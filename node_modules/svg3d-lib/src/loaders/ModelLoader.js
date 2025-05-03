import { ModelNode } from '../scene/ModelNode';
import { generateCube } from '../models/cube';
import { generateSphere } from '../models/sphere';
import { generateCylinder } from '../models/cylinder';
import { generatePyramid } from '../models/pyramid';
import { generateTorus } from '../models/torus';

/**
 * ModelLoader is responsible for loading and creating 3D models.
 * It can create primitive shapes or load models from external sources.
 */
export class ModelLoader {
  constructor() {
    // Default model size
    this.defaultSize = 1.0;
    
    // Map of available primitive model types
    this.primitiveModels = {
      'cube': generateCube,
      'sphere': generateSphere,
      'cylinder': generateCylinder,
      'pyramid': generatePyramid,
      'torus': generateTorus
    };
    
    // Debug: log available generators
    console.log('Available model generators:', Object.keys(this.primitiveModels));
    console.log('Generator functions:', {
      cube: typeof generateCube,
      sphere: typeof generateSphere,
      cylinder: typeof generateCylinder,
      pyramid: typeof generatePyramid,
      torus: typeof generateTorus
    });
  }
  
  /**
   * Load a model by type
   * @param {string} modelType - Type of model to load ('cube', 'sphere', etc)
   * @param {Object} options - Optional parameters for model creation
   * @returns {Promise<ModelNode>} - Promise resolving to a model node
   */
  async load(modelType, options = {}) {
    // Default options
    const modelOptions = {
      size: options.size || this.defaultSize,
      color: options.color || undefined,
      name: options.name || `${modelType.charAt(0).toUpperCase() + modelType.slice(1)}`
    };
    
    try {
      // Check if it's a primitive model
      if (this.primitiveModels[modelType]) {
        return this._createPrimitiveModel(modelType, modelOptions);
      }
      
      // For future expansion: handle loading from files or other sources
      throw new Error(`Unsupported model type: ${modelType}`);
    } catch (error) {
      console.error(`Error loading model ${modelType}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a primitive model
   * @param {string} modelType - Type of primitive ('cube', 'sphere', etc.)
   * @param {Object} options - Options for model creation
   * @returns {ModelNode} - The created model node
   * @private
   */
  _createPrimitiveModel(modelType, options) {
    console.log(`Creating ${modelType} model with size ${options.size}`);
    
    // Get the generator function
    const generateFunction = this.primitiveModels[modelType];
    console.log(`Generator function for ${modelType}:`, generateFunction);
    
    if (typeof generateFunction !== 'function') {
      console.error(`No valid generator function for ${modelType}`);
      return new ModelNode(options.name); // Return empty model
    }
    
    // Generate the model geometry using the appropriate function
    try {
      let geometryData;
      
      // Call the appropriate generator with the correct parameters
      switch (modelType) {
        case 'cube':
          geometryData = generateFunction(options.size);
          break;
        case 'sphere':
          // Sphere requires radius and segments
          geometryData = generateFunction(options.size / 2, 16); // 16 segments
          break;
        case 'cylinder':
          // Cylinder requires radius, height, and segments
          geometryData = generateFunction(options.size / 2, options.size, 16); // 16 segments
          break;
        case 'pyramid':
          // Pyramid requires baseSize and height
          geometryData = generateFunction(options.size, options.size);
          break;
        case 'torus':
          // Torus requires major and minor radius and segments
          geometryData = generateFunction(options.size / 2, options.size / 4, 16, 16);
          break;
        default:
          geometryData = generateFunction(options.size);
      }
      
      console.log(`Generated geometry for ${modelType}:`, {
        vertices: geometryData?.vertices?.length || 0,
        faces: geometryData?.faces?.length || 0,
        size: options.size,
        rawData: geometryData
      });
      
      if (!geometryData || !geometryData.vertices || !geometryData.faces) {
        console.error(`Invalid geometry data for ${modelType}`);
        return new ModelNode(options.name); // Return empty model
      }
      
      // Create a new model node
      const modelNode = new ModelNode(options.name || `${modelType.charAt(0).toUpperCase() + modelType.slice(1)}`);
      
      // Set the geometry data
      modelNode.setGeometry(geometryData);
      
      // Debug: verify model has geometry after setting
      console.log(`Model node after setting geometry:`, {
        name: modelNode.name,
        hasVertices: Boolean(modelNode.vertices && modelNode.vertices.length),
        hasFaces: Boolean(modelNode.faces && modelNode.faces.length),
        vertexCount: modelNode.vertices?.length || 0,
        faceCount: modelNode.faces?.length || 0
      });
      
      // Set color if provided
      if (options.color) {
        modelNode.setColor(options.color);
      }
      
      return modelNode;
    } catch (error) {
      console.error(`Error generating ${modelType} geometry:`, error);
      return new ModelNode(options.name); // Return empty model
    }
  }
} 