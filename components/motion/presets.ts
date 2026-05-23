import type { AnimatedContentProps } from "./animated-content";

export type ScrollRevealPreset = Pick<
  AnimatedContentProps,
  | "distance"
  | "direction"
  | "reverse"
  | "duration"
  | "ease"
  | "threshold"
  | "initialOpacity"
  | "animateOpacity"
  | "scale"
  | "delay"
>;

/** Shared scroll-reveal timing — one place for the whole site */
export const scrollRevealPresets = {
  /** Section labels and headings */
  header: {
    distance: 40,
    direction: "vertical",
    reverse: false,
    duration: 0.85,
    ease: "power3.out",
    threshold: 0.2,
    initialOpacity: 0,
    animateOpacity: true,
    scale: 1,
    delay: 0,
  },
  /** Default content blocks */
  content: {
    distance: 56,
    direction: "vertical",
    reverse: false,
    duration: 0.9,
    ease: "power3.out",
    threshold: 0.15,
    initialOpacity: 0,
    animateOpacity: true,
    scale: 1,
    delay: 0,
  },
  /** Enters from the inline-start side (left in LTR, right in RTL) */
  fromStart: {
    distance: 72,
    direction: "horizontal",
    reverse: true,
    duration: 0.9,
    ease: "power3.out",
    threshold: 0.15,
    initialOpacity: 0,
    animateOpacity: true,
    scale: 0.98,
    delay: 0,
  },
  /** Enters from the inline-end side */
  fromEnd: {
    distance: 72,
    direction: "horizontal",
    reverse: false,
    duration: 0.9,
    ease: "power3.out",
    threshold: 0.15,
    initialOpacity: 0,
    animateOpacity: true,
    scale: 0.98,
    delay: 0,
  },
  /** Large media (carousel, images) */
  media: {
    distance: 64,
    direction: "vertical",
    reverse: false,
    duration: 1,
    ease: "power3.out",
    threshold: 0.12,
    initialOpacity: 0,
    animateOpacity: true,
    scale: 0.97,
    delay: 0.08,
  },
  /** Staggered list items */
  item: {
    distance: 36,
    direction: "vertical",
    reverse: false,
    duration: 0.75,
    ease: "power3.out",
    threshold: 0.12,
    initialOpacity: 0,
    animateOpacity: true,
    scale: 1,
    delay: 0,
  },
  /** Footer strip */
  footer: {
    distance: 28,
    direction: "vertical",
    reverse: false,
    duration: 0.8,
    ease: "power3.out",
    threshold: 0.25,
    initialOpacity: 0,
    animateOpacity: true,
    scale: 1,
    delay: 0,
  },
} as const satisfies Record<string, ScrollRevealPreset>;

export type ScrollRevealPresetName = keyof typeof scrollRevealPresets;
