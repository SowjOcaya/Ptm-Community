"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSuggestedUsers, toggleFollow, checkFollow } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/ui/Avatar";
import { UserSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface SuggestedUser { uid: string; displayName: string; username: string; photoURL: string | null; followersCount: number; }

export default function SuggestedUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const suggested = await getSuggestedUsers(user.uid);
      setUsers(suggested);
      const statuses = await Promise.all(suggested.map((u: SuggestedUser) => checkFollow(u.uid, user.uid)));
      setFollowing(new Set(suggested.filter((_: SuggestedUser, i: number) => statuses[i]).map((u: SuggestedUser) => u.uid)));
      setLoading(false);
    };
    load();
  }, [user]);

  const handleFollow = async (targetUid: string) => {
    if (!user) return;
    const isNow = !following.has(targetUid);
    setFollowing((prev) => { const n = new Set(prev); isNow ? n.add(targetUid) : n.delete(targetUid); return n; });
    await toggleFollow(targetUid, user.uid, isNow ? "follow" : "unfollow");
  };

  if (loading) return (
    <div className="bg-ptm-card border border-ptm-border rounded-3xl p-4">
      <h3 className="font-semibold text-ptm-text mb-3 px-1">Suggested for you</h3>
      {[1,2,3].map((i) => <UserSkeleton key={i} />)}
    </div>
  );
  if (!users.length) return null;

  return (
    <div className="bg-ptm-card border border-ptm-border rounded-3xl p-4">
      <h3 className="font-semibold text-ptm-text mb-3 px-1">Suggested for you</h3>
      <div className="space-y-1">
        {users.map((u, i) => (
          <motion.div key={u.uid} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-ptm-surface transition-colors">
            <Link href={`/profile/${u.uid}`} className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar src={u.photoURL} name={u.displayName} size="sm" />
              <div className="min-w-0">
                <p className="font-semibold text-ptm-text text-sm truncate">{u.displayName}</p>
                <p className="text-ptm-text-dim text-xs truncate">@{u.username}</p>
              </div>
            </Link>
            <button onClick={() => handleFollow(u.uid)} className={cn("flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all", following.has(u.uid) ? "bg-ptm-muted text-ptm-text-muted hover:bg-ptm-pink/10 hover:text-ptm-pink" : "bg-ptm-accent/10 text-ptm-accent hover:bg-ptm-accent/20")}>
              {following.has(u.uid) ? "Following" : "Follow"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
