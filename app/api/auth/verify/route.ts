import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

// Email verification endpoint
export async function POST(req: Request) {
  try {
    // Check if this is a student ID verification or email verification request
    const formData = await req.formData().catch(() => null);
    
    if (formData) {
      // Handle student ID verification
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const studentIdImage = formData.get('studentIdImage') as File;
      if (!studentIdImage) {
        return NextResponse.json({ message: 'Student ID image is required' }, { status: 400 });
      }

      // Upload student ID with public access
      const blob = await put(`student-ids/${session.user.id}/${Date.now()}-${studentIdImage.name}`, studentIdImage, {
        access: 'public',  // Changed from 'private' to 'public' to match Vercel Blob API requirements
        addRandomSuffix: true
      });

      // Update user verification status
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          student_id_image: blob.url,
          verification_status: 'PENDING'
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

      // Find user with the verification token
      const user = await prisma.user.findFirst({
        where: { verification_token: token }
      });

      if (!user) {
        return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 });
      }

      // Update user to verified status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          is_verified: true,
          verification_token: null, // Clear the token after use
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
    
    // TODO: Add proper admin role check
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, action, reason } = await req.json();

    if (!userId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ message: 'Invalid request parameters' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verification_status: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
        is_verified: action === 'APPROVE'
      }
    });

    // TODO: Send email notification to user about verification result

    return NextResponse.json({
      message: `Verification ${action.toLowerCase()}d successfully`,
      user: {
        id: user.id,
        verificationStatus: user.verification_status,
        isVerified: user.is_verified
      }
    });
  } catch (error: any) {
    console.error('Verification update error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
