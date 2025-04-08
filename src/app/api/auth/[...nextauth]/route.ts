import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

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
      
          return {
            id: user.id,
            name: user.name,
            email: user.email,
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