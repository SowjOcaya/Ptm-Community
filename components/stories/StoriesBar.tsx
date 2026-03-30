"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { getStories, createStory, uploadMedia } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/ui/Avatar";
import StoryViewer from "@/components/stories/StoryViewer";
import toast from "react-hot-toast";

// Single shared Story type — must match StoryViewer props exactly
interface Story {
  _id: string;
  uid: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
  expiresAt: string;
  author?: { uid: string; displayName: string; photoURL: string | null };
}

interface StoryGroup {
  uid: string;
  stories: Story[];
  author?: { uid: string; displayName: string; photoURL: string | null };
}

export default function StoriesBar() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<StoryGroup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStories().then((stories: Story[]) => {
      const map = new Map<string, Story[]>();
      stories.forEach((s) => {
        const arr = map.get(s.uid) ?? [];
        arr.push(s);
        map.set(s.uid, arr);
      });
      setGroups(
        Array.from(map.entries()).map(([uid, stories]) => ({
          uid,
          stories,
          author: stories[0]?.author,
        }))
      );
    }).finally(() => setLoading(false));
  }, []);

  const handleAddStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const { url, publicId, resourceType } = await uploadMedia(file, "stories");
      await createStory({ uid: user.uid, mediaUrl: url, mediaType: resourceType, mediaPublicId: publicId });
      toast.success("Story posted!");
    } catch {
      toast.error("Failed to post story");
    }
  };

  if (loading) return (
    <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="skeleton w-14 h-14 rounded-full" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
        {/* Add story button */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-full bg-ptm-card border-2 border-dashed border-ptm-border hover:border-ptm-accent flex items-center justify-center transition-colors relative"
          >
            <Avatar src={user?.photoURL} name={user?.displayName} size="sm" className="opacity-60" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-ptm-accent rounded-full flex items-center justify-center border-2 border-ptm-bg">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </button>
          <span className="text-[10px] text-ptm-text-dim">Your story</span>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleAddStory} />
        </div>

        {/* Story groups */}
        {groups.map((group, i) => (
          <motion.div
            key={group.uid}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 flex flex-col items-center gap-1.5"
          >
            <button
              onClick={() => setActive(group)}
              className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-ptm-accent via-ptm-purple to-ptm-pink"
            >
              <div className="w-full h-full rounded-full border-2 border-ptm-bg overflow-hidden">
                <Avatar src={group.author?.photoURL} name={group.author?.displayName} size="md" />
              </div>
            </button>
            <span className="text-[10px] text-ptm-text-muted truncate max-w-[56px]">
              {group.author?.displayName?.split(" ")[0] ?? "User"}
            </span>
          </motion.div>
        ))}
      </div>

      {active && (
        <StoryViewer
          stories={active.stories}
          user={active.author}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
