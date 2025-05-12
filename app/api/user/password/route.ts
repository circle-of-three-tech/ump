import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // Get user with current password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password_hash: true }
    });

    if (!user?.password_hash) {
      return new NextResponse('Password update not available for OAuth users', { status: 400 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return new NextResponse('Current password is incorrect', { status: 400 });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password_hash: hashedPassword }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Password update error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}