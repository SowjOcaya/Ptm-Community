"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, UserPlus, Mail, CheckCheck } from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import { NotificationSkeleton } from "@/components/ui/Skeleton";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, { icon: typeof Heart; color: string; bg: string }> = {
  like: { icon: Heart, color: "text-ptm-pink", bg: "bg-ptm-pink/10" },
  comment: { icon: MessageCircle, color: "text-ptm-accent", bg: "bg-ptm-accent/10" },
  follow: { icon: UserPlus, color: "text-ptm-purple", bg: "bg-ptm-purple/10" },
  message: { icon: Mail, color: "text-ptm-green", bg: "bg-ptm-green/10" },
  mention: { icon: Bell, color: "text-ptm-amber", bg: "bg-ptm-amber/10" },
};

interface Notification { _id: string; uid: string; type: string; sourceUserId: string; message: string; read: boolean; createdAt: string; sourceUser?: { displayName: string; photoURL: string | null }; }

export default function NotificationsPage() {
  const { user } = useAuth();
  const { setNotifications } = useUIStore();
  const [notifications, setLocal] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.uid).then((notifs) => { setLocal(notifs); setNotifications(notifs); }).finally(() => setLoading(false));
  }, [user, setNotifications]);

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    await markNotificationRead(user.uid, id);
    setLocal((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
  };

  const handleMarkAll = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.uid);
    setLocal((prev) => prev.map((n) => ({ ...n, read: true })));
    setNotifications([]);
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ptm-text">Notifications</h1>
          {unread > 0 && <span className="bg-ptm-pink text-white text-xs font-bold rounded-full px-2.5 py-1">{unread}</span>}
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll} className="flex items-center gap-1.5 text-ptm-accent text-sm hover:text-ptm-accent-hover transition-colors">
            <CheckCheck className="w-4 h-4" />Mark all read
          </button>
        )}
      </div>

      {loading ? <NotificationSkeleton /> : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 mx-auto text-ptm-text-dim mb-4" />
          <h3 className="font-display text-xl font-bold text-ptm-text">No notifications yet</h3>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif, i) => {
              const cfg = iconMap[notif.type] ?? iconMap.like;
              const Icon = cfg.icon;
              return (
                <motion.div key={notif._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => !notif.read && handleMarkRead(notif._id)} className={cn("flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer", notif.read ? "bg-ptm-card/50 border-ptm-border/50 opacity-70" : "bg-ptm-card border-ptm-border hover:border-ptm-accent")}>
                  <div className="relative flex-shrink-0">
                    <Avatar src={notif.sourceUser?.photoURL} name={notif.sourceUser?.displayName} size="md" />
                    <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center", cfg.bg)}><Icon className={cn("w-3.5 h-3.5", cfg.color)} /></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ptm-text text-sm leading-relaxed"><span className="font-semibold">{notif.sourceUser?.displayName ?? "Someone"}</span>{" "}{notif.message}</p>
                    <p className="text-ptm-text-dim text-xs mt-1">{notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ""}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-ptm-accent flex-shrink-0 mt-2" />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
