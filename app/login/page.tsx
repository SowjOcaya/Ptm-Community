"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Users, Film, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

const features = [
  { icon: Users, title: "Communities", desc: "Join groups around your interests" },
  { icon: Film, title: "Reels", desc: "Short-form video content" },
  { icon: MessageSquare, title: "Messages", desc: "Real-time direct messaging" },
  { icon: Zap, title: "Feed", desc: "Personalized content stream" },
];

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.replace("/feed");
    } catch {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ptm-bg mesh-bg flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-ptm-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-ptm-purple/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ptm-pink/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Branding */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ptm-accent via-ptm-purple to-ptm-pink flex items-center justify-center shadow-glow-purple"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="font-display text-4xl font-bold text-gradient">PTM</h1>
              <p className="text-ptm-text-muted text-sm">Community Platform</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-5xl font-bold text-ptm-text leading-tight">
              Connect with your{" "}
              <span className="text-gradient-pink">community</span>
            </h2>
            <p className="mt-4 text-ptm-text-muted text-lg leading-relaxed">
              Share moments, discover content, join communities, and build real connections.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-ptm-card border border-ptm-border rounded-2xl p-4 space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ptm-accent/20 to-ptm-purple/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-ptm-accent" />
                </div>
                <p className="font-semibold text-ptm-text text-sm">{title}</p>
                <p className="text-ptm-text-dim text-xs">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Sign in card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-ptm-card border border-ptm-border rounded-4xl p-8 space-y-8 shadow-card"
        >
          <div className="text-center space-y-2">
            <h3 className="font-display text-2xl font-bold text-ptm-text">Welcome back</h3>
            <p className="text-ptm-text-muted">Sign in to continue to PTM Community</p>
          </div>

          {/* Google Sign In */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </motion.button>

          {/* Decorative divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-ptm-border" />
            <span className="text-ptm-text-dim text-xs">Secure & Private</span>
            <div className="flex-1 h-px bg-ptm-border" />
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-ptm-text-dim leading-relaxed">
            By signing in, you agree to our{" "}
            <span className="text-ptm-accent cursor-pointer hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="text-ptm-accent cursor-pointer hover:underline">Privacy Policy</span>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-2">
            {["Firebase Auth", "End-to-End", "Secure"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-ptm-green" />
                <span className="text-[10px] text-ptm-text-dim">{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
