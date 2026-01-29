'use client';
import { SessionProvider } from "next-auth/react";
import { FleetProvider } from "@/context/FleetContext";
import { Session } from "next-auth";

import { Vehicle, Driver } from "@/utils/mockData";

export function Providers({ children, session, initialVehicles, initialDrivers }: { children: React.ReactNode, session?: Session | null, initialVehicles?: Vehicle[], initialDrivers?: Driver[] }) {
  return (
    <SessionProvider session={session}>
      <FleetProvider initialVehicles={initialVehicles} initialDrivers={initialDrivers}>
        {children}
      </FleetProvider>
    </SessionProvider>
  );
}
