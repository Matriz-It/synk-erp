import { cn } from "@/lib/utils"

type Variant = "light" | "dark" | "primary" | "mono"

interface SynkLogoProps {
  variant?: Variant
  showWordmark?: boolean
  className?: string
}

export function SynkLogo({
  variant = "light",
  showWordmark = true,
  className,
}: SynkLogoProps) {
  const colors = {
    light: { mark: "#3D3EBF", text: "#3D3EBF" },
    dark: { mark: "#FFFFFF", text: "#FFFFFF" },
    primary: { mark: "#FFFFFF", text: "#FFFFFF" },
    mono: { mark: "currentColor", text: "currentColor" },
  }[variant]

  return (
    <span
      className={cn("inline-flex items-center gap-2 select-none", className)}
      aria-label="Synk"
    >
      <SynkMark color={colors.mark} />
      {showWordmark && (
        <span
          className="font-display text-[20px] font-bold leading-none tracking-tight"
          style={{ color: colors.text }}
        >
          Synk
        </span>
      )}
    </span>
  )
}

function SynkMark({ color }: { color: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 14L12 6L20 14"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 20L12 12L20 20"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  )
}
