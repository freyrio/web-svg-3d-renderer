import { useState, useRef, useCallback, useEffect } from 'react';
// Import from the SVG3D library instead of directly accessing internal files
import { normalizeAngle } from 'svg3d-lib';

export function useAnimation(setRotationY) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [fps, setFps] = useState(0);

  // Refs to manage animation loop state without causing re-renders on every frame
  const animationFrameId = useRef(null);
  const lastFrameTime = useRef(performance.now());
  const isAnimatingRef = useRef(isAnimating); // Ref to track current animation status inside loop
  const rotationSpeed = useRef(0.5); // Degrees per frame
  const currentYRotation = useRef(0); // Track rotation internally

  // Keep the ref in sync with the state
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  const animate = useCallback((timestamp) => {
    // Stop if not animating
    if (!isAnimatingRef.current) {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        return;
    }

    // Calculate FPS
    const deltaTime = timestamp - lastFrameTime.current;
    // Avoid division by zero or infinity on first frame / tab switch
    if (deltaTime > 0) {
        const currentFps = Math.round(1000 / deltaTime);
        setFps(currentFps);
    }
    lastFrameTime.current = timestamp;

    // Calculate rotation amount based on time delta for smoother animation
    // Use a fixed rotation speed but adjust by time
    const rotationAmount = rotationSpeed.current * (deltaTime / 16.67); // 16.67ms is ~60fps

    // Update our internal rotation tracker
    currentYRotation.current = normalizeAngle(currentYRotation.current + rotationAmount);
    
    // DIRECT UPDATE: Call setRotationY with the new value, not a function
    // This ensures we're setting an absolute value, not relying on previous state
    setRotationY(currentYRotation.current);

    // Continue animation loop
    animationFrameId.current = requestAnimationFrame(animate);
  }, [setRotationY]); 

  const toggleAnimation = useCallback(() => {
    setIsAnimating(prev => {
      const nextIsAnimating = !prev;

      if (nextIsAnimating) {
        // Start animation - initialize with current rotation value
        // Get current rotation value from the DOM slider if available
        const rotationYSlider = document.getElementById('rotation-y');
        if (rotationYSlider) {
          currentYRotation.current = parseFloat(rotationYSlider.value);
        }
        
        lastFrameTime.current = performance.now();
        isAnimatingRef.current = true; // Ensure ref is updated immediately
        
        // Cancel any existing animation frame
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        
        // Start a new animation frame
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // Stop animation - the loop will cancel itself via isAnimatingRef
        isAnimatingRef.current = false;
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      }
      return nextIsAnimating;
    });
  }, [animate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, []);

  return {
    isAnimating,
    fps,
    toggleAnimation,
  };
} 