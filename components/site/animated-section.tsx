'use client';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type AnimationVariant = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right';

interface AnimatedSectionProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

const variantClasses: Record<
  AnimationVariant,
  { initial: string; animate: string }
> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-in': {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
  'slide-left': {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'slide-right': {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
};

/**
 * Animated section component with scroll reveal
 * Uses Intersection Observer via useScrollReveal hook
 */
export function AnimatedSection({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  className,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollReveal({ threshold, triggerOnce: true });
  const { initial, animate } = variantClasses[variant];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        isVisible ? animate : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
