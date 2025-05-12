'use client';

import { Suspense } from 'react';
import { NotificationsList } from './NotificationsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface NotificationsClientProps {
  userId: string;
}

export function NotificationsClient({ userId }: NotificationsClientProps) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="unread">Unread</TabsTrigger>
      </TabsList>
      
      <Suspense 
        fallback={
          <div className="mt-8 flex justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <TabsContent value="all" className="mt-6">
          <NotificationsList userId={userId} />
        </TabsContent>
        
        <TabsContent value="unread" className="mt-6">
          <NotificationsList userId={userId} unreadOnly />
        </TabsContent>
      </Suspense>
    </Tabs>
  );
}
