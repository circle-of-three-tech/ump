'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface SellerInfoProps {
  id: string;
  name: string;
  profileImage: string | null;
  university: string;
  isVerified: boolean;
  reviewCount: number;
  avgRating?: number;
}

export default function SellerInfo({
  id,
  name,
  profileImage,
  university,
  isVerified,
  reviewCount,
  avgRating
}: SellerInfoProps) {
  return (
    <Link 
      href={`/profile/${id}`}
      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50 transition"
    >
      <div className="relative">
        <Image
          src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`}
          alt={name}
          width={48}
          height={48}
          className="rounded-full"
        />
        {isVerified && (
          <div className="absolute -right-1 -bottom-1 bg-blue-500 text-white p-0.5 rounded-full">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{name}</h3>
          {isVerified && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Verified
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600">{university}</p>
        
        {reviewCount > 0 && (
          <div className="mt-1 text-sm text-gray-600">
            {avgRating && (
              <span className="font-medium text-gray-900">
                {avgRating.toFixed(1)} ★{' '}
              </span>
            )}
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </div>
        )}
      </div>
    </Link>
  );
}