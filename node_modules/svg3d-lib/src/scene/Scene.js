import { v4 as uuidv4 } from 'uuid';
import { SceneNode } from './SceneNode';
import { ModelNode } from './ModelNode';
import { GroupNode } from './GroupNode';

/**
 * Scene class to manage the entire scene graph.
 * Acts as the root container for all objects and provides scene-level operations.
 */
export class Scene {
  constructor(name = 'Scene') {
    this.id = uuidv4();
    this.name = name;
    this.children = [];
    
    // Root group node that contains all objects in the scene
    this.root = new GroupNode(name);
    
    // Scene properties
    this.background = '#ffffff';    // Background color
    this.ambientLight = 0.2;        // Ambient light intensity (0-1)
    this.selectedNode = null;       // Currently selected node
    
    // Management collections
    this._modelNodes = new Set();   // All model nodes in the scene for quick access
    this._groupNodes = new Set();   // All group nodes in the scene for quick access
    this._allNodes = new Map();     // Map of ID -> node for all nodes
    
    // Add the root node to our tracking
    this._groupNodes.add(this.root);
    this._allNodes.set(this.root.id, this.root);
  }
  
  /**
   * Add a node to the scene
   * @param {SceneNode} node - The node to add
   * @returns {SceneNode} - The added node
   */
  add(node) {
    if (!(node instanceof SceneNode)) {
      console.error('Cannot add non-SceneNode to Scene');
      return null;
    }
    
    // Add to children array
    this.children.push(node);
    
    // Register in node tracking
    this._registerNode(node);
    
    return node;
  }
  
  /**
   * Register a node and all its children in the tracking maps
   * @param {SceneNode} node - The node to register
   * @private
   */
  _registerNode(node) {
    if (!node) return;
    
    // Debug: log registration
    console.log(`Registering node in scene: ${node.name} (${node.id}), type: ${node instanceof ModelNode ? 'ModelNode' : node instanceof GroupNode ? 'GroupNode' : 'SceneNode'}`);
    
    // Check if already registered
    if (this._allNodes.has(node.id)) {
      console.warn(`Node ${node.name} (${node.id}) is already registered in scene`);
      return;
    }
    
    // Add to allNodes map
    this._allNodes.set(node.id, node);
    
    // If it's a model node, add to modelNodes set
    if (node instanceof ModelNode) {
      if (this._modelNodes.has(node)) {
        console.warn(`ModelNode ${node.name} is already in _modelNodes set`);
      } else {
        this._modelNodes.add(node);
        console.log(`Added ModelNode ${node.name} to _modelNodes set`);
      }
    }
    
    // Recursively register children
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this._registerNode(child);
      }
    }
  }
  
  /**
   * Remove a node from the scene
   * @param {SceneNode} node - The node to remove
   * @returns {boolean} - Whether the node was successfully removed
   */
  remove(node) {
    if (!(node instanceof SceneNode)) {
      console.error('Cannot remove non-SceneNode from Scene');
      return false;
    }
    
    // Find and remove from children array
    const index = this.children.indexOf(node);
    if (index !== -1) {
      this.children.splice(index, 1);
      
      // Unregister from node tracking
      this._unregisterNode(node);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Unregister a node and all its children from the tracking maps
   * @param {SceneNode} node - The node to unregister
   * @private
   */
  _unregisterNode(node) {
    if (!node) return;
    
    // Remove from allNodes map
    this._allNodes.delete(node.id);
    
    // If it's a model node, remove from modelNodes set
    if (node instanceof ModelNode) {
      this._modelNodes.delete(node);
    }
    
    // Recursively unregister children
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this._unregisterNode(child);
      }
    }
  }
  
  /**
   * Find a node by ID
   * @param {string} id - The ID to search for
   * @returns {SceneNode|null} - The found node or null
   */
  findNodeById(id) {
    return this._allNodes.get(id) || null;
  }
  
  /**
   * Find a node by name (returns first match)
   * @param {string} name - The name to search for
   * @returns {SceneNode|null} - The found node or null
   */
  findNodeByName(name) {
    for (const node of this._allNodes.values()) {
      if (node.name === name) {
        return node;
      }
    }
    return null;
  }
  
  /**
   * Find nodes by name (may return multiple if names are not unique)
   * @param {string} name - The node name to find
   * @returns {Array<SceneNode>} - Array of found nodes (empty if none found)
   */
  findNodesByName(name) {
    const result = [];
    
    for (const node of this._allNodes.values()) {
      if (node.name === name) {
        result.push(node);
      }
    }
    
    return result;
  }
  
  /**
   * Set the background color of the scene
   * @param {string} color - Hex color string (e.g., '#000000')
   * @returns {Scene} - This scene (for chaining)
   */
  setBackground(color) {
    this.background = color;
    return this;
  }
  
  /**
   * Set the ambient light intensity
   * @param {number} intensity - Light intensity (0-1)
   * @returns {Scene} - This scene (for chaining)
   */
  setAmbientLight(intensity) {
    this.ambientLight = Math.max(0, Math.min(1, intensity));
    return this;
  }
  
  /**
   * Select a node in the scene
   * @param {SceneNode|null} node - The node to select, or null to deselect
   * @returns {Scene} - This scene (for chaining)
   */
  selectNode(node) {
    this.selectedNode = node;
    return this;
  }
  
  /**
   * Get all model nodes in the scene
   * @returns {Array<ModelNode>} - Array of all model nodes
   */
  getAllModels() {
    if (!this._modelNodes || this._modelNodes.size === 0) {
      // If _modelNodes tracking is empty, try to rebuild it
      this._rebuildModelNodesTracking();
    }
    return Array.from(this._modelNodes);
  }
  
  /**
   * Rebuild the model nodes tracking set
   * @private
   */
  _rebuildModelNodesTracking() {
    this._modelNodes = new Set();
    
    // Traverse all nodes and add ModelNodes to tracking
    const traverseAndCollect = (node) => {
      if (node instanceof ModelNode) {
        this._modelNodes.add(node);
      }
      
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          traverseAndCollect(child);
        }
      }
    };
    
    // Start traversal from scene children
    for (const child of this.children) {
      traverseAndCollect(child);
    }
    
    // Also check the root node and its children
    traverseAndCollect(this.root);
    
    console.log(`Rebuilt model nodes tracking: found ${this._modelNodes.size} models`);
  }
  
  /**
   * Traverse the scene graph and apply a callback to each node
   * @param {Function} callback - The callback to apply (node, parent) => void
   */
  traverse(callback) {
    const traverseNode = (node, parent) => {
      callback(node, parent);
      
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          traverseNode(child, node);
        }
      }
    };
    
    // First call the callback on the root node
    callback(this.root, this);
    
    // Start traversal from children directly in the scene
    for (const child of this.children) {
      traverseNode(child, this);
    }
    
    // Also traverse through the root node's children
    if (this.root && this.root.children) {
      for (const child of this.root.children) {
        traverseNode(child, this.root);
      }
    }
  }
  
  /**
   * Clear all children from the scene
   */
  clear() {
    // Clear tracking structures
    this._allNodes.clear();
    this._modelNodes.clear();
    
    // Clear children array
    this.children = [];
  }
} 