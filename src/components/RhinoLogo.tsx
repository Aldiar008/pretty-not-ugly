import { cn } from "@/lib/utils";
import { useStore } from "@/store";

interface RhinoLogoProps {
  size?: number;
  className?: string;
  /** Force-disable animation regardless of global setting (e.g. tiny inline icons). */
  static?: boolean;
}

/**
 * Step the Rhino — flat vector mascot in Notion/Linear UI style.
 *
 * - Solid brand-blue circle background
 * - White rhino face with a small horn, rounded ears, dot eyes, soft smile
 * - Optional idle animation (gentle bob + occasional blink) controlled
 *   globally via `useStore().mascotAnimated`
 *
 * Pure SVG so it scales crisply at every size and inherits theme tokens.
 */
export function RhinoLogo({ size = 28, className, static: isStatic = false }: RhinoLogoProps) {
  const animatedPref = useStore((s) => s.mascotAnimated);
  const animate = !isStatic && animatedPref;

  return (
    <span
      className={cn("inline-block align-middle", animate && "sw-mascot-bob", className)}
      style={{ width: size, height: size, lineHeight: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        {/* brand circle */}
        <circle cx="32" cy="32" r="32" fill="hsl(var(--accent))" />

        {/* horn */}
        <path
          d="M30 18 L32 12 L34 18 Z"
          fill="white"
        />

        {/* ears */}
        <ellipse cx="20" cy="24" rx="3.2" ry="4.6" fill="white" />
        <ellipse cx="44" cy="24" rx="3.2" ry="4.6" fill="white" />

        {/* head */}
        <path
          d="M16 34
             C16 24 23 19 32 19
             C41 19 48 24 48 34
             C48 43 41 49 32 49
             C23 49 16 43 16 34 Z"
          fill="white"
        />

        {/* eyes (blink animation toggles scaleY) */}
        <g className={animate ? "sw-mascot-eyes" : undefined} style={{ transformOrigin: "center", transformBox: "fill-box" } as React.CSSProperties}>
          <circle cx="26" cy="33" r="2" fill="hsl(var(--accent))" />
          <circle cx="38" cy="33" r="2" fill="hsl(var(--accent))" />
        </g>

        {/* cheeks */}
        <ellipse cx="22" cy="39" rx="2.4" ry="1.4" fill="hsl(var(--accent))" opacity="0.18" />
        <ellipse cx="42" cy="39" rx="2.4" ry="1.4" fill="hsl(var(--accent))" opacity="0.18" />

        {/* smile */}
        <path
          d="M27 41 Q32 45 37 41"
          stroke="hsl(var(--accent))"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

/** Alias kept for backwards compatibility with older imports. */
export function RhinoBust(props: RhinoLogoProps) {
  return <RhinoLogo {...props} />;
}
