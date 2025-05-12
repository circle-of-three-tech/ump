'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Bookmark, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/app/utils/client';
import { toast } from 'react-hot-toast';
import placeholder from '../../../assets/images/placeholder.png';


interface ListingWithUser {
  id: string;
  title: string;
  description: string;
  price: number;
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

interface FullScreenListingCardProps {
  listing: ListingWithUser;
}

export default function FullScreenListingCard({ listing }: FullScreenListingCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number>(0);

  // Validate images array
  const hasValidImages = listing.images && listing.images.length > 0 && listing.images[0]?.url;
  const currentImage = hasValidImages ? listing.images[currentImageIndex]?.url : placeholder;
  
  // Only allow navigation when there are valid images
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasValidImages) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasValidImages) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && currentImageIndex < listing.images.length - 1) {
        // Swipe left
        setCurrentImageIndex(prev => prev + 1);
      } else if (diff < 0 && currentImageIndex > 0) {
        // Swipe right
        setCurrentImageIndex(prev => prev - 1);
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like API call
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API call
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } catch (err) {
      toast.error('Sharing failed');
    }
  };

  const handleMessage = () => {
    router.push(`/messages?listingId=${listing.id}`);
  };

  const handleBuy = () => {
    router.push(`/listings/${listing.id}`);
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Main image */}
      <div 
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={currentImage}
          alt={listing.title}
          fill
          className={`object-contain transition-opacity duration-200 ${hasValidImages ? '' : 'opacity-50'}`}
          priority
        />

        {/* Image navigation dots */}
        {hasValidImages && listing.images.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1">
            {listing.images.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* No images message */}
        {!hasValidImages && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            <p className="text-lg">No images available</p>
          </div>
        )}

        {/* Interaction buttons */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-4">
          <button 
            onClick={handleLike}
            className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
          >
            <Heart 
              className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
            />
            <span className="text-xs mt-1">{listing._count.likes}</span>
          </button>

          <button 
            onClick={handleMessage}
            className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="text-xs mt-1">{listing._count.comments}</span>
          </button>

          <button 
            onClick={handleBookmark}
            className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
          >
            <Bookmark 
              className={`w-7 h-7 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} 
            />
            <span className="text-xs mt-1">{listing._count.bookmarks}</span>
          </button>

          <button 
            onClick={handleShare}
            className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
          >
            <Share2 className="w-7 h-7" />
            <span className="text-xs mt-1">Share</span>
          </button>
        </div>

        {/* Product info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold truncate flex-1">{listing.title}</h2>
            <span className="text-2xl font-bold ml-4">{formatCurrency(listing.price)}</span>
          </div>
          
          <p className="text-sm text-gray-300 mb-4 line-clamp-2">{listing.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={listing.user.profile_image || '/default-avatar.png'}
                alt={listing.user.full_name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-medium">{listing.user.full_name}</span>
            </div>

            <button
              onClick={handleBuy}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <DollarSign className="w-5 h-5" />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
