import { prisma } from '../prisma';
import { paystack } from '../paystack';

export async function cleanupExpiredEscrow() {
  const now = new Date();

  try {
    // Find all expired escrows that haven't been released or disputed
    const expiredEscrows = await prisma.$transaction(async (tx) => {
      const escrows = await tx.escrow.findMany({
        where: {
          status: 'PENDING',
          releaseDue: {
            lt: now
          }
        },
        include: {
          transaction: {
            include: {
              listing: {
                select: {
                  title: true
                }
              }
            }
          }
        }
      });

      for (const escrow of escrows) {
        // Update escrow status
        await tx.escrow.update({
          where: { id: escrow.id },
          data: {
            status: 'RELEASED',
            releaseDate: now
          }
        });

        // Update transaction status
        await tx.transaction.update({
          where: { id: escrow.transactionId },
          data: {
            status: 'COMPLETED'
          }
        });

        // Create notifications
        await tx.notification.createMany({
          data: [
            {
              userId: escrow.transaction.sellerId,
              type: 'TRANSACTION',
              title: 'Escrow Released',
              message: `The escrow period has ended and funds have been released for "${escrow.transaction.listing.title}"`,
              data: { transactionId: escrow.transactionId }
            },
            {
              userId: escrow.transaction.buyerId,
              type: 'TRANSACTION',
              title: 'Escrow Released',
              message: `The escrow period has ended for "${escrow.transaction.listing.title}"`,
              data: { transactionId: escrow.transactionId }
            }
          ]
        });

        // Release funds through Paystack
        if (escrow.transaction.paymentMethod === 'PAYSTACK') {
          try {
            await paystack.releaseEscrowFunds(escrow.transaction.paymentId);
          } catch (error) {
            console.error('Failed to release funds through Paystack:', error);
            // Continue with other escrows even if one fails
          }
        }
      }

      return escrows;
    });

    return {
      success: true,
      processedCount: expiredEscrows.length
    };
  } catch (error) {
    console.error('Error cleaning up expired escrows:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}