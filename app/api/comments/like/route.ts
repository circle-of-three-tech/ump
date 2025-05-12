import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

// Input validation schema
const likeCommentSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
});

/**
 * POST /api/comments/like
 * Toggles like status on a comment
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate input
    const body = await req.json();
    const validatedInput = likeCommentSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: validatedInput.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { commentId } = validatedInput.data;

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if the user has already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        }
      }
    });

    // Toggle like status
    if (existingLike) {
      // Unlike the comment
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          }
        }
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like the comment
      await prisma.commentLike.create({
        data: {
          userId: session.user.id,
          commentId,
        }
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    console.error('Toggle comment like error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/comments/like
 * Gets like status for a comment
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Check if the user has already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        }
      }
    });

    // Get total like count
    const likeCount = await prisma.commentLike.count({
      where: { commentId }
    });

    return NextResponse.json({
      liked: Boolean(existingLike),
      likeCount
    });
  } catch (error: any) {
    console.error('Get comment like status error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}