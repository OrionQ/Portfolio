/** @jsxImportSource react */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const STRIKE_S = 1.2;
const STRIKE_MS = STRIKE_S * 1000;

/** Pairs in this tagline — last reveal completes at `PAIR_COUNT * STRIKE_MS` */
const PAIR_COUNT = 2;
const REMOVE_SCRATCHED_AFTER_MS = 5000;

/** SVG padding so scribble strokes past the text box aren’t clipped */
const SCRIBBLE_PAD = 8;

/** Tiny deterministic wobble so segments aren’t perfectly straight */
function wobble(i: number, variant: number): number {
  return Math.sin(i * 2.1 + variant * 1.7) * 0.35 + Math.cos(i * 3.3) * 0.18;
}

function densifySegment(
  from: [number, number],
  to: [number, number],
  steps: number,
  variant: number,
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const nx = from[0] + (to[0] - from[0]) * t;
    const ny = from[1] + (to[1] - from[1]) * t;
    const perpX = -(to[1] - from[1]);
    const perpY = to[0] - from[0];
    const len = Math.hypot(perpX, perpY) || 1;
    const ox = (perpX / len) * wobble(i + variant * 10, variant);
    const oy = (perpY / len) * wobble(i + variant * 10, variant);
    out.push([nx + ox, ny + oy]);
  }
  return out;
}

/**
 * Full-word zigzag scratch: each stroke spans nearly the full width (left edge ↔ right edge),
 * like drawing one continuous scribble across the word — not many tight local oscillations.
 */
function handScribblePath(w: number, h: number, variant: number): string {
  if (w <= 0 || h <= 0) return "";

  const xL = -SCRIBBLE_PAD * 0.15;
  const xR = w + SCRIBBLE_PAD * 0.2;
  const inset = Math.min(w * 0.04, 6);

  const mid = h * 0.48;
  const yHi = h * 0.22;
  const yLo = h * 0.82;
  const yHi2 = h * 0.34;
  const yLo2 = h * 0.68;

  const sh = variant === 0 ? 0 : h * 0.04;

  // Alternating corners: each segment crosses almost the whole word (reference-style scratch)
  const corners: [number, number][] = [
    [xL + inset, mid - sh * 0.5],
    [xR - inset, yHi + sh],
    [xL + inset * 1.8, yLo - sh * 0.3],
    [xR - inset * 1.2, yHi2],
    [xL + inset * 2.2, yLo2 + sh],
    [xR - inset * 1.5, mid + sh * 0.4],
    [xL + inset * 2.8, yLo * 0.92],
  ];

  const stepsPerLeg = 14;
  const pts: [number, number][] = [];

  for (let c = 0; c < corners.length - 1; c++) {
    const segment = densifySegment(corners[c], corners[c + 1], stepsPerLeg, variant + c);
    const startIdx = pts.length === 0 ? 0 : 1;
    for (let i = startIdx; i < segment.length; i++) {
      let px = segment[i][0];
      let py = segment[i][1];
      px = Math.min(w + SCRIBBLE_PAD * 0.6, Math.max(-SCRIBBLE_PAD * 0.6, px));
      py = Math.min(h + SCRIBBLE_PAD * 0.45, Math.max(-SCRIBBLE_PAD * 0.35, py));
      pts.push([px + SCRIBBLE_PAD, py + SCRIBBLE_PAD]);
    }
  }

  if (pts.length < 2) return "";

  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
  }
  return d;
}

type Phase = "idle" | "strike" | "done";

type ScratchPairProps = {
  pairIndex: number;
  inView: boolean;
  original: string;
  replacement: string;
  reduceMotion: boolean | null;
  stripOriginal: boolean;
};

function ScratchPair({
  pairIndex,
  inView,
  original,
  replacement,
  reduceMotion,
  stripOriginal,
}: ScratchPairProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [phase, setPhase] = useState<Phase>("idle");

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

    if (reduceMotion) {
      setPhase("done");
      return;
    }

    const start = pairIndex * STRIKE_MS;

    const toStrike = window.setTimeout(() => setPhase("strike"), start);
    const toDone = window.setTimeout(
      () => setPhase("done"),
      start + STRIKE_MS,
    );

    return () => {
      window.clearTimeout(toStrike);
      window.clearTimeout(toDone);
    };
  }, [inView, pairIndex, reduceMotion]);

  const pathD =
    dims.w > 0 && dims.h > 0
      ? handScribblePath(dims.w, dims.h, pairIndex)
      : "";

  const strikeTransition = reduceMotion
    ? { duration: 0 }
    : { duration: STRIKE_S, ease: "easeOut" as const };

  return (
    <span className="inline-flex scratch-pair align-baseline gap-x-1">
      <motion.span
        className="relative inline-block max-w-full align-baseline overflow-x-clip overflow-y-visible whitespace-nowrap"
        style={{ verticalAlign: "baseline" }}
        aria-hidden={stripOriginal}
        animate={{
          opacity: stripOriginal ? 0 : 1,
          maxWidth: stripOriginal ? 0 : 480,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <span className="relative inline-block overflow-visible">
          <span ref={textRef} className="inline">
            {original}
          </span>

          {dims.w > 0 && pathD ? (
            <svg
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              width={dims.w + SCRIBBLE_PAD * 2}
              height={dims.h + SCRIBBLE_PAD * 2}
              style={{ left: -SCRIBBLE_PAD, top: -SCRIBBLE_PAD }}
              aria-hidden
            >
              <motion.path
                d={pathD}
                fill="none"
                stroke="rgba(var(--primary-color), 0.8)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0.001, opacity: 1 }}
                animate={{
                  pathLength: phase === "idle" ? 0.001 : 1,
                  opacity: stripOriginal ? 0 : 1,
                }}
                transition={{
                  pathLength: strikeTransition,
                  opacity: { duration: 0.35 },
                }}
              />
            </svg>
          ) : null}
        </span>
      </motion.span>
      <motion.span
        className="inline-block max-w-full align-baseline overflow-x-clip overflow-y-visible whitespace-nowrap"
        style={{ verticalAlign: "baseline" }}
        initial={false}
        animate={{
          opacity: phase === "done" ? 1 : 0,
          maxWidth: phase === "done" ? 280 : 0,
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.45,
          ease: "easeOut",
          opacity: { duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.08 },
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
  const reduceMotion = useReducedMotion();
  const [stripOriginals, setStripOriginals] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const delayAfterLastReveal = reduceMotion ? 0 : PAIR_COUNT * STRIKE_MS;
    const id = window.setTimeout(
      () => setStripOriginals(true),
      delayAfterLastReveal + REMOVE_SCRATCHED_AFTER_MS,
    );
    return () => window.clearTimeout(id);
  }, [inView, reduceMotion]);

  return (
    <p
      ref={rootRef}
      id="tagline"
      style={{
        fontWeight: "500",
        fontSize: "2.5rem",
        color: "rgba(var(--primary-color), 1)",
        lineHeight: 1.2,
      }}
      className="m-0 w-full text-center md:text-start"
    >
      I am{" "}
      <ScratchPair
        pairIndex={0}
        inView={inView}
        original="usually"
        replacement="now"
        reduceMotion={reduceMotion}
        stripOriginal={stripOriginals}
      />
      {" "}
      stuck between Figma and{" "}
      <ScratchPair
        pairIndex={1}
        inView={inView}
        original="VS Code"
        replacement="Claude Code"
        reduceMotion={reduceMotion}
        stripOriginal={stripOriginals}
      />
      .
    </p>
  );
}
