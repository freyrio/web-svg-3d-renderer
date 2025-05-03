import { Object3D } from './Object3D';

/**
 * Scene class represents the root of the scene graph and contains all objects to be rendered.
 */
export class Scene extends Object3D {
  constructor() {
    super();
    this.background = '#000000'; // Default background color from prototype
    this.type = 'Scene'; // Add type for identification
    this.backgroundOpacity = 1;
  }
  
  /**
   * Sets the background color of the scene
   * @param {string} color - CSS color string
   * @param {number} opacity - Opacity value between 0 and 1
   * @returns {Scene} This scene (for chaining)
   */
  setBackground(color, opacity = 1) {
    this.background = color;
    this.backgroundOpacity = Math.max(0, Math.min(1, opacity));
    return this;
  }
} 