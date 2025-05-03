import React from 'react';

/**
 * Axes Gizmo component that renders X, Y, Z axis in the scene
 * Similar to Blender's axis orientation indicator
 */
const AxesGizmo = ({ camera, size = 50, position = { x: 20, y: 20 }, opacity = 0.8 }) => {
  // Calculate 3D axis endpoints based on size
  const axisEndpoints = {
    x: { x: size, y: 0, z: 0 },
    y: { x: 0, y: size, z: 0 },
    z: { x: 0, y: 0, z: size }
  };

  // Colors for each axis in Blender style
  const axisColors = {
    x: '#E93C3C', // Red
    y: '#6CCE46', // Green
    z: '#4E84F3'  // Blue
  };

  // Project the origin and axis endpoints
  const origin = { x: 0, y: 0, z: 0 };
  const projectedOrigin = camera.projectVertex(origin);

  // Calculate absolute position (using screen position rather than projected)
  const absolutePosition = {
    x: position.x,
    y: position.y
  };

  // Project each axis endpoints
  const projectedAxes = {
    x: camera.projectVertex(axisEndpoints.x),
    y: camera.projectVertex(axisEndpoints.y),
    z: camera.projectVertex(axisEndpoints.z)
  };

  // Create normalized directions for each axis from the origin
  const normalizeVector = (vector) => {
    const dx = vector.x - absolutePosition.x;
    const dy = vector.y - absolutePosition.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    return length === 0 
      ? { x: 0, y: 0 } 
      : { 
          x: dx / length * size * 0.4,
          y: dy / length * size * 0.4
        };
  };
  
  // Calculate the normalized direction vectors
  const axisVectors = {
    x: normalizeVector(projectedAxes.x),
    y: normalizeVector(projectedAxes.y),
    z: normalizeVector(projectedAxes.z)
  };

  // Render the axes as SVG paths
  return (
    <g className="axes-gizmo" opacity={opacity}>
      {/* Background circle */}
      <circle 
        cx={absolutePosition.x} 
        cy={absolutePosition.y} 
        r={size * 0.5} 
        fill="#333333"
        strokeWidth="1"
        stroke="#555555"
        opacity="0.7"
      />
      
      {/* X Axis */}
      <line
        x1={absolutePosition.x}
        y1={absolutePosition.y}
        x2={absolutePosition.x + axisVectors.x.x}
        y2={absolutePosition.y + axisVectors.x.y}
        stroke={axisColors.x}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx={absolutePosition.x + axisVectors.x.x}
        cy={absolutePosition.y + axisVectors.x.y}
        r="3"
        fill={axisColors.x}
      />
      <text
        x={absolutePosition.x + axisVectors.x.x}
        y={absolutePosition.y + axisVectors.x.y}
        dx="5"
        dy="3"
        fill={axisColors.x}
        fontSize="10"
        fontWeight="bold"
      >
        X
      </text>
      
      {/* Y Axis */}
      <line
        x1={absolutePosition.x}
        y1={absolutePosition.y}
        x2={absolutePosition.x + axisVectors.y.x}
        y2={absolutePosition.y + axisVectors.y.y}
        stroke={axisColors.y}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx={absolutePosition.x + axisVectors.y.x}
        cy={absolutePosition.y + axisVectors.y.y}
        r="3"
        fill={axisColors.y}
      />
      <text
        x={absolutePosition.x + axisVectors.y.x}
        y={absolutePosition.y + axisVectors.y.y}
        dx="5"
        dy="3"
        fill={axisColors.y}
        fontSize="10"
        fontWeight="bold"
      >
        Y
      </text>
      
      {/* Z Axis */}
      <line
        x1={absolutePosition.x}
        y1={absolutePosition.y}
        x2={absolutePosition.x + axisVectors.z.x}
        y2={absolutePosition.y + axisVectors.z.y}
        stroke={axisColors.z}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx={absolutePosition.x + axisVectors.z.x}
        cy={absolutePosition.y + axisVectors.z.y}
        r="3"
        fill={axisColors.z}
      />
      <text
        x={absolutePosition.x + axisVectors.z.x}
        y={absolutePosition.y + axisVectors.z.y}
        dx="5"
        dy="3"
        fill={axisColors.z}
        fontSize="10"
        fontWeight="bold"
      >
        Z
      </text>
    </g>
  );
};

export default AxesGizmo; 