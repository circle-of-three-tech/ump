'use client';

import { Badge } from '@/components/ui/badge';
// import type { User } from '@prisma/client';
import { Heart, MessageSquare, Bookmark } from 'lucide-react';
import { useState } from 'react';
import SponsorListingModal from '@/app/components/listing/SponsorListingModal';
import { PaymentForm } from '../PaymentForm';

interface ListingDetailsProps {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  allowSwap: boolean;
  allowNegotiation: boolean;
  user: {
    id: string;
    full_name: string;
    profile_image: string | null;
    university: string;
    is_verified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isOwner: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  onMessage?: () => void;
  onBuy?: () => void;
  listing: {
    id: string;
    is_sponsored: boolean;
  };
}

export default function ListingDetails({ listing, isOwner, title, description, price, category, condition, location, allowSwap, allowNegotiation, user, stats, onLike, onComment, onBookmark, onMessage, onBuy }: ListingDetailsProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl font-semibold">${price.toFixed(2)}</span>
          {allowNegotiation && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Negotiable
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold">Description</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-medium">{category}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Condition</p>
          <p className="font-medium">{condition}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium">{location}</p>
        </div>
        {allowSwap && (
          <div>
            <p className="text-sm text-gray-500">Exchange</p>
            <p className="font-medium">Open to swaps</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isOwner && (
        <div className="flex gap-4">
          <button
            onClick={() => setShowPaymentForm(true)}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Buy Now
          </button>
          <button
            onClick={onMessage}
            className="flex-1 border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition"
          >
            Message Seller
          </button>
        </div>
      )}

      {/* Sponsor button for listing owner */}
      {isOwner && !listing?.is_sponsored && (
        <button
          onClick={() => setShowSponsorModal(true)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          <span className="mr-2">★</span>
          Sponsor this listing
        </button>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          listingId={listing.id}
          listingTitle={title}
          price={price}
          onClose={() => setShowPaymentForm(false)}
        />
      )}

      {/* Sponsor modal */}
      <SponsorListingModal
        listingId={listing?.id}
        isOpen={showSponsorModal}
        onClose={() => setShowSponsorModal(false)}
      />

      {/* Engagement */}
      <div className="flex items-center gap-6 pt-4 border-t">
        <button
          onClick={onLike}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
        >
          <Heart className="w-5 h-5" />
          <span>{stats.likes}</span>
        </button>
        <button
          onClick={onComment}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition"
        >
          <MessageSquare className="w-5 h-5" />
          <span>{stats.comments}</span>
        </button>
        <button
          onClick={onBookmark}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition"
        >
          <Bookmark className="w-5 h-5" />
          <span>{stats.bookmarks}</span>
        </button>
      </div>
    </div>
  );
}