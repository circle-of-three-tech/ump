'use client';

import Link from 'next/link';
import { UserNav } from './UserNav';
import { MainNav } from './MainNav';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b mx-auto">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="text-2xl font-bold">
          UniMarkets
        </Link>
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : session ? (
            <>
              {session.user?.isVerified && (
                <Button asChild variant="ghost">
                  <Link href="/listings/create">+ List Item</Link>
                </Button>
              )}
              <UserNav />
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
