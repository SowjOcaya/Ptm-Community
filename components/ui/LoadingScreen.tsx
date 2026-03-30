import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-ptm-bg flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ptm-accent to-ptm-purple flex items-center justify-center shadow-glow-accent"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-ptm-accent"
            />
          ))}
        </div>
        <p className="text-ptm-text-muted text-sm font-medium">PTM Community</p>
      </motion.div>
    </div>
  );
}
