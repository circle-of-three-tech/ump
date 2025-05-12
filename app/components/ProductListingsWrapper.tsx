'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import ListingCard from './ListingCard';
import FullScreenListingCard from './listing/FullScreenListingCard';
// import { LoadingSpinner } from './LoadingSpinner';
import { ChevronUp } from 'lucide-react';
import { useFetchWithLoading } from '../hooks/useFetchWithLoading';

interface ProductListingsWrapperProps {
  initialListings: any[];
  queryType: 'home' | 'explore' | 'search';
  category?: string;
  university?: string;
  interests?: string[];
  sortBy?: string;
}

export default function ProductListingsWrapper({
  initialListings,
  queryType,
  category,
  university,
  interests,
  sortBy = 'recent'
}: ProductListingsWrapperProps) {
  const [listings, setListings] = useState(initialListings);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const cursor = useRef(listings[listings.length - 1]?.id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { fetchWithLoading } = useFetchWithLoading();
  
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: '100px',
  });

  useEffect(() => {
    // Reset state when filters change
    setListings(initialListings);
    cursor.current = initialListings[initialListings.length - 1]?.id;
    setHasMore(true);
  }, [category, university, sortBy, initialListings]);

  useEffect(() => {
    const loadMore = async () => {
      if (!inView || !hasMore || isFetchingNextPage) return;

      try {
        setIsFetchingNextPage(true);
        const params = new URLSearchParams({
          cursor: cursor.current,
          ...(queryType === 'home' && {
            interests: interests?.join(',') || '',
            university: university || ''
          }),
          ...(queryType === 'explore' && {
            ...(category && { category }),
            ...(university && { university }),
            sort: sortBy
          })
        });

        const data = await fetchWithLoading<{ listings: any[]; nextCursor: string }>(
          `/api/listings?${params}`
        );

        if (data.listings.length === 0) {
          setHasMore(false);
          return;
        }

        setListings(prev => [...prev, ...data.listings]);
        cursor.current = data.nextCursor;
      } catch (error) {
        console.error('Error loading more listings:', error);
      } finally {
        setIsFetchingNextPage(false);
      }
    };

    loadMore();
  }, [inView, hasMore, category, university, sortBy, queryType, interests, fetchWithLoading, isFetchingNextPage]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      setShowScrollTop(containerRef.current.scrollTop > 1000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div 
      ref={containerRef}
      className="w-full px-safe-left"
    >
      {/* Desktop Grid View */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {listings.map((listing: any) => (
          <div key={listing.id} className="h-[400px]">
            <ListingCard listing={listing} />
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[400px] bg-base-300 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
      </div>

      {/* Mobile TikTok-like Scroll View */}
      <div className="md:hidden w-full overflow-hidden">
        <div className="h-[calc(100vh-4rem)] overflow-y-auto snap-y snap-mandatory hide-scrollbar">
          {listings.map((listing: any, index: number) => (
            <div 
              key={listing.id}
              className="h-[calc(100vh-4rem)] w-full snap-start snap-always"
            >
              <FullScreenListingCard listing={listing} />
              {index === listings.length - 1 && (
                <div ref={ref} className="h-20" />
              )}
            </div>
          ))}
          
          {/* Loading skeleton */}
          {isFetchingNextPage && (
            <div 
              className="h-[calc(100vh-4rem)] w-full snap-start snap-always flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-base-100/10 to-base-100" />
              <div className="z-10 flex flex-col items-center gap-4">
                <div className="w-12 h-12 animate-spin rounded-full border-b-2 border-t-2 border-primary opacity-80" />
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="h-6 w-40 bg-white/10 rounded-full" />
                  <div className="h-4 w-32 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasMore && listings.length > 0 && (
        <div className="w-full flex justify-center">
          <p className="text-center text-white/70 p-4 px-safe-right backdrop-blur-sm">
            No more listings to show
          </p>
        </div>
      )}

      {listings.length === 0 && (
        <div className="flex flex-col items-center justify-center ">
          <p className="text-xl font-semibold text-white/70">No listings found</p>
          {queryType !== 'home' && (
            <p className="text-sm text-white/50 mt-2">
              Try adjusting your filters to see more results
            </p>
          )}
        </div>
      )}

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-safe-bottom right-safe-right z-50 btn btn-circle btn-ghost bg-black/50 backdrop-blur-sm hover:bg-black/70 ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } transition-opacity duration-200`}
      >
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );
}