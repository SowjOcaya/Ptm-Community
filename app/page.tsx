"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/feed" : "/login");
    }
  }, [user, loading, router]);

  return <LoadingScreen />;
}
