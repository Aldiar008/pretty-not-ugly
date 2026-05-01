import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import beggieWave from "@/assets/beggie-wave.png";
import beggieSit from "@/assets/beggie-sit.png";
import beggieRelax from "@/assets/beggie-relax.png";
import beggieHead from "@/assets/beggie-head.png";

export type MascotAnimation =
  | "idle"      // gentle bob (default)
  | "wave"      // friendly hand wave — interviewer greeting / waiting for answer
  | "nod"       // approving nod — while user is typing / talking
  | "bounce"    // excited bounce — celebration / new question
  | "tilt"      // curious tilt — thinking
  | "pulse"     // glowing pulse — listening / live mic
  | "think"     // back-and-forth sway — preparing reply
  | "none";     // no animation

export type MascotPose = "wave" | "sit" | "relax" | "head";

interface RhinoCharacterProps {
  size?: number;
  className?: string;
  animation?: MascotAnimation;
  /** Which static pose / artwork to display. Defaults to `wave` (full body). */
  pose?: MascotPose;
}

const ANIM_CLASS: Record<MascotAnimation, string> = {
  idle: "sw-mascot-bob",
  wave: "sw-mascot-wave",
  nod: "sw-mascot-nod",
  bounce: "sw-mascot-bounce",
  tilt: "sw-mascot-tilt",
  pulse: "sw-mascot-pulse",
  think: "sw-mascot-think",
  none: "",
};

const POSE_SRC: Record<MascotPose, string> = {
  wave: beggieWave,
  sit: beggieSit,
  relax: beggieRelax,
  head: beggieHead,
};

/**
 * Бэгги — full-body персонаж с разными позами и state-driven анимациями.
 * Use this on Interview / Onboarding / hero spots where the mascot needs personality.
 *
 * Animations are state-driven (`animation` prop) and globally respect the
 * `mascotAnimated` user setting — when disabled, the character stays still.
 */
export function RhinoCharacter({
  size = 160,
  className,
  animation = "idle",
  pose = "wave",
}: RhinoCharacterProps) {
  const animatedPref = useStore((s) => s.mascotAnimated);
  const animClass = animatedPref ? ANIM_CLASS[animation] : "";

  return (
    <span
      className={cn("inline-block align-middle", animClass, className)}
      style={{ width: size, height: size, lineHeight: 0 }}
      aria-hidden="true"
    >
      <img
        src={POSE_SRC[pose]}
        alt="Бэгги"
        width={size}
        height={size}
        draggable={false}
        loading="lazy"
        className="h-full w-full select-none object-contain"
      />
    </span>
  );
}
