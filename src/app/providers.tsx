"use client";

import { PrimeReactProvider } from "primereact/api";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PrimeReactProvider>
        {children}
      </PrimeReactProvider>
    </SessionProvider>
  );
}