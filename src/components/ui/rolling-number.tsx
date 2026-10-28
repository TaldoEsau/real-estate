import React, { useEffect, useState } from "react"
import { motion } from "motion/react"

interface RollingNumberProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  style?: React.CSSProperties
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  prefix = "",
  suffix = "",
  duration = 1100,
  style,
}) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(eased * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        fontVariantNumeric: "tabular-nums",
        display: "inline-block",
        ...style,
      }}
    >
      {prefix}
      {displayValue.toLocaleString("pt-BR")}
      {suffix}
    </motion.span>
  )
}

export default RollingNumber

