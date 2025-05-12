import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { v4 as uuidv4 } from 'uuid';

const TIER_DURATIONS = {
  1: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  2: 14 * 24 * 60 * 60 * 1000, // 14 days
  3: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const TIER_PRICES = {
  1: 4.99,  // Basic tier price
  2: 9.99,  // Premium tier price
  3: 19.99, // Featured tier price
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { listingId, tierId } = body;

    if (!listingId || !tierId || ![1, 2, 3].includes(tierId)) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { 
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!listing || listing.user.id !== session.user.id) {
      return new NextResponse('Listing not found or unauthorized', { status: 404 });
    }

    // Generate a unique reference
    const reference = `sponsor_${uuidv4()}`;
    const tierName = tierId === 3 ? 'Featured' : tierId === 2 ? 'Premium' : 'Basic';

    // Initialize Paystack transaction
    const response = await paystack.initializeTransaction({
      email: listing.user.email!,
      amount: TIER_PRICES[tierId as keyof typeof TIER_PRICES],
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/verify`,
      metadata: {
        type: 'SPONSORSHIP',
        listingId,
        userId: session.user.id,
        tierId,
        duration: TIER_DURATIONS[tierId as keyof typeof TIER_DURATIONS],
      }
    });

    return NextResponse.json({ 
      authorization_url: response.data.authorization_url,
      reference
    });
  } catch (error: any) {
    console.error('Sponsorship error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}