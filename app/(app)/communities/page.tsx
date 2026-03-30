"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCommunities, toggleCommunity } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatCount, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";

interface Community { _id: string; name: string; slug: string; description: string; coverImage?: string; membersCount: number; isMember?: boolean; }

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    getCommunities(user.uid).then(setCommunities).finally(() => setLoading(false));
  }, [user]);

  const handleJoinLeave = async (community: Community) => {
    if (!user) return;
    setJoiningId(community._id);
    const action = community.isMember ? "leave" : "join";
    await toggleCommunity(community._id, user.uid, action);
    setCommunities((prev) => prev.map((c) => c._id === community._id ? { ...c, isMember: !c.isMember, membersCount: c.membersCount + (action === "join" ? 1 : -1) } : c));
    setJoiningId(null);
  };

  const filtered = communities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-ptm-text">Communities</h1><p className="text-ptm-text-muted text-sm mt-1">Find your people</p></div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ptm-text-dim" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search communities..." className="w-full bg-ptm-card border border-ptm-border rounded-2xl pl-11 pr-4 py-3 text-ptm-text text-sm placeholder:text-ptm-text-dim outline-none focus:border-ptm-accent transition-colors" />
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><Users className="w-16 h-16 mx-auto text-ptm-text-dim mb-4" /><p className="text-ptm-text-muted">No communities found</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map((community, i) => (
            <motion.div key={community._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-ptm-card border border-ptm-border rounded-3xl overflow-hidden hover:border-ptm-muted transition-colors">
              <div className="relative h-28 bg-gradient-to-br from-ptm-accent/20 via-ptm-purple/20 to-ptm-pink/20">
                {community.coverImage && <Image src={community.coverImage} alt={community.name} fill className="object-cover" unoptimized />}
                <div className="absolute inset-0 bg-gradient-to-t from-ptm-card/80 to-transparent" />
              </div>
              <div className="p-5 -mt-6 relative">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-ptm-text">{community.name}</h3>
                    <div className="flex items-center gap-1.5 text-ptm-text-muted text-xs mt-0.5"><Users className="w-3.5 h-3.5" /><span>{formatCount(community.membersCount)} members</span></div>
                  </div>
                  <Button variant={community.isMember ? "secondary" : "primary"} size="sm" loading={joiningId === community._id} onClick={() => handleJoinLeave(community)}>
                    {community.isMember ? "Leave" : "Join"}
                  </Button>
                </div>
                <p className="text-ptm-text-muted text-sm mt-3 line-clamp-2">{community.description}</p>
                {community.isMember && <Link href={`/communities/${community._id}`} className="inline-flex items-center gap-1.5 mt-3 text-ptm-accent text-sm hover:text-ptm-accent-hover transition-colors">View community →</Link>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
