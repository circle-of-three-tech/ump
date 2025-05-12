import { prisma } from '@/lib/prisma';

export async function cleanupExpiredSponsorships() {
  try {
    const now = new Date();

    // Find and update all listings with expired sponsorships
    const result = await prisma.listing.updateMany({
      where: {
        is_sponsored: true,
        sponsored_until: {
          lt: now
        }
      },
      data: {
        is_sponsored: false,
        sponsored_tier: null,
        sponsored_until: null
      }
    });

    console.log(`Cleaned up ${result.count} expired sponsorships`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired sponsorships:', error);
    throw error;
  }
}