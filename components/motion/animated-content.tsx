"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  resetRevealTargets,
  SCROLL_REVEAL_END,
  scrollRevealStart,
} from "@/components/motion/scroll-trigger-utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type AnimatedContentProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "style"
> & {
  children: ReactNode;
  container?: string | HTMLElement | null;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  /** Re-run animation each time the element enters the viewport */
  repeat?: boolean;
  delay?: number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: CSSProperties;
};

export function AnimatedContent({
  children,
  container,
  distance = 100,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  ease = "power3.out",
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  repeat = true,
  delay = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = "power3.in",
  onComplete,
  onDisappearanceComplete,
  className = "",
  style,
  ...rest
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(el, { x: 0, y: 0, scale: 1, opacity: 1, visibility: "visible" });
      onComplete?.();
      return;
    }

    let scrollerTarget: HTMLElement | null = null;
    if (typeof container === "string") {
      scrollerTarget = document.querySelector<HTMLElement>(container);
    } else if (container instanceof HTMLElement) {
      scrollerTarget = container;
    }

    const axis: "x" | "y" = direction === "horizontal" ? "x" : "y";
    const offset = reverse ? -distance : distance;
    const hiddenOpacity = animateOpacity ? initialOpacity : 1;

    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: hiddenOpacity,
      visibility: "visible",
    });

    const reset = () =>
      resetRevealTargets(el, {
        axis,
        offset,
        scale,
        opacity: hiddenOpacity,
      });

    const play = () => {
      gsap.to(el, {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease,
        delay,
        overwrite: "auto",
        onComplete: () => {
          onComplete?.();
          if (disappearAfter > 0) {
            gsap.to(el, {
              [axis]: reverse ? distance : -distance,
              scale: 0.8,
              opacity: animateOpacity ? initialOpacity : 0,
              delay: disappearAfter,
              duration: disappearDuration,
              ease: disappearEase,
              onComplete: () => onDisappearanceComplete?.(),
            });
          }
        },
      });
    };

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scrollerTarget ?? undefined,
      start: scrollRevealStart(threshold),
      end: repeat ? SCROLL_REVEAL_END : undefined,
      once: !repeat,
      onEnter: play,
      ...(repeat
        ? {
            onLeave: reset,
            onEnterBack: play,
            onLeaveBack: reset,
          }
        : {}),
    });

    return () => {
      st.kill();
      gsap.killTweensOf(el);
    };
  }, [
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    repeat,
    delay,
    disappearAfter,
    disappearDuration,
    disappearEase,
    onComplete,
    onDisappearanceComplete,
  ]);

  return (
    <div
      ref={ref}
      className={cn("min-w-0 overflow-x-clip", className)}
      style={{ visibility: "hidden", ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default AnimatedContent;
