import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { usePaystackPayment } from 'react-paystack';
// import { PAYSTACK_PUBLIC_KEY } from '@/lib/paystack';

const TIER_INFO = {
  1: { name: 'Basic', price: '₦4.99', duration: '7 days', features: ['Higher search ranking', 'Highlighted in listings'] },
  2: { name: 'Premium', price: '₦9.99', duration: '14 days', features: ['Even higher search ranking', 'Premium badge', 'Featured section visibility'] },
  3: { name: 'Featured', price: '₦19.99', duration: '30 days', features: ['Top search ranking', 'Featured badge', 'Premium placement', 'Priority support'] },
};

interface SponsorListingButtonProps {
  listingId: string;
  currentTier?: number;
  sponsoredUntil?: Date | null;
  userEmail: string;
}

export function SponsorListingButton({ listingId, currentTier, sponsoredUntil, userEmail }: SponsorListingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSponsor = async (tierId: number) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/listings/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, tierId }),
      });

      if (!response.ok) throw new Error('Failed to create payment session');
      
      const { authorization_url } = await response.json();
      
      // Redirect to Paystack checkout
      window.location.href = authorization_url;
    } catch (error: any) {
      console.error('Sponsorship error:', error);
      // Handle error (show notification, etc)
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  // Handle existing sponsorship
  if (currentTier && sponsoredUntil) {
    const now = new Date();
    if (now < sponsoredUntil) {
      return (
        <div className="text-sm text-gray-600">
          Currently sponsored ({TIER_INFO[currentTier as keyof typeof TIER_INFO].name}) 
          until {new Date(sponsoredUntil).toLocaleDateString()}
        </div>
      );
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Sponsor Listing'}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Sponsor Your Listing</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(TIER_INFO).map(([tier, info]) => (
                <div
                  key={tier}
                  className="border rounded-lg p-4 hover:border-purple-500 cursor-pointer transition-all"
                  onClick={() => handleSponsor(parseInt(tier))}
                >
                  <h3 className="font-bold text-lg">{info.name}</h3>
                  <p className="text-2xl font-bold text-purple-600 my-2">{info.price}</p>
                  <p className="text-gray-600 mb-2">{info.duration}</p>
                  <ul className="text-sm">
                    {info.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}