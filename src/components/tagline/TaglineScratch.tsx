/** @jsxImportSource react */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, MotionConfig, useInView, useReducedMotion } from "motion/react";

const STRIKE_S = 1.2;
const STRIKE_MS = STRIKE_S * 1000;

/** Pairs in this tagline — last reveal completes at `INITIAL_DELAY_MS + PAIR_COUNT * STRIKE_MS` */
const PAIR_COUNT = 3;
const INITIAL_DELAY_MS = 1000;
const REMOVE_SCRATCHED_AFTER_MS = 1000;
const STRIP_S = 0.4;

const STRIP_AT_MS =
  INITIAL_DELAY_MS + PAIR_COUNT * STRIKE_MS + REMOVE_SCRATCHED_AFTER_MS;

const pairStrikeAt = (pairIndex: number) =>
  INITIAL_DELAY_MS + pairIndex * STRIKE_MS;

const pairDoneAt = (pairIndex: number) => pairStrikeAt(pairIndex) + STRIKE_MS;

/**
 * Path from `public/scratch1.svg` — viewBox padded for stroke.
 * Idle uses `pathLength: 0` + `opacity: 0` so `strokeLinecap: round` does not leave a dot
 * (tiny non-zero pathLength would).
 */
const SCRATCH_VB = { x: -3, y: -3, w: 155, h: 35 };
const SCRATCH_PATH_D =
  "M2.00012 30.7175C2.4895 30.3479 2.97887 29.9783 10.2024 24.625C17.426 19.2718 31.3689 8.94616 37.8411 4.53976C44.3133 0.133352 42.8922 1.9591 39.0798 6.21576C21.9994 25.2861 19.4722 28.708 19.1272 30.0688C19.0314 30.4467 20.43 29.9205 27.3697 25.474C34.3094 21.0276 47.0888 12.6081 54.0661 8.10185C61.0434 3.59556 61.8314 3.25762 61.9036 3.79406C63.3948 14.8648 44.2722 24.8435 45.2329 25.1508C49.5652 26.5366 60.9873 17.3381 73.4802 10.0201C77.5209 7.65311 77.1429 8.45818 75.2788 10.8065C73.4147 13.1549 70.1397 17.134 68.9971 19.2883C67.8896 21.3764 85.6163 13.648 96.7245 8.275C97.5836 7.85948 98.3299 7.85873 98.3656 8.34013C98.9207 15.8119 87.6765 22.2408 88.2138 22.8853C90.4631 25.5832 103.393 16.9448 116.936 10.8492C121.149 8.95345 120.373 10.4858 119.301 11.9007C118.229 13.3155 116.99 14.8213 117.371 15.4229C124.98 14.2507 133.723 11.5533 138.692 10.051C141.183 9.08004 143.611 7.68549 146.114 6.24868";

const FINAL_TAGLINE =
  "I love building interfaces and improving the user experience.";

type Phase = "idle" | "strike" | "done";

type ScratchPairProps = {
  pairIndex: number;
  inView: boolean;
  animationStartMs: number | null;
  motionPaused: boolean;
  /** OS-level reduced motion only — not the user pause toggle. */
  skipAnimation: boolean;
  original: string;
  replacement: string;
  stripOriginal: boolean;
};

