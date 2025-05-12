import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { transactionId, action } = await req.json();
    if (!transactionId || !action) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get transaction and escrow details
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        escrow: true,
        listing: {
          select: {
            title: true
          }
        }
      }
    });

    if (!transaction || !transaction.escrow) {
      return new NextResponse('Transaction or escrow not found', { status: 404 });
    }

    // Verify user is the buyer
    if (transaction.buyerId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify escrow is in valid state for the action
    if (transaction.escrow.status !== 'PENDING') {
      return new NextResponse('Invalid escrow state for this action', { status: 400 });
    }

    const now = new Date();

    switch (action) {
      case 'RELEASE':
        // Release funds to seller
        await prisma.$transaction([
          // Update escrow status
          prisma.escrow.update({
            where: { id: transaction.escrow.id },
            data: {
              status: 'RELEASED',
              releaseDate: now
            }
          }),
          // Update transaction status
          prisma.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'COMPLETED'
            }
          }),
          // Create notification for seller
          prisma.notification.create({
            data: {
              userId: transaction.sellerId,
              type: 'TRANSACTION',
              title: 'Funds Released',
              message: `The buyer has released the funds for "${transaction.listing.title}"`,
              data: { transactionId }
            }
          })
        ]);
        break;

      case 'DISPUTE':
        // Mark transaction as disputed
        await prisma.$transaction([
          // Update escrow status
          prisma.escrow.update({
            where: { id: transaction.escrow.id },
            data: {
              status: 'DISPUTED'
            }
          }),
          // Update transaction status
          prisma.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'DISPUTED'
            }
          }),
          // Create notification for seller
          prisma.notification.create({
            data: {
              userId: transaction.sellerId,
              type: 'TRANSACTION',
              title: 'Transaction Disputed',
              message: `A dispute has been opened for "${transaction.listing.title}"`,
              data: { transactionId }
            }
          }),
          // Create notification for support
          prisma.notification.create({
            data: {
              userId: process.env.SUPPORT_USER_ID!,
              type: 'DISPUTE',
              title: 'New Dispute',
              message: `A new dispute has been opened for transaction ${transactionId}`,
              data: { transactionId }
            }
          })
        ]);
        break;

      default:
        return new NextResponse('Invalid action', { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling escrow action:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}