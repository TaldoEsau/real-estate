"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CheckIcon, ExternalLinkIcon, X } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  type PanInfo,
} from "motion/react"

import { cn } from "@/lib/utils"

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return true
  })

  React.useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

function useFeatureVisibility(
  featureId: string,
  variant: "desktop" | "mobile"
) {
  const storageKey = `feature_${featureId}_${variant}`
  const [isVisible, setIsVisible] = React.useState<boolean>(true)

  React.useEffect(() => {
    try {
      const storedValue = localStorage.getItem(storageKey)
      setIsVisible(storedValue ? JSON.parse(storedValue) : true)
    } catch {
      setIsVisible(true)
    }
  }, [storageKey])

  const hideFeature = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(false))
    } catch {
      // ignore storage errors
    }
    setIsVisible(false)
  }

  return { isVisible, hideFeature }
}

function useSwipe(onSwipe: (direction: "left" | "right") => void) {
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 100) {
      onSwipe("right")
    } else if (info.offset.x < -100) {
      onSwipe("left")
    }
  }

  return { handleDragEnd }
}

const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const },
}

const slideInOut = (direction: 1 | -1) => ({
  initial: { opacity: 0, x: 20 * direction },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 * direction },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
})

const hoverScale = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.2 },
}

export interface Step {
  title: string
  short_description: string
  full_description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  media?: {
    type: "image" | "video"
    src: string
    alt?: string
  }
}

export interface FeatureDisclosureProps {
  steps: Step[]
  featureId: string
  onComplete?: () => void
  onSkip?: () => void
  showProgressBar?: boolean
  open: boolean
  setOpen: (open: boolean) => void
  forceVariant?: "mobile" | "desktop"
  title?: string
}

function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-secondary relative h-1.5 w-full overflow-hidden rounded-full",
        className
      )}
    >
      <motion.div
        animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-primary h-full rounded-full"
      />
    </div>
  )
}

