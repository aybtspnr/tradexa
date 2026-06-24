"use client";

import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, ReactNode } from "react";

interface PremiumCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient" | "dark" | "outlined";
  hoverEffect?: "lift" | "glow" | "scale" | "none";
  onClick?: () => void;
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ children, className, variant = "default", hoverEffect = "lift", onClick, ...props }, ref) => {
    const variants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
      },
      hover: {
        y: hoverEffect === "lift" ? -8 : 0,
        scale: hoverEffect === "scale" ? 1.02 : 1,
        boxShadow: hoverEffect === "glow" 
          ? "0 20px 60px -10px rgba(220, 38, 38, 0.3)"
          : "0 24px 64px -8px rgba(0, 0, 0, 0.12)",
      }
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        whileHover={hoverEffect !== "none" ? "hover" : undefined}
        variants={variants}
        onClick={onClick}
        className={cn(
          "rounded-[2rem] overflow-hidden",
          variant === "default" && "bg-white border border-slate-100 shadow-premium-md",
          variant === "glass" && "glass shadow-premium-lg",
          variant === "gradient" && "bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-premium-xl",
          variant === "dark" && "bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-premium-xl",
          variant === "outlined" && "bg-white border-2 border-slate-100 hover:border-red-200",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ children, className, variant = "primary", size = "md", loading, disabled, onClick, ...props }, ref) => {
    const variants = {
      rest: { scale: 1 },
      hover: { scale: 1.03 },
      tap: { scale: 0.97 },
    };

    return (
      <motion.button
        ref={ref}
        variants={variants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.2 }}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          "premium-button inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs rounded-2xl transition-all",
          variant === "primary" && "bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200",
          variant === "secondary" && "bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200",
          variant === "outline" && "border-2 border-red-600 text-red-600 hover:bg-red-50",
          variant === "ghost" && "text-slate-600 hover:bg-slate-100",
          variant === "white" && "bg-white text-red-600 hover:bg-slate-50 shadow-xl",
          size === "sm" && "h-10 px-4 text-[10px]",
          size === "md" && "h-12 px-6",
          size === "lg" && "h-14 px-8 text-sm",
          size === "xl" && "h-16 px-10 text-base",
          (loading || disabled) && "opacity-70 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {children}
      </motion.button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

interface PremiumBadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "error" | "info" | "premium";
  animated?: boolean;
}

export function PremiumBadge({ children, className, variant = "default", animated }: PremiumBadgeProps) {
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 }
    }
  };

  return (
    <motion.span
      initial={animated ? "hidden" : false}
      animate={animated ? "visible" : false}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
        variant === "default" && "bg-slate-100 text-slate-700",
        variant === "success" && "bg-green-100 text-green-700",
        variant === "warning" && "bg-amber-100 text-amber-700",
        variant === "error" && "bg-red-100 text-red-700",
        variant === "info" && "bg-blue-100 text-blue-700",
        variant === "premium" && "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg",
        className
      )}
    >
      {children}
    </motion.span>
  );
}

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-white",
              "focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100",
              "transition-all duration-300",
              icon && "pl-12",
              error && "border-red-500 focus:border-red-500 focus:ring-red-100",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-600 font-bold ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className, staggerDelay = 0.1 }: StaggerContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Array.isArray(children) 
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children
      }
    </motion.div>
  );
}

export { AnimatePresence };