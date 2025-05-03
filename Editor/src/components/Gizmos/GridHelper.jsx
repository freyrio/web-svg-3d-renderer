import React, { useEffect, useState, useCallback } from 'react';

/**
 * GridHelper component that renders a 3D floor grid on the XZ plane
 * Similar to the standard grid in Blender, Unity, and other 3D editors
 */
const GridHelper = ({ 
  camera, 
  size = 1000, 
  divisions = 20, 
  primaryColor = '#666666',
  secondaryColor = '#444444',
  opacity = 0.6
}) => {
  // State to store grid elements
  const [gridElements, setGridElements] = useState([]);
  
  // Memoize the grid generation function to avoid recreating it on each render
  const generateGrid = useCallback(() => {
    if (!camera) return [];
    
    const elements = [];
    const gridSpacing = size / divisions;
    const halfSize = size / 2;
    
    // Create a grid line
    const createGridLine = (x1, z1, x2, z2, isPrimary = false) => {
      // Use Y=0 for the floor plane
      const start = camera.projectVertex({ x: x1, y: 0, z: z1 });
      const end = camera.projectVertex({ x: x2, y: 0, z: z2 });
      
      // Skip if any point is behind the camera or not visible
      if (!start.visible || !end.visible) return null;
      
      return {
        key: `${x1},${z1}-${x2},${z2}`,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        isPrimary,
        depth: (start.z + end.z) / 2 // Average depth for sorting
      };
    };
    
    // Primary axes
    const primaryAxes = [
      createGridLine(-halfSize, 0, halfSize, 0, true),  // X axis
      createGridLine(0, -halfSize, 0, halfSize, true)   // Z axis
    ].filter(line => line !== null);
    
    // Add all grid lines within the boundaries
    for (let i = -divisions; i <= divisions; i++) {
      // Skip the center lines (0) as they're already added as primary axes
      if (i === 0) continue;
      
      const pos = i * gridSpacing;
      
      // Only add lines that are within the grid boundaries
      if (pos >= -halfSize && pos <= halfSize) {
        // Line parallel to Z axis
        const xLine = createGridLine(pos, -halfSize, pos, halfSize, false);
        if (xLine) elements.push(xLine);
        
        // Line parallel to X axis
        const zLine = createGridLine(-halfSize, pos, halfSize, pos, false);
        if (zLine) elements.push(zLine);
      }
    }
    
    // Add primary axes after other lines so they appear on top
    elements.push(...primaryAxes);
    
    // Sort lines by depth so farther lines are rendered first
    return elements.sort((a, b) => b.depth - a.depth);
  }, [camera, size, divisions]);
  
  // Generate grid when camera changes
  useEffect(() => {
    if (!camera) return;
    
    // Update grid elements
    setGridElements(generateGrid());
    
    // Set up a camera movement callback to update the grid
    const handleCameraMove = () => {
      setGridElements(generateGrid());
    };
    
    // Clean up the event listener if needed
    return () => {
      // Any cleanup if needed
    };
  }, [camera, generateGrid, camera?.position?.x, camera?.position?.y, camera?.position?.z, 
      camera?.rotation?.x, camera?.rotation?.y, camera?.rotation?.z]);
  
  // Don't render if no grid elements or camera
  if (!camera || gridElements.length === 0) return null;
  
  return (
    <g className="grid-helper">
      {/* Render the grid lines */}
      {gridElements.map(line => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.isPrimary ? primaryColor : secondaryColor}
          strokeWidth={line.isPrimary ? 1.2 : 0.6}
          opacity={opacity * (1 - (line.depth / 3000))} // Fade with distance
          style={{ pointerEvents: 'none' }}
        />
      ))}
    </g>
  );
};

export default GridHelper; 