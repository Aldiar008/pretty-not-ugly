import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import rhinoMascot from "@/assets/rhino-mascot.png";

interface RhinoLogoProps {
  size?: number;
  className?: string;
  /** Force-disable animation regardless of global setting (e.g. tiny inline icons or hero). */
  static?: boolean;
}

/**
 * Step the Rhino — official mascot used everywhere across the app.
 *
 * Single source of truth: `src/assets/rhino-mascot.png`.
 * Optional idle animation (gentle bob + blink) controlled globally via
 * `useStore().mascotAnimated`. Pass `static` to disable per-instance.
 */
export function RhinoLogo({ size = 28, className, static: isStatic = false }: RhinoLogoProps) {
  const animatedPref = useStore((s) => s.mascotAnimated);
  const animate = !isStatic && animatedPref;

  return (
    <span
      className={cn(
        "inline-block align-middle overflow-hidden",
        animate && "sw-mascot-bob",
        className,
      )}
      style={{ width: size, height: size, lineHeight: 0 }}
      aria-hidden="true"
    >
      <img
        src={rhinoMascot}
        alt="Step the Rhino"
        width={size}
        height={size}
        draggable={false}
        loading="lazy"
        className="h-full w-full select-none object-contain"
      />
    </span>
  );
}

/** Alias kept for backwards compatibility with older imports. */
export function RhinoBust(props: RhinoLogoProps) {
  return <RhinoLogo {...props} />;
}
