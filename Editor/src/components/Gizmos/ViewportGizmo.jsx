import React from 'react';

/**
 * Viewport Gizmo component that displays the current view mode
 * and allows switching between camera views
 * Similar to Blender's view selector in the corner of the viewport
 */
const ViewportGizmo = ({ 
  camera, 
  position = { x: 80, y: 80 }, 
  size = 60,
  onViewChange = () => {} 
}) => {
  // Predefined camera view positions
  const views = {
    'front': {
      position: { x: 0, y: 0, z: 500 },
      rotation: { x: 0, y: 0, z: 0 }
    },
    'back': {
      position: { x: 0, y: 0, z: -500 },
      rotation: { x: 0, y: Math.PI, z: 0 }
    },
    'top': {
      position: { x: 0, y: 500, z: 0 },
      rotation: { x: -Math.PI/2, y: 0, z: 0 }
    },
    'bottom': {
      position: { x: 0, y: -500, z: 0 },
      rotation: { x: Math.PI/2, y: 0, z: 0 }
    },
    'right': {
      position: { x: 500, y: 0, z: 0 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 }
    },
    'left': {
      position: { x: -500, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI/2, z: 0 }
    }
  };
  
  // Determine current view mode based on camera position/rotation
  const getCurrentViewMode = () => {
    // This would need more complex logic to determine the exact view
    // For now, just return "User" for any custom view
    return "User";
  };
  
  // Handle switching to a predefined view
  const handleViewChange = (viewName) => {
    if (views[viewName] && onViewChange) {
      onViewChange(viewName, views[viewName]);
    }
  };
  
  // Calculate background circle and button positions
  const center = { x: position.x, y: position.y };
  const radius = size / 2;
  const buttonRadius = radius / 4;
  
  // Positions for the view buttons (in circular arrangement)
  const buttonPositions = {
    front: { x: center.x, y: center.y - radius * 0.6 },
    back: { x: center.x, y: center.y + radius * 0.6 },
    right: { x: center.x + radius * 0.6, y: center.y },
    left: { x: center.x - radius * 0.6, y: center.y },
    top: { x: center.x - radius * 0.4, y: center.y - radius * 0.4 },
    bottom: { x: center.x + radius * 0.4, y: center.y + radius * 0.4 }
  };
  
  // Labels for the view buttons
  const buttonLabels = {
    front: 'F',
    back: 'B',
    right: 'R',
    left: 'L',
    top: 'T',
    bottom: 'Bo'
  };
  
  return (
    <g className="viewport-gizmo">
      {/* Background circle */}
      <circle 
        cx={center.x} 
        cy={center.y} 
        r={radius} 
        fill="#333333"
        strokeWidth="1"
        stroke="#555555"
        opacity="0.7"
      />
      
      {/* Center indication showing current view mode */}
      <text
        x={center.x}
        y={center.y}
        textAnchor="middle"
        alignmentBaseline="middle"
        fill="#FFFFFF"
        fontSize="10"
        fontWeight="bold"
      >
        {getCurrentViewMode()}
      </text>
      
      {/* View buttons */}
      {Object.keys(buttonPositions).map(viewName => (
        <g key={viewName} onClick={() => handleViewChange(viewName)} style={{ cursor: 'pointer' }}>
          <circle 
            cx={buttonPositions[viewName].x} 
            cy={buttonPositions[viewName].y} 
            r={buttonRadius} 
            fill="#444444"
            stroke="#666666"
            strokeWidth="1"
          />
          <text
            x={buttonPositions[viewName].x}
            y={buttonPositions[viewName].y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="bold"
          >
            {buttonLabels[viewName]}
          </text>
        </g>
      ))}
    </g>
  );
};

export default ViewportGizmo; 