import { NextResponse } from 'next/server';
import { cleanupExpiredEscrow } from '@/lib/jobs/cleanupEscrow';

export async function POST(req: Request) {
  try {
    // Verify the request is authorized
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await cleanupExpiredEscrow();

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({
      success: true,
      processedCount: result.processedCount
    });
  } catch (error: any) {
    console.error('Cleanup escrow error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}