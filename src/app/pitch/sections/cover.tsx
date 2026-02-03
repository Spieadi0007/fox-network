"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { usePitchColors } from "@/app/pitch/pitch-theme";

/* ── Marker locations [lat, lng] ── */
const markers: { location: [number, number]; size: number }[] = [
  { location: [40.7, -74.0], size: 0.08 },    // 0  New York
  { location: [51.5, -0.1], size: 0.08 },      // 1  London
  { location: [25.2, 55.3], size: 0.07 },      // 2  Dubai
  { location: [19.1, 72.9], size: 0.06 },      // 3  Mumbai
  { location: [35.7, 139.7], size: 0.06 },     // 4  Tokyo
  { location: [-23.5, -46.6], size: 0.06 },    // 5  São Paulo
  { location: [6.5, 3.4], size: 0.05 },        // 6  Lagos
  { location: [-33.9, 151.2], size: 0.05 },    // 7  Sydney
  { location: [55.8, 37.6], size: 0.05 },      // 8  Moscow
  { location: [1.3, 103.8], size: 0.06 },      // 9  Singapore
  { location: [48.9, 2.35], size: 0.05 },      // 10 Paris
  { location: [-1.3, 36.8], size: 0.05 },      // 11 Nairobi
  { location: [39.9, 116.4], size: 0.06 },     // 12 Beijing
  { location: [34.1, -118.2], size: 0.06 },    // 13 Los Angeles
];

/* ── Network routes (pairs of marker indices) ── */
const routes: [number, number][] = [
  [0, 1],   // NY ↔ London
  [1, 2],   // London ↔ Dubai
  [2, 3],   // Dubai ↔ Mumbai
  [3, 9],   // Mumbai ↔ Singapore
  [9, 4],   // Singapore ↔ Tokyo
  [4, 12],  // Tokyo ↔ Beijing
  [1, 10],  // London ↔ Paris
  [10, 8],  // Paris ↔ Moscow
  [0, 5],   // NY ↔ São Paulo
  [1, 6],   // London ↔ Lagos
  [6, 11],  // Lagos ↔ Nairobi
  [11, 2],  // Nairobi ↔ Dubai
  [9, 7],   // Singapore ↔ Sydney
  [0, 13],  // NY ↔ LA
  [13, 4],  // LA ↔ Tokyo
  [8, 12],  // Moscow ↔ Beijing
  [3, 7],   // Mumbai ↔ Sydney
  [5, 6],   // São Paulo ↔ Lagos
];

/* ── Project lat/lng to 2D given globe rotation ── */
function project(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  size: number,
): { x: number; y: number; z: number } {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  // 3D point on unit sphere
  const x0 = Math.cos(latR) * Math.sin(lngR);
  const y0 = -Math.sin(latR);
  const z0 = Math.cos(latR) * Math.cos(lngR);

  // Rotate around Y axis (phi) — negate to match cobe's convention
  const x1 = x0 * Math.cos(-phi) - z0 * Math.sin(-phi);
  const z1 = x0 * Math.sin(-phi) + z0 * Math.cos(-phi);

  // Rotate around X axis (theta) — negate to match cobe's convention
  const y2 = y0 * Math.cos(-theta) - z1 * Math.sin(-theta);
  const z2 = y0 * Math.sin(-theta) + z1 * Math.cos(-theta);

  const half = size / 2;
  return {
    x: half + x1 * half * 0.95,
    y: half + y2 * half * 0.95,
    z: z2,
  };
}

