import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        following: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          following: {
            disconnect: { id: userId },
          },
        },
      });

      return NextResponse.json({ message: 'User unfollowed successfully' });
    } else {
      // Follow
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          following: {
            connect: { id: userId },
          },
        },
      });

      return NextResponse.json({ message: 'User followed successfully' });
    }
  } catch (error: any) {
    console.error('Follow/unfollow error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}