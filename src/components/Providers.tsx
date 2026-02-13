'use client';
import { SessionProvider } from "next-auth/react";
import { FleetProvider } from "@/context/FleetContext";
import { Session } from "next-auth";

import { Vehicle, Driver, MaintenanceRecord } from "@/utils/mockData";
import { PushNotificationManager } from "./PushNotificationManager";

export function Providers({ children, session, initialVehicles, initialDrivers, initialMaintenance }: { children: React.ReactNode, session?: Session | null, initialVehicles?: Vehicle[], initialDrivers?: Driver[], initialMaintenance?: MaintenanceRecord[] }) {
  return (
    <SessionProvider session={session}>
      <FleetProvider initialVehicles={initialVehicles} initialDrivers={initialDrivers} initialMaintenance={initialMaintenance}>
        <PushNotificationManager />
        {children}
      </FleetProvider>
    </SessionProvider>
  );
}
