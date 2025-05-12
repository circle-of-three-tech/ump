import { Metadata, ResolvingMetadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ListingPageClient from '@/app/components/listing/ListingPageClient';

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          full_name: true,
          university: true,
          is_verified: true
        }
      },
      images: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          bookmarks: true
        }
      }
    }
  });

  if (!listing) return notFound();

  const previousImages = (await parent).openGraph?.images || [];

  const metadata = {
    title: `${listing.title} | UMP Marketplace`,
    description: listing.description.substring(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: [...listing.images.map(img => img.url), ...previousImages],
      type: "website"
    }
  };

  return metadata as Metadata;
}

async function getListingData(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          profile_image: true,
          university: true,
          is_verified: true,
          _count: {
            select: {
              reviews_received: true
            }
          }
        }
      },
      images: true,
      comments: {
        include: {
          user: {
            select: {
              full_name: true,
              profile_image: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
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

export default async function ListingPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const listing = await getListingData(params.id);

  if (!listing) return notFound();

  // Convert Decimal price to number for client component
  const preparedListing = {
    ...listing,
    price: Number(listing.price)
  };

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/listings/${listing.id}`,
    name: listing.title,
    description: listing.description,
    image: listing.images.map(img => img.url),
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/listings/${listing.id}`,
    category: listing.category,
    offers: {
      '@type': 'Offer',
      price: Number(listing.price),
      priceCurrency: 'USD',
      itemCondition: `https://schema.org/${listing.condition}`,
      availability: listing.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Person',
        name: listing.user.full_name
      }
    },
    seller: {
      '@type': 'Person',
      name: listing.user.full_name,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${listing.user.id}`
    },
    aggregateRating: listing.user._count.reviews_received > 0 ? {
      '@type': 'AggregateRating',
      ratingCount: listing.user._count.reviews_received,
      bestRating: '5',
      worstRating: '1'
    } : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ListingPageClient 
        listing={preparedListing}
        currentUserId={session?.user?.id}
      />
    </>
  );
}
