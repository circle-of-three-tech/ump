import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId, rating, comment, transactionId } = await req.json();

    if (!userId || !rating || rating < 1 || rating > 5) {
      return new NextResponse('Invalid review data', { status: 400 });
    }

    // Verify transaction exists and is completed
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
        status: 'COMPLETED'
      }
    });

    if (!transaction) {
      return new NextResponse('Transaction not found or not completed', { status: 404 });
    }

    // Verify reviewer was part of the transaction
    if (transaction.buyerId !== session.user.id && transaction.sellerId !== session.user.id) {
      return new NextResponse('Not authorized to review this transaction', { status: 401 });
    }

    // Verify the user being reviewed was the other party in the transaction
    if (userId !== transaction.buyerId && userId !== transaction.sellerId) {
      return new NextResponse('Can only review transaction participants', { status: 400 });
    }

    // Check if review already exists for this transaction
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: session.user.id,
        reviewedId: userId,
        transactionId
      }
    });

    if (existingReview) {
      return new NextResponse('Review already submitted for this transaction', { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        reviewerId: session.user.id,
        reviewedId: userId,
        transactionId
      },
      include: {
        reviewer: {
          select: {
            full_name: true,
            profile_image: true
          }
        }
      }
    });

    // Create notification for reviewed user
    await prisma.notification.create({
      data: {
        userId,
        type: 'REVIEW',
        title: 'New Review Received',
        message: `${session.user.name} left you a ${rating}-star review`,
        data: { reviewId: review.id, transactionId }
      }
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Create review error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 10;

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        reviewedId: userId
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [
        { created_at: 'desc' }
      ],
      include: {
        reviewer: {
          select: {
            id: true,
            full_name: true,
            profile_image: true,
            is_verified: true
          }
        },
        transaction: {
          select: {
            listing: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    const nextCursor = reviews.length === limit ? reviews[reviews.length - 1].id : null;

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: {
        reviewedId: userId
      },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    return NextResponse.json({
      reviews,
      nextCursor,
      stats: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count.rating
      }
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { reviewId, rating, comment } = await req.json();

    if (!reviewId || !rating || rating < 1 || rating > 5) {
      return new NextResponse('Invalid review data', { status: 400 });
    }

    // Verify review ownership
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview || existingReview.reviewerId !== session.user.id) {
      return new NextResponse('Review not found or unauthorized', { status: 404 });
    }

    // Update review
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment,
        updated_at: new Date()
      }
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Update review error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}