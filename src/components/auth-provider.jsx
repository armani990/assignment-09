"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { getUser, getServerUser, subscribe, writeUser } from "@/lib/auth-store";

const AuthContext = createContext(null);

export const DEMO_USER = {
  name: "Arman",
  email: "arman@pizzahub.com",
};

export function AuthProvider({ children }) {
  const user = useSyncExternalStore(subscribe, getUser, getServerUser);

  const value = useMemo(
    () => ({
      user,
      login(nextUser = DEMO_USER) {
        writeUser(nextUser);
      },
      logout() {
        writeUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
