import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [featuredListings, total] = await Promise.all([
      prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
        },
        take: limit,
        skip,
        orderBy: [
          { created_at: 'desc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              profile_image: true,
              is_verified: true,
              university: true
            }
          },
          images: {
            select: {
              url: true
            }
          },
          videos: {
            select: {
              url: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true
            }
          }
        }
      }),
      prisma.listing.count({
        where: {
          status: 'ACTIVE'
        }
      })
    ]);

    // Transform listings
    const transformedListings = featuredListings.map((listing) => ({
      ...listing,
      price: Number(listing.price),
      images: listing.images.map(img => img.url),
      videos: listing.videos.map(vid => vid.url),
    }));

    return NextResponse.json({
      listings: transformedListings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
