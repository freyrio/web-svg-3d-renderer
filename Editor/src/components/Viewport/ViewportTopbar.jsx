import React from 'react';
import { useAppContext } from '../../context/AppContext';

/**
 * ViewportTopBar component - similar to Blender's viewport header
 * Contains controls for viewport shading, view options, etc.
 */
function ViewportTopBar({ 
  viewportId,
  viewportType = '3D View',
  viewportName = 'Viewport',
  showGrid,
  showAxes,
  toggleGrid,
  toggleAxes,
  toggleHelp,
  viewportIndex
}) {
  // Get context
  const { updateViewportSettings } = useAppContext();

  // Handle render mode change
  const handleRenderModeChange = (mode) => {
    updateViewportSettings(viewportId, { renderMode: mode });
  };

  // Handle shading mode change
  const handleShadingModeChange = (mode) => {
    updateViewportSettings(viewportId, { shadingMode: mode });
  };

  // Get the viewport's settings
  const { viewports } = useAppContext();
  const viewport = viewports.find(vp => vp.id === viewportId);
  const settings = viewport?.settings;

  if (!settings) {
    return null;
  }

  return (
    <div className="viewport-topbar">
      <div className="viewport-topbar-left">
        <div className="viewport-type-selector">
          <select value={viewportType} disabled>
            <option value="3D View">3D View</option>
          </select>
        </div>
        <div className="viewport-name">
          {viewportName} {viewportIndex !== undefined ? `(${viewportIndex + 1})` : ''}
        </div>
      </div>
      
      <div className="viewport-topbar-center">
        {/* Shading mode buttons */}
        <div className="viewport-shading-buttons">
          <button 
            className={`topbar-button ${settings.renderMode === 'wireframe' ? 'active' : ''}`}
            onClick={() => handleRenderModeChange('wireframe')}
            title="Wireframe"
          >
            Wireframe
          </button>
          <button 
            className={`topbar-button ${settings.renderMode === 'solid' && settings.shadingMode === 'flat' ? 'active' : ''}`}
            onClick={() => {
              handleRenderModeChange('solid');
              handleShadingModeChange('flat');
            }}
            title="Solid"
          >
            Solid
          </button>
          <button 
            className={`topbar-button ${settings.renderMode === 'solid' && settings.shadingMode === 'gradient' ? 'active' : ''}`}
            onClick={() => {
              handleRenderModeChange('solid');
              handleShadingModeChange('gradient');
            }}
            title="Shaded"
          >
            Shaded
          </button>
        </div>
        
        {/* Viewport overlay options */}
        <div className="viewport-overlay-options">
          <button 
            className={`topbar-button ${showGrid ? 'active' : ''}`}
            onClick={toggleGrid}
            title="Toggle Grid"
          >
            Grid
          </button>
          <button 
            className={`topbar-button ${showAxes ? 'active' : ''}`}
            onClick={toggleAxes}
            title="Toggle Axes"
          >
            Axes
          </button>
        </div>
      </div>
      
      <div className="viewport-topbar-right">
        <button 
          className="topbar-button"
          onClick={toggleHelp}
          title="Toggle Help"
        >
          ?
        </button>
      </div>
    </div>
  );
}

export default ViewportTopBar; 