import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, university, country } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName || !university || !country) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse('Invalid email format', { status: 400 });
    }

    // Password validation
    if (password.length < 8) {
      return new NextResponse('Password must be at least 8 characters long', { status: 400 });
    }

    // Check if email domain is valid
    const emailDomain = email.split('@')[1];
    if (!emailDomain.endsWith('.edu') && !emailDomain.endsWith('.com')) {
      return new NextResponse('Must use a valid email address', { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 });
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Code expires in 24 hours

    const hashedPassword = await hash(password, 12);

    // Create user with proper schema fields
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        country, 
        university,
        verificationCode,
        verificationExpires, 
        isVerified: false,
        listings: { create: [] },
        offers: { create: [] },
        sentMessages: { create: [] },
        receivedMessages: { create: [] },
        buyerChats: { create: [] },
        sellerChats: { create: [] },
        buyerTransactions: { create: [] },
        sellerTransactions: { create: [] },
        givenReviews: { create: [] },
        receivedReviews: { create: [] },
        savedListings: { connect: [] },
        following: { connect: [] },
        followers: { connect: [] },
        notifications: { create: [] }
      }
    });

    try {
      // Send verification email
      // await sendVerificationEmail(user.email, verificationCode);
    } catch (emailError) {
      // Log error but don't expose it to the user
      console.error('[EMAIL_VERIFICATION_ERROR]', emailError);
      
      // Clean up by deleting the user if email fails
      await prisma.user.delete({
        where: { id: user.id }
      });
      
      return new NextResponse(
        'Registration failed. Please try again later.',
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error: any) {
    console.error('[REGISTER]', error);
    
    // Handle Prisma unique constraint violations
    if (error?.code === 'P2002') {
      console.log('[REGISTER]',error)
      return new NextResponse('Email already registered', { status: 400 });
    }
    
    // Handle validation errors
    if (error?.name === 'ValidationError') {
      console.log('[REGISTER]',error)
      return new NextResponse(error.message, { status: 400 });
    }

    // Generic error response
    return new NextResponse('Internal server error. Please try again later.', { 
      status: 500 
    });
  }
}
