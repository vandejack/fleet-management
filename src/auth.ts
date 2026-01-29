import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/prisma'; // Import prisma
// import bcrypt from 'bcryptjs'; // Not used yet
// Wait, seed used 'demo1234' plain text? And 'password' for admin? 
// The schema shows `password String`. 
// I'll assume simple string comparison for now to match the seed, or check if bcrypt is used. 
// The seed script used plain strings. I will use plain string comparison for simplicity as per "demo" request, 
// but mention it should be hashed in production.

// Mock user for demonstration
const MOCK_USER = {
  id: '1',
  name: 'Demo User',
  email: 'demo@aicrone.com',
  password: 'demo1234',
  image: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          // Check for Demo User
          if (email === MOCK_USER.email && password === MOCK_USER.password) {
            return {
              id: MOCK_USER.id,
              name: MOCK_USER.name,
              email: MOCK_USER.email,
              image: MOCK_USER.image,
            };
          }

          // Check DB for other users
          const user = await prisma.user.findUnique({ where: { email } });
          if (user && user.password === password) { // Plain text comparison for now
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
              companyId: user.companyId,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname !== '/login';

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyId = (user as any).companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role;
        (session.user as any).companyId = token.companyId;
      }
      return session;
    }
  },
  secret: 'super-secret-random-string-that-should-be-in-env-file',
});
