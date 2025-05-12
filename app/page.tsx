import HomePageClient from './components/HomePageClient';

async function getFeaturedListings() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/listings/featured?page=1&limit=20`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }

  const data = await response.json();
  return data.listings;
}

export default async function HomePage() {
  const transformedListings = await getFeaturedListings();
  // Generate structured data for rich results
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'UMP Marketplace',
    url: process.env.NEXT_PUBLIC_BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    aggregateRating: {
      '@type': 'Rating',
      ratingValue: '4.8',
      reviewCount: '1250'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePageClient 
        transformedListings={transformedListings}
      />
    </>
  );
}