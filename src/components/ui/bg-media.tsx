import React, { useState } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface BackgroundMediaProps {
  src: string
  alt?: string
  type?: "image" | "video"
  variant?: "dark" | "light"
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  src,
  alt = "Background",
  type = "image",
  variant = "dark",
  children,
  className,
  style,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "28px",
        border: "1px solid rgba(197, 168, 128, 0.3)",
        boxShadow:
          "0 30px 70px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
        background: "#060A12",
        ...style,
      }}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Background Media Layer */}
      <motion.div
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: isLoaded ? 1 : 1.06, opacity: isLoaded ? 1 : 0.4 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        {type === "video" ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsLoaded(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.42) contrast(1.08) saturate(0.95)",
            }}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.38) contrast(1.08) saturate(0.92)",
            }}
          />
        )}
      </motion.div>

      {/* Atmospheric Multi-Stop Luxury Gradient Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            variant === "dark"
              ? "linear-gradient(125deg, rgba(6, 10, 18, 0.94) 0%, rgba(11, 19, 35, 0.82) 48%, rgba(6, 10, 18, 0.92) 100%), radial-gradient(circle at 80% 20%, rgba(197, 168, 128, 0.18) 0%, transparent 55%)"
              : "linear-gradient(125deg, rgba(11, 19, 35, 0.78) 0%, rgba(11, 19, 35, 0.65) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle Architectural Grid Pattern Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage:
            "linear-gradient(rgba(197, 168, 128, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(197, 168, 128, 0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          pointerEvents: "none",
        }}
      />

      {/* Content Layer */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  )
}

export default BackgroundMedia