/* ── Interpolate a great-circle arc point ── */
function arcPoint(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  t: number,
): [number, number] {
  const toRad = Math.PI / 180;
  const la1 = lat1 * toRad, lo1 = lng1 * toRad;
  const la2 = lat2 * toRad, lo2 = lng2 * toRad;

  const d = Math.acos(
    Math.sin(la1) * Math.sin(la2) +
    Math.cos(la1) * Math.cos(la2) * Math.cos(lo2 - lo1)
  );

  if (d < 0.001) return [lat1, lng1];

  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);

  const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2);
  const y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2);
  const z = A * Math.sin(la1) + B * Math.sin(la2);

  return [Math.atan2(z, Math.sqrt(x * x + y * y)) / toRad, Math.atan2(y, x) / toRad];
}

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const phi = useRef(0.3);
  const globeTheta = 0.15;
  const colors = usePitchColors();

  const drawOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    const size = overlay.offsetWidth;
    const dpr = window.devicePixelRatio || 1;
    overlay.width = size * dpr;
    overlay.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const time = performance.now() / 1000;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      const currentPhi = phi.current;

      for (let ri = 0; ri < routes.length; ri++) {
        const [ai, bi] = routes[ri];
        const [lat1, lng1] = markers[ai].location;
        const [lat2, lng2] = markers[bi].location;

        const pA = project(lat1, lng1, currentPhi, globeTheta, size);
        const pB = project(lat2, lng2, currentPhi, globeTheta, size);

        // Skip if both endpoints are fully on the back of the globe
        if (pA.z < -0.5 && pB.z < -0.5) continue;

        // Build arc points
        const steps = 40;
        const points: { x: number; y: number; z: number }[] = [];
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const [lat, lng] = arcPoint(lat1, lng1, lat2, lng2, t);
          points.push(project(lat, lng, currentPhi, globeTheta, size));
        }

        // Draw arc segments (only visible parts)
        ctx.beginPath();
        let moved = false;
        for (let s = 0; s < points.length; s++) {
          const p = points[s];
          // Fade based on z (front vs back)
          if (p.z < -0.3) {
            moved = false;
            continue;
          }
          if (!moved) {
            ctx.moveTo(p.x, p.y);
            moved = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        const avgZ = (pA.z + pB.z) / 2;
        const baseAlpha = Math.max(0, Math.min(1, avgZ + 0.6)) * 0.5;
        ctx.strokeStyle = `rgba(59, 130, 246, ${baseAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Traveling pulse along the arc
        const speed = 0.15 + (ri % 5) * 0.03;
        const offset = ri * 1.7;
        const pulseT = ((time * speed + offset) % 1.6) - 0.1;

        if (pulseT >= 0 && pulseT <= 1) {
          const [plat, plng] = arcPoint(lat1, lng1, lat2, lng2, pulseT);
          const pp = project(plat, plng, currentPhi, globeTheta, size);

          if (pp.z > -0.3) {
            const pulseAlpha = Math.max(0, pp.z + 0.5) * 0.9;

            // Glow
            ctx.beginPath();
            ctx.arc(pp.x, pp.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${pulseAlpha * 0.15})`;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(pp.x, pp.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 170, 255, ${pulseAlpha})`;
            ctx.fill();

            // Trail (3 fading dots behind)
            for (let tr = 1; tr <= 3; tr++) {
              const trailT = pulseT - tr * 0.03;
              if (trailT < 0 || trailT > 1) continue;
              const [tlat, tlng] = arcPoint(lat1, lng1, lat2, lng2, trailT);
              const tp = project(tlat, tlng, currentPhi, globeTheta, size);
              if (tp.z > -0.3) {
                ctx.beginPath();
                ctx.arc(tp.x, tp.y, 1.5 - tr * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${pulseAlpha * (0.6 - tr * 0.15)})`;
                ctx.fill();
              }
            }
          }
        }

        // Second pulse going the other direction (staggered)
        const pulseT2 = ((time * speed * 0.7 + offset + 0.8) % 1.8) - 0.1;
        if (pulseT2 >= 0 && pulseT2 <= 1) {
          const [plat2, plng2] = arcPoint(lat2, lng2, lat1, lng1, pulseT2);
          const pp2 = project(plat2, plng2, currentPhi, globeTheta, size);

          if (pp2.z > -0.3) {
            const pulseAlpha2 = Math.max(0, pp2.z + 0.5) * 0.7;

            ctx.beginPath();
            ctx.arc(pp2.x, pp2.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${pulseAlpha2 * 0.1})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pp2.x, pp2.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(140, 190, 255, ${pulseAlpha2})`;
            ctx.fill();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0.3,
      theta: globeTheta,
      dark: colors.globeDark,
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: colors.globeBrightness,
      baseColor: colors.globeBase,
      markerColor: [0.23, 0.51, 0.96],
      glowColor: colors.globeGlow,
      markers,
      onRender: (state) => {
        state.phi = phi.current;
        phi.current += 0.003;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    // Start overlay drawing
    drawOverlay();

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [drawOverlay, colors.globeDark, colors.globeBase, colors.globeGlow, colors.globeBrightness]);

  return (
    <div className="relative aspect-square w-full">
      {/* Outer ring */}
      <div className="absolute inset-[-4%] rounded-full border border-white/[0.06]" />
      <div className="absolute inset-[-2%] rounded-full border border-white/[0.04] border-dashed" />

      {/* HUD labels */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[5%] top-[12%] font-mono text-[9px] tracking-widest text-blue-400/40">
          CENTRAL OPS
        </span>
        <span className="absolute right-[2%] top-[18%] font-mono text-[9px] tracking-widest text-blue-400/40">
          APAC GRID
        </span>
        <span className="absolute bottom-[20%] right-[0%] font-mono text-[9px] tracking-widest text-blue-400/40">
          DATA SYNC: ACTIVE
        </span>
        <span className="absolute bottom-[30%] left-[2%] font-mono text-[9px] tracking-widest text-blue-400/40">
          LATAM REGION
        </span>
        <span className="absolute left-[38%] top-[5%] font-mono text-[9px] tracking-widest text-blue-400/40">
          EMEA NORTH
        </span>

        {/* Corner brackets */}
        <svg className="absolute left-[3%] top-[8%] h-4 w-4" viewBox="0 0 16 16">
          <path d="M0 5 L0 0 L5 0" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>
        <svg className="absolute right-[3%] top-[8%] h-4 w-4" viewBox="0 0 16 16">
          <path d="M16 5 L16 0 L11 0" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>
        <svg className="absolute bottom-[8%] left-[3%] h-4 w-4" viewBox="0 0 16 16">
          <path d="M0 11 L0 16 L5 16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>
        <svg className="absolute bottom-[8%] right-[3%] h-4 w-4" viewBox="0 0 16 16">
          <path d="M16 11 L16 16 L11 16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>

        {/* Tick marks */}
        <span className="absolute right-[1%] top-[10%] font-mono text-[7px] text-white/20">///</span>
        <span className="absolute bottom-[10%] left-[1%] font-mono text-[7px] text-white/20">///</span>
      </div>

      {/* Rotating arc overlay */}
      <svg className="absolute inset-[-3%] animate-[spin_30s_linear_infinite]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1.5" strokeDasharray="30 570" strokeLinecap="round" />
      </svg>
      <svg className="absolute inset-[-3%] animate-[spin_45s_linear_infinite_reverse]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="1" strokeDasharray="15 585" strokeLinecap="round" />
      </svg>

      {/* Globe canvas */}
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ contain: "layout paint size", opacity: 0, transition: "opacity 1s ease" }}
      />

      {/* Network arcs overlay canvas */}
      <canvas
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0, transition: "opacity 1.5s ease 0.5s" }}
      />

      {/* Fade-in both canvases */}
      <FadeInCanvases canvasRef={canvasRef} overlayRef={overlayRef} />
    </div>
  );
}

function FadeInCanvases({
  canvasRef,
  overlayRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  overlayRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
      if (overlayRef.current) overlayRef.current.style.opacity = "1";
    }, 300);
    return () => clearTimeout(timer);
  }, [canvasRef, overlayRef]);
  return null;
}

export function Cover() {
  const colors = usePitchColors();
  return (
    <section className="relative flex min-h-full items-center overflow-hidden">
      {/* Grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            `linear-gradient(${colors.gridLineBold} 1px, transparent 1px), linear-gradient(90deg, ${colors.gridLineBold} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Subtle glow behind globe */}
      <div className="pointer-events-none absolute right-[-5%] top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-fox-orange/[0.04] blur-[100px]" />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="grid min-h-[70vh] items-center gap-4 lg:grid-cols-[1fr_1.1fr]">
          {/* ── LEFT: Text content ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            {/* Logo with bracket style */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2.5 rounded border border-[var(--p-border-2)] px-3.5 py-2"
            >
              <span className="font-[family-name:var(--font-heading)] text-[15px] font-bold tracking-[-0.02em]">
                <span className="text-white">Fox</span>
                <span className="text-fox-orange">Network</span>
              </span>
              <div className="ml-1 h-2 w-2 rounded-full border border-fox-orange/50 bg-fox-orange/20" />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mt-10 font-[family-name:var(--font-heading)] text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.04em]"
            >
              The Operating
              <br />
              System for Physical
              <br />
              Infrastructure.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-md text-lg leading-[1.6] text-[var(--p-text-muted)]"
            >
              From fragmented field execution to
              <br />
              a globally orchestrated digital grid.
            </motion.p>

          </motion.div>

          {/* ── RIGHT: Globe ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <Globe />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
