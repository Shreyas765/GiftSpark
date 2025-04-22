import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

/*
export function validateStaffPassword(password: string): boolean {
  // TO DO: implement password validation logic
  return true; // temporary implementation
}
*/

export const authOptions = {
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
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data: { id: string; name: string; email: string; message?: string } = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
          }

          if (!data || !data.id) {
            throw new Error('Invalid response from server');
          }

          return {
            id: data.id,
            name: data.name,
            email: data.email,
          };
        } catch (error: unknown) {
          console.error('Auth error:', error);
          throw new Error((error as Error).message || 'Authentication failed');
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: '/auth/signin',
  },
};
