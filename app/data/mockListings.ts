import type { Listing } from '../types';

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'MacBook Pro 2021',
    description: 'Like new MacBook Pro M1, 16GB RAM, 512GB SSD. Perfect for students! Includes charger and protective case.',
    price: 1299.99,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000',
    ],
    category: 'Electronics',
    condition: 'Like New',
    createdAt: '2024-03-15T10:00:00Z',
    user: {
      id: 'u1',
      name: 'Alex Thompson',
      image: 'https://ui-avatars.com/api/?name=Alex+Thompson',
      university: 'Stanford University'
    },
    likes: 24,
    comments: 5,
    isBookmarked: false
  },
  {
    id: '2',
    title: 'Calculus Textbook Bundle',
    description: 'Complete calculus textbook set (Calculus I, II, III) with solution manuals. Great condition, minimal highlighting.',
    price: 89.99,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000',
    ],
    category: 'Books',
    condition: 'Good',
    createdAt: '2024-03-14T15:30:00Z',
    user: {
      id: 'u2',
      name: 'Sarah Chen',
      image: 'https://ui-avatars.com/api/?name=Sarah+Chen',
      university: 'MIT'
    },
    likes: 12,
    comments: 3,
    isBookmarked: true
  },
  {
    id: '3',
    title: 'Modern Studio Apartment Sublet',
    description: 'Available for summer sublet! Fully furnished studio apartment near campus. All utilities included.',
    price: 1200,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000',
    ],
    category: 'Housing',
    condition: 'N/A',
    createdAt: '2024-03-14T09:15:00Z',
    user: {
      id: 'u3',
      name: 'Michael Brown',
      image: 'https://ui-avatars.com/api/?name=Michael+Brown',
      university: 'UC Berkeley'
    },
    likes: 45,
    comments: 8,
    isBookmarked: false
  },
  {
    id: '4',
    title: 'Concert Tickets - The Weeknd',
    description: 'Two tickets for The Weeknd concert next month. Great seats! Selling because I cannot make it.',
    price: 150,
    images: [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000',
    ],
    category: 'Tickets',
    condition: 'New',
    createdAt: '2024-03-13T20:45:00Z',
    user: {
      id: 'u4',
      name: 'Emma Wilson',
      image: 'https://ui-avatars.com/api/?name=Emma+Wilson',
      university: 'UCLA'
    },
    likes: 67,
    comments: 12,
    isBookmarked: false
  }
]; 