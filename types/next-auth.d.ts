import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      fullName?: string | null;
      email?: string | null;
      profileImage?: string | null;
      isVerified?: boolean;
      verificationStatus?: 'VERIFIED' | 'PENDING' | 'UNDER_REVIEW' | 'REJECTED'; 
      role: 'USER' | 'ADMIN' | 'MODERATOR';
    };
  }
  
  interface User {
    id: string;
    fullName?: string | null;
    email?: string | null;
    profileImage?: string | null;
    isVerified?: boolean;
    verificationStatus?: 'VERIFIED' | 'PENDING' | 'UNDER_REVIEW' | 'REJECTED'; 
    role: 'USER' | 'ADMIN' | 'MODERATOR';
  }
}