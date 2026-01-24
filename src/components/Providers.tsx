'use client';
import { SessionProvider } from "next-auth/react";
import { FleetProvider } from "@/context/FleetContext";
import { Session } from "next-auth";

export function Providers({ children, session }: { children: React.ReactNode, session?: Session | null }) {
  return (
    <SessionProvider session={session}>
      <FleetProvider>
        {children}
      </FleetProvider>
    </SessionProvider>
  );
}
