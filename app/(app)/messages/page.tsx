"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { getConversations, getOrCreateConversation, getMessages, sendMessage, getUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface OtherUser { uid: string; displayName: string; username: string; photoURL: string | null; }
interface Conversation { _id: string; members: string[]; lastMessage: string; lastMessageAt: string; otherUser?: OtherUser; }
interface Message { _id: string; conversationId: string; senderId: string; text: string; createdAt: string; seen: boolean; }

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const uidParam = searchParams.get("uid");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const convs = await getConversations(user.uid);
      setConversations(convs);
      setLoading(false);
      if (uidParam) {
        const convId = await getOrCreateConversation(user.uid, uidParam);
        const other = await getUser(uidParam);
        setOtherUser(other);
        setActiveConvId(convId);
      }
    };
    load();
  }, [user, uidParam]);

  const loadMessages = useCallback(async () => {
    if (!activeConvId) return;
    const msgs = await getMessages(activeConvId);
    setMessages(msgs);
  }, [activeConvId]);

  useEffect(() => {
    if (!activeConvId) return;
    loadMessages();
    // Poll every 3s for new messages
    const interval = setInterval(loadMessages, 3000);
    setPolling(interval);
    return () => clearInterval(interval);
  }, [activeConvId, loadMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const openConversation = async (conv: Conversation) => {
    setActiveConvId(conv._id);
    const otherUid = conv.members.find((m) => m !== user?.uid) ?? "";
    const other = await getUser(otherUid);
    setOtherUser(other);
  };

  const handleSend = async () => {
    if (!user || !activeConvId || !text.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(activeConvId, user.uid, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText("");
      setConversations((prev) => prev.map((c) => c._id === activeConvId ? { ...c, lastMessage: text.trim(), lastMessageAt: new Date().toISOString() } : c));
    } finally { setSending(false); }
  };

  return (
    <div className="flex h-screen">
      <div className={cn("w-full lg:w-80 border-r border-ptm-border flex flex-col", activeConvId ? "hidden lg:flex" : "flex")}>
        <div className="p-4 border-b border-ptm-border">
          <h1 className="font-display text-xl font-bold text-ptm-text flex items-center gap-2"><MessageCircle className="w-6 h-6 text-ptm-accent" />Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? [1,2,3].map((i) => <div key={i} className="flex gap-3 p-3"><Skeleton className="w-12 h-12 rounded-full" /><div className="flex-1 space-y-2 pt-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div>) :
          conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 p-4"><MessageCircle className="w-12 h-12 text-ptm-text-dim" /><p className="text-ptm-text-muted text-sm text-center">No conversations yet. Visit a profile to message them!</p></div>
          ) : conversations.map((conv) => {
            const other = conv.otherUser;
            return (
              <button key={conv._id} onClick={() => openConversation(conv)} className={cn("w-full flex items-center gap-3 p-4 hover:bg-ptm-card transition-colors text-left", activeConvId === conv._id && "bg-ptm-card border-r-2 border-ptm-accent")}>
                <Avatar src={other?.photoURL} name={other?.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ptm-text text-sm truncate">{other?.displayName ?? "User"}</p>
                  <p className="text-ptm-text-dim text-xs truncate">{conv.lastMessage || "Start a conversation"}</p>
                </div>
                <span className="text-ptm-text-dim text-[10px] flex-shrink-0">{conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }) : ""}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeConvId ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-ptm-border glass-strong">
            <button onClick={() => setActiveConvId(null)} className="lg:hidden p-2 -ml-2 text-ptm-text-muted"><ArrowLeft className="w-5 h-5" /></button>
            <Avatar src={otherUser?.photoURL} name={otherUser?.displayName} size="sm" />
            <div><p className="font-semibold text-ptm-text">{otherUser?.displayName}</p><p className="text-ptm-text-dim text-xs">@{otherUser?.username}</p></div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.uid;
              return (
                <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[75%] px-4 py-2.5 rounded-2xl text-sm", isMe ? "bg-gradient-to-br from-ptm-accent to-ptm-purple text-white rounded-br-sm" : "bg-ptm-card border border-ptm-border text-ptm-text rounded-bl-sm")}>
                    <p>{msg.text}</p>
                    <p className={cn("text-[10px] mt-1", isMe ? "text-white/60" : "text-ptm-text-dim")}>{msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ""}</p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-ptm-border">
            <div className="flex items-center gap-3 bg-ptm-card border border-ptm-border rounded-2xl px-4 py-3 focus-within:border-ptm-accent transition-colors">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} placeholder="Type a message..." className="flex-1 bg-transparent text-ptm-text text-sm placeholder:text-ptm-text-dim outline-none" />
              <motion.button whileTap={{ scale: 0.85 }} onClick={handleSend} disabled={!text.trim() || sending} className="text-ptm-accent disabled:text-ptm-text-dim transition-colors">
                {sending ? <div className="w-5 h-5 border-2 border-ptm-accent border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center space-y-3"><MessageCircle className="w-16 h-16 mx-auto text-ptm-text-dim" /><h3 className="font-display text-xl font-bold text-ptm-text">Select a conversation</h3></div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-ptm-accent border-t-transparent rounded-full animate-spin" /></div>}><MessagesContent /></Suspense>;
}
