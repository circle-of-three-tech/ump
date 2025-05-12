'use client'; 
// import ListingCard from './ListingCard';   
import ProductListingsWrapper from './ProductListingsWrapper';
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
import CreateListingWidget from './CreateListingWidget'; 

const categories = [
  'All',
   'Books', 'Electronics', 'Furniture', 'Clothing', 'Clothing Accessories',
  'Services', 'Housing', 'Event Tickets', 'Tutoring', 'Projects', 
  'Gadgets'
];

type Props = {
  transformedListings: Array<any>;
  university?: string;
  interests?: string[];
}

export default function HomePageClient({ transformedListings, university, interests }: Props) {
  const { data: session, status } = useSession();
  // const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreateWidgetVisible, setIsCreateWidgetVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [filteredListings, setFilteredListings] = useState(transformedListings);

  useEffect(() => {
    setFilteredListings(
      selectedCategory === 'All' 
        ? transformedListings 
        : transformedListings.filter(listing => listing.category === selectedCategory)
    );
  }, [selectedCategory, transformedListings]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <main className="w-full container mx-auto md:px-4 md:py-8">
      <div className="w-full space-y-6">
        {/* Tabs */}
        <Tabs defaultValue="browse" className="w-full mb-8 hidden md:flex">
          <TabsList>
            <TabsTrigger
              value="browse"
              onClick={() => {
                setActiveTab('browse');
                setIsCreateWidgetVisible(false);
              }}
            >
              Browse Listings
            </TabsTrigger>
            {session?.user && (
              <TabsTrigger
                value="create"
                onClick={() => {
                  setActiveTab('create');
                  setIsCreateWidgetVisible(true);
                }}
              >
                Create Listing
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {/* Content */}
        {activeTab === 'browse' ? (
          <>
            {/* Category filters - floating on mobile */}
            <div className="fixed md:relative left-0 right-0 z-10 px-4 md:px-0 bg-transparent backdrop-blur-md">
              <div className="w-full flex overflow-x-auto py-3 md:py-2 hide-scrollbar">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Add spacing for mobile to prevent content overlap */}
            <div className=" md:hidden" />

            {/* Listings grid */}
            <ProductListingsWrapper
              initialListings={filteredListings}
              queryType="home"
              category={selectedCategory !== 'All' ? selectedCategory : undefined}
              university={university}
              interests={interests}
            />
          </>
        ) : (
          <CreateListingWidget
            isVisible={isCreateWidgetVisible}
            onClose={() => {
              setIsCreateWidgetVisible(false);
              setActiveTab('browse');
            }}
          />
        )}
      </div>
    </main>
  );
}