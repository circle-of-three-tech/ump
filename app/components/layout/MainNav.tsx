import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'ADMIN';
  const isModerator = session?.user?.role === 'MODERATOR';

  const routes = [
    {
      href: '/browse',
      label: 'Browse',
      active: pathname === '/browse',
    },
    {
      href: '/categories',
      label: 'Categories',
      active: pathname === '/categories',
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    // Admin routes
    ...(isAdmin ? [
      {
        href: '/admin',
        label: 'Admin',
        active: pathname.startsWith('/admin'),
      },
    ] : []),
    // Moderator routes
    ...(isModerator ? [
      {
        href: '/moderation',
        label: 'Moderation',
        active: pathname.startsWith('/moderation'),
      },
    ] : []),
  ];

  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)} {...props}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
