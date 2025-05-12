'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast  from 'react-hot-toast';

interface ListingActionsProps {
  listingId: string;
  initialLikes: number;
  initialBookmarks: number;
  onSuccess?: () => void;
}

export default function ListingActions({
  listingId,
  initialLikes,
  initialBookmarks,
  onSuccess
}: ListingActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/like`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to like listing');

      setLikes(prev => prev + (isLiked ? -1 : 1));
      setIsLiked(prev => !prev);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to like listing'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/bookmark`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to bookmark listing');

      setBookmarks(prev => prev + (isBookmarked ? -1 : 1));
      setIsBookmarked(prev => !prev);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to bookmark listing'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    router.push(`/messages?listing=${listingId}`);
  };

  const handleBuy = () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    // Implement buy flow
    toast.success('Buy functionality coming soon!');
  };

  return {
    likes,
    bookmarks,
    isLiked,
    isBookmarked,
    isLoading,
    handleLike,
    handleBookmark,
    handleMessage,
    handleBuy
  };
}