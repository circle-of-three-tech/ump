'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, X, Plus, DollarSign, MapPin, Tag, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  'Books', 'Electronics', 'Furniture', 'Clothing', 
  'Services', 'Housing', 'Tickets', 'Ride Shares'
];

const CONDITIONS = [
  'New', 'Like New', 'Good', 'Fair', 'Poor'
];

interface CreateListingWidgetProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export default function CreateListingWidget({ isVisible, onClose }: CreateListingWidgetProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExpanded, setIsExpanded] = useState(isVisible);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    tags: [] as string[],
    allowSwap: false,
    allowNegotiation: false,
  });
  const [currentTag, setCurrentTag] = useState('');

  // Sync with external visibility control
  useEffect(() => {
    setIsExpanded(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setIsExpanded(false);
    onClose?.();
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreviews(prev => [...prev, ...newPreviews]);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()]
        }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    try {
      // First, upload media files
      const mediaUrls = [];
      for (const file of mediaFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const { url } = await res.json();
        mediaUrls.push(url);
      }

      // Then create the listing
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images: mediaUrls,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      // Reset form and collapse widget
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: '',
        location: '',
        tags: [],
        allowSwap: false,
        allowNegotiation: false,
      });
      setMediaFiles([]);
      setMediaPreviews([]);
      handleClose();
      router.refresh();
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className={`fixed inset-x-0 top-20 z-50 mx-auto max-w-3xl px-4 transition-all duration-300 ${
      isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
    }`}>
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}`}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200 transition"
            onClick={() => !isExpanded && setIsExpanded(true)}
        >
          What would you like to sell, {session?.user?.name?.split(' ')[0]}?
        </div>
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Media Upload */}
          <div className="grid grid-cols-4 gap-2">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {mediaPreviews.length < 4 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
              >
                <Camera className="w-6 h-6 text-gray-400" />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaChange}
            accept="image/*,video/*"
            multiple
            className="hidden"
          />

          {/* Title & Description */}
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Price & Category Row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Condition & Location Row */}
          <div className="flex gap-4">
            <select
              value={formData.condition}
              onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Condition</option>
              {CONDITIONS.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Add tags (press Enter)"
                value={currentTag}
                onChange={e => setCurrentTag(e.target.value)}
                onKeyDown={handleTagAdd}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-gray-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.allowSwap}
                onChange={e => setFormData(prev => ({ ...prev, allowSwap: e.target.checked }))}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Allow Swaps
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.allowNegotiation}
                onChange={e => setFormData(prev => ({ ...prev, allowNegotiation: e.target.checked }))}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Allow Negotiation
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
                onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title || !formData.category || !formData.price}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Listing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 