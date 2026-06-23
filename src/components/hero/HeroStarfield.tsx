/** @jsxImportSource react */
import { useEffect, useRef } from "react";
import laptopSvg from "../../icons/laptop.svg?raw";
import penSvg from "../../icons/pen.svg?raw";
import cameraSvg from "../../icons/camera.svg?raw";

type Star3D = {
  x: number;
  y: number;
  z: number;
  size: number;
  tw: number;
  sp: number;
  tone: 0 | 1; // 0 = primary, 1 = secondary
  kind: 0 | 1; // 0 = soft dot, 1 = four-point sparkle
  rot: number;
};

type ConstShape = {
  idx: number;
  label: string;
  target: number; // yaw at which it faces the camera
  pts: { x: number; y: number; z: number }[];
  edges: [number, number][];
  topIndex: number; // point used to anchor the label
  lead: number; // brighter "lead" star
};

// camera distance from the star-ball centre (in ball radii)
const CAM = 2.6;
// fixed pitch so we look slightly down onto the field
const TILT = 0.32;
// average spin speed (rad/s) for auto-cycle moves — linear drift, no ease spike
const SPEED = 0.028;
// faster speed when chasing a hovered constellation
const FAST = 2.4;
// minimum spin duration (seconds)
const MIN_SPIN = 6.5;
const MIN_SPIN_FAST = 0.55;
// hard cap on yaw velocity (rad/s) — auto-cycle only; hover follows eased timeline
const MAX_YAW_SPEED = 0.055;
// seconds the field pauses on each constellation
const HOLD = 6;
// how far along the inbound arc to BUILD at rest (0 = previous stop, 1 = BUILD)
const PREBUILD_LAND_FRAC = 0.92;

// constellation placement on the sphere
const R_CONST = 0.6;
const SCALE = 0.0024;
// per-constellation vertical offset (fraction of canvas height, − = higher).
// staggers the reveal heights so they don't all sit on one line. On narrow
// screens we flatten the stagger and float the cluster above the centred text.
const STAGGER_WIDE = [-0.19, 0.12, -0.04];
const STAGGER_NARROW = [0, 0, 0];

/** Viewport breakpoints (px) */
const BP_TABLET = 432;
const BP_LG = 1024;

/** Constellation lane per viewport band — tweak `cy` (lower = higher on screen) */
const LAYOUT = {
  /** ≥ 1024px */
  desktop: { cy: 0.48, iconMult: 1.3, iconMin: 0, spread: 1, cxFrac: 0.68, stagger: STAGGER_WIDE },
  /** 432px – 1023px */
  tablet: { cy: 0.65, iconMult: 1, iconMin: 0.34, spread: 0.82, cxFrac: 0.5, stagger: STAGGER_NARROW },
  /** ≤ 431px (pinned scroll hero) */
  pinned: { cy: 0.72, iconMult: 1, iconMin: 0.4, spread: 0.88, cxFrac: 0.5, stagger: STAGGER_NARROW },
} as const;

const pickLayout = (cssW: number) => {
  if (cssW >= BP_LG) return LAYOUT.desktop;
  if (cssW >= BP_TABLET) return LAYOUT.tablet;
  return LAYOUT.pinned;
};
// label placement per constellation — inset from icon top, gap above visible art (dpr)
const LABEL_TUNE = [
  { inset: 0.13, gap: 5 }, // BUILD — laptop
  { inset: 0.06, gap: 12 }, // DESIGN — pen cap sits high in the SVG
  { inset: 0.13, gap: 5 }, // CAPTURE — camera
];
// icon + constellation nudge when revealed (fraction of iconSize)
const ICON_OFFSET = [
  { x: 0, y: 0.10 }, // BUILD
  { x: 0, y: 0 }, // DESIGN
  { x: -0.38, y: 0.62 }, // CAPTURE
];

