import React, { useRef, useState, useEffect } from 'react';
import { SceneRenderer, AxesGizmo, GridHelper, ViewportGizmo } from 'svg3d-lib';
import { useAppContext } from '../../context/AppContext';
// import styles from './Viewport.module.css'; // We can add styles later

// Components for information display
const FPSCounter = ({ fps }) => (
  <div className="fps-counter">FPS: <span>{fps || 0}</span></div>
);

const LoadingIndicator = () => (
  <div className="loading">Loading scene...</div>
);

const StatsDisplay = ({ stats }) => (
  <div className="stats-display">
    <div>Models: {stats.visibleModels}</div>
    <div>Faces: {stats.renderedFaces}/{stats.culledFaces + stats.renderedFaces}</div>
    <div>Frame: {stats.frameTime.toFixed(1)}ms</div>
  </div>
);

const CameraInfo = ({ camera }) => (
  <div className="camera-info">
    <div>Camera: {camera.name}</div>
    <div>Type: {camera.type}</div>
    <div>X: {Math.round(camera.position.x)}, Y: {Math.round(camera.position.y)}, Z: {Math.round(camera.position.z)}</div>
  </div>
);

const NavigationHelp = () => (
  <div className="navigation-help">
    <div><strong>Left Click + Drag</strong>: Orbit</div>
    <div><strong>Middle Click + Drag</strong>: Pan</div>
    <div><strong>Right Click + Drag</strong>: Pan</div>
    <div><strong>Mouse Wheel</strong>: Zoom</div>
  </div>
);

/**
 * Enhanced Viewport component that renders a scene using the scene graph and camera system
 */
