'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import ListingImageGallery from './ListingImageGallery';
import ListingDetails from './ListingDetails';
import SellerInfo from './SellerInfo';
import ListingComments from './ListingComments';
import ListingActions from './ListingActions';
import type { ListingMedia } from '@prisma/client';

interface ListingPageClientProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    location: string | null;
    allow_swap: boolean;
    allow_negotiation: boolean;
    images: ListingMedia[];
    user: {
      id: string;
      full_name: string;
      profile_image: string | null;
      university: string;
      is_verified: boolean;
      _count: {
        reviews_received: number;
      };
    };
    comments: {
      id: string;
      content: string;
      created_at: Date;
      user: {
        full_name: string;
        profile_image: string | null;
      };
    }[];
    _count: {
      likes: number;
      comments: number;
      bookmarks: number;
    };
  };
  currentUserId?: string;
}

export default function ListingPageClient({ listing, currentUserId }: ListingPageClientProps) {
  const router = useRouter();
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState(listing.comments);

  const { 
    likes, 
    bookmarks,
    isLiked,
    isBookmarked,
    isLoading,
    handleLike,
    handleBookmark,
    handleMessage,
    handleBuy
  } = ListingActions({
    listingId: listing.id,
    initialLikes: listing._count.likes,
    initialBookmarks: listing._count.bookmarks,
    onSuccess: () => {
      router.refresh();
    }
  });

  const handleAddComment = async (content: string) => {
    if (!currentUserId) {
      router.push('/auth/signin');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/listings/${listing.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const newComment = await response.json();
      setComments(prev => [newComment, ...prev]);
      router.refresh();
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Gallery */}
        <ListingImageGallery 
          images={listing.images} 
          title={listing.title} 
        />

        {/* Right column - Details */}
        <div className="space-y-8">
          <ListingDetails
            title={listing.title}
            description={listing.description}
            price={Number(listing.price)}
            category={listing.category}
            condition={listing.condition}
            location={listing.location || ''}
            allowSwap={listing.allow_swap}
            allowNegotiation={listing.allow_negotiation}
            user={listing.user}
            stats={{
              likes,
              comments: listing._count.comments,
              bookmarks
            }}
            isOwner={currentUserId === listing.user.id}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onMessage={handleMessage}
            onBuy={handleBuy}
          />

          <SellerInfo
            id={listing.user.id}
            name={listing.user.full_name}
            profileImage={listing.user.profile_image}
            university={listing.user.university}
            isVerified={listing.user.is_verified}
            reviewCount={listing.user._count.reviews_received}
          />
        </div>
      </div>

      {/* Comments section */}
      <div className="mt-12">
        <ListingComments 
          comments={comments}
          onAddComment={currentUserId ? handleAddComment : undefined}
        />
      </div>
    </div>
  );
}