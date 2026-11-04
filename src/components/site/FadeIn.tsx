"use client";

import { useEffect, useRef, useState } from "react";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  /** השהיה במילישניות, לרצף עדין של כמה פריטים */
  delay?: number;
};

/**
 * הופעה עדינה בגלילה. מי שביקש להפחית תנועה (prefers-reduced-motion)
 * רואה את התוכן מיד, בלי מעבר.
 */
export function FadeIn({ children, className = "", delay = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`motion-safe:transition-[opacity,translate] motion-safe:duration-1000 motion-safe:ease-out ${
        visible ? "" : "motion-safe:translate-y-4 motion-safe:opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
