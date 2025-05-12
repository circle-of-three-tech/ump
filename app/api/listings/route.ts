import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { uploadFileToStorage, generateUniqueFileName } from '@/lib/storage';
import { Listing, Prisma } from '@prisma/client';

type ListingWithRelations = Prisma.ListingGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        full_name: true;
        profile_image: true;
        is_verified: true;
      };
    };
    _count: {
      select: {
        likes: true;
        comments: true;
        bookmarks: true;
      };
    };
  };
}>;

type MediaUpload = {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  listingId: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');

    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const location = searchParams.get('location');
    const limit = 12;

    const now = new Date();

    // Build where clause based on filters
    const where: any = {
      is_available: true,
      AND: []
    };

    if (category) where.category = category;
    if (condition) where.condition = condition;
    if (location) where.location = location;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    // Get sponsored listings first
    const sponsoredListings = await prisma.listing.findMany({
      take: limit,
      where: {
        ...where,
        is_sponsored: true,
        sponsored_until: {
          gt: now
        }
      },
      orderBy: [
        { sponsored_tier: 'desc' },
        { sponsored_until: 'desc' },
        { created_at: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            profile_image: true,
            is_verified: true
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
    });

    // Calculate how many regular listings to fetch
    const remainingLimit = Math.max(0, limit - sponsoredListings.length);

    // Get regular listings
    let regularListings: ListingWithRelations[] = [];
    if (remainingLimit > 0) {
      regularListings = await prisma.listing.findMany({
        take: remainingLimit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...where,
          OR: [
            { is_sponsored: false },
            {
              is_sponsored: true,
              sponsored_until: {
                lte: now
              }
            }
          ]
        },
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              profile_image: true,
              is_verified: true
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
      });
    }

    // Combine sponsored and regular listings
    const listings = [...sponsoredListings, ...regularListings];
console.log(listings)
    // Get the ID of the last regular listing for pagination
    const lastListing = regularListings[regularListings.length - 1];
    const nextCursor = lastListing?.id;

    return NextResponse.json({
      listings,
      nextCursor
    });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    
    // Extract all form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const location = formData.get('location') as string;
    const tags = JSON.parse(formData.get('tags') as string);
    const allowSwap = formData.get('allowSwap') === 'true';
    const allowNegotiation = formData.get('allowNegotiation') === 'true';
    const isLocalMeetup = formData.get('isLocalMeetup') === 'true';
    const imageUrls = formData.getAll('images') as string[];

    // Validate required fields
    if (!title || !description || !price || !category || !condition || !location) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    console.log('Creating listing with data:', {
      title,
      price,
      category,
      imageCount: imageUrls.length
    });

    // Create listing first
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        category,
        condition,
        location,
        tags,
        allow_swap: allowSwap,
        allow_negotiation: allowNegotiation,
        is_local_meetup: isLocalMeetup,
        userId: session.user.id,
      }
    });

    // Handle image URLs if they exist
    if (imageUrls?.length > 0) {
      console.log('Creating media entries for listing:', listing.id, imageUrls);
      
      // Create media entries
      await prisma.listingMedia.createMany({
        data: imageUrls.map(url => ({
          url,
          type: 'IMAGE' as const,
          listingId: listing.id
        }))
      });
    }

    // Fetch the complete listing with media
    const completeListingData = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: {
        images: true,
        videos: true,
        user: {
          select: {
            full_name: true,
            profile_image: true,
            is_verified: true
          }
        }
      }
    });

    return NextResponse.json(completeListingData);
  } catch (error: any) {
    console.error('Create listing error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const condition = formData.get('condition') as string;
    const location = formData.get('location') as string;
    const tags = JSON.parse(formData.get('tags') as string);
    const allowSwap = formData.get('allowSwap') === 'true';
    const allowNegotiation = formData.get('allowNegotiation') === 'true';
    const isLocalMeetup = formData.get('isLocalMeetup') === 'true';
    const status = formData.get('status') as string;
    const deletedMediaIds = JSON.parse(formData.get('deletedMediaIds') as string || '[]');
    
    // Verify ownership
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingListing || existingListing.userId !== session.user.id) {
      return new NextResponse('Not found or unauthorized', { status: 404 });
    }

    // Delete media files first
    if (deletedMediaIds.length > 0) {
      await prisma.listingMedia.deleteMany({
        where: { id: { in: deletedMediaIds } }
      });
    }

    // Handle new media files
    const mediaFiles = formData.getAll('newMedia') as File[];
    const imageUploads: MediaUpload[] = [];
    const videoUploads: MediaUpload[] = [];

    for (const file of mediaFiles) {
      const type = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
      
      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const uniqueFilename = generateUniqueFileName(file.name);
      
      // Upload to Firebase Storage with listing-specific folder
      const url = await uploadFileToStorage(
        buffer,
        uniqueFilename,
        `listings/${id}`
      );
      
      if (type === 'IMAGE') {
        imageUploads.push({ url, type: 'IMAGE' as const, listingId: id });
      } else {
        videoUploads.push({ url, type: 'VIDEO' as const, listingId: id });
      }
    }

    // Update listing and create new media
    const listing = await prisma.$transaction(async (prisma) => {
      // Update listing details
      const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
          title,
          description,
          price,
          category,
          condition,
          location,
          tags,
          allow_swap: allowSwap,
          allow_negotiation: allowNegotiation,
          is_local_meetup: isLocalMeetup,
          status,
        }
      });

      // Create new media entries
      if (imageUploads.length > 0) {
        await prisma.listingMedia.createMany({
          data: imageUploads
        });
      }

      if (videoUploads.length > 0) {
        await prisma.listingMedia.createMany({
          data: videoUploads
        });
      }

      // Return complete listing data
      return prisma.listing.findUnique({
        where: { id },
        include: {
          images: true,
          videos: true,
          user: {
            select: {
              full_name: true,
              profile_image: true,
              is_verified: true
            }
          }
        }
      });
    });

    return NextResponse.json(listing);
  } catch (error: any) {
    console.error('Update listing error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Listing ID is required', { status: 400 });
    }

    // Verify ownership
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingListing || existingListing.userId !== session.user.id) {
      return new NextResponse('Not found or unauthorized', { status: 404 });
    }

    await prisma.listing.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Delete listing error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
