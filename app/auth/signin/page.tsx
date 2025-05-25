'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Icons } from '../../../components/ui/icons';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error === 'CredentialsSignin' 
          ? 'Invalid email or password'
          : 'An error occurred during sign in'
        );
        return;
      }

      toast.success('Successfully signed in!');
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-8">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn('google', { callbackUrl })}
              type="button"
              disabled={isLoading}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
