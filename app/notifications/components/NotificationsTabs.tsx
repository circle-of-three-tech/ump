'use client';

import { NotificationsList } from './NotificationsList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface NotificationsTabsProps {
  userId: string;
}

export function NotificationsTabs({ userId }: NotificationsTabsProps) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="unread">Unread</TabsTrigger>
      </TabsList>
      
      <Suspense fallback={
        <div className="mt-6 flex justify-center">
          <LoadingSpinner />
        </div>
      }>
        <TabsContent value="all" className="mt-4">
          <NotificationsList userId={userId} />
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4">
          <NotificationsList userId={userId} unreadOnly />
        </TabsContent>
      </Suspense>
    </Tabs>
  );
}
