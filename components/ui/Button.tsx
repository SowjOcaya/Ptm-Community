import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-gradient-to-r from-ptm-accent to-ptm-purple text-white hover:opacity-90 shadow-glow-accent",
      secondary: "bg-ptm-card text-ptm-text border border-ptm-border hover:border-ptm-accent hover:text-ptm-accent",
      ghost: "text-ptm-text-muted hover:text-ptm-text hover:bg-ptm-card",
      danger: "bg-ptm-pink/10 text-ptm-pink border border-ptm-pink/30 hover:bg-ptm-pink/20",
      outline: "border border-ptm-accent text-ptm-accent hover:bg-ptm-accent/10",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3.5 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...(props as object)}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export default Button;
