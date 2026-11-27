import { useEffect, useRef } from "react";

const fontSize = 16;
const cellWidth = 10;
const cellHeight = 20;

function mixColor(from, to, progress) {
  return from.map((channel, i) => Math.round(channel + (to[i] - channel) * progress));
}

export default function LetterGlitch({
  className = "",
  enabled = true,
  glitchSpeed = 90,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",
  maxFps = 30,
  transitionMs = 200,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const symbols = Array.from(characters);
    if (!symbols.length) return;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim().split(/\s+/).map(Number);
    const colors = [[43, 69, 57], accent.length === 3 ? accent : [75, 188, 137], [97, 179, 220]];
    const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
    const frameMs = 1000 / Math.max(1, maxFps);
    const dirty = new Set();
    const fading = new Set();
    const clippedGlyphs = new Set();
    let letters = [];
    let drawingWidth = 0;
    let drawingHeight = 0;
    let dpr = 0;
    let frame = null;
    let resizeTimer;
    let lastFrame;
    let lastGlitch;

    function paintLetter(letter) {
      const { x, y, left, top, width, height, char, color } = letter;
      ctx.fillStyle = `rgb(${color.join(",")})`;
      // Bound any overhanging ink so clearing one cell leaves neighboring glyphs intact.
      const clips = clippedGlyphs.has(char);
      if (clips) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, width, height);
        ctx.clip();
      }
      ctx.fillText(char, x, y);
      if (clips) ctx.restore();
    }

    function resize() {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      if (width === drawingWidth && height === drawingHeight && ratio === dpr) return;

      drawingWidth = width;
      drawingHeight = height;
      dpr = ratio;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";

      clippedGlyphs.clear();
      const horizontalSlack = Number.isInteger(cellWidth * dpr) ? 0 : 1 / dpr;
      const verticalSlack = Number.isInteger(cellHeight * dpr) ? 0 : 1 / dpr;
      for (const char of symbols) {
        const bounds = ctx.measureText(char);
        if (bounds.actualBoundingBoxLeft > 0 || bounds.actualBoundingBoxRight > cellWidth - horizontalSlack ||
            bounds.actualBoundingBoxAscent > 0 || bounds.actualBoundingBoxDescent > cellHeight - verticalSlack) {
          clippedGlyphs.add(char);
        }
      }

      const columns = Math.ceil(width / cellWidth);
      const rows = Math.ceil(height / cellHeight);
      const snap = (value) => Math.floor(value * dpr) / dpr;
      fading.clear();
      dirty.clear();
      letters = Array.from({ length: columns * rows }, (_, index) => {
        const x = (index % columns) * cellWidth;
        const y = Math.floor(index / columns) * cellHeight;
        const left = snap(x);
        const top = snap(y);
        return {
          x, y, left, top, width: snap(x + cellWidth) - left, height: snap(y + cellHeight) - top,
          char: randomItem(symbols), color: randomItem(colors), from: null, to: null, progress: 1,
        };
      });
      letters.forEach(paintLetter);
    }

    function animate(now) {
      lastFrame ??= now;
      lastGlitch ??= now;
      const delta = now - lastFrame;

      if (delta >= frameMs) {
        lastFrame = now;
        if (letters.length && now - lastGlitch >= glitchSpeed) {
          lastGlitch = now;
          const count = Math.max(1, Math.floor(letters.length * 0.05));
          for (let n = 0; n < count; n++) {
            const letter = randomItem(letters);
            letter.char = randomItem(symbols);
            const next = randomItem(colors);
            if (smooth) {
              letter.from = letter.color;
              letter.to = next;
              letter.progress = 0;
              fading.add(letter);
            } else {
              letter.color = next;
              dirty.add(letter);
            }
          }
        }

        for (const letter of fading) {
          letter.progress = Math.min(1, letter.progress + delta / Math.max(1, transitionMs));
          letter.color = mixColor(letter.from, letter.to, letter.progress);
          dirty.add(letter);
          if (letter.progress === 1) fading.delete(letter);
        }

        for (const letter of dirty) {
          ctx.clearRect(letter.left, letter.top, letter.width, letter.height);
          paintLetter(letter);
        }
        dirty.clear();
      }

      frame = requestAnimationFrame(animate);
    }

    function start() {
      if (frame !== null || document.hidden) return;
      resize();
      lastFrame = undefined;
      lastGlitch = undefined;
      frame = requestAnimationFrame(animate);
    }

    function stop() {
      if (frame === null) return;
      cancelAnimationFrame(frame);
      frame = null;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!document.hidden) resize();
      }, 120);
    }

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, glitchSpeed, smooth, characters, maxFps, transitionMs]);

  const containerStyle = {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    background: "#000000",
    overflow: "hidden",
    zIndex: 0,
    pointerEvents: "none",
  };

  const canvasStyle = {
    display: "block",
    width: "100%",
    height: "100%",
    opacity: 0.22,
    mixBlendMode: "screen",
  };

  const outerVignetteStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: "radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)",
  };

  const centerVignetteStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
  };

  return (
    <div style={containerStyle} className={className} aria-hidden="true">
      <canvas ref={canvasRef} style={canvasStyle} />
      {outerVignette && <div style={outerVignetteStyle} />}
      {centerVignette && <div style={centerVignetteStyle} />}
    </div>
  );
}
