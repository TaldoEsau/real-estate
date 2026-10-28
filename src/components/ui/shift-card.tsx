import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface ShiftCardProps {
  className?: string
  topContent?: React.ReactNode
  topAnimateContent?: React.ReactNode
  middleContent?: React.ReactNode
  bottomContent?: React.ReactNode
  onClick?: () => void
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  className,
  topContent,
  topAnimateContent,
  middleContent,
  bottomContent,
  onClick,
}) => {
  const [isHovered, setHovered] = React.useState(false)

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      initial={{ y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={{
        position: "relative",
        borderRadius: "20px",
        border: isHovered
          ? "1px solid rgba(197, 168, 128, 0.55)"
          : "1px solid rgba(197, 168, 128, 0.22)",
        background:
          "linear-gradient(165deg, rgba(16, 26, 48, 0.9) 0%, rgba(8, 14, 28, 0.96) 100%)",
        boxShadow: isHovered
          ? "0 20px 44px rgba(0, 0, 0, 0.6), 0 0 28px rgba(197, 168, 128, 0.16)"
          : "0 10px 30px rgba(0, 0, 0, 0.4)",
        padding: "22px",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "235px",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
      className={cn("group", className)}
    >
      {/* Subtle Top Glow */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "130px",
          height: "130px",
          borderRadius: "9999px",
          background: isHovered
            ? "radial-gradient(circle, rgba(197, 168, 128, 0.24) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(197, 168, 128, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
          transition: "all 0.3s ease",
        }}
      />

      {/* Top Header Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>{topContent}</div>
        <AnimatePresence>
          {topAnimateContent && (
            <motion.div
              initial={{ opacity: 0.7, scale: 0.92 }}
              animate={{
                opacity: isHovered ? 1 : 0.75,
                scale: isHovered ? 1.06 : 1,
              }}
              transition={{ duration: 0.25 }}
            >
              {topAnimateContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Middle Shifting Content */}
      <motion.div
        animate={{
          y: isHovered ? -4 : 0,
        }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        style={{
          marginTop: "14px",
          marginBottom: "12px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {middleContent}
      </motion.div>

      {/* Bottom Reveal / Action Content */}
      <motion.div
        animate={{
          opacity: isHovered ? 1 : 0.85,
          y: isHovered ? 0 : 3,
        }}
        transition={{ duration: 0.25 }}
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: "12px",
          borderTop: "1px solid rgba(197, 168, 128, 0.15)",
        }}
      >
        {bottomContent}
      </motion.div>
    </motion.div>
  )
}

export default ShiftCard

