"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider 
      // Adding this option can help prevent certain types of fetch errors
      refetchInterval={0} 
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}