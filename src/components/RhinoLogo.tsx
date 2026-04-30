import { cn } from "@/lib/utils";

interface RhinoLogoProps {
  size?: number;
  className?: string;
}

/**
 * Step the Rhino — flat, minimalist mascot.
 * Side profile facing right, horn stylised as an upward arrow.
 */
export function RhinoLogo({ size = 28, className }: RhinoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-[hsl(var(--accent))]", className)}
      aria-hidden="true"
    >
      {/* body */}
      <path
        d="M8 42c0-10 9-17 19-17h11l4-9 5 12c4 1 9 5 9 11v7c0 2-2 4-4 4h-3l-2 5h-5l-1-5H22l-1 5h-5l-2-5h-2c-2 0-4-2-4-4v-4z"
        fill="currentColor"
      />
      {/* horn = arrow up */}
      <path
        d="M44 21l4-9 4 9-2 0v6h-4v-6h-2z"
        fill="currentColor"
      />
      {/* eye */}
      <circle cx="50" cy="32" r="1.4" fill="hsl(var(--background))" />
      {/* ear */}
      <path d="M44 22c1-3 4-3 4 0v3h-3l-1-3z" fill="currentColor" />
    </svg>
  );
}

/**
 * Bust / front-facing rhino used inside the floating mascot button.
 * Always white on accent background.
 */
export function RhinoBust({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* head */}
      <ellipse cx="32" cy="34" rx="20" ry="18" fill="white" />
      {/* horn */}
      <path d="M28 18l4-10 4 10v6h-8v-6z" fill="white" />
      {/* ears */}
      <ellipse cx="14" cy="22" rx="4" ry="6" fill="white" />
      <ellipse cx="50" cy="22" rx="4" ry="6" fill="white" />
      {/* eyes */}
      <circle cx="24" cy="32" r="2" fill="hsl(var(--accent))" />
      <circle cx="40" cy="32" r="2" fill="hsl(var(--accent))" />
      {/* smile */}
      <path
        d="M24 42c2 3 6 4 8 4s6-1 8-4"
        stroke="hsl(var(--accent))"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* nose */}
      <ellipse cx="32" cy="38" rx="3" ry="2" fill="hsl(var(--accent))" opacity="0.4" />
    </svg>
  );
}
