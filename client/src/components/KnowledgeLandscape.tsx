import { useEffect, useRef } from "react";
import "./knowledge-landscape.css";

type Point = { x: number; y: number };
type Surface = "left" | "right" | "base";

/** A moving mathematical surface, drawn as geometry rather than a product graphic. */
export default function KnowledgeLandscape({ paused = false }: { paused?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const syncPlaybackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!scene || !canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let elapsed = 0;
    let lastTick = 0;
    let lastPaint = 0;
    let inView = true;
    let pointerX = 0;
    let pointerY = 0;
    let easedX = 0;
    let easedY = 0;
    let disposed = false;

    const point = (surface: Surface, t: number, s: number, phase: number): Point => {
      const mobile = width < 700;
      const breathing = Math.sin(phase * 0.42 + t * 4.4 + s * 1.2);
      let x: number;
      let y: number;

      if (surface === "right") {
        const spine = 1.045 - 0.22 * Math.sin(t * Math.PI * 0.74);
        const spread = 0.115 + 0.075 * Math.sin(t * Math.PI);
        x = width * (spine + s * spread + 0.018 * breathing * Math.sin(t * Math.PI));
        y = height * (0.005 + 0.94 * t + s * 0.10 * Math.sin(t * 2.1 + 0.4));
        y += Math.sin(s * Math.PI + t * 0.7 + phase * 0.30) * height * 0.068 * Math.sin(t * Math.PI);
        x += easedX * 13;
        y += easedY * 9;
      } else if (surface === "left") {
        const spine = -0.085 + 0.18 * Math.sin(t * Math.PI * 0.86);
        const spread = 0.11 + 0.07 * Math.sin(t * Math.PI);
        x = width * (spine + s * spread + breathing * 0.014);
        y = height * (0.10 + 0.90 * t + s * 0.11 * Math.cos(t * Math.PI * 1.1));
        y += Math.sin(s * Math.PI + phase * 0.26 + t) * height * 0.06;
        x -= easedX * 9;
        y -= easedY * 6;
      } else {
        x = width * (-0.20 + 1.40 * t + s * 0.07);
        y = height * (0.94 - 0.11 * Math.sin(t * Math.PI) + s * 0.08);
        y += Math.sin(t * 8 + s * 1.2 - phase * 0.22) * height * 0.036;
        y += easedY * 5;
      }

      // Keep the same sculptural silhouette on narrow screens, further from the copy.
      if (mobile && surface !== "base") {
        x = width / 2 + (x - width / 2) * 1.16;
        y += height * 0.07;
      }
      return { x, y };
    };

    const trace = (points: Point[]) => {
      context.beginPath();
      points.forEach((p, index) => {
        if (index === 0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
      });
    };

    const drawSurface = (surface: Surface, phase: number) => {
      const length = surface === "base" ? 76 : 66;
      const breadth = surface === "base" ? 30 : 44;
      const grid: Point[][] = [];
      for (let i = 0; i <= length; i++) {
        const row: Point[] = [];
        for (let j = 0; j <= breadth; j++) {
          row.push(point(surface, i / length, (j / breadth) * 2 - 1, phase));
        }
        grid.push(row);
      }

      const edge = [
        ...grid.map((row) => row[0]),
        ...grid[length].slice(1),
        ...grid.slice(0, length).reverse().map((row) => row[breadth]),
        ...grid[0].slice(1, breadth).reverse(),
      ];
      trace(edge);
      context.closePath();
      const fill = context.createLinearGradient(
        surface === "left" ? 0 : width,
        height * 0.15,
        surface === "left" ? width * 0.32 : width * 0.62,
        height,
      );
      if (surface === "base") {
        fill.addColorStop(0, "rgba(117, 139, 236, 0.10)");
        fill.addColorStop(0.5, "rgba(128, 147, 240, 0.46)");
        fill.addColorStop(1, "rgba(187, 192, 247, 0.20)");
      } else {
        fill.addColorStop(0, "rgba(64, 92, 207, 0.56)");
        fill.addColorStop(0.28, "rgba(83, 112, 224, 0.72)");
        fill.addColorStop(0.62, "rgba(140, 139, 226, 0.65)");
        fill.addColorStop(0.85, "rgba(170, 180, 240, 0.48)");
        fill.addColorStop(1, "rgba(219, 225, 250, 0.10)");
      }
      context.fillStyle = fill;
      context.fill();

      // Follow the curvature with soft light and shade, so the surface reads as
      // a continuous folded material rather than a flat decorative grid.
      for (let j = 0; j < breadth; j++) {
        const strip = [
          ...grid.map((row) => row[j]),
          ...grid.slice().reverse().map((row) => row[j + 1]),
        ];
        trace(strip);
        context.closePath();
        const across = j / breadth;
        const light = 0.5 + 0.5 * Math.sin(across * Math.PI * 2.1 + (surface === "left" ? 0.4 : 2.1) + phase * 0.18);
        const shade = context.createLinearGradient(0, height * 0.06, 0, height);
        if (surface === "base") {
          shade.addColorStop(0, `rgba(68, 88, 191, ${(1 - light) * 0.10})`);
          shade.addColorStop(1, `rgba(212, 217, 255, ${light * 0.28})`);
        } else {
          const dark = (1 - light) * 0.35;
          shade.addColorStop(0, `rgba(30, 55, 155, ${dark * 0.50})`);
          shade.addColorStop(0.43, `rgba(41, 56, 154, ${dark})`);
          shade.addColorStop(0.72, `rgba(218, 220, 255, ${light * 0.42})`);
          shade.addColorStop(1, "rgba(239, 241, 255, 0.10)");
        }
        context.fillStyle = shade;
        context.fill();
      }

      for (let i = 0; i <= length; i++) {
        trace(grid[i]);
        const strength = Math.sin((i / length) * Math.PI);
        const major = i % 6 === 0;
        context.strokeStyle = surface === "base"
          ? `rgba(72, 97, 198, ${0.13 + strength * (major ? 0.25 : 0.12)})`
          : `rgba(42, 67, 166, ${0.16 + strength * (major ? 0.40 : 0.20)})`;
        context.lineWidth = major ? 0.9 : 0.55;
        context.stroke();
      }

      for (let j = 0; j <= breadth; j++) {
        trace(grid.map((row) => row[j]));
        const major = j % 5 === 0;
        context.strokeStyle = surface === "base"
          ? `rgba(87, 101, 196, ${major ? 0.32 : 0.16})`
          : `rgba(232, 237, 255, ${major ? 0.64 : 0.30})`;
        context.lineWidth = major ? 0.8 : 0.5;
        context.stroke();
      }

      if (surface === "base") return;

      // A handful of moving points make the direction of the surface readable.
      const lanes = surface === "right" ? [-0.65, 0.12, 0.64] : [-0.35, 0.55];
      lanes.forEach((lane, index) => {
        const t = ((index * 0.283 + (surface === "left" ? 0.22 : 0.04) + phase * 0.022) % 0.82) + 0.08;
        const p = point(surface, t, lane, phase);
        const trail: Point[] = [];
        for (let step = 0; step <= 20; step++) {
          trail.push(point(surface, Math.max(0, t - 0.09 + step * 0.0045), lane, phase));
        }
        trace(trail);
        const trailColor = context.createLinearGradient(trail[0].x, trail[0].y, p.x, p.y);
        trailColor.addColorStop(0, "rgba(69, 101, 213, 0)");
        trailColor.addColorStop(1, "rgba(238, 244, 255, 0.88)");
        context.strokeStyle = trailColor;
        context.lineWidth = 1.65;
        context.stroke();

        const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
        glow.addColorStop(0, "rgba(230, 240, 255, 0.72)");
        glow.addColorStop(0.3, "rgba(162, 188, 255, 0.28)");
        glow.addColorStop(1, "rgba(104, 131, 240, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(p.x, p.y, 18, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#fbfcff";
        context.beginPath();
        context.arc(p.x, p.y, 3, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "rgba(67, 101, 212, 0.8)";
        context.beginPath();
        context.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        context.fill();
      });
    };

    const paint = () => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);
      drawSurface("base", elapsed);
      drawSurface("left", elapsed);
      drawSurface("right", elapsed);
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed || pausedRef.current || !inView || document.hidden || reducedMotion.matches) return;
      if (now - lastPaint >= 1000 / 30) {
        // Resuming a background tab never advances the scene by a large jump.
        elapsed += lastTick ? Math.min((now - lastTick) / 1000, 0.06) : 0;
        lastTick = now;
        lastPaint = now;
        easedX += (pointerX - easedX) * 0.045;
        easedY += (pointerY - easedY) * 0.045;
        paint();
      }
      frame = window.requestAnimationFrame(tick);
    };

    const syncPlayback = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      lastTick = 0;
      if (disposed) return;
      if (reducedMotion.matches) {
        elapsed = 0;
        easedX = 0;
        easedY = 0;
        paint();
      } else if (!pausedRef.current && inView && !document.hidden) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    syncPlaybackRef.current = syncPlayback;

    const resize = () => {
      const rect = scene.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.65);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || pausedRef.current || reducedMotion.matches || !inView) return;
      const rect = scene.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    };
    const onPointerLeave = () => { pointerX = 0; pointerY = 0; };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(scene);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { rootMargin: "60px" });
    intersectionObserver.observe(scene);
    const pointerSurface = scene.parentElement;
    pointerSurface?.addEventListener("pointermove", onPointerMove, { passive: true });
    pointerSurface?.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    resize();
    syncPlayback();

    return () => {
      disposed = true;
      syncPlaybackRef.current = null;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      pointerSurface?.removeEventListener("pointermove", onPointerMove);
      pointerSurface?.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    syncPlaybackRef.current?.();
  }, [paused]);

  return <div ref={sceneRef} className="knowledge-landscape" aria-hidden="true">
    <div className="knowledge-landscape-light knowledge-landscape-light-left" />
    <div className="knowledge-landscape-light knowledge-landscape-light-right" />
    <canvas ref={canvasRef} className="knowledge-landscape-canvas" />
  </div>;
}
