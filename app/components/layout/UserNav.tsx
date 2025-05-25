'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { User, Settings, LogOut, AlertCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { useCallback } from 'react';

export function UserNav() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isVerified = session?.user?.isVerified && 
    session?.user?.verificationStatus === 'VERIFIED';

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }, [router]);

  if (status === 'loading') {
    return null;
  }

  if (!session) {
    return (
      <Button variant="default" onClick={() => handleNavigation('/auth/signin')}>
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={session.user.profileImage ?? ''} 
              alt={session.user.fullName ?? ''} 
            />
            <AvatarFallback>
              {session.user.fullName?.[0] ?? '?'}
            </AvatarFallback>
          </Avatar>
          {!isVerified && (
            <div className="absolute -top-1 -right-1">
              <Badge variant="destructive" className="h-4 w-4 rounded-full p-0">
                <AlertCircle className="h-3 w-3" />
              </Badge>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {session.user.fullName}
              </p>
              {!isVerified && (
                <Badge variant="destructive" className="text-xs">
                  Unverified
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigation(`/profile/${session.user.id}`)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation('/dashboard')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          {!isVerified && (
            <DropdownMenuItem 
              onClick={() => handleNavigation('/auth/verify')}
              className="text-destructive"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              <span>Verify Account</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}