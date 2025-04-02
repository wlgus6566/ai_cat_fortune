"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { UserProvider } from "./contexts/UserContext";
import { CompatibilityProvider } from "./context/CompatibilityContext";
import { FriendCompatibilityProvider } from "./context/FriendCompatibilityContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        <CompatibilityProvider>
          <FriendCompatibilityProvider>{children}</FriendCompatibilityProvider>
        </CompatibilityProvider>
      </UserProvider>
    </SessionProvider>
  );
}
