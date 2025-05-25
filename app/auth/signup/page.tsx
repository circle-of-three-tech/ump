'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
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
import { Icons } from '@/components/ui/icons';
import { Combobox } from '@/components/ui/combobox';
import { UniversityService } from '@/app/lib/services/university-service';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
  const [universities, setUniversities] = useState<{ label: string; value: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [email, setEmail] = useState('');

  useEffect(() => {
    setCountries(UniversityService.getCountries());
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setUniversities(UniversityService.getUniversitiesByCountry(selectedCountry));
      setSelectedUniversity('');
    }
  }, [selectedCountry]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      
      if (!selectedUniversity) {
        throw new Error('Please select a university');
      }

      if (!UniversityService.isValidUniversityEmail(email, selectedUniversity)) {
        throw new Error('Please use your university email address');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: formData.get('password'),
          fullName: formData.get('fullName'),
          university: selectedUniversity,
          country: selectedCountry,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      toast.success('Please check your email to verify your account.');
      router.push('/auth/signin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Icons.logo className="mr-2 h-6 w-6" />
          UniMarkets
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Join the trusted marketplace for university students.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                Sign up to start buying and selling on UniMarkets
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Combobox
                    disabled={false}
                    options={countries}
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                    placeholder="Select your country"
                    searchPlaceholder="Search countries..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>University</Label>
                  <Combobox
                    options={universities}
                    value={selectedUniversity}
                    onValueChange={setSelectedUniversity}
                    placeholder="Select your university"
                    searchPlaceholder="Search universities..."
                    disabled={!selectedCountry}
                    emptyText={selectedCountry ? "No universities found" : "Select a country first"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">University Email </Label>
                  <span className='text-gray-400 text-sm mb-4'>{"university-specific emails (like .edu, etc) get verification badges."}</span>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@university.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 mt-8">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign Up
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" onClick={() => signIn('google')}>
                    <Icons.google className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => signIn('facebook')}>
                    <Icons.facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => signIn('apple')}>
                    <Icons.apple className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="underline">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