// local line-art silhouettes (centred) — matched to src/icons laptop / pen / camera
const RAW: { label: string; lead: number; pts: [number, number][]; edges: [number, number][] }[] = [
  {
    label: "BUILD",
    lead: 0,
    pts: [
      [-72, -48],
      [72, -48],
      [72, 8],
      [-72, 8],
      [-88, 18],
      [88, 18],
      [0, 42],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
      [2, 5],
      [4, 6],
      [5, 6],
    ],
  },
  {
    label: "DESIGN",
    lead: 5,
    pts: [
      [0, -72],
      [-14, -20],
      [14, -20],
      [-18, 45],
      [18, 45],
      [0, 78],
      [0, 8],
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 6],
      [2, 6],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
      [6, 5],
    ],
  },
  {
    label: "CAPTURE",
    lead: 5,
    pts: [
      [-70, -8],
      [70, -8],
      [0, -42],
      [-70, 52],
      [70, 52],
      [0, 18],
      [-28, 18],
      [28, 18],
    ],
    edges: [
      [0, 1],
      [1, 4],
      [4, 3],
      [3, 0],
      [0, 2],
      [1, 2],
      [5, 6],
      [5, 7],
      [6, 7],
      [5, 0],
      [5, 1],
      [5, 3],
      [5, 4],
    ],
  },
];

// user-provided icons — BUILD → laptop, DESIGN → pen, CAPTURE → camera
const ICON_SVGS = [laptopSvg, penSvg, cameraSvg];

const tintSvg = (raw: string, r: number, g: number, b: number) => {
  const fill = `fill="rgb(${r},${g},${b})"`;
  return raw
    .replace(/fill="#000000"/gi, fill)
    .replace(/fill="#000"/gi, fill)
    .replace(/fill="black"/gi, fill);
};

const drawStarShape = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  kind: 0 | 1,
  rot: number,
) => {
  if (kind === 0) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    return;
  }

  ctx.fillStyle = color;
  const o = radius;
  const c = radius * 0.24;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const px = (lx: number, ly: number) => x + lx * cos - ly * sin;
  const py = (lx: number, ly: number) => y + lx * sin + ly * cos;
  ctx.beginPath();
  ctx.moveTo(px(0, -o), py(0, -o));
  ctx.quadraticCurveTo(px(c, -c), py(c, -c), px(o, 0), py(o, 0));
  ctx.quadraticCurveTo(px(c, c), py(c, c), px(0, o), py(0, o));
  ctx.quadraticCurveTo(px(-c, c), py(-c, c), px(-o, 0), py(-o, 0));
  ctx.quadraticCurveTo(px(-c, -c), py(-c, -c), px(0, -o), py(0, -o));
  ctx.closePath();
  ctx.fill();
};

