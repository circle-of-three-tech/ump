'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Tag, Book } from 'lucide-react';
import Image from 'next/image';
import debounce from 'lodash/debounce';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = debounce(async (q: string) => {
    if (!q.trim()) {
      setSuggestions({});
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=suggestions`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      fetchSuggestions(query);
    } else {
      setSuggestions({});
    }
  }, [query]);

  const handleSearch = (searchQuery: string, type?: string, category?: string) => {
    setShowSuggestions(false);
    setQuery('');

    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category) params.set('category', category);
    if (type === 'user') {
      router.push(`/search/users?${params.toString()}`);
    } else {
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="relative flex-1 max-w-xl" ref={suggestionRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search..."
          aria-label="Search listings, users, or categories"
          className="w-full rounded-full bg-gray-100 px-4 py-2 pl-10 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm sm:text-base"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (query || Object.keys(suggestions).length > 0) && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border overflow-hidden z-50 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {/* Categories */}
          {suggestions.categories?.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 pl-2 mb-1">Categories</div>
              {suggestions.categories.map((cat: any) => (
                <button
                  key={cat.value}
                  onClick={() => handleSearch('', 'category', cat.value)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-md text-sm"
                >
                  <Book className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{cat.value}</span>
                  <span className="text-sm text-gray-500 shrink-0">({cat.count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Users */}
          {suggestions.users?.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-xs font-semibold text-gray-500 pl-2 mb-1">Users</div>
              {suggestions.users.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => router.push(`/profile/${user.id}`)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-md text-sm"
                >
                  {user.image ? (
                    <div className="shrink-0">
                      <Image
                        src={user.image}
                        alt={user.value}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <User className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm truncate">{user.value}</span>
                    <span className="text-xs text-gray-500 truncate">{user.university}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Tags */}
          {suggestions.tags?.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-xs font-semibold text-gray-500 pl-2 mb-1">Tags</div>
              {suggestions.tags.map((tag: any) => (
                <button
                  key={tag.value}
                  onClick={() => handleSearch(tag.value)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-md text-sm"
                >
                  <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{tag.value}</span>
                  <span className="text-sm text-gray-500 shrink-0">({tag.count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Listings */}
          {suggestions.listings?.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-xs font-semibold text-gray-500 pl-2 mb-1">Listings</div>
              {suggestions.listings.map((listing: any) => (
                <button
                  key={listing.value}
                  onClick={() => handleSearch(listing.value)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-md text-sm text-left"
                >
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate">{listing.value}</div>
                    <div className="text-xs text-gray-500 truncate">in {listing.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && Object.keys(suggestions).length === 0 && !isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No suggestions found
            </div>
          )}

          {/* Search button */}
          {query && (
            <button
              onClick={() => handleSearch(query)}
              className="w-full p-3 text-left border-t hover:bg-gray-50 text-sm"
            >
              <span className="text-indigo-600">
                Search for "{query}"
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}