"use client";

import ScrollReveal from "./ui/ScrollReveal";
import { useEffect, useRef, useState } from "react";

function Counter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const num = parseInt(value.replace(/[^0-9.]/g, ""));
  const isNum = !isNaN(num);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !isNum) return;
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * num));
      if (current >= steps) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [visible, num, isNum]);

  return (
    <span ref={ref}>
      {isNum ? `${count}${suffix}` : value}
    </span>
  );
}

const stats = [
  { value: "97%", label: "of irrelevant applications filtered", sub: "before a human ever sees them" },
  { value: "5x", label: "faster time-to-match", sub: "vs traditional screening pipelines" },
  { value: "200+", label: "applications reduced to 3\u20135", sub: "genuine, verified matches per candidate" },
  { value: "0", label: "ghosted outcomes", sub: "every exit has a clear, transparent reason" },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-subtle py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.02] via-transparent to-accent-gradient/[0.02]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1} y={10}>
              <div className="text-center group">
                <p className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl transition-transform duration-300 group-hover:scale-105">
                  <Counter value={stat.value} />
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
                <p className="mt-0.5 text-xs text-muted">{stat.sub}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
