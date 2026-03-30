"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import CreatePostModal from "@/components/feed/CreatePostModal";
import LoadingScreen from "@/components/ui/LoadingScreen";
import NotificationListener from "@/components/notifications/NotificationListener";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-ptm-bg">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-0 lg:ml-64 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Global modals */}
      <CreatePostModal />

      {/* Realtime notification listener */}
      <NotificationListener />
    </div>
  );
}
