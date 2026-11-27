import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import useCompactLayout from "../hooks/useCompactLayout";
import "./DecryptedText.css";

function hasGlyph(character) {
  return /\S/.test(character);
}

function revealOrder(letters, direction) {
  const indices = letters.map((_, index) => index).filter((index) => hasGlyph(letters[index]));
  if (direction === "end") return indices.reverse();
  if (direction !== "center") return indices;
  const center = Math.floor(letters.length / 2);
  return indices.sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || b - a);
}

export default function DecryptedText({
  text,
  speed = 40,
  maxIterations = 12,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%+=",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  revealDelay = 0,
  revealKey,
  ...props
}) {
  const compact = useCompactLayout();
  const reducedMotion = useReducedMotion();
  const letters = useMemo(() => Array.from(text), [text]);
  const [frame, setFrame] = useState(null);
  const container = useRef(null);
  const stopAnimation = useRef(null);
  const lastViewedText = useRef(null);

  const stop = useCallback(() => {
    stopAnimation.current?.();
    stopAnimation.current = null;
  }, []);

  const play = useCallback((delay = 0) => {
    stop();
    if (reducedMotion || !letters.some(hasGlyph)) return;

    let timer = window.setTimeout(() => {
      if (compact) {
        animation = container.current?.animate?.(
          [{ opacity: .55 }, { opacity: 1 }],
          { duration: 220, easing: "ease-out" }
        );
        return;
      }

      const alphabet = Array.from(useOriginalCharsOnly ? new Set(letters) : characters).filter(hasGlyph);
      if (!alphabet.length) return;
      const order = revealOrder(letters, revealDirection);
      const revealed = new Set();
      const steps = sequential ? order.length : maxIterations;
      let step = 0;

      function draw() {
        if (step >= steps) {
          setFrame(null);
          return;
        }
        setFrame({
          text,
          glyphs: letters.map((letter, index) => hasGlyph(letter) && !revealed.has(index)
            ? alphabet[Math.floor(Math.random() * alphabet.length)]
            : null),
        });
        revealed.add(order[step]);
        step += 1;
        timer = window.setTimeout(draw, speed);
      }

      draw();
    }, delay);
    let animation;

    stopAnimation.current = () => {
      window.clearTimeout(timer);
      animation?.cancel();
    };
  }, [characters, compact, letters, maxIterations, reducedMotion, revealDirection, sequential, speed, stop, text, useOriginalCharsOnly]);

  useEffect(() => stop, [play, stop]);

  useEffect(() => {
    if (!revealKey || reducedMotion) return;
    play(revealDelay);
  }, [play, revealDelay, revealKey, reducedMotion]);

  useEffect(() => {
    if (revealKey || reducedMotion || (animateOn !== "view" && animateOn !== "both")) return;

    const element = container.current;
    const panel = element.closest(".scroll-deck__panel");
    let checkFrame;

    function trigger() {
      const phase = document.documentElement.dataset.phase;
      if ((phase && phase !== "ready") || panel?.getAttribute("aria-hidden") === "true") return;
      if (lastViewedText.current === text) return;
      lastViewedText.current = text;
      play(revealDelay + (panel ? 180 : 0));
    }

    function checkVisibility() {
      const rect = element.getBoundingClientRect();
      const viewport = panel?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight };
      if (rect.bottom > viewport.top && rect.top < viewport.bottom) trigger();
    }

    function scheduleCheck() {
      cancelAnimationFrame(checkFrame);
      checkFrame = requestAnimationFrame(checkVisibility);
    }

    const observer = typeof IntersectionObserver !== "undefined" && new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) trigger(); },
      { root: panel, threshold: .2 }
    );
    observer?.observe?.(element);
    const phaseObserver = new MutationObserver(scheduleCheck);
    phaseObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-phase"] });
    window.addEventListener("deck:active", scheduleCheck);
    window.addEventListener("deck:state", scheduleCheck);
    window.addEventListener("resize", scheduleCheck);
    scheduleCheck();

    return () => {
      cancelAnimationFrame(checkFrame);
      observer?.disconnect?.();
      phaseObserver.disconnect();
      window.removeEventListener("deck:active", scheduleCheck);
      window.removeEventListener("deck:state", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
    };
  }, [animateOn, play, reducedMotion, revealDelay, revealKey, text]);

  const glyphs = !compact && !reducedMotion && frame?.text === text ? frame.glyphs : null;
  const hover = !compact && !reducedMotion && ["hover", "both"].includes(animateOn);
  let offset = 0;

  return (
    <span
      className={`decrypted-text ${parentClassName}`}
      ref={container}
      onMouseEnter={hover ? () => play() : undefined}
      onMouseLeave={hover ? () => { stop(); setFrame(null); } : undefined}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(/(\s+|(?<=-)(?=\S))/u).map((word) => {
          if (!word) return null;
          const start = offset;
          const wordLetters = Array.from(word);
          offset += wordLetters.length;
          if (!hasGlyph(word)) return <Fragment key={start}>{word}</Fragment>;

          return (
            <Fragment key={start}>
              <span className="decrypted-text__word">
                {wordLetters.map((letter, index) => {
                  const glyph = glyphs?.[start + index];
                  return (
                    <span className="decrypted-text__slot" key={index} data-decoding={glyph ? "" : undefined}>
                      <span className={className}>{letter}</span>
                      {glyph && <span className={`decrypted-text__cipher ${encryptedClassName}`}>{glyph}</span>}
                    </span>
                  );
                })}
              </span>
              {word.endsWith("-") && <wbr />}
            </Fragment>
          );
        })}
      </span>
    </span>
  );
}
