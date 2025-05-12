import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ProductListingsWrapper from '../components/ProductListingsWrapper';
import FilterControls from '../components/FilterControls';

export const metadata: Metadata = {
  title: 'Search Campus Marketplace - Find Student Listings',
  description: 'Search through thousands of student listings. Advanced filters for categories, price ranges, and locations.',
  openGraph: {
    title: 'Search Campus Marketplace',
    description: 'Find exactly what you need with our advanced search filters. Browse listings from verified student sellers.',
    images: ['/search-og.png']
  }
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    location?: string;
    university?: string;
    sort?: string;
    verified?: string;
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await getServerSession(authOptions);
  const {
    q,
    category,
    minPrice,
    maxPrice,
    condition,
    location,
    university,
    sort = 'relevance',
    verified
  } = searchParams;

  // Build search query
  const where: any = {
    status: 'ACTIVE',
    is_available: true
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { hasSome: q.split(' ') } }
    ];
  }

  if (category) where.category = category;
  if (condition) where.condition = condition;
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (minPrice) where.price = { gte: parseFloat(minPrice) };
  if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

  if (university) {
    where.user = {
      ...where.user,
      university: { contains: university, mode: 'insensitive' }
    };
  }

  if (verified === 'true') {
    where.user = {
      ...where.user,
      is_verified: true
    };
  }

  // Determine sort order
  const orderBy: any[] = [];
  switch (sort) {
    case 'price-low':
      orderBy.push({ price: 'asc' });
      break;
    case 'price-high':
      orderBy.push({ price: 'desc' });
      break;
    case 'newest':
      orderBy.push({ created_at: 'desc' });
      break;
    case 'popular':
      orderBy.push({ views: 'desc' });
      break;
    default:
      if (q) {
        orderBy.push(
          { views: 'desc' },
          { _count: { likes: 'desc' } },
          { created_at: 'desc' }
        );
      } else {
        orderBy.push({ created_at: 'desc' });
      }
  }

  const [listings, categories, universities, rawPriceRange] = await Promise.all([
    prisma.listing.findMany({
      where,
      take: 20,
      orderBy,
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
      }
    }),
    prisma.listing.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _count: true
    }),
    prisma.user.groupBy({
      by: ['university'],
      _count: true
    }),
    prisma.listing.aggregate({
      where: { status: 'ACTIVE' },
      _min: { price: true },
      _max: { price: true }
    })
  ]);

  // Convert Prisma Decimal to number for the price range
  const priceRange = {
    _min: { price: Number(rawPriceRange._min.price) || 0 },
    _max: { price: Number(rawPriceRange._max.price) || 0 }
  };

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: 'Search Results',
    description: `Search results for ${q || 'all listings'}`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/search${q ? `?q=${q}` : ''}`,
    numberOfItems: listings.length,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: listings.map((listing, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: listing.title,
          description: listing.description,
          image: listing.images[0]?.url,
          offers: {
            '@type': 'Offer',
            price: listing.price,
            priceCurrency: 'USD'
          },
          seller: {
            '@type': 'Person',
            name: listing.user.full_name
          }
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen bg-base-100">
        {/* Search summary */}
        <div className="fixed top-4 left-4 right-16 z-50 bg-base-100/80 backdrop-blur-sm rounded-lg p-4 shadow-lg md:static md:bg-transparent md:shadow-none md:mb-4">
          <h1 className="text-2xl font-bold">
            {q ? `Results for "${q}"` : 'All Listings'}
          </h1>
          <p className="text-base-content/70">
            {listings.length} listing{listings.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <FilterControls
          categories={categories}
          universities={universities}
          priceRange={priceRange}
          currentValues={searchParams}
          showPriceFilter
          showVerifiedFilter
        />

        {/* Main content */}
        <ProductListingsWrapper
          initialListings={listings}
          queryType="search"
          {...searchParams}
        />
      </main>
    </>
  );
}
