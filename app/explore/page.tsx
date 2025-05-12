"use client";

import React, { useEffect, useState } from "react";
import ProductListingsWrapper from "@/app/components/ProductListingsWrapper";
import FilterControls from "@/app/components/FilterControls";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface ListingWithUser {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  images: { url: string }[];
  user: {
    full_name: string;
    profile_image: string | null;
    is_verified: boolean;
  };
  _count: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  is_sponsored: boolean;
  sponsored_tier: number | null;
}

interface ListingsResponse {
  listings: ListingWithUser[];
  nextCursor: string | null;
}

interface FilterValues {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  verified?: string;
}

export default function ExplorePage() {
  const [currentValues, setCurrentValues] = useState<FilterValues>({
    category: "",
    minPrice: "",
    maxPrice: "",
    condition: "",
    verified: "false",
  });

  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<ListingsResponse, Error>({
    queryKey: ["listings", currentValues],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam as string);
      if (currentValues.category)
        params.set("category", currentValues.category);
      if (currentValues.minPrice)
        params.set("minPrice", currentValues.minPrice);
      if (currentValues.maxPrice)
        params.set("maxPrice", currentValues.maxPrice);
      if (currentValues.condition)
        params.set("condition", currentValues.condition);
      if (currentValues.verified)
        params.set("verified", currentValues.verified);

      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "pending") return <LoadingSpinner />;
  if (status === "error" && error)
    return <div>Error loading listings: {error.message}</div>;

  const listings = data ? data.pages.flatMap((page) => page.listings) : [];

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md pt-safe-top">
        <FilterControls
          currentValues={currentValues}
          showPriceFilter={true}
          showVerifiedFilter={true}
          className="px-4 py-2"
        />

        <div className="pt-[64px]">
          <ProductListingsWrapper
            initialListings={listings}
            queryType="explore"
            category={currentValues.category}
          />
        </div>
      </div>
    </div>
  );
}
