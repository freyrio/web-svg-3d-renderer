import { v4 as uuidv4 } from 'uuid';

/**
 * SceneNode class representing a node in the scene graph.
 * Each node can have a parent and multiple children, forming a tree structure.
 */
export class SceneNode {
  constructor(name = 'Node') {
    this.id = uuidv4(); // Unique identifier
    this.name = name;   // Human-readable name
    this.parent = null; // Parent node reference
    this.children = []; // Child nodes
    
    // Local transformation properties
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    
    // Visibility flag
    this.visible = true;
    
    // Optional user data for custom properties
    this.userData = {};
  }
  
  /**
   * Add a child node to this node
   * @param {SceneNode} child - The child node to add
   * @returns {SceneNode} - The child node (for chaining)
   */
  add(child) {
    console.log(`SceneNode.add: Adding ${child.name} (${child.id}) to ${this.name} (${this.id})`);
    
    if (child.parent) {
      console.log(`Child ${child.name} already has parent ${child.parent.name}, removing from old parent`);
      child.parent.remove(child);
    }
    
    // Check if the child is already in this node
    const existingChildIndex = this.children.findIndex(c => c.id === child.id);
    if (existingChildIndex !== -1) {
      console.warn(`Child ${child.name} (${child.id}) is already a child of ${this.name}, not adding again`);
      return child;
    }
    
    child.parent = this;
    this.children.push(child);
    
    console.log(`Added ${child.name} to ${this.name}, now has ${this.children.length} children`);
    
    return child;
  }
  
  /**
   * Remove a child node from this node
   * @param {SceneNode} child - The child node to remove
   * @returns {SceneNode} - This node (for chaining)
   */
  remove(child) {
    const index = this.children.indexOf(child);
    
    if (index !== -1) {
      child.parent = null;
      this.children.splice(index, 1);
    }
    
    return this;
  }
  
  /**
   * Set the position of this node
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   * @returns {SceneNode} - This node (for chaining)
   */
  setPosition(x, y, z) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    
    return this;
  }
  
  /**
   * Set the rotation of this node (in degrees)
   * @param {number} x - X rotation
   * @param {number} y - Y rotation
   * @param {number} z - Z rotation
   * @returns {SceneNode} - This node (for chaining)
   */
  setRotation(x, y, z) {
    this.rotation.x = x;
    this.rotation.y = y;
    this.rotation.z = z;
    
    return this;
  }
  
  /**
   * Set the scale of this node
   * @param {number} x - X scale
   * @param {number} y - Y scale
   * @param {number} z - Z scale
   * @returns {SceneNode} - This node (for chaining)
   */
  setScale(x, y, z) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
    
    return this;
  }
  
  /**
   * Calculate the world matrix for this node
   * Combines parent transformations with local transformations
   * @returns {Object} - The world transformation properties
   */
  getWorldTransform() {
    const worldTransform = {
      position: { ...this.position },
      rotation: { ...this.rotation },
      scale: { ...this.scale }
    };
    
    if (this.parent) {
      const parentTransform = this.parent.getWorldTransform();
      
      // Combine position (parent position + (parent scale * local position rotated by parent))
      // This is a simplified version; a complete implementation would use matrices
      worldTransform.position.x = parentTransform.position.x + (parentTransform.scale.x * this.position.x);
      worldTransform.position.y = parentTransform.position.y + (parentTransform.scale.y * this.position.y);
      worldTransform.position.z = parentTransform.position.z + (parentTransform.scale.z * this.position.z);
      
      // Combine rotation (just add for simplicity; in a full implementation, would use quaternions)
      worldTransform.rotation.x = parentTransform.rotation.x + this.rotation.x;
      worldTransform.rotation.y = parentTransform.rotation.y + this.rotation.y;
      worldTransform.rotation.z = parentTransform.rotation.z + this.rotation.z;
      
      // Combine scale (multiply)
      worldTransform.scale.x = parentTransform.scale.x * this.scale.x;
      worldTransform.scale.y = parentTransform.scale.y * this.scale.y;
      worldTransform.scale.z = parentTransform.scale.z * this.scale.z;
    }
    
    return worldTransform;
  }
  
  /**
   * Traverse this node and all its descendants
   * @param {Function} callback - Function to call for each node
   */
  traverse(callback) {
    callback(this);
    
    for (const child of this.children) {
      child.traverse(callback);
    }
  }
} 