'use client';

import { Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useSwipe } from '../hooks/useSwipe';

interface FilterControlsProps {
  categories?: Array<{
    category: string;
    _count: number;
  }>;
  universities?: Array<{
    university: string;
    _count: number;
  }>;
  priceRange?: {
    _min: { price: number };
    _max: { price: number };
  };
  currentValues: {
    category?: string;
    university?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    verified?: string;
  };
  showPriceFilter?: boolean;
  showVerifiedFilter?: boolean;
  className?: string;
}

export default function FilterControls({
  categories = [],
  universities = [],
  priceRange,
  currentValues,
  showPriceFilter = false,
  showVerifiedFilter = false,
  className = '',
}: FilterControlsProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const { handlers } = useSwipe({
    onSwipeLeft: () => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        if (checkboxRef.current) {
          checkboxRef.current.checked = false;
        }
      }
    }
  });

  const updateQueryParams = (updates: Record<string, string | undefined>) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    router.push(url.toString());
    // Close drawer on mobile after filter change
    if (window.innerWidth < 768) {
      setIsDrawerOpen(false);
      if (checkboxRef.current) {
        checkboxRef.current.checked = false;
      }
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4 px-safe-right">
        <div className="flex overflow-x-auto gap-2 hide-scrollbar px-safe-left">
          {/* Category pills */}
          {categories.map(({ category, _count }) => (
            <button
              key={category}
              onClick={() => updateQueryParams({ category })}
              className={`badge badge-lg whitespace-nowrap backdrop-blur-sm transition-all duration-200 ${
                currentValues.category === category 
                  ? 'badge-primary scale-105' 
                  : 'badge-ghost hover:scale-105'
              }`}
            >
              {category} ({_count})
            </button>
          ))}
        </div>

        {/* Filter button */}
        <div className="flex-shrink-0">
          <label 
            htmlFor="filter-drawer" 
            className="btn btn-circle btn-sm btn-ghost drawer-button backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Filter className="w-4 h-4" />
          </label>
        </div>
      </div>

      {/* Filter drawer */}
      <div className="drawer drawer-end z-[999]">
        <input 
          id="filter-drawer" 
          type="checkbox" 
          className="drawer-toggle" 
          ref={checkboxRef}
          checked={isDrawerOpen}
          onChange={(e) => setIsDrawerOpen(e.target.checked)}
        />
        <div className="drawer-side">
          <label 
            htmlFor="filter-drawer" 
            className="drawer-overlay"
            onClick={() => setIsDrawerOpen(false)}
          ></label>
          <div className="relative p-4 w-80 min-h-full bg-base-100 animate-slide-in overflow-hidden pl-safe-left pr-safe-right pb-safe-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <label 
                htmlFor="filter-drawer" 
                className="btn btn-circle btn-ghost btn-sm"
                onClick={() => setIsDrawerOpen(false)}
              >
                ✕
              </label>
            </div>

            {/* Filters */}
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-6rem)] pb-safe-bottom" {...handlers}>
              {/* Categories grid */}
              {categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(({ category, _count }) => (
                      <button
                        key={category}
                        onClick={() => updateQueryParams({ category })}
                        className={`badge badge-lg w-full transition-all duration-200 ${
                          currentValues.category === category 
                            ? 'badge-primary scale-105' 
                            : 'badge-outline hover:scale-105'
                        }`}
                      >
                        {category} ({_count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Universities */}
              {universities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">University</h3>
                  <select
                    value={currentValues.university || ''}
                    onChange={(e) => updateQueryParams({ university: e.target.value })}
                    className="select select-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Universities</option>
                    {universities.map(({ university, _count }) => (
                      <option key={university} value={university}>
                        {university} ({_count})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price range */}
              {showPriceFilter && priceRange && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Price Range</h3>
                  <div className="flex gap-4">
                    <div className="form-control flex-1">
                      <input
                        type="number"
                        placeholder="Min"
                        value={currentValues.minPrice || ''}
                        min={Math.floor(Number(priceRange._min.price))}
                        max={Math.ceil(Number(priceRange._max.price))}
                        onChange={(e) => updateQueryParams({ minPrice: e.target.value })}
                        className="input input-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <span className="text-base-content/50">-</span>
                    <div className="form-control flex-1">
                      <input
                        type="number"
                        placeholder="Max"
                        value={currentValues.maxPrice || ''}
                        min={Math.floor(Number(priceRange._min.price))}
                        max={Math.ceil(Number(priceRange._max.price))}
                        onChange={(e) => updateQueryParams({ maxPrice: e.target.value })}
                        className="input input-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Verified sellers filter */}
              {showVerifiedFilter && (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentValues.verified === 'true'}
                      onChange={(e) => updateQueryParams({ verified: e.target.checked ? 'true' : undefined })}
                      className="checkbox checkbox-primary transition-all duration-200 group-hover:scale-105"
                    />
                    <span>Verified Sellers Only</span>
                  </label>
                </div>
              )}

              {/* Sort options */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sort By</h3>
                <select
                  value={currentValues.sort || 'recent'}
                  onChange={(e) => updateQueryParams({ sort: e.target.value })}
                  className="select select-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  {showVerifiedFilter && <option value="relevance">Best Match</option>}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}