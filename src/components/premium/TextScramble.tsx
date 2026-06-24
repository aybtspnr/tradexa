"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

interface TextScrambleProps {
  text: string;
  className?: string;
  duration?: number;
  trigger?: "mount" | "inview" | "hover";
  tag?: "h1" | "h2" | "h3" | "span" | "p";
}

export function TextScramble({
  text,
  className = "",
  duration = 1200,
  trigger = "inview",
  tag: Tag = "span",
}: TextScrambleProps) {
  const [display, setDisplay] = useState(text);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const frameRef = useRef<number>(0);

  const scramble = useCallback(() => {
    if (hasAnimated && trigger !== "hover") return;
    setHasAnimated(true);

    const steps = 20;
    const stepTime = duration / steps;
    let step = 0;

    const run = () => {
      const progress = step / steps;
      const revealed = Math.floor(progress * text.length);

      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          result += " ";
        } else if (i < revealed) {
          result += text[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(result);

      step++;
      if (step <= steps) {
        frameRef.current = window.setTimeout(run, stepTime);
      } else {
        setDisplay(text);
      }
    };

    run();
  }, [text, duration, trigger, hasAnimated]);

  // InView trigger
  useEffect(() => {
    if (trigger !== "inview" || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scramble();
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger, scramble]);

  // Mount trigger
  useEffect(() => {
    if (trigger === "mount") {
      scramble();
    }
    return () => {
      if (frameRef.current) clearTimeout(frameRef.current);
    };
  }, [trigger, scramble]);

  const handlers =
    trigger === "hover"
      ? { onMouseEnter: scramble }
      : {};

  return (
    <Tag
      ref={ref as any}
      className={`inline-block ${className}`}
      {...handlers}
    >
      {display}
    </Tag>
  );
}
