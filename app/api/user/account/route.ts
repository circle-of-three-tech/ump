import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete user and all related data (cascading delete is set up in schema)
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}