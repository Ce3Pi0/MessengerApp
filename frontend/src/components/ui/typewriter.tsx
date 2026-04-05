"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export interface TypewriterProps {
  text: string;
  delay?: number;
  duration?: number;
}

export function Typewriter({ text, delay = 0, duration = 2 }: TypewriterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    const controls = animate(count, text.length, {
      type: "tween",
      duration: duration,
      ease: "linear",
      delay: delay,
    });
    return controls.stop;
  }, [text, count, duration, delay]);

  return <motion.span>{displayText}</motion.span>;
}
