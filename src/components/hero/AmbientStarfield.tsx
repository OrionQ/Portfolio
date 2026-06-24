/** @jsxImportSource react */
import { useEffect, useRef } from "react";

type Star3D = {
  x: number;
  y: number;
  z: number;
  size: number;
  tw: number;
  sp: number;
  tone: 0 | 1;
  kind: 0 | 1;
  rot: number;
};

const CAM = 2.6;
const TILT = 0.32;
const DRIFT_SPEED = 0.012;

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

export default function AmbientStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMotionPaused = () =>
      document.documentElement.classList.contains("motion-paused");
    const shouldRepaint = () => reduced || isMotionPaused();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let ambient: Star3D[] = [];
    let frameId = 0;
    let last = performance.now();
    let visualNow = last;
    let yaw = 0;
    let primary: [number, number, number] = [0, 125, 179];
    let secondary: [number, number, number] = [0, 90, 132];
    let dark = document.documentElement.classList.contains("dark");
    let lastCssW = 0;

    const readRgb = (name: string, fallback: [number, number, number]) => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const parts = raw.split(",").map((n) => Number.parseInt(n.trim(), 10));
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
        return [parts[0], parts[1], parts[2]] as const;
      }
      return fallback;
    };

    const isDarkMode = () => document.documentElement.classList.contains("dark");

    const readColors = () => {
      primary = [...readRgb("--primary-color", primary)];
      secondary = [...readRgb("--secondary-color", secondary)];
      dark = isDarkMode();
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

    const scaleMin = 1 / (CAM + 1);
    const scaleMax = 1 / (CAM - 1);
    const scaleRange = scaleMax - scaleMin;
    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    const project = (x: number, y: number, z: number, cx: number, cy: number, proj: number) => {
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y1 = y * cosT - z1 * sinT;
      const z2 = y * sinT + z1 * cosT;
      const depth = z2 + CAM;
      const scale = 1 / depth;
      return { sx: cx + x1 * scale * proj, sy: cy + y1 * scale * proj, scale, depth };
    };

    const resize = () => {
      const cssW = Math.max(canvas.clientWidth, 1);
      const cssH = Math.max(canvas.clientHeight, 1);
      const widthChanged = Math.abs(cssW - lastCssW) > 2;
      lastCssW = cssW;

      const backingW = Math.round(cssW * dpr);
      // Safari's collapsing address bar emits height-only ResizeObserver
      // updates while scrolling. Reusing the backing height prevents the
      // fixed ambient canvas from being cleared for a frame on every update.
      const keepMobileHeight =
        cssW < 1024 && !widthChanged && height > 0;
      const backingH = keepMobileHeight
        ? height
        : Math.round(cssH * dpr);
      if (backingW !== width || backingH !== height) {
        width = canvas.width = backingW;
        height = canvas.height = backingH;
      }

      readColors();
      if (widthChanged) initStars();
      if (shouldRepaint()) render(performance.now());
    };

    const render = (now: number) => {
      if (!dark) {
        ctx.clearRect(0, 0, width, height);
        frameId = 0;
        return;
      }

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!isMotionPaused()) visualNow += dt * 1000;

      if (!reduced && !isMotionPaused()) {
        yaw += DRIFT_SPEED * dt;
      }

      ctx.clearRect(0, 0, width, height);

      const cssW = width / dpr;
      const cx = width * (cssW >= 1024 ? 0.52 : 0.5);
      const cy = height * 0.5;
      const proj = Math.hypot(width, height) * 0.9;
      const [pr, pg, pb] = primary;
      const [sr, sg, sb] = secondary;

      for (const s of ambient) {
        const p = project(s.x, s.y, s.z, cx, cy, proj);
        if (p.depth <= 0.05) continue;
        const [cr, cg, cb] = s.tone === 0 ? [pr, pg, pb] : [sr, sg, sb];
        let norm = (p.scale - scaleMin) / scaleRange;
        norm = norm < 0 ? 0 : norm > 1 ? 1 : norm;
        const twinkle =
          reduced ? 0 : Math.sin(s.tw + visualNow * 0.001 * s.sp) * 0.16;
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

      if (!reduced && !isMotionPaused()) {
        frameId = requestAnimationFrame(render);
      } else {
        frameId = 0;
      }
    };

    resize();
    last = performance.now();
    render(last);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMotionPause = (e: Event) => {
      const paused = Boolean((e as CustomEvent<{ paused?: boolean }>).detail?.paused);
      if (paused) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        return;
      }
      if (!reduced && dark) {
        last = performance.now();
        frameId = requestAnimationFrame(render);
      }
    };

    const mo = new MutationObserver(() => {
      const wasDark = dark;
      readColors();
      if (!dark) {
        ctx.clearRect(0, 0, width, height);
        cancelAnimationFrame(frameId);
        frameId = 0;
        return;
      }
      if (dark && !wasDark && !reduced && !isMotionPaused() && !frameId) {
        last = performance.now();
        frameId = requestAnimationFrame(render);
      }
      if (shouldRepaint()) render(performance.now());
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    window.addEventListener("motion-pause-change", onMotionPause);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("motion-pause-change", onMotionPause);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="ambient-starfield"
      className="ambient-starfield"
      aria-hidden="true"
    />
  );
}
