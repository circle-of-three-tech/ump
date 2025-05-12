import NextAuth, { type NextAuthOptions, type User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials', 
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your-email@university.edu' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password_hash) {
          throw new Error('Invalid email or password');
        }
        const isValid = await compare(credentials.password, user.password_hash);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }
        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
          image: user.profile_image || "",
          isVerified: user.is_verified,
          university: user.university, 
          bio: user.bio,
          profile_image: user.profile_image,
          is_verified: user.is_verified,
          verification_status: user.verification_status,
          profile_completed: user.profile_completed
        } as User;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          hd: '', // restrict to .edu domains if needed
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          response_mode: 'query',
          scope: 'openid email profile offline_access User.Read',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: User }) {
      if (user) {
        token.id = user.id;
        token.isVerified = (user as any).isVerified;
        token.university = (user as any).university;
        token.profile_completed = (user as any).profile_completed;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.isVerified = token.isVerified;
        session.user.university = token.university;
        session.user.profile_completed = token.profile_completed;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always allow callbackUrls (internal redirects)
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // If user is signing in and not verified, redirect to verify
      if (url.includes('/auth/signin')) {
        return `${baseUrl}/`;
      }
      
      // If user is signing up, redirect to onboarding
      if (url.includes('/auth/signup')) {
        return `${baseUrl}/onboarding`;
      }
      
      // Default redirect to home
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
