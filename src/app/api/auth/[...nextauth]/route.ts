import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { 
  isStaffPasswordExpired,
  requiresMFA,
  SYSTEM_ROLES
} from '@/utils/staff-password-policy';
import { logSecurityIncident } from '@/utils/security';
import { SecurityIncidentLevel, SecurityIncidentType } from '@/utils/security';

const handler = NextAuth({
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
          await connectDB();
          
          // First, check if this is a staff login attempt
          const isStaffEmail = credentials?.email?.endsWith('@giftspark.com');
          
          // Find user
          const user = await User.findOne({ email: credentials?.email });
          if (!user) {
            throw new Error('Invalid credentials');
          }

          // Check password
          const isMatch = await user.comparePassword(credentials?.password || '');
          if (!isMatch) {
            throw new Error('Invalid credentials');
          }
      
          // Handle staff authentication
          if (isStaffEmail && user.role && Object.values(SYSTEM_ROLES).includes(user.role)) {
            // Check if MFA is required
            if (requiresMFA(user.id)) {
              throw new Error('MFA required for staff accounts');
            }

            // Check if password is expired
            if (isStaffPasswordExpired(user.id)) {
              throw new Error('Staff password has expired');
            }

            // Log staff login attempt
            await logSecurityIncident({
              timestamp: Date.now(),
              level: SecurityIncidentLevel.INFO,
              type: SecurityIncidentType.UNAUTHORIZED_ACCESS,
              ip: 'unknown',
              userId: user.id,
              details: 'Staff login attempt'
            });
          }
      
          // Set default role for regular users if none provided
          const userRole = isStaffEmail ? user.role : (user.role || 'user');
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: userRole,
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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user for Google sign-in
            const newUser = new User({
              email: user.email,
              name: user.name,
              password: Math.random().toString(36).slice(-8), // Random password for Google users
            });
            
            await newUser.save();
            console.log('New Google user created:', newUser.email);
          }
          
          return true;
        } catch (error) {
          console.error('Error in Google sign-in:', error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
});

export { handler as GET, handler as POST };