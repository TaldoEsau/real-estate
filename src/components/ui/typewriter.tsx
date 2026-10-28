import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

interface TypewriterProps {
  words: string[]
  interval?: number
  className?: string
}

export const Typewriter: React.FC<TypewriterProps> = ({
  words,
  interval = 3000,
  className,
}) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!words.length) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, interval)
    return () => clearInterval(timer)
  }, [words, interval])

  return (
    <span
      style={{
        display: "inline-flex",
        position: "relative",
        verticalAlign: "bottom",
      }}
      className={cn("inline-flex items-center", className)}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 18, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "inline-block",
            fontWeight: 700,
            color: "inherit",
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default Typewriter

