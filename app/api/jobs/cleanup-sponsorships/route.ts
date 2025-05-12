import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint should be called by a CRON job every hour
export async function POST(req: Request) {
  try {
    // Verify the request is authorized (you can add more security here)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find all expired sponsored listings
    const now = new Date();
    const expiredSponsorships = await prisma.listing.updateMany({
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

    return NextResponse.json({
      success: true,
      updatedCount: expiredSponsorships.count
    });
  } catch (error: any) {
    console.error('Cleanup sponsorships error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}