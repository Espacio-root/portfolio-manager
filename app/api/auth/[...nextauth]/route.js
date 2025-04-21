import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '../../../lib/db';
import User from '../../../../models/User';

// Add this for Vercel Pro plans (remove if on hobby plan)
export const config = {
  maxDuration: 60
};

// Separate function for user creation to avoid blocking authentication
async function createUserIfNeeded(userData) {
  try {
    await connectDB();
    const existingUser = await User.findOne({ email: userData.email });
    
    if (!existingUser) {
      await User.create({
        name: userData.name,
        email: userData.email,
        image: userData.image,
        portfolio: []
      });
    }
    return true;
  } catch (error) {
    console.error('Error in user creation:', error);
    return false;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        // Don't block sign-in with database operations
        // Just verify the user has a Google account
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // If this is the first sign in, schedule user creation
      if (account && user) {
        // Don't await this - let it run in the background
        createUserIfNeeded(user).catch(console.error);
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID to session if needed
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
