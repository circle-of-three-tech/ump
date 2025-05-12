'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart, MessageSquare, Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/app/utils/client';
import { useRouter } from 'next/navigation';
import placeholder from '../../assets/images/placeholder.png';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    images: string[];
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
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const {
    id,
    title,
    price,
    images,
    user,
    _count,
    is_sponsored,
    sponsored_tier
  } = listing;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const router = useRouter();

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images?.length > 1) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setImageError(false); // Reset error state when changing image
      setIsLoading(true);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images?.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setImageError(false); // Reset error state when changing image
      setIsLoading(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleDoubleTap = (e: React.MouseEvent) => {
    const currentTime = Date.now();
    const tapTimeout = 300; // Time in ms to consider a double tap

    if (currentTime - lastTapRef.current < tapTimeout) {
      e.stopPropagation();
      nextImage(e);
    }
    lastTapRef.current = currentTime;
  };
  const handleTouchCancel = () => {
    setTouchStart(null);
    setTouchEnd(null);
  };
  const handleTouchMoveEnd = (e: React.TouchEvent) => {
    if (touchStart && touchEnd) {
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      if (isLeftSwipe && currentImageIndex < (images?.length || 0) - 1) {
        setCurrentImageIndex((prev) => prev + 1);
        setImageError(false);
        setIsLoading(true);
      }
      if (isRightSwipe && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
        setImageError(false);
        setIsLoading(true);
      }
      setTouchStart(null);
      setTouchEnd(null);
    }
  };
  console.log(images)
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImageIndex < (images?.length || 0) - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setImageError(false);
      setIsLoading(true);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setImageError(false);
      setIsLoading(true);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const navigateToDetail = () => {
    router.push(`/listings/${id}`);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('Image failed to load:', images?.[currentImageIndex]);
    setImageError(true);
    setIsLoading(false);
  };

  // Get current image URL or fallback to placeholder
  const currentImageUrl = images?.[currentImageIndex] || '';
  const showPlaceholder = !currentImageUrl || imageError;

  return (
    <div 
      className={`rounded-lg overflow-hidden shadow-md transition-transform hover:scale-[1.02] ${
        is_sponsored ? 'ring-2 ring-yellow-400 bg-yellow-50' : 'bg-white'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={navigateToDetail}
    >
      <div className="relative">
        {/* Main Image */}
        <div className="relative w-full h-48">
          <Image
            src={showPlaceholder ? placeholder : currentImageUrl}
            alt={title}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoadingComplete={handleImageLoad}
            onError={handleImageError}
            priority={currentImageIndex === 0}
          />
          
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          )}

          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2">
              <AlertCircle className="w-6 h-6" />
              <span className="text-sm">Image unavailable</span>
            </div>
          )}

          {/* Navigation arrows for multiple images */}
          {images?.length > 1 && !imageError && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Image counter dots */}
          {images?.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    index === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sponsored badge */}
        {is_sponsored && (
          <div className="absolute top-2 right-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium
              ${sponsored_tier === 3 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                : sponsored_tier === 2 
                ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-white'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
              }`}
            >
              {sponsored_tier === 3 ? 'Featured' 
                : sponsored_tier === 2 ? 'Premium' 
                : 'Sponsored'}
            </div>
          </div>
        )}
      </div>

      {/* Listing details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold">{formatCurrency(price)}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm text-gray-500">
              <Heart className="w-4 h-4 mr-1" />
              {_count.likes}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MessageSquare className="w-4 h-4 mr-1" />
              {_count.comments}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative w-8 h-8 mr-3">
            <Image
              src={user.profile_image || '/default-avatar.png'}
              alt={user.full_name}
              fill
              className="rounded-full object-cover"
            />
            {user.is_verified && (
              <div className="absolute -right-1 -bottom-1">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600 truncate">
            {user.full_name}
          </span>
        </div>
      </div>
    </div>
  );
}