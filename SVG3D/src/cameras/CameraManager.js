import { Camera } from './Camera';
import { PerspectiveCamera } from './PerspectiveCamera';
import { OrthographicCamera } from './OrthographicCamera';
import { Vector3 } from '../math/Vector3';

/**
 * CameraManager class to manage multiple cameras and camera switching.
 * Provides convenience methods that delegate to the active camera.
 */
export class CameraManager {
  constructor() {
    // Initialize camera collections
    this.cameras = new Map();
    this.activeCamera = null;
    
    // Add default cameras
    this.addDefaultCameras();
  }
  
  /**
   * Add default cameras to the manager
   * @private
   */
  addDefaultCameras() {
    const perspectiveCamera = new PerspectiveCamera(45, 1, 0.1, 2000);
    perspectiveCamera.name = 'Default Perspective';
    perspectiveCamera.position.set(0, 10, 15);
    perspectiveCamera.lookAt(new Vector3(0, 0, 0));
    
    const orthographicCamera = new OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    orthographicCamera.name = 'Default Orthographic';
    orthographicCamera.position.set(0, 10, 15);
    orthographicCamera.lookAt(new Vector3(0, 0, 0));
    
    this.addCamera(perspectiveCamera);
    this.addCamera(orthographicCamera);
    
    // Set perspective as active by default
    this.setActiveCamera(perspectiveCamera.id);
  }
  
  /**
   * Add a camera to the manager
   * @param {Camera} camera - The camera to add
   * @returns {string} - The camera's ID
   */
  addCamera(camera) {
    if (!(camera instanceof Camera)) {
      throw new Error('Camera must be an instance of Camera class');
    }
    
    camera.updateMatrix();
    camera.updateWorldMatrix();
    this.cameras.set(camera.id, camera);
    
    // If this is the first camera, make it active
    if (!this.activeCamera) {
      this.activeCamera = camera;
    }
    
    return camera.id;
  }
  
  /**
   * Remove a camera from the manager
   * @param {string} cameraId - The ID of the camera to remove
   * @returns {boolean} - Whether the camera was found and removed
   */
  removeCamera(cameraId) {
    if (this.cameras.size <= 1) {
        console.warn("Cannot remove the last camera.");
        return false;
    }
    if (this.activeCamera && this.activeCamera.id === cameraId) {
      // Find a different camera to activate
      let newActiveId = null;
      for (const id of this.cameras.keys()) {
          if (id !== cameraId) {
              newActiveId = id;
              break;
          }
      }
      if (newActiveId) {
          this.setActiveCamera(newActiveId);
      } else {
          console.error("Could not switch active camera before removing.");
          return false;
      }
    }
    return this.cameras.delete(cameraId);
  }
  
  /**
   * Get a camera by ID
   * @param {string} cameraId - The ID of the camera to get
   * @returns {Camera|null} - The camera or null if not found
   */
  getCamera(cameraId) {
    return this.cameras.get(cameraId) || null;
  }
  
  /**
   * Get all cameras
   * @returns {Array<Camera>} - Array of all cameras
   */
  getAllCameras() {
    return Array.from(this.cameras.values());
  }
  
  /**
   * Set the active camera
   * @param {string} cameraId - The ID of the camera to make active
   * @returns {boolean} - Whether the camera was found and made active
   */
  setActiveCamera(cameraId) {
    const camera = this.cameras.get(cameraId);
    if (camera) {
      this.activeCamera = camera;
      console.log(`Active camera set to: ${camera.name} (${camera.type})`);
      return true;
    }
    console.warn(`Camera with ID ${cameraId} not found.`);
    return false;
  }
  
  /**
   * Get the active camera
   * @returns {Camera} - The active camera
   */
  getActiveCamera() {
    return this.activeCamera;
  }
  
  /**
   * Create a new perspective camera
   * @param {string} name - Name for the new camera
   * @returns {PerspectiveCamera} - The created camera
   */
  createPerspectiveCamera(name = 'New Perspective Camera') {
    const camera = new PerspectiveCamera();
    camera.name = name;
    this.addCamera(camera);
    return camera;
  }
  
  /**
   * Create a new orthographic camera
   * @param {string} name - Name for the new camera
   * @returns {OrthographicCamera} - The created camera
   */
  createOrthographicCamera(name = 'New Orthographic Camera') {
    const camera = new OrthographicCamera();
    camera.name = name;
    this.addCamera(camera);
    return camera;
  }
  
  /**
   * Toggle between perspective and orthographic cameras
   * @returns {Camera} - The new active camera
   */
  toggleCameraType() {
    if (!this.activeCamera) return null;
    
    const targetType = this.activeCamera.type === 'PerspectiveCamera' ? 'OrthographicCamera' : 'PerspectiveCamera';
    let switched = false;

    for (const camera of this.cameras.values()) {
      if (camera.type === targetType) {
        this.syncCameras(this.activeCamera, camera);
        this.activeCamera = camera;
        switched = true;
        break;
      }
    }
    
    console.log(`Switched active camera to: ${this.activeCamera.name} (${this.activeCamera.type})`);
    return this.activeCamera;
  }
  
  // --- Convenience methods that delegate to the active camera ---
  
  /**
   * Set the position of the active camera
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   * @returns {CameraManager} - This manager (for chaining)
   */
  setPosition(x, y, z) {
    if (this.activeCamera) {
      this.activeCamera.position.set(x, y, z);
      this.activeCamera.updateMatrix();
      this.activeCamera.updateWorldMatrix();
    }
    return this;
  }
  
  /**
   * Set the rotation of the active camera
   * @param {number} x - X rotation in degrees
   * @param {number} y - Y rotation in degrees
   * @param {number} z - Z rotation in degrees
   * @returns {CameraManager} - This manager (for chaining)
   */
  setRotation(x, y, z) {
    if (this.activeCamera) {
      this.activeCamera.rotation.set(x, y, z);
      this.activeCamera.updateMatrix();
      this.activeCamera.updateWorldMatrix();
    }
    return this;
  }
  
  lookAt(target) {
      if (this.activeCamera) {
          this.activeCamera.lookAt(target);
      }
      return this;
  }
  
  /**
   * Sync camera positions between different camera types
   * This ensures smooth transitions when switching between camera types
   */
  syncCameras(sourceCamera, targetCamera) {
    if (!sourceCamera || !targetCamera) return;

    targetCamera.position.copy(sourceCamera.position);
    targetCamera.rotation.copy(sourceCamera.rotation);
    targetCamera.scale.copy(sourceCamera.scale);
    
    targetCamera.updateMatrix();
    targetCamera.updateWorldMatrix();
    targetCamera.updateProjectionMatrix();
  }
} 