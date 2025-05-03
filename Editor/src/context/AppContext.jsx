import React, { createContext, useState, useContext, useEffect } from 'react';
import { SceneManager, CameraManager } from 'svg3d-lib';
import { useAnimation } from '../hooks/useAnimation';

// Create the context
const AppContext = createContext(null);

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

// Viewport types
export const VIEWPORT_TYPES = {
  VIEW_3D: '3D_VIEW',
  // Future viewport types:
  // FRONT: 'FRONT',
  // TOP: 'TOP',
  // RIGHT: 'RIGHT',
  // PERSPECTIVE: 'PERSPECTIVE',
};

// Default viewport settings
const defaultViewportSettings = {
  renderMode: 'solid',
  wireframeColor: '#000000',
  depthSort: true,
  cullBackfaces: true,
  maxVisibleFaces: 5000,
  shadingMode: 'gradient',
  lightDirection: 'front'
};

// Provider component
export const AppContextProvider = ({ children }) => {
  // Create global scene manager
  const [sceneManager] = useState(() => new SceneManager());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState(null);
  
  // Viewports state
  const [viewports, setViewports] = useState([
    {
      id: 'viewport-1',
      type: VIEWPORT_TYPES.VIEW_3D,
      name: 'Perspective',
      cameraManager: new CameraManager(),
      settings: { ...defaultViewportSettings },
      active: true
    }
  ]);
  
  // Active viewport state
  const [activeViewportId, setActiveViewportId] = useState('viewport-1');
  
  // Get active viewport
  const getActiveViewport = () => {
    return viewports.find(vp => vp.id === activeViewportId) || viewports[0];
  };

  // Animation state - animates the active viewport
  const activeViewport = getActiveViewport();
  const activeCamera = activeViewport?.cameraManager.getActiveCamera();
  
  const { isAnimating, fps, toggleAnimation } = useAnimation(value => {
    if (activeCamera) {
      activeCamera.setRotation(
        activeCamera.rotation.x,
        value,
        activeCamera.rotation.z
      );
      activeViewport.cameraManager.syncCameraPositions();
    }
  });
  
  // Initialize the scene
  useEffect(() => {
    const loadScene = async () => {
      setIsLoading(true);
      
      try {
        // Clear the scene first
        sceneManager.clearScene();
        
        // Create example scene with multiple models
        await sceneManager.createExampleScene();
      } catch (error) {
        console.error('Error creating scene:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadScene();
  }, [sceneManager]);
  
  // Handle model selection
  const handleSelectModel = (modelId) => {
    setSelectedModelId(modelId);
  };
  
  // Handle renderer settings updates for a specific viewport
  const updateViewportSettings = (viewportId, newSettings) => {
    setViewports(currentViewports => 
      currentViewports.map(viewport => 
        viewport.id === viewportId
          ? { 
              ...viewport, 
              settings: { ...viewport.settings, ...newSettings } 
            }
          : viewport
      )
    );
  };

  // Add a new viewport
  const addViewport = (type = VIEWPORT_TYPES.VIEW_3D, name = 'New Viewport') => {
    const newViewportId = `viewport-${viewports.length + 1}`;
    const newViewport = {
      id: newViewportId,
      type,
      name,
      cameraManager: new CameraManager(),
      settings: { ...defaultViewportSettings },
      active: false
    };
    
    setViewports([...viewports, newViewport]);
    return newViewportId;
  };

  // Remove a viewport
  const removeViewport = (viewportId) => {
    // Prevent removing the last viewport
    if (viewports.length <= 1) return false;
    
    const isActive = viewportId === activeViewportId;
    const filteredViewports = viewports.filter(vp => vp.id !== viewportId);
    
    setViewports(filteredViewports);
    
    // If we removed the active viewport, set a new active one
    if (isActive) {
      setActiveViewportId(filteredViewports[0].id);
    }
    
    return true;
  };

  // Set the active viewport
  const setActiveViewport = (viewportId) => {
    if (viewports.some(vp => vp.id === viewportId)) {
      setActiveViewportId(viewportId);
      return true;
    }
    return false;
  };

  // Context value
  const contextValue = {
    sceneManager,
    isLoading,
    selectedModelId,
    isAnimating,
    fps,
    toggleAnimation,
    handleSelectModel,
    
    // Viewport management
    viewports,
    activeViewportId,
    getActiveViewport,
    updateViewportSettings,
    addViewport,
    removeViewport,
    setActiveViewport,
    
    // Viewport types
    VIEWPORT_TYPES
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}; 