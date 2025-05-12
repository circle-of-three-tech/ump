import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return new NextResponse('Token is required', { status: 400 });
    }

    // Update user's FCM token in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { push_subscription: token }
    });

    return new NextResponse('Device registered successfully', { status: 200 });
  } catch (error) {
    console.error('Error registering device:', error);
    return new NextResponse('Error registering device', { status: 500 });
  }
}