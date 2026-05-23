"use client";

import {
  createElement,
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AnimatedContent,
  type AnimatedContentProps,
} from "@/components/motion/animated-content";
import {
  scrollRevealPresets,
  type ScrollRevealPresetName,
} from "@/components/motion/presets";
import {
  playRevealTargets,
  resetRevealTargets,
  SCROLL_REVEAL_END,
  scrollRevealStart,
} from "@/components/motion/scroll-trigger-utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type ScrollRevealProps = AnimatedContentProps & {
  preset?: ScrollRevealPresetName;
};

/** Single block reveal on scroll */
export function ScrollReveal({
  preset = "content",
  ...props
}: ScrollRevealProps) {
  return <AnimatedContent {...scrollRevealPresets[preset]} {...props} />;
}

/** Section title / label group */
export function SectionHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ScrollReveal preset="header" className={className}>
      {children}
    </ScrollReveal>
  );
}

type ScrollRevealStaggerProps = {
  children: ReactNode;
  className?: string;
  preset?: ScrollRevealPresetName;
  stagger?: number;
  threshold?: number;
  delay?: number;
  as?: ElementType;
};

/** Reveals direct children one after another on scroll */
export function ScrollRevealStagger({
  children,
  className,
  preset = "item",
  stagger = 0.1,
  threshold,
  delay = 0,
  as: Tag = "div",
}: ScrollRevealStaggerProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = Array.from(el.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );
    if (items.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(items, { x: 0, y: 0, opacity: 1, visibility: "visible" });
      return;
    }

    const config = scrollRevealPresets[preset];
    const axis: "x" | "y" =
      config.direction === "horizontal" ? "x" : "y";
    const offset = config.reverse ? -config.distance : config.distance;
    const itemThreshold = threshold ?? config.threshold;
    const hiddenOpacity = config.animateOpacity ? config.initialOpacity : 1;
    const resetOptions = {
      axis,
      offset,
      scale: config.scale,
      opacity: hiddenOpacity,
    };
    const playVars = {
      [axis]: 0,
      opacity: 1,
      scale: 1,
      duration: config.duration,
      ease: config.ease,
      stagger,
      delay,
    };

    gsap.set(items, {
      [axis]: offset,
      scale: config.scale,
      opacity: hiddenOpacity,
      visibility: "visible",
    });

    const play = (elements: Element[]) =>
      playRevealTargets(elements, playVars);

    const reset = (elements: Element[]) =>
      resetRevealTargets(elements, resetOptions);

    const triggers: ScrollTrigger[] = [];

    const batch = ScrollTrigger.batch(items, {
      start: scrollRevealStart(itemThreshold),
      end: SCROLL_REVEAL_END,
      once: false,
      onEnter: play,
      onLeave: reset,
      onEnterBack: play,
      onLeaveBack: reset,
    });

    if (Array.isArray(batch)) {
      triggers.push(...batch);
    } else if (batch) {
      triggers.push(batch);
    }

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, [preset, stagger, threshold, delay]);

  return createElement(Tag, {
    ref: ref as Ref<HTMLElement>,
    className,
    children,
  });
}
