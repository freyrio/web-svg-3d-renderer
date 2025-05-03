import { SceneNode } from './SceneNode';

/**
 * ModelNode class representing a 3D model in the scene graph.
 * Extends SceneNode with model-specific properties and methods.
 */
export class ModelNode extends SceneNode {
  constructor(name = 'Model') {
    super(name);
    
    // Model geometry data
    this.vertices = []; // Array of vertices: [{x, y, z}, ...]
    this.faces = [];    // Array of face indices: [[v1, v2, v3], ...]
    
    // Rendering properties
    this.color = '#4a90e2';     // Base color
    this.wireframe = false;     // Whether to render as wireframe
    this.transparent = false;   // Whether the model is transparent
    this.opacity = 1.0;         // Opacity level (0-1)
    
    // Performance data
    this.vertexCount = 0;
    this.faceCount = 0;
  }
  
  /**
   * Set the model geometry data
   * @param {Object} modelData - Object containing vertices and faces arrays
   * @returns {ModelNode} - This node (for chaining)
   */
  setGeometry(modelData) {
    if (!modelData || !modelData.vertices || !modelData.faces) {
      console.error('Invalid model data provided to ModelNode.setGeometry()');
      return this;
    }
    
    this.vertices = modelData.vertices;
    this.faces = modelData.faces;
    
    this.vertexCount = this.vertices.length;
    this.faceCount = this.faces.length;
    
    return this;
  }
  
  /**
   * Set the model color
   * @param {string} color - Hex color string (e.g., '#ff0000')
   * @returns {ModelNode} - This node (for chaining)
   */
  setColor(color) {
    this.color = color;
    return this;
  }
  
  /**
   * Set the wireframe rendering mode
   * @param {boolean} enabled - Whether to render as wireframe
   * @returns {ModelNode} - This node (for chaining)
   */
  setWireframe(enabled) {
    this.wireframe = enabled;
    return this;
  }
  
  /**
   * Set transparency and opacity
   * @param {boolean} transparent - Whether the model is transparent
   * @param {number} opacity - Opacity level (0-1)
   * @returns {ModelNode} - This node (for chaining)
   */
  setTransparency(transparent, opacity = 1.0) {
    this.transparent = transparent;
    this.opacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    return this;
  }
  
  /**
   * Clone this model node
   * @returns {ModelNode} - A new model node with the same properties
   */
  clone() {
    const clone = new ModelNode(this.name + ' (Clone)');
    
    // Copy transform properties
    clone.position = { ...this.position };
    clone.rotation = { ...this.rotation };
    clone.scale = { ...this.scale };
    
    // Copy visibility
    clone.visible = this.visible;
    
    // Share the same geometry (reference, not copy)
    clone.vertices = this.vertices;
    clone.faces = this.faces;
    clone.vertexCount = this.vertexCount;
    clone.faceCount = this.faceCount;
    
    // Copy rendering properties
    clone.color = this.color;
    clone.wireframe = this.wireframe;
    clone.transparent = this.transparent;
    clone.opacity = this.opacity;
    
    // Copy user data (shallow copy)
    clone.userData = { ...this.userData };
    
    return clone;
  }
} 