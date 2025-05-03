import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Viewport3D from './Viewport3D';

const ViewController = () => {
  const { 
    viewports, 
    activeViewportId, 
    addViewport, 
    removeViewport, 
    VIEWPORT_TYPES 
  } = useAppContext();

  // State for viewport layout
  const [layout, setLayout] = useState('single'); // single, horizontal, vertical, quad

  // Add a new viewport
  const handleAddViewport = () => {
    // Add a new 3D viewport
    addViewport(VIEWPORT_TYPES.VIEW_3D, `Viewport ${viewports.length + 1}`);
    
    // Automatically choose a layout based on number of viewports
    if (viewports.length === 1) {
      setLayout('horizontal'); // 2 viewports side by side
    } else if (viewports.length === 2) {
      setLayout('triple'); // 3 viewports in L shape
    } else if (viewports.length === 3) {
      setLayout('quad'); // 4 viewports in grid
    }
  };

  // Remove a viewport
  const handleRemoveViewport = (viewportId) => {
    if (removeViewport(viewportId)) {
      // Automatically choose a layout based on number of viewports
      if (viewports.length === 2) {
        setLayout('single');
      } else if (viewports.length === 3) {
        setLayout('horizontal');
      } else if (viewports.length === 4) {
        setLayout('triple');
      }
    }
  };

  // Change layout
  const handleChangeLayout = (newLayout) => {
    setLayout(newLayout);
  };

  // Determine layout class
  const layoutClass = `viewport-layout-${layout}`;

  return (
    <div className="view-controller">
      {/* Viewport layout controls */}
      <div className="viewport-controls">
        <div className="layout-buttons">
          <button 
            className={`layout-button ${layout === 'single' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('single')}
            title="Single Viewport"
          >
            ▣
          </button>
          <button 
            className={`layout-button ${layout === 'horizontal' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('horizontal')}
            title="Horizontal Split"
            disabled={viewports.length < 2}
          >
            ◫◫
          </button>
          <button 
            className={`layout-button ${layout === 'vertical' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('vertical')}
            title="Vertical Split"
            disabled={viewports.length < 2}
          >
            ⬒⬒
          </button>
          <button 
            className={`layout-button ${layout === 'triple' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('triple')}
            title="Triple Split"
            disabled={viewports.length < 3}
          >
            ⬒⬒⬒
          </button>
          <button 
            className={`layout-button ${layout === 'quad' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('quad')}
            title="Quad Split"
            disabled={viewports.length < 4}
          >
            ⧉
          </button>
        </div>
        
        <div className="viewport-actions">
          <button 
            className="viewport-add-button"
            onClick={handleAddViewport}
            disabled={viewports.length >= 4}
            title="Add Viewport"
          >
            +
          </button>
          {viewports.length > 1 && (
            <button 
              className="viewport-remove-button"
              onClick={() => handleRemoveViewport(viewports[viewports.length - 1].id)}
              title="Remove Last Viewport"
            >
              -
            </button>
          )}
        </div>
      </div>

      {/* Viewports container */}
      <div className={`viewports-container ${layoutClass}`}>
        {viewports.map((viewport) => (
          <div key={viewport.id} className="viewport-wrapper">
            <Viewport3D 
              viewportId={viewport.id} 
              isActive={viewport.id === activeViewportId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewController; 