function ScratchPair({
  pairIndex,
  inView,
  animationStartMs,
  motionPaused,
  skipAnimation,
  original,
  replacement,
  stripOriginal,
}: ScratchPairProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [phase, setPhase] = useState<Phase>("idle");
  const [revealAnimated, setRevealAnimated] = useState(false);
  const [stripAnimated, setStripAnimated] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [original]);

  useEffect(() => {
    if (!inView) return;

    if (skipAnimation) {
      setPhase("done");
      return;
    }

    if (motionPaused || animationStartMs === null) return;

    const strikeAt = pairStrikeAt(pairIndex);
    const doneAt = pairDoneAt(pairIndex);
    const elapsed = Date.now() - animationStartMs;

    if (elapsed >= doneAt) {
      setPhase("done");
      return;
    }

    const timers: number[] = [];

    if (elapsed >= strikeAt) {
      setPhase((current) => (current === "idle" ? "strike" : current));
      timers.push(window.setTimeout(() => setPhase("done"), doneAt - elapsed));
    } else {
      timers.push(
        window.setTimeout(() => setPhase("strike"), strikeAt - elapsed),
      );
      timers.push(window.setTimeout(() => setPhase("done"), doneAt - elapsed));
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [inView, pairIndex, skipAnimation, motionPaused, animationStartMs]);

  const revealed = phase === "done" || skipAnimation;

  useEffect(() => {
    if (!revealed || revealAnimated || skipAnimation) return;
    const id = window.setTimeout(() => setRevealAnimated(true), 500);
    return () => window.clearTimeout(id);
  }, [revealed, revealAnimated, skipAnimation]);

  useEffect(() => {
    if (!stripOriginal || stripAnimated || skipAnimation) return;
    const id = window.setTimeout(
      () => setStripAnimated(true),
      STRIP_S * 1000,
    );
    return () => window.clearTimeout(id);
  }, [stripOriginal, stripAnimated, skipAnimation]);

  const showScratch = dims.w > 0 && dims.h > 0;
  const freezeMotion = motionPaused || skipAnimation;

  const strikeTransition = skipAnimation
    ? { duration: 0 }
    : { duration: STRIKE_S, ease: "easeOut" as const };

  const stripDuration =
    stripOriginal && !stripAnimated && !skipAnimation && !motionPaused
      ? STRIP_S
      : stripOriginal
        ? 0
        : 0.4;

  return (
    <span
      className={`scratch-pair inline-flex items-baseline${stripOriginal ? "" : " gap-[0.12em]"}`}
      style={{ marginInline: stripOriginal ? 0 : "0.05em 0" }}
    >
      <motion.span
        className="relative inline-block min-w-0 max-w-full whitespace-nowrap align-baseline overflow-x-clip overflow-y-visible"
        style={{ verticalAlign: "baseline" }}
        aria-hidden={stripOriginal || !revealed}
        initial={false}
        animate={{
          opacity: stripOriginal ? 0 : 1,
          maxWidth: stripOriginal ? 0 : dims.w > 0 ? dims.w : 480,
        }}
        transition={{
          duration: stripOriginal ? stripDuration : 0.4,
          ease: "easeInOut",
        }}
      >
        <span ref={textRef} className="inline">
          {original}
        </span>

        {showScratch ? (
          <svg
            className="pointer-events-none absolute left-0 top-0 overflow-hidden"
            width={dims.w}
            height={dims.h}
            viewBox={`${SCRATCH_VB.x} ${SCRATCH_VB.y} ${SCRATCH_VB.w} ${SCRATCH_VB.h}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <motion.path
              d={SCRATCH_PATH_D}
              fill="none"
              stroke="rgba(var(--primary-color), 1)"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: phase === "idle" ? 0 : 1,
                opacity:
                  phase === "idle"
                    ? 0
                    : stripOriginal
                      ? 0
                      : 1,
              }}
              transition={{
                pathLength: freezeMotion ? { duration: 0 } : strikeTransition,
                opacity: {
                  duration: freezeMotion
                    ? 0
                    : phase === "idle"
                      ? 0
                      : stripOriginal
                        ? STRIP_S
                        : 0.05,
                },
              }}
            />
          </svg>
        ) : null}
      </motion.span>

      <motion.span
        className="inline-block min-w-0 max-w-full whitespace-nowrap align-baseline overflow-x-clip overflow-y-visible"
        style={{ verticalAlign: "baseline" }}
        aria-hidden={!revealed}
        initial={false}
        animate={{
          opacity: revealed ? 1 : 0,
          maxWidth: revealed ? "max-content" : 0,
        }}
        transition={{
          duration:
            skipAnimation || motionPaused || revealAnimated ? 0 : 0.45,
          ease: "easeOut",
          opacity: {
            duration:
              skipAnimation || motionPaused || revealAnimated ? 0 : 0.35,
            delay:
              skipAnimation || motionPaused || revealAnimated ? 0 : 0.08,
          },
        }}
      >
        {replacement}
      </motion.span>
    </span>
  );
}

export default function TaglineScratch() {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.5 });
  const skipAnimation = useReducedMotion() === true;
  const [motionPaused, setMotionPaused] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("motion-paused"),
  );
  const animationStartRef = useRef<number | null>(null);
  const frozenElapsedRef = useRef<number | null>(null);
  const wasPausedRef = useRef(motionPaused);
  const [animationStartMs, setAnimationStartMs] = useState<number | null>(
    null,
  );
  const [stripOriginals, setStripOriginals] = useState(false);

  useEffect(() => {
    const onMotionPause = (e: Event) => {
      setMotionPaused(
        Boolean((e as CustomEvent<{ paused?: boolean }>).detail?.paused),
      );
    };
    window.addEventListener("motion-pause-change", onMotionPause);
    return () => window.removeEventListener("motion-pause-change", onMotionPause);
  }, []);

  useEffect(() => {
    if (animationStartRef.current === null) {
      wasPausedRef.current = motionPaused;
      return;
    }

    const wasPaused = wasPausedRef.current;

    if (!wasPaused && motionPaused) {
      frozenElapsedRef.current = Date.now() - animationStartRef.current;
    } else if (wasPaused && !motionPaused && frozenElapsedRef.current !== null) {
      animationStartRef.current = Date.now() - frozenElapsedRef.current;
      setAnimationStartMs(animationStartRef.current);
      frozenElapsedRef.current = null;
    }

    wasPausedRef.current = motionPaused;
  }, [motionPaused]);

  useEffect(() => {
    if (!inView || skipAnimation || motionPaused) return;
    if (animationStartRef.current !== null) return;

    animationStartRef.current = Date.now();
    setAnimationStartMs(animationStartRef.current);
  }, [inView, skipAnimation, motionPaused]);

  useEffect(() => {
    if (!inView || stripOriginals) return;

    if (skipAnimation) {
      setStripOriginals(true);
      return;
    }

    if (motionPaused || animationStartMs === null) return;

    const elapsed = Date.now() - animationStartMs;
    const remaining = STRIP_AT_MS - elapsed;

    if (remaining <= 0) {
      setStripOriginals(true);
      return;
    }

    const id = window.setTimeout(() => setStripOriginals(true), remaining);
    return () => window.clearTimeout(id);
  }, [inView, skipAnimation, motionPaused, animationStartMs, stripOriginals]);

  if (skipAnimation) {
    return (
      <p ref={rootRef} id="tagline" className="tagline w-full min-w-0">
        {FINAL_TAGLINE}
      </p>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <p ref={rootRef} id="tagline" className="tagline w-full min-w-0">
        <span className="sr-only">{FINAL_TAGLINE}</span>
        <span aria-hidden="true">
          {"I love "}
          <ScratchPair
            pairIndex={0}
            inView={inView}
            animationStartMs={animationStartMs}
            motionPaused={motionPaused}
            skipAnimation={skipAnimation}
            original="mocking up"
            replacement="building"
            stripOriginal={stripOriginals}
          />
          {" interfaces and "}
          <ScratchPair
            pairIndex={1}
            inView={inView}
            animationStartMs={animationStartMs}
            motionPaused={motionPaused}
            skipAnimation={skipAnimation}
            original="refactoring"
            replacement="improving"
            stripOriginal={stripOriginals}
          />
          {" the "}
          <ScratchPair
            pairIndex={2}
            inView={inView}
            animationStartMs={animationStartMs}
            motionPaused={motionPaused}
            skipAnimation={skipAnimation}
            original="codebase"
            replacement="user experience"
            stripOriginal={stripOriginals}
          />
          .
        </span>
      </p>
    </MotionConfig>
  );
}
