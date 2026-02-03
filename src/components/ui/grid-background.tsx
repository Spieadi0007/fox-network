"use client";

import { useEffect, useRef, useCallback } from "react";

interface Pulse {
  x: number;
  y: number;
  dx: number;
  dy: number;
  progress: number;
  speed: number;
  length: number;
}

export function GridBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulsesRef = useRef<Pulse[]>([]);
  const animRef = useRef<number>(0);
  const gridSize = 48;

  const spawnPulse = useCallback((width: number, height: number): Pulse => {
    const horizontal = Math.random() > 0.5;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);

    if (horizontal) {
      const row = Math.floor(Math.random() * rows) * gridSize;
      const goRight = Math.random() > 0.5;
      return {
        x: goRight ? -gridSize : width + gridSize,
        y: row,
        dx: goRight ? 1 : -1,
        dy: 0,
        progress: 0,
        speed: 0.6 + Math.random() * 0.8,
        length: 3 + Math.floor(Math.random() * 5),
      };
    } else {
      const col = Math.floor(Math.random() * cols) * gridSize;
      const goDown = Math.random() > 0.5;
      return {
        x: col,
        y: goDown ? -gridSize : height + gridSize,
        dx: 0,
        dy: goDown ? 1 : -1,
        progress: 0,
        speed: 0.6 + Math.random() * 0.8,
        length: 3 + Math.floor(Math.random() * 5),
      };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      width = parent.offsetWidth;
      height = parent.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Seed initial pulses
    pulsesRef.current = Array.from({ length: 8 }, () => {
      const p = spawnPulse(width, height);
      p.progress = Math.random() * width; // start mid-travel
      return p;
    });

    const maxPulses = 12;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw static grid
      ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw intersection dots
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update & draw pulses
      const pulses = pulsesRef.current;

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;
        const headX = p.x + p.dx * p.progress;
        const headY = p.y + p.dy * p.progress;

        // Remove if fully off-screen
        if (
          headX < -gridSize * p.length && p.dx < 0 ||
          headX > width + gridSize * p.length && p.dx > 0 ||
          headY < -gridSize * p.length && p.dy < 0 ||
          headY > height + gridSize * p.length && p.dy > 0
        ) {
          pulses.splice(i, 1);
          continue;
        }

        // Draw the pulse trail — segments along the grid line
        for (let s = 0; s < p.length; s++) {
          const segOffset = s * gridSize;
          const sx = headX - p.dx * segOffset;
          const sy = headY - p.dy * segOffset;

          // Fade out toward the tail
          const alpha = (1 - s / p.length) * 0.5;

          // Glow
          ctx.shadowColor = `rgba(59, 130, 246, ${alpha * 0.8})`;
          ctx.shadowBlur = 8;

          // Segment line
          const segEnd = gridSize * 0.8;
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + p.dx * segEnd, sy + p.dy * segEnd);
          ctx.stroke();

          // Bright node at segment start
          ctx.shadowBlur = 12;
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 1.2})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bright head node
        ctx.shadowColor = "rgba(59, 130, 246, 0.9)";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "rgba(59, 130, 246, 0.7)";
        ctx.beginPath();
        ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      }

      // Spawn new pulses
      if (pulses.length < maxPulses && Math.random() < 0.02) {
        pulses.push(spawnPulse(width, height));
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [spawnPulse]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
