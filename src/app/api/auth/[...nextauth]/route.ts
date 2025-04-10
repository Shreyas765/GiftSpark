import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { 
  validateStaffPassword,
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
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // First, check if this is a staff login attempt
          const isStaffEmail = credentials?.email?.endsWith('@giftspark.com');
          
          // Get user data from backend
          const response = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });
      
          if (!response.ok) {
            const data = await response.json();
            console.error("Login failed:", data);
            throw new Error(data.message || 'Authentication failed');
          }
      
          const user = await response.json();
      
          if (!user || !user.id || !user.email) {
            throw new Error('Invalid user data returned');
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
              ip: 'unknown', // NextAuth doesn't provide IP in authorize callback
              userId: user.id,
              details: 'Staff login attempt'
            });
          }
      
          // Set default role for regular users if none provided
          const userRole = isStaffEmail ? user.role : (user.role || 'user');
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: userRole,
          };
        } catch (error: any) {
          console.error('Authorize error:', error);
          throw new Error(error.message || 'Authentication error');
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };