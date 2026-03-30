"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { getComments, addComment } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import Avatar from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

interface CommentAuthor { uid: string; displayName: string; photoURL: string | null; }
interface Comment { _id: string; postId: string; uid: string; text: string; createdAt: string; author?: CommentAuthor; }

export default function CommentsSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getComments(postId).then(setComments).finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    setSubmitting(true);
    try {
      const comment = await addComment(postId, user.uid, text.trim());
      setComments((prev) => [...prev, comment]);
      setText("");
    } catch { toast.error("Failed to post comment"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar src={user?.photoURL} name={user?.displayName} size="sm" />
        <div className="flex-1 flex items-center gap-2 bg-ptm-surface border border-ptm-border rounded-2xl px-4 py-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()} placeholder="Add a comment..." className="flex-1 bg-transparent text-ptm-text text-sm placeholder:text-ptm-text-dim outline-none" />
          <motion.button whileTap={{ scale: 0.85 }} onClick={handleSubmit} disabled={!text.trim() || submitting} className="text-ptm-accent disabled:text-ptm-text-dim transition-colors">
            {submitting ? <div className="w-4 h-4 border-2 border-ptm-accent border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map((i) => <div key={i} className="flex gap-3"><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-16 flex-1 rounded-xl" /></div>)}</div>
      ) : comments.length === 0 ? (
        <p className="text-center text-ptm-text-dim text-sm py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {comments.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3">
              <Avatar src={c.author?.photoURL} name={c.author?.displayName} size="sm" />
              <div className="flex-1 bg-ptm-surface rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-ptm-text text-sm">{c.author?.displayName ?? "User"}</span>
                  <span className="text-ptm-text-dim text-xs">{c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ""}</span>
                </div>
                <p className="text-ptm-text text-sm leading-relaxed">{c.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
