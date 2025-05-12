'use client';

import { useState, useRef } from 'react';

interface UseSwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useSwipe({ threshold = 50, onSwipeLeft, onSwipeRight }: UseSwipeOptions = {}) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const touchMoved = useRef(false);

  const handleTouchStart = (e: React.TouchEvent | TouchEvent) => {
    touchMoved.current = false;
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    touchMoved.current = true;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !touchMoved.current) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe) {
      onSwipeLeft?.();
    }

    if (isRightSwipe) {
      onSwipeRight?.();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}