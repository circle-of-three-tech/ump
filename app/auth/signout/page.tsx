'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push('/');
    });
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Signing out...</p>
    </div>
  );
}