// Cheaper than canvas shadowBlur — a soft second pass, dark mode only.
const drawHalo = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  r: number,
  g: number,
  b: number,
  alpha: number,
) => {
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.75, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.14})`;
  ctx.fill();
};

function buildShapes(): ConstShape[] {
  return RAW.map((c, idx) => {
    // place shapes in the same cyclic order the chips read (BUILD→DESIGN→CAPTURE)
    // so the natural drift and the shortest hover path share a direction
    const theta = (-idx * 2 * Math.PI) / RAW.length;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    // recentre each shape on its own bounding box so it reveals centred
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [lx, ly] of c.pts) {
      if (lx < minX) minX = lx;
      if (lx > maxX) maxX = lx;
      if (ly < minY) minY = ly;
      if (ly > maxY) maxY = ly;
    }
    const ox = (minX + maxX) / 2;
    const oy = (minY + maxY) / 2;
    // counteract the downward viewing tilt so the shape reveals vertically centred
    const yTiltFix = -R_CONST * Math.tan(TILT);
    const pts = c.pts.map(([lx, ly]) => {
      const sx = (lx - ox) * SCALE;
      return {
        x: R_CONST * sinT + sx * cosT,
        y: (ly - oy) * SCALE + yTiltFix,
        z: R_CONST * cosT - sx * sinT,
      };
    });
    // yaw that brings this shape to face the camera (centred, closest)
    const target = (((Math.PI - theta) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let topIndex = 0;
    c.pts.forEach(([, ly], i) => {
      if (ly < c.pts[topIndex][1]) topIndex = i;
    });
    return { idx, label: c.label, target, pts, edges: c.edges, topIndex, lead: c.lead };
  });
}

export default function HeroStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let ambient: Star3D[] = [];
    let frameId = 0;
    let last = performance.now();
    let primary: [number, number, number] = [0, 125, 179];
    let secondary: [number, number, number] = [0, 90, 132];
    let dark = document.documentElement.classList.contains("dark");
    let icons: HTMLImageElement[] = [];

    const buildIcons = () => {
      const [r, g, b] = primary;
      icons = ICON_SVGS.map((raw) => {
        const svg = tintSvg(raw, r, g, b);
        const img = new Image();
        img.onload = () => {
          if (reduced) render(performance.now());
        };
        img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        return img;
      });
    };

    const shapes = buildShapes();
    const order = shapes
      .map((s) => ({ idx: s.idx, target: s.target }))
      .sort((a, b) => a.target - b.target);

    // BUILD (idx 0) — laptop / "coding" — first stop on load and in the auto-cycle
    const START_CONST_IDX = 0;
    const startShape = shapes[START_CONST_IDX];
    const startOrderIdx = Math.max(0, order.findIndex((o) => o.idx === START_CONST_IDX));
    const buildTarget = startShape.target;
    const prevOrderIdx = (startOrderIdx - 1 + order.length) % order.length;
    const prevTarget = shapes[order[prevOrderIdx].idx].target;
    const arcToBuild =
      ((((buildTarget - prevTarget) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    const preBuildYaw = buildTarget - arcToBuild * (1 - PREBUILD_LAND_FRAC);

    // rotation state machine (ease-in-out spin → hold → spin)
    let yaw = reduced ? buildTarget : preBuildYaw;
    let holding = reduced;
    let holdIdx = reduced ? START_CONST_IDX : -1;
    let holdTimer = reduced ? HOLD / 2 : 0;
    let pointer = startOrderIdx;
    let focusIdx = -1;
    let rotating = false;
    let rotFrom = 0;
    let rotTo = 0;
    let rotElapsed = 0;
    let rotDuration = 1;
    let spinGoal = 0;
    let hoverSpin = false;

    // pinned-hero scroll scrub (Apple-style: scroll position drives yaw + reveals)
    let scrollScrubActive = false;
    let scrollPhase = 0;
    let scrubSrcIdx = -1;
    let scrubSrcFade = 0;
    let scrubDstIdx = -1;
    let scrubDstFade = 0;
    let scrollHandoffYaw: number | null = null;

    const constellationTargets = shapes.map((s) => s.target);
    // Fraction of each hold segment used for fade in/out (mirrors desktop ~0.4s / ~0.45s on HOLD)
    const SCRUB_FADE_IN = 0.1;
    const SCRUB_FADE_OUT = 0.1;

    const scrubHoldFade = (localT: number) => {
      let fin = 1;
      if (localT < SCRUB_FADE_IN) {
        fin = easeInOutCubic(localT / SCRUB_FADE_IN);
      }
      let fout = 1;
      if (localT > 1 - SCRUB_FADE_OUT) {
        fout = easeInOutCubic((1 - localT) / SCRUB_FADE_OUT);
      }
      return Math.min(fin, fout);
    };

    const revealScrubConstellations = (phase: number) => {
      scrubSrcIdx = -1;
      scrubSrcFade = 0;
      scrubDstIdx = -1;
      scrubDstFade = 0;

      const holds: { idx: number; start: number }[] = [
        { idx: 0, start: 2 },
        { idx: 1, start: 4 },
        { idx: 2, start: 6 },
      ];

      for (const { idx, start } of holds) {
        if (phase >= start && phase < start + 1) {
          const fade = scrubHoldFade(phase - start);
          if (fade > 0.001) {
            scrubDstIdx = idx;
            scrubDstFade = fade;
          }
          return;
        }
      }
    };
    // Must match MOBILE_SCROLL_STEPS in index.astro (text + 3× rotate/hold + overshoot)
    const SCROLL_SEGMENTS: { from: number; to: number }[] = [
      { from: -1, to: -1 }, // 0 text lift — resolved to preBuildYaw below
      { from: -1, to: 0 }, // 1 rotate → BUILD
      { from: 0, to: 0 }, // 2 hold BUILD
      { from: 0, to: 1 }, // 3 rotate → DESIGN
      { from: 1, to: 1 }, // 4 hold DESIGN
      { from: 1, to: 2 }, // 5 rotate → CAPTURE
      { from: 2, to: 2 }, // 6 hold CAPTURE
      { from: 2, to: -1 }, // 7 drift past CAPTURE, stop before BUILD
    ];
    const SCROLL_PHASE_MAX = SCROLL_SEGMENTS.length;

    const yawForConstIdx = (idx: number) =>
      idx < 0 ? preBuildYaw : constellationTargets[idx];

    const applyScrollScrub = (phase: number) => {
      rotating = false;
      holding = false;

      scrubSrcIdx = -1;
      scrubSrcFade = 0;
      scrubDstIdx = -1;
      scrubDstFade = 0;

      // Text lift — auto was running until the user scrolled; freeze yaw in place.
      if (phase < 1) {
        if (scrollHandoffYaw === null) scrollHandoffYaw = yaw;
        revealScrubConstellations(phase);
        return;
      }

      if (scrollHandoffYaw === null) scrollHandoffYaw = yaw;

      const seg = Math.min(Math.floor(phase), SCROLL_SEGMENTS.length - 1);
      let t = phase - seg;
      const { from, to } = SCROLL_SEGMENTS[seg];
      let fromYaw = yawForConstIdx(from);
      const toYaw = yawForConstIdx(to);
      if (seg === 1) fromYaw = scrollHandoffYaw;
      const delta = shortestDelta(fromYaw, toYaw);
      if (Math.abs(delta) < 1e-6) {
        yaw = fromYaw;
      } else {
        t = easeInOutCubic(t);
        yaw = fromYaw + delta * t;
      }

      revealScrubConstellations(phase);
    };

    const resumeAutocycleFromYaw = () => {
      holding = false;
      rotating = false;
      const norm = ((yaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      let pi = 0;
      for (let i = 0; i < order.length; i++) {
        if (order[i].target > norm + 1e-3) {
          pi = i;
          break;
        }
      }
      pointer = pi;
      startSpin(order[pointer].target, SPEED);
    };

    const syncScrollScrub = () => {
      const block = canvas.closest(".hero-block") as HTMLElement | null;
      if (!block) {
        if (scrollScrubActive) {
          scrollScrubActive = false;
          scrollHandoffYaw = null;
          scrubSrcIdx = -1;
          scrubSrcFade = 0;
          scrubDstIdx = -1;
          scrubDstFade = 0;
          if (focusIdx < 0) resumeAutocycleFromYaw();
        }
        return;
      }

      const style = getComputedStyle(block);
      const active = style.getPropertyValue("--hero-scroll-active").trim() === "1";
      if (!active) {
        if (scrollScrubActive) {
          scrollScrubActive = false;
          scrollHandoffYaw = null;
          scrubSrcIdx = -1;
          scrubSrcFade = 0;
          scrubDstIdx = -1;
          scrubDstFade = 0;
          if (focusIdx < 0) resumeAutocycleFromYaw();
        }
        return;
      }

      focusIdx = -1;
      scrollScrubActive = true;
      scrollPhase = Math.max(
        0,
        Math.min(
          SCROLL_PHASE_MAX,
          Number.parseFloat(style.getPropertyValue("--hero-scroll-phase")) || 0,
        ),
      );
      applyScrollScrub(scrollPhase);
    };

    const shortestDelta = (from: number, to: number) =>
      ((((to - from) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

    const beginHold = (idx: number) => {
      holding = true;
      holdIdx = idx;
      holdTimer = 0;
      rotating = false;
    };

    const startSpin = (
      target: number,
      avgSpeed: number,
      minDuration = MIN_SPIN,
      isHover = false,
    ) => {
      const delta = shortestDelta(yaw, target);
      spinGoal = target;
      hoverSpin = isHover;
      if (Math.abs(delta) < 0.002) {
        yaw += delta;
        rotating = false;
        return true;
      }
      rotFrom = yaw;
      rotTo = yaw + delta;
      rotElapsed = 0;
      rotDuration = Math.max(minDuration, Math.abs(delta) / avgSpeed);
      if (!isHover) {
        rotDuration *= 1.15;
      }
      rotating = true;
      holding = false;
      return false;
    };

    const tickSpin = (dt: number) => {
      rotElapsed += dt;
      const t = Math.min(1, rotElapsed / rotDuration);
      const eased = hoverSpin ? easeInOutCubic(t) : t;
      const idealYaw = rotFrom + (rotTo - rotFrom) * eased;
      if (hoverSpin) {
        yaw = idealYaw;
      } else {
        const step = idealYaw - yaw;
        const maxStep = MAX_YAW_SPEED * dt;
        yaw += Math.abs(step) > maxStep ? Math.sign(step) * maxStep : step;
      }
      if (t >= 1) {
        yaw = rotTo;
        rotating = false;
        return true;
      }
      return false;
    };

    const readRgb = (name: string, fallback: [number, number, number]) => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const parts = raw.split(",").map((n) => Number.parseInt(n.trim(), 10));
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) return [parts[0], parts[1], parts[2]] as const;
      return fallback;
    };

    const readColors = () => {
      primary = [...readRgb("--primary-color", primary)];
      secondary = [...readRgb("--secondary-color", secondary)];
      dark = document.documentElement.classList.contains("dark");
      buildIcons();
    };

    const addAmbient = (x: number, y: number, z: number) => {
      ambient.push({
        x,
        y,
        z,
        size: Math.random() * 1.1 + 0.45,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.9 + 0.35,
        tone: Math.random() < 0.5 ? 0 : 1,
        kind: Math.random() < 0.44 ? 1 : 0,
        rot: Math.random() * Math.PI,
      });
    };

    const sampleSphere = () => {
      let x = 0;
      let y = 0;
      let z = 0;
      let d2 = 2;
      while (d2 > 1 || d2 < 1e-4) {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        d2 = x * x + y * y + z * z;
      }
      const r = 0.88 + Math.random() * 0.28;
      const inv = r / Math.sqrt(d2);
      return { x: x * inv, y: y * inv, z: z * inv };
    };

    const initStars = () => {
      ambient = [];
      const cssW = width / dpr;
      const cssH = height / dpr;
      const baseCount = Math.min(720, Math.max(420, Math.floor((cssW * cssH) / 1600)));
      // extra stars biased toward the upper-left at rest (immersive fill behind the text)
      const fillCount = Math.floor(baseCount * 0.45);

      for (let i = 0; i < baseCount; i++) {
        const p = sampleSphere();
        addAmbient(p.x, p.y, p.z);
      }

      for (let i = 0; i < fillCount; i++) {
        let x = 0;
        let y = 0;
        let z = 0;
        let d2 = 2;
        while (d2 > 1.08 || d2 < 1e-4) {
          // power < 1 biases toward negative x/y → more stars left + top on screen
          x = -(Math.random() ** 0.48) * (0.55 + Math.random() * 0.45) + (Math.random() - 0.5) * 0.3;
          y = -(Math.random() ** 0.42) * (0.55 + Math.random() * 0.45) + (Math.random() - 0.5) * 0.3;
          z = Math.random() * 2 - 1;
          d2 = x * x + y * y + z * z;
        }
        const r = 0.9 + Math.random() * 0.32;
        const inv = r / Math.sqrt(d2);
        addAmbient(x * inv, y * inv, z * inv);
      }
    };

    let lastCssW = 0;
    let lastCssH = 0;

    const resize = () => {
      const cssW = Math.max(canvas.clientWidth, 1);
      const cssH = Math.max(canvas.clientHeight, 1);
      // Only regenerate the star field on a real width change. Height-only
      // changes happen constantly on mobile as the browser's address bar
      // collapses/expands during scroll (we size off 100dvh) — regenerating
      // stars on every one of those produced a visible flicker.
      const widthChanged = Math.abs(cssW - lastCssW) > 2;
      lastCssW = cssW;
      lastCssH = cssH;
      width = canvas.width = cssW * dpr;
      height = canvas.height = cssH * dpr;
      readColors();
      if (widthChanged) initStars();
      if (reduced) render(performance.now());
    };

    const scaleMin = 1 / (CAM + 1);
    const scaleMax = 1 / (CAM - 1);
    const scaleRange = scaleMax - scaleMin;

    // shared projection params (recomputed per frame)
    let cx = 0;
    let cy = 0;
    let proj = 0;
    let cosY = 1;
    let sinY = 0;
    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    const project = (x: number, y: number, z: number) => {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y1 = y * cosT - z1 * sinT;
      const z2 = y * sinT + z1 * cosT;
      const depth = z2 + CAM;
      const scale = 1 / depth;
      return { sx: cx + x1 * scale * proj, sy: cy + y1 * scale * proj, scale, depth };
    };

    const advance = (dt: number) => {
      if (reduced || document.documentElement.classList.contains("motion-paused")) return;

      syncScrollScrub();
      if (scrollScrubActive) return;

      if (focusIdx >= 0) {
        const tgt = shapes[focusIdx].target;
        const err = Math.abs(shortestDelta(yaw, tgt));
        if (err <= 0.002) {
          yaw += shortestDelta(yaw, tgt);
          if (!holding || holdIdx !== focusIdx) {
            beginHold(focusIdx);
          } else {
            holdTimer = Math.min(holdTimer + dt, HOLD - 0.5);
          }
          return;
        }
        // Retarget only when idle, wrong destination, or still on a slow auto-cycle spin.
        const needsRetarget =
          !rotating ||
          !hoverSpin ||
          Math.abs(shortestDelta(spinGoal, tgt)) > 0.001;
        if (needsRetarget) startSpin(tgt, FAST, MIN_SPIN_FAST, true);
        if (rotating && tickSpin(dt)) beginHold(focusIdx);
        return;
      }

      if (rotating) {
        if (tickSpin(dt)) beginHold(order[pointer].idx);
        return;
      }

      if (holding) {
        holdTimer += dt;
        if (holdTimer > HOLD) {
          holding = false;
          pointer = (pointer + 1) % order.length;
          startSpin(order[pointer].target, SPEED);
        }
        return;
      }

      if (startSpin(order[pointer].target, SPEED)) {
        beginHold(order[pointer].idx);
      }
    };

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      advance(dt);

      ctx.clearRect(0, 0, width, height);

      const cssW = width / dpr;
      const layout = pickLayout(cssW);
      const wide = cssW >= BP_LG;
      // ambient field stays broad; constellations sit in their own lane
      cx = width * (wide ? 0.52 : 0.5);
      cy = height * 0.5;
      const constCx = width * layout.cxFrac;
      const constCy = height * layout.cy;
      const stagger = layout.stagger;
      const csize = 1;
      const iconMult = layout.iconMult;
      const iconMin = wide ? 0 : cssW * layout.iconMin;
      const constSpread = layout.spread;
      proj = Math.hypot(width, height) * 0.9;
      cosY = Math.cos(yaw);
      sinY = Math.sin(yaw);
      const [pr, pg, pb] = primary;
      const [sr, sg, sb] = secondary;

      const layoutConstellation = (c: ConstShape, cyShape: number) => {
        let projPts = c.pts.map((p) => {
          const q = project(p.x, p.y, p.z);
          q.sx = constCx + (q.sx - cx) * csize;
          q.sy = cyShape + (q.sy - cy) * csize;
          return q;
        });

        let bMinX = Infinity;
        let bMaxX = -Infinity;
        let bMinY = Infinity;
        let bMaxY = -Infinity;
        for (const p of projPts) {
          if (p.sx < bMinX) bMinX = p.sx;
          if (p.sx > bMaxX) bMaxX = p.sx;
          if (p.sy < bMinY) bMinY = p.sy;
          if (p.sy > bMaxY) bMaxY = p.sy;
        }
        const bMx = (bMinX + bMaxX) / 2;
        const bMy = (bMinY + bMaxY) / 2;
        const bSpan = Math.max(bMaxX - bMinX, bMaxY - bMinY, 1);
        const iconSize = Math.max(bSpan * iconMult, iconMin);

        if (!wide) {
          const spread = (iconSize * constSpread) / bSpan;
          projPts = projPts.map((p) => ({
            ...p,
            sx: bMx + (p.sx - bMx) * spread,
            sy: bMy + (p.sy - bMy) * spread,
          }));
        }

        const off = wide ? (ICON_OFFSET[c.idx] ?? ICON_OFFSET[0]) : ICON_OFFSET[0];
        const dx = off.x * iconSize;
        const dy = off.y * iconSize;
        if (dx !== 0 || dy !== 0) {
          projPts = projPts.map((p) => ({ ...p, sx: p.sx + dx, sy: p.sy + dy }));
        }

        return { projPts, bMx: bMx + dx, bMy: bMy + dy, iconSize, bMinY };
      };

      // ambient field — dual-tone stars (primary + secondary)
      for (const s of ambient) {
        const p = project(s.x, s.y, s.z);
        if (p.depth <= 0.05) continue;
        const [cr, cg, cb] = s.tone === 0 ? [pr, pg, pb] : [sr, sg, sb];
        let norm = (p.scale - scaleMin) / scaleRange;
        norm = norm < 0 ? 0 : norm > 1 ? 1 : norm;
        const twinkle = reduced ? 0 : Math.sin(s.tw + now * 0.001 * s.sp) * 0.16;
        let alpha = 0.1 + norm * 0.55 + twinkle;
        alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
        if (alpha < 0.07) continue;
        const rad = Math.max(0.35, s.size * p.scale * 3.1 * dpr);
        if (dark && norm > 0.28) drawHalo(ctx, p.sx, p.sy, rad, cr, cg, cb, alpha);
        drawStarShape(
          ctx,
          p.sx,
          p.sy,
          rad,
          `rgba(${cr},${cg},${cb},${alpha})`,
          s.kind,
          s.rot,
        );
      }

      // reveal fade for the currently-held constellation
      let fade = 0;
      if (scrollScrubActive) {
        fade = scrubDstFade;
      } else if (holding) {
        const fin = Math.min(1, holdTimer / 0.4);
        const fout = holdTimer > HOLD - 0.45 ? Math.max(0, (HOLD - holdTimer) / 0.45) : 1;
        fade = Math.min(fin, fout);
      }

      const fadeFor = (idx: number) => {
        if (scrollScrubActive) {
          if (idx === scrubDstIdx) return scrubDstFade;
          if (idx === scrubSrcIdx) return scrubSrcFade;
          return 0;
        }
        if (holding && idx === holdIdx) return fade;
        return 0;
      };

      // constellation stars (always present, brighter) + lines/label on reveal
      for (const c of shapes) {
        const cyShape = constCy + stagger[c.idx % stagger.length] * height;
        const { projPts, bMx, bMy, iconSize } = layoutConstellation(c, cyShape);
        const shapeFade = fadeFor(c.idx);
        const isHeld = shapeFade > 0.001;

        // revealed illustration: fade the SVG icon in behind the dots
        const icon = icons[c.idx];
        if (isHeld && icon && icon.complete && icon.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = shapeFade * 0.62;
          ctx.drawImage(icon, bMx - iconSize / 2, bMy - iconSize / 2, iconSize, iconSize);
          ctx.restore();
        }

        // connecting lines (only when this shape is revealed)
        if (isHeld) {
          ctx.save();
          ctx.strokeStyle = `rgba(${pr},${pg},${pb},${0.85 * shapeFade})`;
          ctx.lineWidth = 1.4 * dpr;
          ctx.lineCap = "round";
          ctx.beginPath();
          for (const [a, b] of c.edges) {
            ctx.moveTo(projPts[a].sx, projPts[a].sy);
            ctx.lineTo(projPts[b].sx, projPts[b].sy);
          }
          ctx.stroke();
          ctx.restore();
        }

        // the stars themselves
        for (let i = 0; i < projPts.length; i++) {
          const p = projPts[i];
          if (p.depth <= 0.05) continue;
          let norm = (p.scale - scaleMin) / scaleRange;
          norm = norm < 0 ? 0 : norm > 1 ? 1 : norm;
          const base = 0.45 + norm * 0.4;
          const alpha = Math.min(1, isHeld ? base + shapeFade * 0.5 : base);
          const isLead = i === c.lead;
          const rad =
            Math.max(0.6, p.scale * (isLead ? 4.4 : 3.2) * dpr) * (isHeld ? 1 + shapeFade * 0.15 : 1);
          if (dark && isHeld && shapeFade > 0.15) {
            drawHalo(ctx, p.sx, p.sy, rad, pr, pg, pb, alpha * shapeFade);
          }
          drawStarShape(
            ctx,
            p.sx,
            p.sy,
            rad,
            `rgba(${pr},${pg},${pb},${alpha})`,
            1,
            (i * 0.9 + c.idx * 0.55) % Math.PI,
          );
        }
      }

      // labels last so they always paint above icons and stars
      const labelIdx = scrollScrubActive ? scrubDstIdx : holding ? holdIdx : -1;
      const labelFade = scrollScrubActive ? scrubDstFade : fade;
      if (labelIdx >= 0 && labelFade > 0.02) {
        const c = shapes[labelIdx];
        const cyShape = constCy + stagger[c.idx % stagger.length] * height;
        const { bMx, bMy, iconSize } = layoutConstellation(c, cyShape);
        const iconTop = bMy - iconSize / 2;
        const fontSize = 12 * dpr;
        const tune = LABEL_TUNE[c.idx] ?? LABEL_TUNE[0];
        const visibleTop = iconTop + iconSize * tune.inset;
        const labelY = visibleTop - tune.gap * dpr;

        ctx.save();
        try {
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${3 * dpr}px`;
        } catch {
          /* letterSpacing unsupported */
        }
        ctx.font = `600 ${fontSize}px Gabarito, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${0.9 * labelFade})`;
        ctx.fillText(c.label, bMx, labelY);
        ctx.restore();
      }

      if (!reduced && !document.documentElement.classList.contains("motion-paused")) {
        frameId = requestAnimationFrame(render);
      }
    };

    resize();
    last = performance.now();
    render(last);

    const onFocus = (e: Event) => {
      const raw = (e as CustomEvent).detail;
      const scroll =
        typeof raw === "object" && raw !== null && "scroll" in raw
          ? Boolean((raw as { scroll?: boolean }).scroll)
          : false;
      const detail =
        typeof raw === "number"
          ? raw
          : typeof raw === "object" && raw !== null && "idx" in raw
            ? (raw as { idx: number }).idx
            : -1;

      if (typeof detail === "number" && detail >= 0 && detail < shapes.length) {
        scrollScrubActive = false;
        focusIdx = detail;
        if (scroll) {
          yaw = shapes[detail].target;
          rotating = false;
          beginHold(detail);
          return;
        }
        holding = false;
        startSpin(shapes[detail].target, FAST, MIN_SPIN_FAST, true);
      } else {
        if (scrollScrubActive) return;
        focusIdx = -1;
        resumeAutocycleFromYaw();
      }
    };
    window.addEventListener("hero-focus", onFocus as EventListener);

    const onMotionPause = (e: Event) => {
      const paused = Boolean((e as CustomEvent<{ paused?: boolean }>).detail?.paused);
      if (paused) {
        cancelAnimationFrame(frameId);
        return;
      }
      if (!reduced) {
        last = performance.now();
        frameId = requestAnimationFrame(render);
      }
    };
    window.addEventListener("motion-pause-change", onMotionPause as EventListener);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mo = new MutationObserver(() => {
      readColors();
      if (reduced) render(performance.now());
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("hero-focus", onFocus as EventListener);
      window.removeEventListener("motion-pause-change", onMotionPause as EventListener);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-starfield" aria-hidden="true" />;
}
