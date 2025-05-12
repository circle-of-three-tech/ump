"use client";
import { redirect } from 'next/navigation'; 
import { NotificationsTabs } from './components/NotificationsTabs';
import { useSession } from 'next-auth/react';

export default async function NotificationsPage() {
  
    const { data: session } = useSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <main className="container max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <NotificationsTabs userId={session.user.id} />
    </main>
  );
}