function Viewport() {
  // Get context
  const {
    sceneManager,
    cameraManager,
    fps,
    isLoading,
    selectedModelId,
    handleSelectModel,
    isAnimating,
    rendererSettings
  } = useAppContext();

  // Refs
  const svgRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseStateRef = useRef({
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    button: 0, // 0 = left, 1 = middle, 2 = right
    orbitSpeed: 0.5,
    panSpeed: 2.0,
    zoomSpeed: 50
  });
  
  // State for rendered elements and stats
  const [svgElements, setSvgElements] = useState([]);
  const [rendererStats, setRendererStats] = useState({
    visibleModels: 0,
    renderedFaces: 0,
    culledFaces: 0,
    frameTime: 0
  });
  
  // State for gizmo visibility
  const [showGrid, setShowGrid] = useState(true);
  const [showAxesGizmo, setShowAxesGizmo] = useState(true);
  const [showViewportGizmo, setShowViewportGizmo] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  
  // Initialize renderer
  useEffect(() => {
    rendererRef.current = new SceneRenderer();
    
    // Set initial renderer settings (these will be overridden by the prop if available)
    rendererRef.current.setSettings({
      maxVisibleFaces: 5000,
      wireframeColor: '#000000',
      depthSort: true,
      cullBackfaces: true,
      renderMode: 'solid',
      shadingMode: 'gradient'
    });
    
    // Set light direction
    rendererRef.current.setLightDirection('front');
  }, []);
  
  // Update renderer when settings change
  useEffect(() => {
    if (rendererRef.current && rendererSettings) {
      console.log('Updating renderer settings:', rendererSettings);
      rendererRef.current.setSettings(rendererSettings);
      
      // Update light direction if it's in the settings
      if (rendererSettings.lightDirection) {
        rendererRef.current.setLightDirection(rendererSettings.lightDirection);
      }
    }
  }, [rendererSettings]);
  
  // Handle view change from the viewport gizmo
  const handleViewChange = (viewName, viewSettings) => {
    const camera = cameraManager.getActiveCamera();
    if (!camera) return;
    
    // Apply the view position and rotation
    camera.setPosition(
      viewSettings.position.x,
      viewSettings.position.y,
      viewSettings.position.z
    );
    
    camera.setRotation(
      viewSettings.rotation.x,
      viewSettings.rotation.y,
      viewSettings.rotation.z
    );
    
    // Sync camera positions
    cameraManager.syncCameraPositions();
  };

  // Pan the camera in the view plane
  const panCamera = (camera, deltaX, deltaY) => {
    // Calculate pan direction based on camera orientation
    const { x: rotX, y: rotY } = camera.rotation;
    
    // Pan in camera space
    const panSpeed = mouseStateRef.current.panSpeed;
    
    // Calculate right vector for X panning
    const rightX = Math.sin(rotY + Math.PI/2);
    const rightZ = Math.cos(rotY + Math.PI/2);
    
    // Calculate up vector for Y panning (based on right and view direction)
    const upX = Math.sin(rotX) * Math.sin(rotY);
    const upY = Math.cos(rotX);
    const upZ = Math.sin(rotX) * Math.cos(rotY);
    
    // Apply pan offset
    camera.setPosition(
      camera.position.x - (rightX * deltaX + upX * deltaY) * panSpeed,
      camera.position.y - upY * deltaY * panSpeed,
      camera.position.z - (rightZ * deltaX + upZ * deltaY) * panSpeed
    );
  };
  
  // Orbit the camera around the focal point
  const orbitCamera = (camera, deltaX, deltaY) => {
    const orbitSpeed = mouseStateRef.current.orbitSpeed;
    
    // Calculate new rotation angles
    let newRotX = camera.rotation.x + deltaY * orbitSpeed;
    const newRotY = camera.rotation.y + deltaX * orbitSpeed;
    
    // Clamp vertical rotation to avoid gimbal lock
    newRotX = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, newRotX));
    
    // Set the camera rotation
    camera.setRotation(
      newRotX,
      newRotY,
      camera.rotation.z
    );
  };
  
  // Handle mouse down to start drag operation
  const handleMouseDown = (event) => {
    const mouseState = mouseStateRef.current;
    
    // Store the mouse position and button
    mouseState.isDragging = true;
    mouseState.lastMouseX = event.clientX;
    mouseState.lastMouseY = event.clientY;
    mouseState.button = event.button;
    
    // Prevent default behavior for middle click (which might be scroll or context menu)
    if (event.button === 1 || event.button === 2) {
      event.preventDefault();
    }
  };
  
  // Handle mouse up to end drag operation
  const handleMouseUp = () => {
    mouseStateRef.current.isDragging = false;
  };
  
  // Handle mouse move for orbiting and panning
  const handleMouseMove = (event) => {
    const mouseState = mouseStateRef.current;
    const camera = cameraManager.getActiveCamera();
    
    if (!mouseState.isDragging || !camera) return;
    
    // Calculate mouse movement delta
    const deltaX = event.clientX - mouseState.lastMouseX;
    const deltaY = event.clientY - mouseState.lastMouseY;
    
    // Update mouse position
    mouseState.lastMouseX = event.clientX;
    mouseState.lastMouseY = event.clientY;
    
    // Orbit with left mouse button
    if (mouseState.button === 0) {
      orbitCamera(camera, deltaX, deltaY);
    }
    // Pan with middle or right mouse button
    else if (mouseState.button === 1 || mouseState.button === 2) {
      panCamera(camera, deltaX, deltaY);
    }
    
    // Sync camera positions
    cameraManager.syncCameraPositions();
    
    // Prevent default behavior
    event.preventDefault();
  };
  
  // Handle wheel event for zooming
  const handleWheel = (event) => {
    const camera = cameraManager.getActiveCamera();
    if (!camera) return;
    
    // Determine zoom direction based on deltaY
    const zoomFactor = event.deltaY > 0 ? 1 : -1;
    const zoomAmount = zoomFactor * mouseStateRef.current.zoomSpeed;
    
    if (camera.type === 'PerspectiveCamera') {
      // For perspective camera, move along the view direction
      const viewDirX = Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x);
      const viewDirY = Math.sin(camera.rotation.x);
      const viewDirZ = Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x);
      
      camera.setPosition(
        camera.position.x + viewDirX * zoomAmount,
        camera.position.y + viewDirY * zoomAmount,
        camera.position.z + viewDirZ * zoomAmount
      );
    } else {
      // For orthographic camera, adjust zoom factor
      camera.setZoom(camera.zoom * (zoomFactor > 0 ? 0.9 : 1.1));
    }
    
    // Sync camera positions
    cameraManager.syncCameraPositions();
    
    // Prevent default scrolling
    event.preventDefault();
  };
  
  // Handle click for model selection
  const handleClick = (event) => {
    // Only handle clicks, not drags
    if (mouseStateRef.current.isDragging) return;
    
    // Model selection via hit-testing would be implemented here
    console.log('Viewport clicked at', event.clientX, event.clientY);
  };
  
  // Handle context menu to prevent right-click menu
  const handleContextMenu = (event) => {
    event.preventDefault();
  };
  
  // Set up mouse event handlers
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    // Add event listeners
    svg.addEventListener('mousedown', handleMouseDown);
    svg.addEventListener('mousemove', handleMouseMove);
    svg.addEventListener('mouseup', handleMouseUp);
    svg.addEventListener('mouseleave', handleMouseUp);
    svg.addEventListener('wheel', handleWheel, { passive: false });
    svg.addEventListener('click', handleClick);
    svg.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      // Clean up event listeners
      svg.removeEventListener('mousedown', handleMouseDown);
      svg.removeEventListener('mousemove', handleMouseMove);
      svg.removeEventListener('mouseup', handleMouseUp);
      svg.removeEventListener('mouseleave', handleMouseUp);
      svg.removeEventListener('wheel', handleWheel);
      svg.removeEventListener('click', handleClick);
      svg.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [cameraManager]);
  
  // Animation frame for continuous rendering
  useEffect(() => {
    if (!rendererRef.current || !sceneManager || !cameraManager) return;
    
    let animationFrameId;
    
    const renderFrame = () => {
      const camera = cameraManager.getActiveCamera();
      const scene = sceneManager.getScene();
      
      if (camera && scene) {
        // Render the scene
        const elements = rendererRef.current.renderScene(scene, camera);
        
        // Update state with rendered elements
        setSvgElements(elements);
        
        // Update statistics
        setRendererStats(rendererRef.current.getStats());
      }
      
      // Continue animation
      animationFrameId = requestAnimationFrame(renderFrame);
    };
    
    // Start rendering
    animationFrameId = requestAnimationFrame(renderFrame);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sceneManager, cameraManager, isAnimating]);
  
  // Get the active camera for info display
  const activeCamera = cameraManager?.getActiveCamera();

  return (
    <div id="viewport" className="viewport">
      <svg
        ref={svgRef}
        viewBox="-400 -300 800 600"
        preserveAspectRatio="xMidYMid meet"
        className={rendererRef.current?.settings.renderMode}
      >
        {/* Render grid helper */}
        {showGrid && activeCamera && (
          <GridHelper 
            camera={activeCamera} 
            size={1000} 
            divisions={20} 
          />
        )}
        
        {/* Render SVG elements (model polygons) */}
        {svgElements.map((element, index) => (
          <polygon
            key={`polygon-${index}`}
            points={element.points}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            opacity={element.opacity}
            data-model-id={element.model} // Store model ID for selection
            className={selectedModelId === element.model ? 'selected' : ''}
          />
        ))}
        
        {/* Render axes gizmo (upper right corner) */}
        {showAxesGizmo && activeCamera && (
          <AxesGizmo 
            camera={activeCamera} 
            size={60} 
            position={{ x: 350, y: -250 }} 
          />
        )}
        
        {/* Render viewport gizmo (lower right corner) */}
        {showViewportGizmo && activeCamera && (
          <ViewportGizmo 
            camera={activeCamera}
            position={{ x: 350, y: 250 }}
            size={80}
            onViewChange={handleViewChange}
          />
        )}
      </svg>

      {/* Overlays */}
      {isLoading && <LoadingIndicator />}
      <FPSCounter fps={fps} />
      <StatsDisplay stats={rendererStats} />
      {activeCamera && <CameraInfo camera={activeCamera} />}
      
      {/* Navigation help overlay */}
      {showHelp && <NavigationHelp />}
      
      {/* Toggle buttons for gizmos */}
      <div className="gizmo-toggles">
        <button 
          className={`gizmo-toggle ${showGrid ? 'active' : ''}`} 
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
        >
          Grid
        </button>
        <button 
          className={`gizmo-toggle ${showAxesGizmo ? 'active' : ''}`} 
          onClick={() => setShowAxesGizmo(!showAxesGizmo)}
          title="Toggle Axes"
        >
          Axes
        </button>
        <button 
          className={`gizmo-toggle ${showViewportGizmo ? 'active' : ''}`} 
          onClick={() => setShowViewportGizmo(!showViewportGizmo)}
          title="Toggle View"
        >
          View
        </button>
        <button 
          className={`gizmo-toggle ${showHelp ? 'active' : ''}`} 
          onClick={() => setShowHelp(!showHelp)}
          title="Toggle Help"
        >
          ?
        </button>
      </div>
      
      {/* Visual indicator for selected model */}
      {selectedModelId && <div className="selection-indicator">Selected: {selectedModelId}</div>}
    </div>
  );
}

export default Viewport; 