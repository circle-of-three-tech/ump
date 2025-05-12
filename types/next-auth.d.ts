import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      university?: string | null;
      bio?: string | null;
      is_verified?: boolean;
    }
  }

  interface User {
    id: string;
    email: string;
    full_name: string;
    university: string;
    bio?: string;
    profile_image?: string;
    is_verified: boolean;
    verification_status: string;
  }
}