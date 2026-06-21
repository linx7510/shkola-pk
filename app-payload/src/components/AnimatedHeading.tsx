"use client"

import { useEffect, useRef, ReactNode, CSSProperties } from 'react';

interface AnimatedHeadingProps {
  as?: 'h1' | 'h2' | 'h3';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Animated heading with smooth scroll-triggered appearance.
 * Uses IntersectionObserver to trigger animation when visible.
 */
export default function AnimatedHeading({
  as: Tag = 'h2',
  children,
  className = '',
  style,
}: AnimatedHeadingProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Initial state: invisible
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className} style={style}>
      {children}
    </Tag>
  );
}
