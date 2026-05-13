"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserData {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/me", { signal });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("UserContext: Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /** Re-fetches user data without showing a loading spinner — used after mutations */
  const refreshUser = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("UserContext: Error refreshing user:", error);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchUser(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
