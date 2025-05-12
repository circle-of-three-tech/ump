import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, X } from 'lucide-react';
import { usePaystack } from '@/app/hooks/usePaystack';

interface SponsorListingModalProps {
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SPONSORSHIP_TIERS = [
  {
    id: 1,
    name: 'Basic',
    price: 4.99,
    duration: '7 days',
    features: [
      'Sponsored tag',
      'Priority in search results',
      'Basic highlight effect'
    ]
  },
  {
    id: 2,
    name: 'Premium',
    price: 9.99,
    duration: '14 days',
    features: [
      'Premium sponsored tag',
      'Top priority in search',
      'Silver highlight effect',
      'Double visibility boost'
    ]
  },
  {
    id: 3,
    name: 'Featured',
    price: 19.99,
    duration: '30 days',
    features: [
      'Featured tag with gold effect',
      'Highest search priority',
      'Gold highlight effect',
      'Triple visibility boost',
      'Featured section placement'
    ]
  }
];

export default function SponsorListingModal({
  listingId,
  isOpen,
  onClose
}: SponsorListingModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const { initializePayment } = usePaystack();

  const handleSponsor = async (tierId: number) => {
    try {
      setLoading(true);
      setSelectedTier(tierId);
      
      const selectedTierData = SPONSORSHIP_TIERS.find(tier => tier.id === tierId);
      if (!selectedTierData) throw new Error('Invalid tier selected');

      const response = await fetch('/api/listings/sponsor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          tierId
        }),
      });

      const data = await response.json();
      
      await initializePayment({
        email: data.userEmail,
        amount: selectedTierData.price * 100, // Convert to kobo
        reference: data.reference,
        metadata: {
          listingId,
          tierId,
          sponsorshipDuration: selectedTierData.duration
        },
        onSuccess: () => {
          // Handle success - redirect will be handled by the webhook
          onClose();
        },
        onCancel: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Sponsorship error:', error);
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-semibold">
                Sponsor Your Listing
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-full p-1.5 hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {SPONSORSHIP_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-lg border p-6 ${
                    tier.id === 3
                      ? 'border-yellow-400 bg-yellow-50'
                      : tier.id === 2
                      ? 'border-slate-300 bg-slate-50'
                      : 'border-amber-600 bg-amber-50'
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                  <p className="text-3xl font-bold mb-4">${tier.price}</p>
                  <p className="text-gray-600 mb-4">{tier.duration}</p>
                  
                  <ul className="mb-6 space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSponsor(tier.id)}
                    disabled={loading && selectedTier === tier.id}
                    className={`w-full py-2 rounded-lg font-medium ${
                      tier.id === 3
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-white'
                        : tier.id === 2
                        ? 'bg-slate-400 hover:bg-slate-500 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {loading && selectedTier === tier.id ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Select Plan'
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              Boost your listing's visibility and reach more potential buyers!
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}