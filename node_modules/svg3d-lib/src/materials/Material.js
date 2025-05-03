/**
 * Base class for all materials.
 * Defines appearance properties for 3D objects.
 */
export class Material {
  constructor(color = '#FFFFFF', opacity = 1.0) {
    this.color = color;
    this.opacity = opacity;
    this.wireframe = false;
    this.type = 'Material';
    
    // Basic properties with defaults
    this.wireframeColor = '#000000';
    this.wireframeWidth = 1;
    
    // Transparency
    this.transparent = false;
    
    // Visibility
    this.visible = true;
    
    // Lighting and shading
    this.flatShading = false;
    
    // Allow any additional parameters
    this.userData = {};
  }
  
  /**
   * Sets the color of the material
   * @param {string} color - CSS color value
   * @returns {Material} This material (for chaining)
   */
  setColor(color) {
    this.color = color;
    return this;
  }
  
  /**
   * Sets the wireframe mode of the material
   * @param {boolean} enabled - Whether wireframe is enabled
   * @param {string} color - Optional wireframe color
   * @param {number} width - Optional wireframe width
   * @returns {Material} This material (for chaining)
   */
  setWireframe(enabled, color, width) {
    this.wireframe = enabled;
    
    if (color !== undefined) this.wireframeColor = color;
    if (width !== undefined) this.wireframeWidth = width;
    
    return this;
  }
  
  /**
   * Sets the transparency of the material
   * @param {boolean} transparent - Whether the material is transparent
   * @param {number} opacity - Opacity value between 0 and 1
   * @returns {Material} This material (for chaining)
   */
  setTransparency(transparent, opacity) {
    this.transparent = transparent;
    
    if (opacity !== undefined) {
      this.opacity = Math.max(0, Math.min(1, opacity));
    }
    
    return this;
  }
  
  /**
   * Creates a clone of this material
   * @returns {Material} A new material with the same properties
   */
  clone() {
    return new Material({
      color: this.color,
      opacity: this.opacity
    });
  }
} 