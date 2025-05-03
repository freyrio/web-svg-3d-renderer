import { Scene } from './Scene';
import { ModelLoader } from '../loaders/ModelLoader';
import { ModelNode } from './ModelNode';
import { GroupNode } from './GroupNode';

/**
 * SceneManager controls scene setup, handles models, and manages scene state
 */
export class SceneManager {
  /**
   * Create a new SceneManager
   */
  constructor() {
    // The active scene
    this.scene = new Scene();
    
    // Group that holds all models
    this.modelsGroup = new GroupNode('Models');
    this.scene.add(this.modelsGroup);
    
    // Model loader for importing 3D models
    this.modelLoader = new ModelLoader();
  }
  
  /**
   * Get the active scene
   * @returns {Scene} - The current scene
   */
  getScene() {
    return this.scene;
  }
  
  /**
   * Create an example scene with some predefined models
   */
  async createExampleScene() {
    console.log("Starting createExampleScene");
    
    // Clear any existing scene
    this.scene = new Scene();
    this.modelsGroup = new GroupNode('Models');
    this.scene.add(this.modelsGroup);
    
    try {
      // Load and add models in a single operation per model
      // Use a static array for model definitions to avoid recreation
      const modelDefinitions = [
        { type: 'cube', position: { x: -200, y: 0, z: 0 }, color: '#ff0000' },
        { type: 'cylinder', position: { x: 0, y: 0, z: 0 }, color: '#00ff00' },
        { type: 'sphere', position: { x: 200, y: 0, z: 0 }, color: '#0000ff' },
        { type: 'pyramid', position: { x: -100, y: 100, z: 0 }, color: '#ffff00' },
        { type: 'torus', position: { x: 100, y: 100, z: 0 }, color: '#ff00ff' }
      ];
      
      // Load models in sequence to avoid race conditions
      for (const def of modelDefinitions) {
        // Load the model
        const model = await this.loadModel(def.type, { 
          size: 100, 
          color: def.color 
        });
        
        // Set position
        model.setPosition(def.position.x, def.position.y, def.position.z);
        
        // Add to scene
        this.addModel(model);
      }
      
      console.log('Example scene created with models:', this.getAllModels().length);
      
      // Debug: Log all models and their positions
      const models = this.getAllModels();
      console.log('Models in scene:', models.map(model => ({
        id: model.id,
        name: model.name,
        position: model.position,
        vertexCount: model.vertices?.length || 0,
        faceCount: model.faces?.length || 0
      })));
    } catch (error) {
      console.error('Error creating example scene:', error);
    }
  }
  
  /**
   * Load a model using the model loader
   * @param {string} modelType - Type of model to load ('cube', 'sphere', etc)
   * @param {Object} options - Optional parameters for the model (size, color, etc)
   * @returns {Promise<ModelNode>} - The loaded model
   */
  async loadModel(modelType, options = {}) {
    try {
      return await this.modelLoader.load(modelType, options);
    } catch (error) {
      console.error(`Error loading model ${modelType}:`, error);
      throw error;
    }
  }
  
  /**
   * Add a model to the scene
   * @param {ModelNode} model - The model to add
   */
  addModel(model) {
    if (!(model instanceof ModelNode)) {
      console.error('Cannot add non-ModelNode to scene');
      return;
    }
    
    // Get stack trace to find out where this is being called from
    const stackTrace = new Error().stack;
    console.log(`addModel called for ${model.name} from:`, stackTrace);
    
    // Check if model is already in the scene to prevent duplicates
    const existingModels = this.getAllModels();
    console.log(`Checking for duplicates among ${existingModels.length} existing models`);
    
    const isDuplicate = existingModels.some(m => m.id === model.id);
    
    if (isDuplicate) {
      console.warn(`Model ${model.name} (${model.id}) already exists in scene, skipping add`);
      return;
    }
    
    // Add to models group
    this.modelsGroup.add(model);
    
    // Ensure the model is tracked in the scene
    this._ensureModelIsTracked(model);
    
    console.log(`Added model ${model.name} to scene`);
  }
  
