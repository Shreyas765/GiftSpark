import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectBusinessDB } from '@/lib/db';
import getBusinessModel from '@/models/User';
import { 
  isStaffPasswordExpired,
  requiresMFA,
  SYSTEM_ROLES
} from '@/utils/staff-password-policy';
import { logSecurityIncident } from '@/utils/security';
import { SecurityIncidentLevel, SecurityIncidentType } from '@/utils/security';
import { User, Account } from "next-auth";
import { JWT } from "next-auth/jwt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const Business = await getBusinessModel();
          
          // Find business
          const business = await Business.findOne({ email: credentials?.email });
          if (!business) {
            throw new Error('Invalid credentials');
          }

          // Check password
          const isMatch = await business.comparePassword(credentials?.password || '');
          if (!isMatch) {
            throw new Error('Invalid credentials');
          }
      
          return {
            id: business._id.toString(),
            email: business.email,
            companyName: business.companyName,
            industry: business.industry,
            size: business.size,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication error');
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (account?.provider === 'google') {
        try {
          const Business = await getBusinessModel();
          
          // Check if business already exists
          const existingBusiness = await Business.findOne({ email: user.email });
          
          if (!existingBusiness) {
            // Create new business for Google sign-in
            const newBusiness = new Business({
              email: user.email,
              companyName: user.name || 'Unnamed Business',
              industry: 'Not specified',
              size: 'Not specified',
              password: Math.random().toString(36).slice(-8), // Random password for Google users
              employees: [],
            });
            
            await newBusiness.save();
            console.log('New Google business created:', newBusiness.email);
          }
          
          return true;
        } catch (error) {
          console.error('Error in Google sign-in:', error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };