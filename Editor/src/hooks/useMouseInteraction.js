import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to handle mouse drag and wheel events on a target element for camera control.
 * @param {React.RefObject<Element>} targetRef - Ref to the element to attach listeners (e.g., the SVG viewport).
 * @param {function} adjustRotation - Function to call with (deltaX, deltaY) on drag.
 * @param {function} adjustDistance - Function to call with (deltaY) on wheel scroll.
 */
export function useMouseInteraction(targetRef, adjustRotation, adjustDistance) {
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  // --- Event Handlers --- 

  const handleMouseDown = useCallback((event) => {
    // Check if the target element exists
    if (!targetRef.current) return;
    // Prevent default drag behavior if needed
    // event.preventDefault(); 
    isDragging.current = true;
    lastPosition.current = { x: event.clientX, y: event.clientY };
    // Add listeners to the document for mousemove and mouseup to capture events outside the target
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [targetRef]); // No adjustRotation/adjustDistance needed here

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      // Remove document listeners when dragging stops
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, []); // No dependencies needed

  const handleMouseMove = useCallback((event) => {
    if (!isDragging.current) return;

    const deltaX = event.clientX - lastPosition.current.x;
    const deltaY = event.clientY - lastPosition.current.y;

    // Update last position
    lastPosition.current = { x: event.clientX, y: event.clientY };

    // Adjust camera rotation using the callback
    adjustRotation(deltaX, deltaY);
  }, [adjustRotation]); // Depends on adjustRotation callback

  const handleWheel = useCallback((event) => {
     // Check if the target element exists
    if (!targetRef.current) return;
    // Prevent default page scroll
    event.preventDefault(); 
    // Adjust camera distance using the callback
    adjustDistance(event.deltaY);
  }, [targetRef, adjustDistance]); // Depends on adjustDistance callback

  // --- Effect to Attach/Detach Listeners --- 

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return; // Don't attach if the element isn't rendered yet

    // Attach mousedown listener to the target element
    element.addEventListener('mousedown', handleMouseDown);
    // Attach wheel listener to the target element
    // Use passive: false for wheel event to allow preventDefault
    element.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup function: remove listeners when the component unmounts or dependencies change
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('wheel', handleWheel);
      // Important: Also remove document listeners if component unmounts while dragging
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [targetRef, handleMouseDown, handleMouseUp, handleMouseMove, handleWheel]); // Include handlers in dependencies

  // This hook doesn't return anything; it just sets up side effects.
} 