"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Compass, Film, MessageSquare, Bell, PlusCircle } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/reels", icon: Film, label: "Reels" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { setCreatePostOpen, unreadCount } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-strong border-t border-ptm-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 p-2 min-w-[56px]">
              <motion.div whileTap={{ scale: 0.85 }}>
                <Icon className={cn("w-6 h-6 transition-colors", active ? "text-ptm-accent" : "text-ptm-text-muted")} />
              </motion.div>
              <span className={cn("text-[10px]", active ? "text-ptm-accent" : "text-ptm-text-dim")}>{label}</span>
            </Link>
          );
        })}

        {/* Center create button */}
        <button
          onClick={() => setCreatePostOpen(true)}
          className="flex flex-col items-center gap-1 p-2"
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ptm-accent to-ptm-purple flex items-center justify-center shadow-glow-accent -mt-4"
          >
            <PlusCircle className="w-6 h-6 text-white" />
          </motion.div>
        </button>

        {navItems.slice(2).map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 p-2 min-w-[56px] relative">
              <motion.div whileTap={{ scale: 0.85 }}>
                <Icon className={cn("w-6 h-6 transition-colors", active ? "text-ptm-accent" : "text-ptm-text-muted")} />
                {label === "Alerts" && unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-ptm-pink text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </motion.div>
              <span className={cn("text-[10px]", active ? "text-ptm-accent" : "text-ptm-text-dim")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
