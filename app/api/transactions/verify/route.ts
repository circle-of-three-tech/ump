import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return new NextResponse('Missing reference', { status: 400 });
    }

    const verification = await paystack.verifyTransaction(reference);

    if (verification.data.status === 'success') {
      const { metadata } = verification.data;
      const { type, listingId, transactionId, tierId, duration } = metadata;

      if (type === 'SPONSORSHIP') {
        // Handle sponsored listing
        const sponsoredUntil = new Date(Date.now() + duration);
        
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            is_sponsored: true,
            sponsored_tier: tierId,
            sponsored_until: sponsoredUntil,
          },
        });

        // Notify user about successful sponsorship
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'LISTING',
            title: 'Listing Sponsored',
            message: 'Your listing has been successfully sponsored',
            data: { listingId }
          }
        });

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listingId}?sponsored=success`
        );
      } else {
        // Handle regular transaction payment
        const transaction = await prisma.transaction.findUnique({
          where: { id: transactionId },
          include: {
            listing: {
              select: {
                title: true,
                userId: true
              }
            }
          }
        });

        if (!transaction) {
          throw new Error('Transaction not found');
        }

        // Update transaction status
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            paymentStatus: 'PAID',
            status: transaction.escrowEnabled ? 'PENDING' : 'COMPLETED',
            listing: {
              update: {
                status: transaction.escrowEnabled ? 'PENDING' : 'SOLD',
                is_available: false
              }
            }
          }
        });

        // Create notifications
        await prisma.$transaction([
          prisma.notification.create({
            data: {
              userId: transaction.sellerId,
              type: 'TRANSACTION',
              title: 'Payment Received',
              message: `Payment received for "${transaction.listing.title}"`,
              data: { transactionId }
            }
          }),
          prisma.notification.create({
            data: {
              userId: transaction.buyerId,
              type: 'TRANSACTION',
              title: 'Payment Successful',
              message: `Your payment for "${transaction.listing.title}" was successful`,
              data: { transactionId }
            }
          })
        ]);

        // If escrow is enabled, create an escrow record
        if (transaction.escrowEnabled) {
          await prisma.escrow.create({
            data: {
              transactionId,
              amount: transaction.amount,
              status: 'PENDING',
              releaseDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            }
          });
        }

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/transactions/success?id=${transactionId}`
        );
      }
    } else {
      // Payment failed
      if (verification.data.metadata.type === 'SPONSORSHIP') {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/listings/${verification.data.metadata.listingId}?sponsored=failed`
        );
      } else {
        const transaction = await prisma.transaction.findFirst({
          where: { paymentId: reference }
        });

        if (transaction) {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED'
            }
          });
        }

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/transactions/error?reference=${reference}`
        );
      }
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/transactions/error?message=${encodeURIComponent(
        error.message || 'Payment verification failed'
      )}`
    );
  }
}