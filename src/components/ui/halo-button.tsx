import React from "react"
import { motion, HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/utils"

export interface HaloButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode
  variant?: "gold" | "dark" | "glass"
  size?: "sm" | "md" | "lg"
  haloIntensity?: "subtle" | "strong"
}

export const HaloButton = React.forwardRef<HTMLButtonElement, HaloButtonProps>(
  (
    {
      children,
      className,
      variant = "gold",
      size = "md",
      haloIntensity = "strong",
      style,
      ...props
    },
    ref
  ) => {
    const sizeStyles: Record<"sm" | "md" | "lg", React.CSSProperties> = {
      sm: { padding: "8px 16px", fontSize: "0.8rem", borderRadius: "10px" },
      md: { padding: "11px 22px", fontSize: "0.875rem", borderRadius: "12px" },
      lg: { padding: "14px 28px", fontSize: "0.95rem", borderRadius: "14px" },
    }

    const isGold = variant === "gold"
    const isGlass = variant === "glass"

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: "pointer",
          overflow: "hidden",
          outline: "none",
          border: isGold
            ? "1px solid rgba(255, 236, 204, 0.65)"
            : isGlass
            ? "1px solid rgba(197, 168, 128, 0.4)"
            : "1px solid rgba(197, 168, 128, 0.25)",
          background: isGold
            ? "linear-gradient(135deg, #E8D5B7 0%, #C5A880 50%, #9E825D 100%)"
            : isGlass
            ? "rgba(197, 168, 128, 0.14)"
            : "rgba(11, 19, 35, 0.85)",
          color: isGold ? "#070C18" : "#F3F4F6",
          boxShadow:
            haloIntensity === "strong"
              ? isGold
                ? "0 0 24px rgba(197, 168, 128, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.55)"
                : "0 0 22px rgba(197, 168, 128, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
              : "0 4px 14px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(12px)",
          ...sizeStyles[size],
          ...style,
        }}
        className={cn("group select-none", className)}
        {...props}
      >
        {/* Animated Halo Shimmer Layer */}
        <motion.span
          aria-hidden="true"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            inset: 0,
            background: isGold
              ? "linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.45) 50%, transparent 75%)"
              : "linear-gradient(110deg, transparent 25%, rgba(197, 168, 128, 0.22) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "relative",
            zIndex: 1,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {children}
        </span>
      </motion.button>
    )
  }
)

HaloButton.displayName = "HaloButton"
export default HaloButton

