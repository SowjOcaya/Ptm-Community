"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, Compass, Film, User, MessageSquare, Bell,
  Users, Shield, PlusCircle, LogOut, Zap
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUIStore } from "@/store/ui-store";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/reels", icon: Film, label: "Reels" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/communities", icon: Users, label: "Communities" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { setCreatePostOpen, unreadCount } = useUIStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col bg-ptm-surface border-r border-ptm-border z-40">
      {/* Logo */}
      <div className="p-6 border-b border-ptm-border">
        <Link href="/feed" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ptm-accent to-ptm-purple flex items-center justify-center shadow-glow-accent">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-gradient">PTM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Create Post Button */}
        <button
          onClick={() => setCreatePostOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl btn-primary text-sm font-semibold"
        >
          <PlusCircle className="w-5 h-5" />
          Create Post
        </button>

        <div className="space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium relative",
                    active
                      ? "bg-ptm-accent/10 text-ptm-accent"
                      : "text-ptm-text-muted hover:text-ptm-text hover:bg-ptm-card"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-ptm-accent rounded-full"
                    />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                  {label === "Notifications" && unreadCount > 0 && (
                    <span className="ml-auto bg-ptm-pink text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}

          {user?.role === "admin" && (
            <Link href="/admin">
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium",
                  pathname.startsWith("/admin")
                    ? "bg-ptm-amber/10 text-ptm-amber"
                    : "text-ptm-text-muted hover:text-ptm-text hover:bg-ptm-card"
                )}
              >
                <Shield className="w-5 h-5" />
                Admin
              </motion.div>
            </Link>
          )}
        </div>
      </nav>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-ptm-border">
        <Link href={`/profile/${user?.uid}`} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-ptm-card transition-colors">
          <Avatar src={user?.photoURL} name={user?.displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ptm-text truncate">{user?.displayName}</p>
            <p className="text-xs text-ptm-text-muted truncate">@{user?.username}</p>
          </div>
        </Link>
        <button
          onClick={signOut}
          className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 rounded-xl text-ptm-text-muted hover:text-ptm-pink hover:bg-ptm-card transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
