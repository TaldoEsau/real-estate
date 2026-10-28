import * as React from "react"
import { cn } from "@/lib/utils"

const TextureCardStyled = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      borderRadius: "24px",
      border: "1px solid rgba(197, 168, 128, 0.28)",
      background:
        "linear-gradient(165deg, rgba(16, 26, 48, 0.92) 0%, rgba(8, 13, 25, 0.96) 100%)",
      boxShadow:
        "0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(197, 168, 128, 0.1)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      ...style,
    }}
    className={cn("relative overflow-hidden transition-all duration-300", className)}
    {...props}
  >
    {/* Inner Cult UI multi-layered tactile border */}
    <div
      style={{
        borderRadius: "22px",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        margin: "2px",
      }}
    >
      <div
        style={{
          borderRadius: "20px",
          border: "1px solid rgba(197, 168, 128, 0.12)",
          background:
            "radial-gradient(circle at 50% 0%, rgba(197, 168, 128, 0.08) 0%, transparent 70%)",
        }}
      >
        {children}
      </div>
    </div>
  </div>
))
TextureCardStyled.displayName = "TextureCardStyled"

const TextureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        borderRadius: "20px",
        border: "1px solid rgba(197, 168, 128, 0.24)",
        background:
          "linear-gradient(160deg, rgba(15, 24, 44, 0.88) 0%, rgba(7, 12, 23, 0.94) 100%)",
        boxShadow:
          "0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(16px)",
        ...style,
      }}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  )
})
TextureCard.displayName = "TextureCard"

const TextureCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{ padding: "24px 24px 16px 24px", ...style }}
    className={cn("flex flex-col gap-1.5", className)}
    {...props}
  />
))
TextureCardHeader.displayName = "TextureCardHeader"

const TextureCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, style, ...props }, ref) => (
  <h3
    ref={ref}
    style={{
      fontSize: "1.15rem",
      fontWeight: 700,
      color: "#FFFFFF",
      letterSpacing: "0.02em",
      ...style,
    }}
    className={cn("font-semibold leading-tight", className)}
    {...props}
  />
))
TextureCardTitle.displayName = "TextureCardTitle"

const TextureCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, style, ...props }, ref) => (
  <p
    ref={ref}
    style={{
      fontSize: "0.875rem",
      color: "var(--text-muted)",
      lineHeight: 1.5,
      ...style,
    }}
    className={cn("text-sm", className)}
    {...props}
  />
))
TextureCardDescription.displayName = "TextureCardDescription"

const TextureCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{ padding: "20px 24px", ...style }}
    className={cn("", className)}
    {...props}
  />
))
TextureCardContent.displayName = "TextureCardContent"

const TextureCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      ...style,
    }}
    className={cn("flex items-center justify-between", className)}
    {...props}
  />
))
TextureCardFooter.displayName = "TextureCardFooter"

const TextureSeparator = () => {
  return (
    <div
      style={{
        height: "2px",
        width: "100%",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(197, 168, 128, 0.28) 50%, transparent 100%)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.55)",
      }}
    />
  )
}

export {
  TextureCard,
  TextureCardHeader,
  TextureCardStyled,
  TextureCardFooter,
  TextureCardTitle,
  TextureSeparator,
  TextureCardDescription,
  TextureCardContent,
}