function StepPreview({ step, direction }: { step: Step; direction: 1 | -1 }) {
  const controls = useAnimation()

  React.useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { delay: 0.12, duration: 0.3 },
    })
  }, [controls, step])

  return (
    <motion.div
      {...slideInOut(direction)}
      className="relative h-full min-h-[340px] w-full overflow-hidden rounded-sm rounded-tl-2xl ring-2 ring-black/20"
    >
      {step.media ? (
        <div className="relative h-full min-h-[340px] w-full bg-black">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={controls}
            className="h-full max-h-[700px] w-full"
          >
            {step.media.type === "image" ? (
              <img
                src={step.media.src || "/placeholder.svg"}
                alt={step.media.alt || ""}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <video
                src={step.media.src}
                controls
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={controls}
            className="absolute right-0 bottom-0 left-0 p-6"
          >
            <h3 className="mb-2 text-2xl font-semibold text-white">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-200">
              {step.full_description}
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={controls}
            className="text-center"
          >
            <h3 className="text-primary mb-2 text-2xl font-semibold">
              {step.title}
            </h3>
            <p className="text-muted-foreground">{step.full_description}</p>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

interface StepTabProps {
  step: Step
  isActive: boolean
  onClick: () => void
  isCompleted: boolean
}

function StepTab({ step, isActive, onClick, isCompleted }: StepTabProps) {
  return (
    <motion.button
      type="button"
      {...hoverScale}
      onClick={onClick}
      className={cn(
        "relative flex w-full cursor-pointer flex-col items-start rounded-xl px-4 py-3 text-left transition-colors",
        isActive
          ? "bg-muted border-primary/50 border shadow-sm"
          : "hover:bg-muted/60 border border-transparent"
      )}
      aria-current={isActive ? "step" : undefined}
      aria-label={`${step.title}${isCompleted ? " (concluído)" : ""}`}
    >
      <div className="text-card-foreground mb-1 pr-6 text-sm font-semibold">
        {step.title}
      </div>
      <div className="text-muted-foreground line-clamp-2 hidden text-xs md:block">
        {step.short_description}
      </div>
      {isCompleted && (
        <motion.div {...fadeInScale} className="absolute top-3 right-3">
          <div className="bg-primary rounded-full p-1">
            <CheckIcon className="text-primary-foreground h-2.5 w-2.5" />
          </div>
        </motion.div>
      )}
    </motion.button>
  )
}

interface StepContentProps {
  steps: Step[]
  currentStep: number
  onSkip: () => void
  onNext: () => void
  onPrevious: () => void
  hideFeature: () => void
  completedSteps: number[]
  onStepSelect: (index: number) => void
  direction: 1 | -1
  isDesktop: boolean
  stepRef: React.RefObject<HTMLButtonElement>
}

function StepContent({
  steps,
  currentStep,
  onSkip,
  onNext,
  onPrevious,
  hideFeature,
  completedSteps,
  onStepSelect,
  direction,
  isDesktop,
  stepRef,
}: StepContentProps) {
  const [skipNextTime, setSkipNextTime] = React.useState(false)

  const renderActionButton = (action: Step["action"]) => {
    if (!action) return null

    if (action.href) {
      return (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold no-underline transition-colors"
        >
          <span>{action.label}</span>
          <ExternalLinkIcon className="h-4 w-4" />
        </a>
      )
    }

    return (
      <button
        type="button"
        onClick={action.onClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-md transition-all"
      >
        {action.label}
      </button>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col justify-between">
      {isDesktop && (
        <div className="flex-1 px-2 py-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center justify-center space-y-2.5 px-1"
          >
            {steps.map((step, index) => (
              <StepTab
                key={index}
                step={step}
                isActive={currentStep === index}
                onClick={() => onStepSelect(index)}
                isCompleted={completedSteps.includes(index)}
              />
            ))}
          </motion.div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep}
          {...slideInOut(direction)}
          className="mt-4 space-y-4"
        >
          {!isDesktop && steps[currentStep]?.media && (
            <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
              {steps[currentStep]?.media?.type === "image" ? (
                <img
                  src={steps[currentStep]?.media?.src || "/placeholder.svg"}
                  alt={steps[currentStep]?.media?.alt || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={steps[currentStep]?.media?.src}
                  controls
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          )}

          {steps[currentStep]?.action ? (
            <div className="px-2">
              {renderActionButton(steps[currentStep]?.action)}
            </div>
          ) : (
            <div className="h-2" />
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between px-2 pr-4">
            <button
              type="button"
              onClick={onSkip}
              className="text-muted-foreground hover:bg-muted hover:text-card-foreground cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
            >
              Fechar
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={onPrevious}
                  className="text-card-foreground hover:bg-muted cursor-pointer rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium transition-colors"
                >
                  Anterior
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (skipNextTime) {
                    hideFeature()
                  }
                  onNext()
                }}
                ref={stepRef}
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-5 py-1.5 text-sm font-semibold shadow-sm transition-colors"
              >
                {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 pb-4">
            <input
              type="checkbox"
              id={`skipNextTime-${steps[0]?.title || "intro"}`}
              checked={skipNextTime}
              onChange={(e) => setSkipNextTime(e.target.checked)}
              className="accent-primary h-4 w-4 cursor-pointer rounded"
            />
            <label
              htmlFor={`skipNextTime-${steps[0]?.title || "intro"}`}
              className="text-muted-foreground cursor-pointer text-xs"
            >
              Não mostrar novamente automaticamente
            </label>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function IntroDisclosure({
  steps,
  open,
  setOpen,
  featureId,
  onComplete,
  onSkip,
  showProgressBar = true,
  forceVariant,
  title = "Prévia Rápida do Imóvel",
}: FeatureDisclosureProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([0])
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const isDesktopQuery = useMediaQuery("(min-width: 768px)")
  const isDesktop = forceVariant ? forceVariant === "desktop" : isDesktopQuery
  const variant = isDesktop ? "desktop" : "mobile"
  const { hideFeature } = useFeatureVisibility(featureId, variant)
  const stepRef = React.useRef<HTMLButtonElement>(null)

  // Reset to first step whenever reopened
  React.useEffect(() => {
    if (open) {
      setCurrentStep(0)
      setCompletedSteps([0])
    }
  }, [open, featureId])

  // Focus management & Escape key
  React.useEffect(() => {
    if (!open) return
    stepRef.current?.focus()

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [open, currentStep, setOpen])

  if (!open || typeof document === "undefined") {
    return null
  }

  const handleNext = () => {
    setDirection(1)
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep]
    )
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1
      setCurrentStep(nextIdx)
      setCompletedSteps((prev) =>
        prev.includes(nextIdx) ? prev : [...prev, nextIdx]
      )
    } else {
      setOpen(false)
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    setDirection(-1)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setOpen(false)
    onSkip?.()
  }

  const handleStepSelect = (index: number) => {
    setDirection(index > currentStep ? 1 : -1)
    setCompletedSteps((prev) => {
      const newCompletedSteps = new Set(prev)
      if (index > currentStep) {
        for (let i = currentStep; i <= index; i++) {
          newCompletedSteps.add(i)
        }
      } else {
        newCompletedSteps.add(index)
      }
      return Array.from(newCompletedSteps)
    })
    setCurrentStep(index)
  }

  const handleSwipe = (swipeDirection: "left" | "right") => {
    if (swipeDirection === "left") {
      handleNext()
    } else {
      handlePrevious()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      handleNext()
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      handlePrevious()
    }
  }

  const { handleDragEnd } = useSwipe(handleSwipe)

  if (isDesktop) {
    return createPortal(
      <div
        className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          className="bg-card text-card-foreground border-border relative w-full max-w-5xl overflow-hidden rounded-2xl border shadow-2xl"
        >
          {/* Header */}
          <div className="bg-muted border-border relative space-y-2.5 border-b px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-card-foreground text-lg font-semibold tracking-wide">
                {title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-card-foreground hover:bg-card inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                aria-label="Fechar preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {showProgressBar && (
              <div className="flex w-full justify-center">
                <ProgressBar
                  value={((currentStep + 1) / steps.length) * 100}
                  className="h-1.5"
                />
              </div>
            )}
          </div>

          {/* 2-Column Content */}
          <div className="grid min-h-[440px] grid-cols-1 md:grid-cols-2">
            <div className="p-3 pr-[18px]">
              <StepContent
                steps={steps}
                currentStep={currentStep}
                onSkip={handleSkip}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hideFeature={hideFeature}
                completedSteps={completedSteps}
                onStepSelect={handleStepSelect}
                direction={direction}
                isDesktop={isDesktop}
                stepRef={stepRef}
              />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <StepPreview
                key={currentStep}
                step={steps[currentStep]}
                direction={direction}
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/80 backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onKeyDown={handleKeyDown}
        className="bg-card text-card-foreground border-border relative flex h-[90vh] max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border-t"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-white/20" />
        <div className="space-y-3 px-5 pt-4 pb-3 text-left">
          {showProgressBar && (
            <ProgressBar value={((currentStep + 1) / steps.length) * 100} />
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {steps[currentStep]?.title}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-card-foreground inline-flex h-8 w-8 items-center justify-center rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-4 pb-32">
            {/* Step tabs */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              {steps.map((step, index) => (
                <StepTab
                  key={index}
                  step={step}
                  isActive={currentStep === index}
                  onClick={() => handleStepSelect(index)}
                  isCompleted={completedSteps.includes(index)}
                />
              ))}
            </div>
            {/* Preview */}
            <div className="ring-border relative aspect-video overflow-hidden rounded-lg ring-2">
              <StepPreview step={steps[currentStep]} direction={direction} />
            </div>

            {/* Step content */}
            <div className="border-border space-y-3 rounded-lg border p-3.5">
              <p className="text-muted-foreground text-sm">
                {steps[currentStep]?.full_description}
              </p>
              {steps[currentStep]?.action && (
                <button
                  type="button"
                  onClick={steps[currentStep]?.action?.onClick}
                  className="bg-primary text-primary-foreground w-full cursor-pointer rounded-full py-2.5 text-sm font-semibold"
                >
                  {steps[currentStep]?.action?.label}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fixed bottom navigation */}
        <div className="bg-background border-border absolute right-0 bottom-0 left-0 border-t p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSkip}
              className="text-muted-foreground hover:bg-card rounded-full px-3 py-1.5 text-sm"
            >
              Fechar
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-sm"
                >
                  Anterior
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                ref={stepRef}
                className="bg-primary text-primary-foreground rounded-full px-5 py-1.5 text-sm font-semibold"
              >
                {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

export default IntroDisclosure
