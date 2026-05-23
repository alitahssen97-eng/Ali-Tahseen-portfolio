import { gsap } from "gsap";

export const SCROLL_REVEAL_END = "bottom 15%";

export function scrollRevealStart(threshold: number) {
  return `top ${(1 - threshold) * 100}%`;
}

type ResetRevealOptions = {
  axis: "x" | "y";
  offset: number;
  scale: number;
  opacity: number;
};

export function resetRevealTargets(
  targets: gsap.TweenTarget,
  { axis, offset, scale, opacity }: ResetRevealOptions
) {
  gsap.killTweensOf(targets);
  gsap.set(targets, {
    x: axis === "x" ? offset : 0,
    y: axis === "y" ? offset : 0,
    scale,
    opacity,
  });
}

export function playRevealTargets(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars
) {
  gsap.to(targets, { ...vars, overwrite: "auto" });
}
