import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
// import styles from './Controls.module.css'; // We can add styles later

/**
 * Enhanced Controls component inspired by Blender's UI with Outliner and Properties panels
 */
function Controls() {
  // Get app context
  const {
    sceneManager, 
    isLoading,
    isAnimating,
    toggleAnimation,
    selectedModelId,
    handleSelectModel,
    viewports,
    activeViewportId,
    updateViewportSettings,
    getActiveViewport
  } = useAppContext();

  // Get the active viewport
  const activeViewport = getActiveViewport();
  const cameraManager = activeViewport?.cameraManager;
  const settings = activeViewport?.settings;

  // Local state for UI controls
  const [activePropertyTab, setActivePropertyTab] = useState('object'); // object, camera, render, scene
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  
  // Get active camera and models
  const activeCamera = cameraManager?.getActiveCamera();
  const models = sceneManager?.getAllModels() || [];
  const selectedModel = selectedModelId ? models.find(model => model.id === selectedModelId) : null;
  
  // Handle clicking outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) && 
          !dropdownButtonRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle toggling dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
  
  // Handler for camera type toggling
  const handleToggleCameraType = () => {
    if (cameraManager) {
      cameraManager.toggleCameraType();
      cameraManager.syncCameraPositions();
    }
  };
  
  // Handler for renderer settings changes
  const handleRenderSettingChange = (setting, value) => {
    if (updateViewportSettings && activeViewportId) {
      updateViewportSettings(activeViewportId, {
        [setting]: value
      });
    }
  };
  
  // Handler for camera position/rotation changes
  const handleCameraChange = (property, axis, value) => {
    if (!activeCamera) return;
    
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return;
    
    if (property === 'position') {
      const newPosition = { ...activeCamera.position };
      newPosition[axis] = numericValue;
      activeCamera.setPosition(newPosition.x, newPosition.y, newPosition.z);
    } else if (property === 'rotation') {
      const newRotation = { ...activeCamera.rotation };
      newRotation[axis] = numericValue;
      activeCamera.setRotation(newRotation.x, newRotation.y, newRotation.z);
    }
    
    // Sync camera positions to keep all cameras aligned
    cameraManager.syncCameraPositions();
  };
  
  // Handle model selection
  const handleModelSelect = (modelId) => {
    handleSelectModel(modelId);
    // Switch to object properties tab when selecting a model
    setActivePropertyTab('object');
  };
  
  // Add a new model to the scene
  const handleAddModel = async (modelType) => {
    if (!sceneManager) return;
    
    // Generate position offset from center to avoid overlap
    const offsetX = (Math.random() - 0.5) * 300;
    const offsetY = (Math.random() - 0.5) * 300;
    const offsetZ = (Math.random() - 0.5) * 300;
    
    // Generate random color
    const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    
    // Add the model
    const model = await sceneManager.addPredefinedModel(modelType, {
      name: `${modelType.charAt(0).toUpperCase() + modelType.slice(1)}-${Date.now()}`,
      position: { x: offsetX, y: offsetY, z: offsetZ },
      color
    });
    
    // Select the newly added model
    if (model) {
      handleSelectModel(model.id);
      setActivePropertyTab('object');
    }
    
    // Hide dropdown after selection
    setDropdownVisible(false);
  };
  
  // Clear the scene
  const handleClearScene = () => {
    if (sceneManager) {
      sceneManager.clearScene();
      handleSelectModel(null);
    }
  };
  
  // Create example scene
  const handleCreateExampleScene = async () => {
    if (sceneManager) {
      await sceneManager.createExampleScene();
    }
  };
  
  return (
    <div id="controls" className="controls-panel">
      {/* Outliner Panel (similar to Blender's scene hierarchy) */}
      <div className="panel outliner">
            <div className="panel-header">
              <h3>Outliner</h3>
          <div className="panel-actions">
                <button 
                  className="small-button" 
              title="Add object" 
              ref={dropdownButtonRef}
              onClick={toggleDropdown}
                >
              +
                </button>
            <div 
              ref={dropdownRef}
              className="dropdown-menu" 
              style={{ display: dropdownVisible ? 'block' : 'none' }}
            >
              <div onClick={() => handleAddModel('cube')}>Cube</div>
              <div onClick={() => handleAddModel('sphere')}>Sphere</div>
              <div onClick={() => handleAddModel('pyramid')}>Pyramid</div>
              <div onClick={() => handleAddModel('cylinder')}>Cylinder</div>
              <div onClick={() => handleAddModel('torus')}>Torus</div>
            </div>
              </div>
            </div>
            
        <div className="panel-content">
          {models.length === 0 ? (
            <div className="empty-message">No objects in scene</div>
          ) : (
            <ul className="scene-tree">
              <li className="scene-root">
                <div className="tree-row">
                  <span className="tree-toggle">▼</span>
                  <span className="tree-icon">🌐</span>
                  <span className="tree-label">Scene</span>
                </div>
                <ul>
                  {models.map(model => (
                    <li 
                      key={model.id} 
                      className={`tree-item ${selectedModelId === model.id ? 'selected' : ''}`}
                      onClick={() => handleModelSelect(model.id)}
                    >
                      <div className="tree-row">
                        <span className="tree-icon" style={{ color: model.color }}>●</span>
                        <span className="tree-label">{model.name}</span>
                      </div>
                    </li>
                  ))}
                  <li className="tree-item">
                    <div className="tree-row">
                      <span className="tree-icon">📷</span>
                      <span className="tree-label" onClick={() => setActivePropertyTab('camera')}>
                        {activeCamera?.type || 'Camera'}
                      </span>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
              )}
            </div>
            
        <div className="panel-footer">
          <button 
            className="small-button" 
            title="Create example scene" 
            onClick={handleCreateExampleScene}
          >Demo</button>
          <button 
            className="small-button" 
            title="Clear scene" 
            onClick={handleClearScene}
          >Clear</button>
          <div className="animation-toggle">
            <button 
              className={`animation-button ${isAnimating ? 'active' : ''}`}
              onClick={toggleAnimation}
              title={isAnimating ? 'Stop Animation' : 'Start Animation'}
            >
              {isAnimating ? '■' : '▶'}
            </button>
              </div>
              </div>
            </div>
            
      {/* Properties Panel (like Blender's property editor) */}
      <div className="panel properties">
                <div className="panel-header">
          <div className="tab-bar">
            <button 
              className={`tab ${activePropertyTab === 'object' ? 'active' : ''}`} 
              onClick={() => setActivePropertyTab('object')}
              disabled={!selectedModelId}
              title="Object Properties"
            >
              <span className="tab-icon">▲</span>
            </button>
            <button 
              className={`tab ${activePropertyTab === 'camera' ? 'active' : ''}`} 
              onClick={() => setActivePropertyTab('camera')}
              title="Camera Properties"
            >
              <span className="tab-icon">📷</span>
            </button>
            <button 
              className={`tab ${activePropertyTab === 'render' ? 'active' : ''}`} 
              onClick={() => setActivePropertyTab('render')}
              title="Render Properties"
            >
              <span className="tab-icon">🎬</span>
            </button>
            <button 
              className={`tab ${activePropertyTab === 'scene' ? 'active' : ''}`} 
              onClick={() => setActivePropertyTab('scene')}
              title="Scene Properties"
            >
              <span className="tab-icon">🌐</span>
            </button>
      </div>
        </div>
                    
        <div className="panel-content">
          {/* Object Properties */}
          {activePropertyTab === 'object' && selectedModel && (
            <div className="property-section">
              <div className="property-group">
                <h4>Object</h4>
                    <div className="property-row">
                  <span className="property-label">Name</span>
                  <span className="property-value">{selectedModel.name}</span>
        </div>
                    <div className="property-row">
                  <span className="property-label">Type</span>
                  <span className="property-value">{selectedModel.type || 'Mesh'}</span>
                </div>
            </div>
            
            <div className="property-group">
                <h4>Transform</h4>
                {/* Placeholder for transform properties */}
                <div className="property-row">
                  <span className="property-label">Color</span>
                  <input 
                    type="color" 
                    value={selectedModel.color} 
                    onChange={(e) => {
                      // Logic to update model color
                      if (sceneManager) {
                        sceneManager.updateModelColor(selectedModel.id, e.target.value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
                
          {/* Camera Properties */}
          {activePropertyTab === 'camera' && activeCamera && (
            <div className="property-section">
              <div className="property-group">
                <h4>Camera</h4>
                <div className="property-row">
                  <span className="property-label">Type</span>
                  <button onClick={handleToggleCameraType} className="property-button">
                    {activeCamera.type === 'PerspectiveCamera' ? 'Perspective' : 'Orthographic'}
                  </button>
                </div>
              </div>
              
              <div className="property-group">
                <h4>Position</h4>
                <div className="property-row number-input">
                  <span className="property-label">X</span>
                  <input 
                    type="range" 
                    min="-1000"
                    max="1000"
                    value={activeCamera.position.x}
                    onChange={(e) => handleCameraChange('position', 'x', e.target.value)}
                  />
                  <span className="property-value">{Math.round(activeCamera.position.x)}</span>
                </div>
                <div className="property-row number-input">
                  <span className="property-label">Y</span>
                  <input 
                    type="range" 
                    min="-1000"
                    max="1000"
                    value={activeCamera.position.y}
                    onChange={(e) => handleCameraChange('position', 'y', e.target.value)}
                  />
                  <span className="property-value">{Math.round(activeCamera.position.y)}</span>
                </div>
                <div className="property-row number-input">
                  <span className="property-label">Z</span>
                  <input 
                    type="range" 
                    min="100"
                    max="2000"
                    value={activeCamera.position.z}
                    onChange={(e) => handleCameraChange('position', 'z', e.target.value)}
                  />
                  <span className="property-value">{Math.round(activeCamera.position.z)}</span>
                </div>
                </div>
                
              <div className="property-group">
                <h4>Rotation</h4>
                <div className="property-row number-input">
                  <span className="property-label">X</span>
                  <input 
                    type="range" 
                    min="-180"
                    max="180"
                    value={activeCamera.rotation.x}
                    onChange={(e) => handleCameraChange('rotation', 'x', e.target.value)}
                  />
                  <span className="property-value">{Math.round(activeCamera.rotation.x)}°</span>
                </div>
                <div className="property-row number-input">
                  <span className="property-label">Y</span>
                  <input 
                    type="range" 
                    min="-180"
                    max="180"
                    value={activeCamera.rotation.y}
                    onChange={(e) => handleCameraChange('rotation', 'y', e.target.value)}
                  />
                  <span className="property-value">{Math.round(activeCamera.rotation.y)}°</span>
                </div>
                <div className="property-row number-input">
                  <span className="property-label">Z</span>
                  <input 
                    type="range" 
                    min="-180"
                    max="180"
                    value={activeCamera.rotation.z}
                    onChange={(e) => handleCameraChange('rotation', 'z', e.target.value)}
                  />
                  <span className="property-value">{Math.round(activeCamera.rotation.z)}°</span>
                </div>
              </div>
              
              {/* Camera-specific settings */}
              {activeCamera.type === 'PerspectiveCamera' && (
                <div className="property-group">
                  <h4>Lens</h4>
                  <div className="property-row number-input">
                    <span className="property-label">FOV</span>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      value={activeCamera.fov}
                      onChange={(e) => {
                        activeCamera.setFov(parseFloat(e.target.value));
                      }}
                    />
                    <span className="property-value">{Math.round(activeCamera.fov)}°</span>
            </div>
          </div>
        )}
        
              {activeCamera.type === 'OrthographicCamera' && (
            <div className="property-group">
                  <h4>Orthographic</h4>
                  <div className="property-row number-input">
                    <span className="property-label">Zoom</span>
          <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={activeCamera.zoom}
                      onChange={(e) => {
                        activeCamera.setZoom(parseFloat(e.target.value));
                      }}
                    />
                    <span className="property-value">{activeCamera.zoom.toFixed(1)}x</span>
                  </div>
                </div>
              )}
        </div>
          )}

          {/* Render Properties */}
          {activePropertyTab === 'render' && settings && (
            <div className="property-section">
              <div className="property-group">
                <h4>Display</h4>
                <div className="property-row">
                  <span className="property-label">Render Mode</span>
                  <select
                    value={settings.renderMode}
                    onChange={(e) => handleRenderSettingChange('renderMode', e.target.value)}
                    className="property-select"
                  >
                    <option value="solid">Solid</option>
                    <option value="wireframe">Wireframe</option>
                    <option value="solid-wireframe">Solid + Wireframe</option>
                  </select>
                </div>
                
                <div className="property-row">
                  <span className="property-label">Shading</span>
                  <select
                    value={settings.shadingMode}
                    onChange={(e) => handleRenderSettingChange('shadingMode', e.target.value)}
                    className="property-select"
                  >
                    <option value="flat">Flat</option>
                    <option value="gradient">Depth Gradient</option>
                  </select>
                </div>
                
                <div className="property-row">
                  <span className="property-label">Light</span>
                  <select
                    value={settings.lightDirection}
                    onChange={(e) => handleRenderSettingChange('lightDirection', e.target.value)}
                    className="property-select"
                  >
                    <option value="front">Front</option>
                    <option value="top">Top</option>
                    <option value="side">Side</option>
                  </select>
                </div>
            </div>
            
            <div className="property-group">
                <h4>Performance</h4>
                <div className="property-row number-input">
                  <span className="property-label">Max Faces</span>
                  <input 
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={settings.maxVisibleFaces}
                    onChange={(e) => handleRenderSettingChange('maxVisibleFaces', parseInt(e.target.value))}
                  />
                  <span className="property-value">{settings.maxVisibleFaces}</span>
                </div>
                </div>
                
              <div className="property-group">
                <h4>Options</h4>
                <div className="property-row checkbox">
                  <input 
                    type="checkbox" 
                    id="depth-sort"
                    checked={settings.depthSort}
                    onChange={(e) => handleRenderSettingChange('depthSort', e.target.checked)}
                  />
                  <label htmlFor="depth-sort">Depth Sorting</label>
                </div>
                
                <div className="property-row checkbox">
                  <input 
                    type="checkbox" 
                    id="cull-backfaces"
                    checked={settings.cullBackfaces}
                    onChange={(e) => handleRenderSettingChange('cullBackfaces', e.target.checked)}
                  />
                  <label htmlFor="cull-backfaces">Backface Culling</label>
                </div>
        </div>
        </div>
          )}
                
          {/* Scene Properties */}
          {activePropertyTab === 'scene' && (
            <div className="property-section">
              <div className="property-group">
                <h4>Scene</h4>
                <div className="property-row">
                  <button onClick={handleCreateExampleScene} className="property-button">Create Example Scene</button>
        </div>
                <div className="property-row">
                  <button onClick={handleClearScene} className="property-button danger">Clear Scene</button>
                </div>
                </div>
                
              <div className="property-group">
                <h4>Animation</h4>
                <div className="property-row">
                  <button 
                    onClick={toggleAnimation} 
                    className={`property-button ${isAnimating ? 'active' : ''}`}
                  >
                    {isAnimating ? 'Stop Animation' : 'Start Animation'}
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
    </div>
  );
}

export default Controls; 