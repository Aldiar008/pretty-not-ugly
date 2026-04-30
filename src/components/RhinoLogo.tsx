import { cn } from "@/lib/utils";
import rhinoMascot from "@/assets/rhino-mascot.png";

interface RhinoLogoProps {
  size?: number;
  className?: string;
}

/**
 * Step the Rhino mascot — uses the uploaded mascot image.
 * Kept as a single component (RhinoLogo + RhinoBust alias) so all existing
 * imports across the app continue to work.
 */
export function RhinoLogo({ size = 28, className }: RhinoLogoProps) {
  return (
    <img
      src={rhinoMascot}
      width={size}
      height={size}
      alt="Step the Rhino"
      className={cn("inline-block object-contain", className)}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}

export function RhinoBust({ size = 32, className }: { size?: number; className?: string }) {
  return <RhinoLogo size={size} className={className} />;
}
