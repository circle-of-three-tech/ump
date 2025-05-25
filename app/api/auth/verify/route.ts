import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// import { GET, POST } from '../[...nextauth]/route';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

// Rate limiting map
const verificationAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Email verification endpoint
export async function POST(req: Request) {
  try {
    const formData = await req.formData().catch(() => null);
    
    if (formData) {
      // Handle student ID verification
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      // Rate limiting check
      const userAttempts = verificationAttempts.get(session.user.id) || { count: 0, timestamp: Date.now() };
      if (Date.now() - userAttempts.timestamp > WINDOW_MS) {
        // Reset if window has passed
        userAttempts.count = 0;
        userAttempts.timestamp = Date.now();
      }
      if (userAttempts.count >= MAX_ATTEMPTS) {
        return NextResponse.json({ 
          message: 'Too many verification attempts. Please try again later.' 
        }, { status: 429 });
      }

      const studentIdImage = formData.get('studentIdImage') as File;
      if (!studentIdImage) {
        return NextResponse.json({ message: 'Student ID image is required' }, { status: 400 });
      }

      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(studentIdImage.type)) {
        return NextResponse.json({ 
          message: 'Invalid file type. Please upload a JPEG, PNG, or WebP image' 
        }, { status: 400 });
      }

      if (studentIdImage.size > maxSize) {
        return NextResponse.json({ 
          message: 'File size too large. Maximum size is 5MB' 
        }, { status: 400 });
      }

      // Upload student ID
      const blob = await put(`student-ids/${session.user.id}-${Date.now()}`, studentIdImage, {
        access: 'public',
        addRandomSuffix: true,
      });

      // Increment attempt counter
      verificationAttempts.set(session.user.id, {
        count: userAttempts.count + 1,
        timestamp: userAttempts.timestamp
      });

      // Update user verification status
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          student_id_image: blob.url,
          verification_status: 'PENDING',
          verification_submitted_at: new Date()
        }
      });

      return NextResponse.json({
        message: 'Student ID verification request submitted successfully',
        status: 'PENDING'
      });
    } else {
      // Handle email verification
      const { token } = await req.json();

      if (!token) {
        return NextResponse.json({ message: 'Verification token is required' }, { status: 400 });
      }

      // Find user with valid verification token
      const user = await prisma.user.findFirst({
        where: {
          verification_token: token,
          verification_token_expires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 });
      }

      // Update user to verified status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          is_verified: true,
          verification_token: null,
          verification_token_expires: null,
          email_verified: new Date(),
          verification_status: user.student_id_image ? 'PENDING' : 'EMAIL_VERIFIED'
        }
      });

      return NextResponse.json({
        message: 'Email verified successfully',
        status: 'EMAIL_VERIFIED',
        userId: user.id
      });
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}

// Admin-only endpoint to approve/reject verification
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Proper admin role check
    const admin = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { role: true }
    });

    if (!session?.user?.id || admin?.role !== 'ADMIN') {
      return NextResponse.json({ 
        message: 'Unauthorized - Admin access required' 
      }, { status: 401 });
    }

    const { userId, action, reason } = await req.json();

    if (!userId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ 
        message: 'Invalid request parameters' 
      }, { status: 400 });
    }

    // Create verification audit log
    const verificationLog = await prisma.verificationAudit.create({
      data: {
        userId,
        adminId: session.user.id,
        action,
        reason,
        previousStatus: (await prisma.user.findUnique({
          where: { id: userId },
          select: { verification_status: true }
        }))?.verification_status
      }
    });

    // Update user verification status
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verification_status: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
        is_verified: action === 'APPROVE',
        verification_updated_at: new Date(),
        verification_reason: reason || null
      }
    });

    // TODO: Send email notification using your email service
    // await sendVerificationResultEmail(user.email, action, reason);

    return NextResponse.json({
      message: `Verification ${action.toLowerCase()}d successfully`,
      user: {
        id: user.id,
        verificationStatus: user.verification_status,
        isVerified: user.is_verified
      },
      auditId: verificationLog.id
    });
  } catch (error: any) {
    console.error('Verification update error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}