import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

// Mock user for demonstration
const MOCK_USER = {
  id: '1',
  name: 'Admin User',
  email: 'admin@aicrone.com',
  password: 'password', // In a real app, this would be hashed
  image: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
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
          
          if (email === MOCK_USER.email && password === MOCK_USER.password) {
            return {
              id: MOCK_USER.id,
              name: MOCK_USER.name,
              email: MOCK_USER.email,
              image: MOCK_USER.image,
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
  },
  secret: 'super-secret-random-string-that-should-be-in-env-file', 
});
