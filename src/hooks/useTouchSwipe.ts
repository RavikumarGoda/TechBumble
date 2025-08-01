
import { useState, useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
}

interface TouchPosition {
  x: number;
  y: number;
}

export const useTouchSwipe = (handlers: SwipeHandlers) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startPos = useRef<TouchPosition>({ x: 0, y: 0 });
  const currentPos = useRef<TouchPosition>({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    startPos.current = { x: clientX, y: clientY };
    currentPos.current = { x: clientX, y: clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    currentPos.current = { x: clientX, y: clientY };
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const deltaX = currentPos.current.x - startPos.current.x;
    const deltaY = currentPos.current.y - startPos.current.y;
    
    const threshold = 100;
    
    // Check for vertical swipe first (up)
    if (deltaY < -threshold && Math.abs(deltaX) < threshold) {
      handlers.onSwipeUp();
    }
    // Then check horizontal swipes
    else if (Math.abs(deltaX) > threshold && Math.abs(deltaY) < threshold) {
      if (deltaX > 0) {
        handlers.onSwipeRight();
      } else {
        handlers.onSwipeLeft();
      }
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, handlers]);

  return {
    isDragging,
    dragOffset,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
