import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { listingId, paymentMethod, meetupLocation, meetupTime, useEscrow } = await req.json();

    // Verify listing exists and is available
    const listing = await prisma.listing.findUnique({
      where: { 
        id: listingId,
        is_available: true,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        }
      }
    });

    if (!listing) {
      return new NextResponse('Listing not found or unavailable', { status: 404 });
    }

    // Prevent buying own listing
    if (listing.user.id === session.user.id) {
      return new NextResponse('Cannot purchase your own listing', { status: 400 });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        buyerId: session.user.id,
        sellerId: listing.user.id,
        status: 'PENDING',
        paymentMethod,
        paymentStatus: paymentMethod === 'PAYSTACK' ? 'PENDING' : null,
        amount: listing.price,
        meetupLocation,
        meetupTime: meetupTime ? new Date(meetupTime) : null,
        escrowEnabled: useEscrow
      }
    });

    // If using Paystack, initialize payment
    if (paymentMethod === 'PAYSTACK') {
      const reference = `txn_${uuidv4()}`;
      const response = await paystack.initializeTransaction({
        email: session.user.email!,
        amount: Number(listing.price),
        reference,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/verify`,
        metadata: {
          transactionId: transaction.id,
          listingId: listing.id
        }
      });

      // Update transaction with payment reference
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { paymentId: reference }
      });

      // Create notifications
      await prisma.$transaction([
        prisma.notification.create({
          data: {
            userId: listing.user.id,
            type: 'TRANSACTION',
            title: 'New Purchase Request',
            message: `${session.user.name} wants to buy your listing "${listing.title}"`,
            data: { transactionId: transaction.id, listingId }
          }
        }),
        prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'TRANSACTION',
            title: 'Purchase Started',
            message: `Your purchase of "${listing.title}" is being processed`,
            data: { transactionId: transaction.id, listingId }
          }
        })
      ]);

      return NextResponse.json({
        transaction,
        authorization_url: response.data.authorization_url
      });
    }

    // For cash/local meetup transactions
    await prisma.$transaction([
      prisma.notification.create({
        data: {
          userId: listing.user.id,
          type: 'TRANSACTION',
          title: 'New Local Meetup Request',
          message: `${session.user.name} wants to buy your listing "${listing.title}" via local meetup`,
          data: { transactionId: transaction.id, listingId, meetupLocation, meetupTime }
        }
      }),
      prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'TRANSACTION',
          title: 'Local Meetup Arranged',
          message: `Your local meetup for "${listing.title}" has been arranged`,
          data: { transactionId: transaction.id, listingId, meetupLocation, meetupTime }
        }
      })
    ]);

    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'buying' or 'selling'
    const status = searchParams.get('status');
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 10;

    // If specific transaction ID is provided, return that transaction
    if (id) {
      const transaction = await prisma.transaction.findUnique({
        where: { 
          id,
          OR: [
            { buyerId: session.user.id },
            { sellerId: session.user.id }
          ]
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: {
                take: 1,
                select: { url: true }
              }
            }
          },
          buyer: {
            select: {
              id: true,
              full_name: true,
              profile_image: true
            }
          },
          seller: {
            select: {
              id: true,
              full_name: true,
              profile_image: true
            }
          }
        }
      });

      if (!transaction) {
        return new NextResponse('Transaction not found', { status: 404 });
      }

      return NextResponse.json({ transaction });
    }

    // Otherwise, return paginated list of transactions
    const where = {
      ...(type === 'buying' ? { buyerId: session.user.id } : {}),
      ...(type === 'selling' ? { sellerId: session.user.id } : {}),
      ...(status ? { status: status.toUpperCase() } : {})
    };

    const transactions = await prisma.transaction.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [{ created_at: 'desc' }],
      include: {
        listing: {
          select: {
            title: true,
            images: {
              take: 1,
              select: { url: true }
            }
          }
        },
        buyer: {
          select: {
            full_name: true,
            profile_image: true
          }
        },
        seller: {
          select: {
            full_name: true,
            profile_image: true
          }
        }
      }
    });

    const nextCursor = transactions.length === limit ? transactions[transactions.length - 1].id : null;

    return NextResponse.json({
      transactions,
      nextCursor
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { transactionId, action } = await req.json();

    if (!['COMPLETE', 'CANCEL'].includes(action)) {
      return new NextResponse('Invalid action', { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        listing: {
          select: {
            title: true
          }
        }
      }
    });

    if (!transaction) {
      return new NextResponse('Transaction not found', { status: 404 });
    }

    // Verify user is buyer or seller
    if (transaction.buyerId !== session.user.id && transaction.sellerId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: action === 'COMPLETE' ? 'COMPLETED' : 'CANCELLED',
        ...(action === 'COMPLETE' ? {
          listing: {
            update: {
              status: 'SOLD',
              is_available: false
            }
          }
        } : {})
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: action === 'COMPLETE' ? transaction.buyerId : transaction.sellerId,
        type: 'TRANSACTION',
        title: `Transaction ${action === 'COMPLETE' ? 'Completed' : 'Cancelled'}`,
        message: `Your transaction for "${transaction.listing.title}" has been ${action === 'COMPLETE' ? 'completed' : 'cancelled'}`,
        data: { transactionId }
      }
    });

    return NextResponse.json({ transaction: updatedTransaction });
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}