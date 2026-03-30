"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { syncUser, getUser } from "@/lib/api";

interface AppUser {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  role: "user" | "admin" | "banned";
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  website?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (fbUser: FirebaseUser) => {
    try {
      // Sync with MongoDB — creates user if first login
      const mongoUser = await syncUser({
        uid: fbUser.uid,
        email: fbUser.email ?? "",
        displayName: fbUser.displayName ?? "User",
        photoURL: fbUser.photoURL,
      });
      setUser(mongoUser);
    } catch (err) {
      console.error("Failed to sync user:", err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const mongoUser = await getUser(firebaseUser.uid);
      setUser(mongoUser);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, [firebaseUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await loadUser(fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadUser]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, signInWithGoogle, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