  /**
   * Ensure a model is properly tracked in the scene
   * @param {ModelNode} model - The model to track
   * @private
   */
  _ensureModelIsTracked(model) {
    // Get stack trace to find out where this is being called from
    const stackTrace = new Error().stack;
    console.log(`_ensureModelIsTracked called for ${model.name} from:`, stackTrace);
    
    // Get current models in the scene
    const currentModels = this.getAllModels();
    
    // Check if the model is already tracked
    const isTracked = currentModels.some(m => m.id === model.id);
    
    if (!isTracked) {
      // If not tracked, manually add to scene's model tracking
      if (this.scene._modelNodes) {
        this.scene._modelNodes.add(model);
        console.log(`Manually added model ${model.name} to tracking`);
      } else {
        console.warn('Scene does not have _modelNodes collection, cannot track model');
      }
    } else {
      console.log(`Model ${model.name} is already tracked in scene`);
    }
  }
  
  /**
   * Remove a model from the scene
   * @param {ModelNode} model - The model to remove
   */
  removeModel(model) {
    if (!(model instanceof ModelNode)) {
      console.error('Cannot remove non-ModelNode from scene');
      return;
    }
    
    this.modelsGroup.remove(model);
    console.log(`Removed model ${model.name} from scene`);
  }
  
  /**
   * Get all models in the scene
   * @returns {Array<ModelNode>} - Array of all models
   */
  getAllModels() {
    // First try to get models from scene's tracking
    const trackedModels = this.scene.getAllModels();
    
    if (trackedModels && trackedModels.length > 0) {
      return trackedModels;
    }
    
    // Fallback: manually collect models from the modelsGroup
    console.warn('No models found in scene tracking, collecting manually from modelsGroup');
    return this._collectModelsFromGroup(this.modelsGroup);
  }
  
  /**
   * Recursively collect models from a group
   * @param {GroupNode} group - The group to collect models from
   * @returns {Array<ModelNode>} - Array of models found
   * @private
   */
  _collectModelsFromGroup(group) {
    const models = [];
    
    if (!group || !group.children) {
      return models;
    }
    
    // Check each child
    for (const child of group.children) {
      if (child instanceof ModelNode) {
        models.push(child);
      } else if (child instanceof GroupNode) {
        // Recursively collect from nested groups
        const nestedModels = this._collectModelsFromGroup(child);
        models.push(...nestedModels);
      }
    }
    
    return models;
  }
  
  /**
   * Get a model by ID
   * @param {string} id - The model ID
   * @returns {ModelNode|null} - The found model or null
   */
  getModelById(id) {
    const models = this.getAllModels();
    return models.find(model => model.id === id) || null;
  }
  
  /**
   * Add a predefined model type to the scene with custom properties
   * @param {string} modelType - The type of model ('cube', 'sphere', etc.)
   * @param {Object} options - Options including position, color, name, etc.
   * @returns {Promise<ModelNode>} - The created model
   */
  async addPredefinedModel(modelType, options = {}) {
    console.log(`Adding predefined model: ${modelType} with options:`, options);
    
    try {
      // Load the model
      const model = await this.loadModel(modelType, { 
        size: options.size || 100,
        color: options.color
      });
      
      // Set custom properties if provided
      if (options.name) {
        model.name = options.name;
      }
      
      if (options.position) {
        model.setPosition(
          options.position.x || 0,
          options.position.y || 0,
          options.position.z || 0
        );
      }
      
      if (options.rotation) {
        model.setRotation(
          options.rotation.x || 0,
          options.rotation.y || 0,
          options.rotation.z || 0
        );
      }
      
      if (options.scale) {
        model.setScale(
          options.scale.x || 1,
          options.scale.y || 1,
          options.scale.z || 1
        );
      }
      
      // Add to scene
      this.addModel(model);
      
      return model;
    } catch (error) {
      console.error(`Error adding predefined model ${modelType}:`, error);
      return null;
    }
  }
  
  /**
   * Clear the scene and remove all models
   */
  clearScene() {
    this.scene = new Scene();
    this.modelsGroup = new GroupNode('Models');
    this.scene.add(this.modelsGroup);
    console.log('Scene cleared');
  }
} 