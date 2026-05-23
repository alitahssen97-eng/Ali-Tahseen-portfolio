"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Github } from "lucide-react";
import type { Project } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isExternalImage(url: string) {
  return /^https?:\/\//.test(url);
}

/** Shortest signed distance on a circular list (negative = left, positive = right). */
function getCircularOffset(
  index: number,
  activeIndex: number,
  count: number
): number {
  if (count <= 1) return 0;
  const forward = (index - activeIndex + count) % count;
  const backward = (activeIndex - index + count) % count;
  if (forward === 0) return 0;
  if (backward < forward) return -backward;
  if (forward < backward) return forward;
  return forward <= count / 2 ? forward : -backward;
}

type Breakpoint = "mobile" | "tablet" | "desktop";

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const compute = () => {
      const w = window.innerWidth;
      if (w < 768) return "mobile";
      if (w < 1024) return "tablet";
      return "desktop";
    };

    setBp(compute());
    const onResize = () => setBp(compute());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return bp;
}

const SWIPE_THRESHOLD_PX = 48;
const DRAG_CLICK_THRESHOLD_PX = 10;

function isInteractiveDragTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest("a, button, input, textarea, label, [data-no-drag]")
  );
}

type ProjectCardDescriptionProps = {
  description: string;
  projectId: string;
  isActive: boolean;
  showMore: string;
  showLess: string;
};

function ProjectCardDescription({
  description,
  projectId,
  isActive,
  showMore,
  showLess,
}: ProjectCardDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setExpanded(false);
  }, [projectId]);

  useEffect(() => {
    if (!isActive) return;

    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      if (expanded) {
        setIsTruncated(true);
        return;
      }
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [description, expanded, isActive, projectId]);

  if (!description) return null;

  const showToggle = isTruncated || expanded;

  return (
    <div className="mt-1.5">
      <p
        ref={textRef}
        className={cn(
          "whitespace-pre-wrap text-xs leading-relaxed text-cream-300/80 sm:text-sm",
          !expanded && "line-clamp-2 sm:line-clamp-3"
        )}
      >
        {description}
      </p>
      {showToggle && (
          <button
          type="button"
          data-no-drag
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className="mt-1 text-[11px] font-medium text-emerald-400/90 underline-offset-2 hover:text-emerald-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          {expanded ? showLess : showMore}
        </button>
      )}
    </div>
  );
}

export type ImmersiveProjectsCarouselProps = {
  projects: Project[];
  pickDescription: (project: Project) => string;
  labels: {
    featured: string;
    viewProject: string;
    githubRepo: string;
    showMore: string;
    showLess: string;
  };
  /** Localized arrow aria labels. */
  prevLabel?: string;
  nextLabel?: string;
};

