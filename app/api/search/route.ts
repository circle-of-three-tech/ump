import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type GroupByResult = {
  category?: string;
  tags?: string[];
  _count: number;
};

// Define types for suggestions
type CategorySuggestion = {
  category: string;
  _count: number;
};

type TagSuggestion = {
  tags: string[];
  _count: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'listings'; // listings, users, or suggestions
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 20;
    const filters = {
      category: searchParams.get('category'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      condition: searchParams.get('condition'),
      location: searchParams.get('location'),
      university: searchParams.get('university'),
      verified: searchParams.get('verified') === 'true'
    };

    // For real-time suggestions
    if (type === 'suggestions' && q) {
      const suggestions = await Promise.all([
        // Search categories
        prisma.listing.groupBy({
          by: ['category'],
          where: {
            category: { contains: q, mode: 'insensitive' },
            status: 'ACTIVE'
          },
          _count: true,
          orderBy: {
            category: 'asc'
          },
          take: 3
        }),

        // Search tags
        prisma.listing.groupBy({
          by: ['tags'],
          where: {
            tags: { hasSome: [q] },
            status: 'ACTIVE'
          },
          _count: true,
          orderBy: {
            tags: 'asc'
          },
          take: 3
        }),

        // Search listings titles
        prisma.listing.findMany({
          where: {
            title: { contains: q, mode: 'insensitive' },
            status: 'ACTIVE'
          },
          select: {
            title: true,
            category: true
          },
          take: 3
        }),

        // Search users
        prisma.user.findMany({
          where: {
            OR: [
              { full_name: { contains: q, mode: 'insensitive' } },
              { university: { contains: q, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            full_name: true,
            university: true,
            profile_image: true
          },
          take: 3
        })
      ]);

      return NextResponse.json({
        categories: (suggestions[0] as GroupByResult[]).map(s => ({
          type: 'category',
          value: s.category || '',
          count: s._count
        })),
        tags: (suggestions[1] as GroupByResult[]).map(s => ({
          type: 'tag',
          value: s.tags?.[0] || '',
          count: s._count
        })),
        listings: suggestions[2].map(s => ({
          type: 'listing',
          value: s.title,
          category: s.category
        })),
        users: suggestions[3].map(u => ({
          type: 'user',
          value: u.full_name,
          id: u.id,
          university: u.university,
          image: u.profile_image
        }))
      });
    }

    // Build search query
    const where: any = {
      status: 'ACTIVE'
    };

    if (q) {
      if (type === 'users') {
        where.OR = [
          { full_name: { contains: q, mode: 'insensitive' } },
          { university: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } }
        ];
      } else {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: q.split(' ') } }
        ];
      }
    }

    // Apply filters for listings
    if (type === 'listings') {
      if (filters.category) where.category = filters.category;
      if (filters.condition) where.condition = filters.condition;
      if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
      if (filters.minPrice) where.price = { gte: parseFloat(filters.minPrice) };
      if (filters.maxPrice) where.price = { ...where.price, lte: parseFloat(filters.maxPrice) };

      if (filters.university || filters.verified) {
        where.user = {};
        if (filters.university) {
          where.user.university = { contains: filters.university, mode: 'insensitive' };
        }
        if (filters.verified) {
          where.user.is_verified = true;
        }
      }
    }

    // Execute search query
    if (type === 'users') {
      const users = await prisma.user.findMany({
        where,
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          _count: {
            select: {
              listings: true,
              followers: true,
              following: true,
              reviews_received: true
            }
          }
        },
        orderBy: [
          { is_verified: 'desc' },
          { reviews_received: { _count: 'desc' } }
        ]
      });

      const nextCursor = users.length === limit ? users[users.length - 1].id : null;

      return NextResponse.json({
        users,
        nextCursor
      });
    } else {
      const listings = await prisma.listing.findMany({
        where,
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
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
            take: 1
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true
            }
          }
        },
        orderBy: [
          { views: 'desc' },
          { created_at: 'desc' }
        ]
      });

      const nextCursor = listings.length === limit ? listings[listings.length - 1].id : null;

      return NextResponse.json({
        listings,
        nextCursor
      });
    }
  } catch (error: any) {
    console.error('Search error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}