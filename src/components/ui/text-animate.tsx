import React from "react"
import { motion, Variants } from "motion/react"
import { cn } from "@/lib/utils"

type AnimationType =
  | "fadeIn"
  | "fadeInUp"
  | "popIn"
  | "shiftInUp"
  | "rollIn"
  | "whipIn"
  | "whipInUp"
  | "calmInUp"

interface TextAnimateProps {
  text: string
  type?: AnimationType
  delay?: number
  duration?: number
  className?: string
  segmentClassName?: string
}

const animationVariants: Record<
  AnimationType,
  { container: Variants; child: Variants }
> = {
  fadeIn: {
    container: {
      hidden: { opacity: 0 },
      visible: (i: number = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
      }),
    },
    child: {
      visible: {
        opacity: 1,
        y: [0, -4, 0],
        transition: {
          type: "spring",
          damping: 12,
          stiffness: 100,
        },
      },
      hidden: { opacity: 0, y: 10 },
    },
  },
  fadeInUp: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
      },
    },
    child: {
      visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
      hidden: { opacity: 0, y: 18 },
    },
  },
  popIn: {
    container: {
      hidden: { scale: 0 },
      visible: {
        scale: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
      },
    },
    child: {
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", damping: 14, stiffness: 320 },
      },
      hidden: { opacity: 0, scale: 0.5 },
    },
  },
  calmInUp: {
    container: {
      hidden: {},
      visible: (i: number = 1) => ({
        transition: { staggerChildren: 0.03, delayChildren: 0.05 * i },
      }),
    },
    child: {
      hidden: {
        y: "110%",
        opacity: 0,
        transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.6 },
      },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          ease: [0.125, 0.92, 0.69, 0.975],
          duration: 0.65,
        },
      },
    },
  },
  shiftInUp: {
    container: {
      hidden: {},
      visible: (i: number = 1) => ({
        transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
      }),
    },
    child: {
      hidden: {
        y: "100%",
        opacity: 0,
      },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    },
  },
  rollIn: {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.03, delayChildren: 0.1 },
      },
    },
    child: {
      hidden: { opacity: 0, rotateX: 90, y: 14 },
      visible: {
        opacity: 1,
        rotateX: 0,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
      },
    },
  },
  whipIn: {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.025, delayChildren: 0.1 },
      },
    },
    child: {
      hidden: { opacity: 0, x: -16 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 260, damping: 20 },
      },
    },
  },
  whipInUp: {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.025, delayChildren: 0.1 },
      },
    },
    child: {
      hidden: { opacity: 0, y: 24, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 22 },
      },
    },
  },
}

export const TextAnimate: React.FC<TextAnimateProps> = ({
  text,
  type = "calmInUp",
  className,
  segmentClassName,
}) => {
  const { container, child } = animationVariants[type]
  const words = text.split(" ")

  return (
    <motion.span
      style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.28em" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn("inline-flex flex-wrap", className)}
    >
      {words.map((word, index) => (
        <span
          key={index}
          style={{ display: "inline-block", overflow: "hidden" }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            variants={child}
            className={segmentClassName}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

export default TextAnimate