export function ImmersiveProjectsCarousel({
  projects,
  pickDescription,
  labels,
  prevLabel = "Previous project",
  nextLabel = "Next project",
}: ImmersiveProjectsCarouselProps) {
  const count = projects.length;
  const initialIndex = useMemo(() => Math.floor(count / 2), [count]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    didDrag: false,
  });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      const next = ((index % count) + count) % count;
      startTransition(() => setActiveIndex(next));
    },
    [count]
  );

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    goTo(activeIndex - 1);
  }, [activeIndex, count, goTo]);

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    goTo(activeIndex + 1);
  }, [activeIndex, count, goTo]);

  const finishDrag = useCallback(
    (dx: number) => {
      setDragOffset(0);
      setIsDragging(false);

      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        if (dx < 0) handleNext();
        else handlePrev();
      }

      window.setTimeout(() => {
        dragRef.current.didDrag = false;
      }, 0);
    },
    [handleNext, handlePrev]
  );

  const onCarouselPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (count <= 1 || e.button !== 0) return;
      if (isInteractiveDragTarget(e.target)) return;

      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        didDrag: false,
      };
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [count]
  );

  const onCarouselPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || dragRef.current.pointerId !== e.pointerId) return;

      const dx = e.clientX - dragRef.current.startX;
      if (Math.abs(dx) > DRAG_CLICK_THRESHOLD_PX) {
        dragRef.current.didDrag = true;
      }
      setDragOffset(dx * 0.4);
    },
    [isDragging]
  );

  const onCarouselPointerEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || dragRef.current.pointerId !== e.pointerId) return;

      const dx = e.clientX - dragRef.current.startX;
      dragRef.current.pointerId = -1;

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      finishDrag(dx);
    },
    [finishDrag, isDragging]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        if (e.deltaX > 20) handleNext();
        else if (e.deltaX < -20) handlePrev();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleNext, handlePrev]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    const node = containerRef.current;
    if (!node) return;
    node.addEventListener("keydown", handleKey);
    return () => node.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  const getCardStyle = useCallback(
    (index: number) => {
      const offset = getCircularOffset(index, activeIndex, count);
      const distance = Math.abs(offset);
      const fixedOffset = isMobile ? 70 : isTablet ? 140 : 200;

      let scale = 1;
      let opacity = 1;
      let blur = 0;
      let zIndex = 1;
      let translateX = 0;
      let translateY = 0;

      if (distance === 0) {
        scale = 1;
        opacity = 1;
        blur = 0;
        zIndex = 10;
      } else if (distance === 1) {
        scale = isMobile ? 0.92 : isTablet ? 0.82 : 0.85;
        blur = isMobile ? 0 : 3;
        zIndex = 5;
        translateX = offset * fixedOffset;
        translateY = isMobile ? 6 : isTablet ? 16 : 22;
      } else if (distance === 2) {
        scale = isMobile ? 0.88 : isTablet ? 0.66 : 0.72;
        opacity = 0.85;
        blur = isMobile ? 1 : 6;
        zIndex = 3;
        translateX = offset * fixedOffset;
        translateY = isMobile ? 10 : isTablet ? 30 : 42;
      } else {
        scale = isMobile ? 0.84 : isTablet ? 0.55 : 0.6;
        opacity = 0.55;
        blur = isMobile ? 2 : 8;
        translateX = offset * fixedOffset;
        translateY = isMobile ? 14 : isTablet ? 44 : 60;
      }

      return { scale, opacity, blur, zIndex, translateX, translateY };
    },
    [activeIndex, count, isMobile, isTablet]
  );

  const stageHeight = isMobile
    ? "h-[440px]"
    : isTablet
      ? "h-[560px]"
      : "h-[600px]";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Projects carousel"
      className={cn(
        "relative w-full overflow-hidden outline-none touch-none select-none",
        "rounded-2xl border border-neutral-800/60 bg-neutral-950/40 backdrop-blur-md",
        "focus-visible:ring-2 focus-visible:ring-emerald-700/40",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      onPointerDown={onCarouselPointerDown}
      onPointerMove={onCarouselPointerMove}
      onPointerUp={onCarouselPointerEnd}
      onPointerCancel={onCarouselPointerEnd}
    >
      <motion.div
        className={cn(
          "relative flex w-full items-center justify-center pb-10",
          stageHeight
        )}
        style={{ x: dragOffset }}
        transition={
          isDragging
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 32 }
        }
      >
        {projects.map((project, index) => {
          const s = getCardStyle(index);
          const isActive = index === activeIndex;
          const primaryLink = project.liveLink ?? project.githubLink;
          const description = pickDescription(project);

          return (
            <motion.div
              key={project.id}
              role="button"
              tabIndex={isActive ? 0 : -1}
              aria-label={
                isActive
                  ? `${project.title} — ${labels.viewProject}`
                  : project.title
              }
              animate={{
                scale: s.scale,
                opacity: s.opacity,
                x: s.translateX,
                y: s.translateY,
                filter: `blur(${s.blur}px)`,
              }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              whileHover={isActive ? { scale: s.scale * 1.01 } : undefined}
              onClick={() => {
                if (dragRef.current.didDrag) return;
                if (!isActive) goTo(index);
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isActive) {
                  e.preventDefault();
                  goTo(index);
                }
              }}
              style={{ zIndex: s.zIndex }}
              className={cn(
                "absolute select-none outline-none",
                isActive ? "cursor-default" : "cursor-pointer",
                isMobile
                  ? "w-[86%] max-w-[300px]"
                  : isTablet
                    ? "w-[56%] max-w-[400px]"
                    : "w-[400px]",
                "aspect-[3/4]"
              )}
            >
              <div
                className={cn(
                  "relative flex h-full w-full flex-col overflow-hidden rounded-2xl",
                  "border border-neutral-800/80 bg-neutral-950",
                  "shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85),_0_15px_40px_-20px_rgba(0,0,0,0.6)]"
                )}
              >
                <div className="relative flex-1 overflow-hidden">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 86vw, (max-width: 1024px) 56vw, 400px"
                    className="object-cover"
                    unoptimized={isExternalImage(project.imageUrl)}
                    priority={isActive}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />

                  {project.featured && (
                    <span className="absolute start-4 top-4 rounded-sm border border-emerald-800/50 bg-emerald-950/60 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-sm">
                      {labels.featured}
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-display text-base leading-tight text-cream-50 sm:text-lg">
                      {project.title}
                    </h3>

                    {isActive && description && (
                      <ProjectCardDescription
                        description={description}
                        projectId={project.id}
                        isActive={isActive}
                        showMore={labels.showMore}
                        showLess={labels.showLess}
                      />
                    )}

                    {isActive && project.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {primaryLink && (
                      <Link
                        href={primaryLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-hidden={!isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={(e) => {
                          if (!isActive) e.preventDefault();
                        }}
                        className={cn(
                          "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full",
                          "border border-emerald-700/40 bg-emerald-500 px-4 py-2",
                          "text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-950",
                          "shadow-lg shadow-emerald-500/20 transition-all duration-200",
                          "hover:bg-emerald-400 hover:shadow-emerald-400/30",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-300",
                          isActive
                            ? "pointer-events-auto opacity-100"
                            : "pointer-events-none opacity-0"
                        )}
                      >
                        {project.githubLink && !project.liveLink && (
                          <Github className="h-3.5 w-3.5" />
                        )}
                        {labels.viewProject}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <Button
        type="button"
        size="icon"
        onClick={handlePrev}
        disabled={count <= 1}
        aria-label={prevLabel}
        className={cn(
          "absolute top-1/2 z-20 h-11 w-11 min-h-11 min-w-11 -translate-y-1/2",
          isMobile ? "start-3" : "start-5"
        )}
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
      </Button>

      <Button
        type="button"
        size="icon"
        onClick={handleNext}
        disabled={count <= 1}
        aria-label={nextLabel}
        className={cn(
          "absolute top-1/2 z-20 h-11 w-11 min-h-11 min-w-11 -translate-y-1/2",
          isMobile ? "end-3" : "end-5"
        )}
      >
        <ChevronRight className="h-5 w-5 rtl:rotate-180" />
      </Button>

      <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-1.5">
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${p.title}`}
            aria-current={i === activeIndex}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === activeIndex
                ? "w-6 bg-emerald-400"
                : "w-1.5 bg-cream-300/30 hover:bg-cream-300/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default ImmersiveProjectsCarousel;
