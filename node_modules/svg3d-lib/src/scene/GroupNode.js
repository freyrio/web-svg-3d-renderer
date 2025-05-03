import { SceneNode } from './SceneNode';

/**
 * GroupNode class for organizing multiple nodes in the scene.
 * Provides methods for managing collections of models and other groups.
 */
export class GroupNode extends SceneNode {
  constructor(name = 'Group') {
    super(name);
  }
  
  /**
   * Add multiple children at once
   * @param {Array<SceneNode>} nodes - Array of nodes to add
   * @returns {GroupNode} - This node (for chaining)
   */
  addAll(nodes) {
    for (const node of nodes) {
      this.add(node);
    }
    return this;
  }
  
  /**
   * Find a child node by name
   * @param {string} name - The name to search for
   * @param {boolean} recursive - Whether to search recursively through all descendants
   * @returns {SceneNode|null} - The found node or null
   */
  findByName(name, recursive = false) {
    // First check direct children
    for (const child of this.children) {
      if (child.name === name) {
        return child;
      }
    }
    
    // If recursive and not found in direct children, check grandchildren
    if (recursive) {
      for (const child of this.children) {
        if (child instanceof GroupNode) {
          const found = child.findByName(name, true);
          if (found) {
            return found;
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Find a child node by ID
   * @param {string} id - The ID to search for
   * @param {boolean} recursive - Whether to search recursively through all descendants
   * @returns {SceneNode|null} - The found node or null
   */
  findById(id, recursive = false) {
    // First check direct children
    for (const child of this.children) {
      if (child.id === id) {
        return child;
      }
    }
    
    // If recursive and not found in direct children, check grandchildren
    if (recursive) {
      for (const child of this.children) {
        if (child instanceof GroupNode) {
          const found = child.findById(id, true);
          if (found) {
            return found;
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Set visibility for all children
   * @param {boolean} visible - Whether children should be visible
   * @returns {GroupNode} - This node (for chaining)
   */
  setChildrenVisibility(visible) {
    for (const child of this.children) {
      child.visible = visible;
    }
    return this;
  }
  
  /**
   * Clear all children from this group
   * @returns {GroupNode} - This node (for chaining)
   */
  clear() {
    // Remove parent reference from all children
    for (const child of this.children) {
      child.parent = null;
    }
    
    // Clear the children array
    this.children = [];
    
    return this;
  }
} 