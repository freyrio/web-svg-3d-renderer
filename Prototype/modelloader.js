/**
 * SVG3D Model Loader
 * 
 * Provides functionality to load 3D models from various file formats into the SVG3D engine.
 * Currently supports OBJ format with plans to expand to other formats.
 */

class ModelLoader {
    /**
     * Create a new ModelLoader
     * 
     * @param {Object} options - Configuration options
     * @param {boolean} [options.calculateNormals=true] - Whether to calculate normals if not provided
     * @param {boolean} [options.normalizeSize=false] - Whether to normalize the model size
     * @param {number} [options.scale=1.0] - Scale factor for loaded models
     */
    constructor(options = {}) {
      this.options = Object.assign({
        calculateNormals: true,
        normalizeSize: false,
        scale: 1.0
      }, options);
      
      // Cache for materials and textures
      this.materialCache = new Map();
      this.textureCache = new Map();
    }
    
    /**
     * Load a 3D model from a URL
     * 
     * @param {string} url - URL of the model to load
     * @param {Object} [options] - Loading options that override constructor options
     * @returns {Promise<Object3D>} Promise that resolves to the loaded model
     */
    async loadFromUrl(url, options = {}) {
      // Merge options
      const loadOptions = Object.assign({}, this.options, options);
      
      try {
        // Fetch the file
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load model from ${url}: ${response.statusText}`);
        }
        
        const text = await response.text();
        
        // Determine format from extension
        const extension = url.split('.').pop().toLowerCase();
        
        // Process based on file type
        switch(extension) {
          case 'obj':
            return this.parseOBJ(text, loadOptions);
          case 'stl':
            return this.parseSTL(text, loadOptions);
          case 'gltf':
          case 'glb':
            throw new Error('glTF format not yet implemented');
          default:
            throw new Error(`Unsupported file format: ${extension}`);
        }
      } catch(error) {
        console.error('Model loading error:', error);
        throw error;
      }
    }
    
    /**
     * Load a 3D model from a File object
     * 
     * @param {File} file - File object containing the model data
     * @param {Object} [options] - Loading options that override constructor options
     * @returns {Promise<Object3D>} Promise that resolves to the loaded model
     */
    async loadFromFile(file, options = {}) {
      // Merge options
      const loadOptions = Object.assign({}, this.options, options);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const text = event.target.result;
            
            // Determine format from extension
            const extension = file.name.split('.').pop().toLowerCase();
            
            // Process based on file type
            let model;
            switch(extension) {
              case 'obj':
                model = this.parseOBJ(text, loadOptions);
                break;
              case 'stl':
                model = this.parseSTL(text, loadOptions);
                break;
              case 'gltf':
              case 'glb':
                reject(new Error('glTF format not yet implemented'));
                return;
              default:
                reject(new Error(`Unsupported file format: ${extension}`));
                return;
            }
            
            resolve(model);
          } catch(error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
      });
    }
    
    /**
     * Parse OBJ file format
     * 
     * @param {string} text - OBJ file content
     * @param {Object} options - Processing options
     * @returns {Object3D} The parsed model
     */
    parseOBJ(text, options) {
      // Create a root object to hold all meshes
      const modelRoot = new Object3D();
      modelRoot.name = 'OBJModel';
      
      // Arrays to store data from the OBJ file
      const vertices = [];
      const normals = [];
      const texCoords = [];
      const vertexColors = [];
      
      // Current material
      let currentMaterial = new Material('#CCCCCC');
      
      // Current object/group
      let currentObject = null;
      let currentGroupName = 'default';
      
      // Arrays to store face data for current object
      let objectVertices = [];
      let objectFaces = [];
      
      // Object for storing materials (simple MTL parser)
      const materials = {};
      
      // Temporary storage for indices and face data
      const indexMap = new Map();
      
      // Parse each line of the OBJ file
      const lines = text.split('\n');
      let lineNumber = 0;
      
      for (const line of lines) {
        lineNumber++;
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (trimmedLine === '' || trimmedLine.startsWith('#')) continue;
        
        const parts = trimmedLine.split(' ');
        const command = parts[0].toLowerCase();
        const data = parts.slice(1);
        
        try {
          switch(command) {
            // Vertex data
            case 'v': // Vertex position
              if (data.length >= 3) {
                const x = parseFloat(data[0]) * options.scale;
                const y = parseFloat(data[1]) * options.scale;
                const z = parseFloat(data[2]) * options.scale;
                
                // Check for vertex colors (some OBJ variants include them)
                if (data.length >= 6) {
                  const r = parseFloat(data[3]);
                  const g = parseFloat(data[4]);
                  const b = parseFloat(data[5]);
                  vertexColors.push([r, g, b]);
                }
                
                vertices.push(new Vector3(x, y, z));
              }
              break;
              
            case 'vn': // Vertex normal
              if (data.length >= 3) {
                const x = parseFloat(data[0]);
                const y = parseFloat(data[1]);
                const z = parseFloat(data[2]);
                normals.push(new Vector3(x, y, z));
              }
              break;
              
            case 'vt': // Texture coordinate
              if (data.length >= 2) {
                const u = parseFloat(data[0]);
                const v = parseFloat(data[1]);
                texCoords.push([u, v]);
              }
              break;
              
            // Material handling
            case 'mtllib': // Material library
              // We would load the MTL file here, but for now we'll use default materials
              // this.loadMTL(data[0]);
              break;
              
            case 'usemtl': // Use material
              // For now, just create a simple material with a random color
              if (!materials[data[0]]) {
                // Generate a deterministic color based on material name
                const hash = data[0].split('').reduce((acc, char) => {
                  return (acc * 31 + char.charCodeAt(0)) & 0xFFFFFFFF;
                }, 0);
                
                const hue = hash % 360;
                const material = new Material(`hsl(${hue}, 70%, 60%)`);
                materials[data[0]] = material;
              }
              
              currentMaterial = materials[data[0]];
              break;
              
            // Grouping
            case 'o': // Object name
            case 'g': // Group name
              // If we have face data for the current object, finalize it
              if (objectFaces.length > 0) {
                this._finalizeObject(modelRoot, currentGroupName, objectVertices, objectFaces, options);
                objectVertices = [];
                objectFaces = [];
              }
              
              currentGroupName = data.join(' ') || 'default';
              break;
              
            // Face definitions
            case 'f': // Face
              if (data.length >= 3) {
                // Each face is a polygon defined by vertex indices
                // Format: f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ...
                
                const faceIndices = [];
                const faceNormals = [];
                const faceTexCoords = [];
                
                // Process each vertex in the face
                for (let i = 0; i < data.length; i++) {
                  const vertexData = data[i].split('/');
                  
                  // OBJ indices are 1-based, so we subtract 1
                  // Handle vertex index
                  if (vertexData[0]) {
                    const vertexIndex = parseInt(vertexData[0]) - 1;
                    faceIndices.push(vertexIndex);
                  }
                  
                  // Handle texture coordinate index (optional)
                  if (vertexData[1] && vertexData[1] !== '') {
                    const texCoordIndex = parseInt(vertexData[1]) - 1;
                    if (texCoordIndex >= 0 && texCoordIndex < texCoords.length) {
                      faceTexCoords.push(texCoordIndex);
                    }
                  }
                  
                  // Handle normal index (optional)
                  if (vertexData[2] && vertexData[2] !== '') {
                    const normalIndex = parseInt(vertexData[2]) - 1;
                    if (normalIndex >= 0 && normalIndex < normals.length) {
                      faceNormals.push(normalIndex);
                    }
                  }
                }
                
                // Triangulate the face if it has more than 3 vertices
                if (faceIndices.length >= 3) {
                  for (let i = 1; i < faceIndices.length - 1; i++) {
                    // Create a triangle face
                    objectFaces.push({
                      indices: [faceIndices[0], faceIndices[i], faceIndices[i+1]],
                      material: currentMaterial,
                      // Only include normals if we have them for all vertices
                      normals: faceNormals.length === faceIndices.length ? 
                        [faceNormals[0], faceNormals[i], faceNormals[i+1]] : null,
                      // Only include texture coordinates if we have them for all vertices
                      texCoords: faceTexCoords.length === faceIndices.length ?
                        [faceTexCoords[0], faceTexCoords[i], faceTexCoords[i+1]] : null
                    });
                  }
                }
              }
              break;
          }
        } catch (error) {
          console.warn(`Error parsing OBJ at line ${lineNumber}: ${error.message}`);
        }
      }
      
      // Finalize the last object
      if (objectFaces.length > 0) {
        this._finalizeObject(modelRoot, currentGroupName, vertices, objectFaces, options);
      }
      
      // If no objects were created, the OBJ file might be using a different structure
      // Try to create a single object from all data
      if (modelRoot.children.length === 0 && objectFaces.length > 0) {
        this._finalizeObject(modelRoot, 'default', vertices, objectFaces, options);
      }
      
      // Normalize size if requested
      if (options.normalizeSize) {
        this._normalizeModelSize(modelRoot);
      }
      
      return modelRoot;
    }
    
    /**
     * Finalize an object by creating a mesh from its data
     * 
     * @param {Object3D} parent - The parent object to add the mesh to
     * @param {string} name - The name of the object
     * @param {Vector3[]} vertices - Array of vertices
     * @param {Object[]} faces - Array of face data
     * @param {Object} options - Processing options
     * @private
     */
    _finalizeObject(parent, name, vertices, faces, options) {
      if (faces.length === 0) return;
      
      // Create a new mesh object
      const mesh = new Object3D();
      mesh.name = name;
      
      // Set vertices and faces
      mesh.vertices = [];
      mesh.faces = [];
      
      // Map from original vertex indices to new indices
      const indexMap = new Map();
      
      // Process each face and build the mesh
      for (const faceData of faces) {
        const { indices, material, normals, texCoords } = faceData;
        
        // Create a unique set of vertices for this face
        const faceVertices = [];
        const mappedIndices = [];
        
        for (let i = 0; i < indices.length; i++) {
          const originalIndex = indices[i];
          const vertex = vertices[originalIndex];
          
          // Check if this vertex has already been added with the same attributes
          const key = `${originalIndex}-${normals ? normals[i] : 'n'}-${texCoords ? texCoords[i] : 't'}`;
          
          if (indexMap.has(key)) {
            // Reuse existing vertex
            mappedIndices.push(indexMap.get(key));
          } else {
            // Add new vertex
            const newIndex = mesh.vertices.length;
            mesh.vertices.push(vertex.clone());
            indexMap.set(key, newIndex);
            mappedIndices.push(newIndex);
          }
        }
        
        // Create normal for this face
        let faceNormal;
        
        if (normals && normals.length === indices.length) {
          // Use provided normals
          // Average the normals for this face (simple approach)
          faceNormal = new Vector3(0, 0, 0);
          for (const normalIndex of normals) {
            faceNormal.add(normals[normalIndex]);
          }
          faceNormal.normalize();
        } else if (options.calculateNormals) {
          // Calculate face normal from vertices
          const v0 = mesh.vertices[mappedIndices[0]];
          const v1 = mesh.vertices[mappedIndices[1]];
          const v2 = mesh.vertices[mappedIndices[2]];
          
          const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
          const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
          
          faceNormal = new Vector3().copy(edge1).cross(edge2).normalize();
        } else {
          // Default normal (up)
          faceNormal = new Vector3(0, 1, 0);
        }
        
        // Create face and add it to the mesh
        mesh.faces.push(new Face(
          mappedIndices[0],
          mappedIndices[1],
          mappedIndices[2],
          faceNormal,
          material
        ));
      }
      
      // Only add the mesh if it has faces
      if (mesh.faces.length > 0) {
        parent.add(mesh);
      }
    }
    
    /**
     * Normalize the size of a model to fit in a unit cube
     * 
     * @param {Object3D} model - The model to normalize
     * @private
     */
    _normalizeModelSize(model) {
      // Find the bounding box of the model
      const boundingBox = this._calculateBoundingBox(model);
      const min = boundingBox.min;
      const max = boundingBox.max;
      
      // Calculate the size of the bounding box
      const size = new Vector3(
        max.x - min.x,
        max.y - min.y,
        max.z - min.z
      );
      
      // Find the largest dimension
      const maxDimension = Math.max(size.x, size.y, size.z);
      
      // Calculate scale factor to fit in a unit cube
      const scale = 1.0 / maxDimension;
      
      // Calculate center of bounding box
      const center = new Vector3(
        (min.x + max.x) / 2,
        (min.y + max.y) / 2,
        (min.z + max.z) / 2
      );
      
      // Scale and center the model
      this._transformModelVertices(model, (vertex) => {
        // Center the vertex
        vertex.x -= center.x;
        vertex.y -= center.y;
        vertex.z -= center.z;
        
        // Scale the vertex
        vertex.x *= scale;
        vertex.y *= scale;
        vertex.z *= scale;
      });
    }
    
    /**
     * Calculate the bounding box of a model
     * 
     * @param {Object3D} model - The model to calculate the bounding box for
     * @returns {Object} The bounding box {min, max}
     * @private
     */
    _calculateBoundingBox(model) {
      const min = new Vector3(Infinity, Infinity, Infinity);
      const max = new Vector3(-Infinity, -Infinity, -Infinity);
      
      // Recursive function to process all vertices in the model
      const processObject = (object) => {
        if (object.vertices) {
          // Get object's world matrix
          const worldMatrix = object.worldMatrix || new Matrix4();
          
          for (const vertex of object.vertices) {
            // Clone vertex to avoid modifying original
            const transformedVertex = vertex.clone();
            
            // Transform to world space
            worldMatrix.transformPoint(transformedVertex);
            
            // Update min and max
            min.x = Math.min(min.x, transformedVertex.x);
            min.y = Math.min(min.y, transformedVertex.y);
            min.z = Math.min(min.z, transformedVertex.z);
            
            max.x = Math.max(max.x, transformedVertex.x);
            max.y = Math.max(max.y, transformedVertex.y);
            max.z = Math.max(max.z, transformedVertex.z);
          }
        }
        
        // Process children
        if (object.children) {
          for (const child of object.children) {
            processObject(child);
          }
        }
      };
      
      processObject(model);
      
      return { min, max };
    }
    
    /**
     * Apply a transformation function to all vertices in a model
     * 
     * @param {Object3D} model - The model to transform
     * @param {Function} transformFn - The transformation function to apply to each vertex
     * @private
     */
    _transformModelVertices(model, transformFn) {
      // Recursive function to process all vertices in the model
      const processObject = (object) => {
        if (object.vertices) {
          for (const vertex of object.vertices) {
            transformFn(vertex);
          }
        }
        
        // Process children
        if (object.children) {
          for (const child of object.children) {
            processObject(child);
          }
        }
      };
      
      processObject(model);
    }
    
    /**
     * Parse STL file format (ASCII only for now)
     * 
     * @param {string} text - STL file content
     * @param {Object} options - Processing options
     * @returns {Object3D} The parsed model
     */
    parseSTL(text, options) {
      // Create a root object to hold all meshes
      const modelRoot = new Object3D();
      modelRoot.name = 'STLModel';
      
      // Check if this is a binary STL file
      if (this._isBinarySTL(text)) {
        throw new Error('Binary STL format not yet implemented');
      }
      
      // Create a single mesh for the STL model
      const mesh = new Object3D();
      mesh.name = 'STLMesh';
      
      // Arrays to store vertex and face data
      mesh.vertices = [];
      mesh.faces = [];
      
      // Default material
      const material = new Material('#AAAAAA');
      
      // Parse ASCII STL
      const lines = text.split('\n');
      let currentFaceVertices = [];
      let currentNormal = null;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (trimmedLine === '') continue;
        
        // Tokenize the line
        const tokens = trimmedLine.split(/\s+/);
        
        switch (tokens[0].toLowerCase()) {
          case 'solid':
            // Solid name
            mesh.name = tokens.slice(1).join(' ') || 'STLMesh';
            break;
            
          case 'facet':
            // Start of a facet (triangle)
            if (tokens[1].toLowerCase() === 'normal') {
              const x = parseFloat(tokens[2]);
              const y = parseFloat(tokens[3]);
              const z = parseFloat(tokens[4]);
              currentNormal = new Vector3(x, y, z);
            }
            break;
            
          case 'vertex':
            // Vertex definition
            if (tokens.length >= 4) {
              const x = parseFloat(tokens[1]) * options.scale;
              const y = parseFloat(tokens[2]) * options.scale;
              const z = parseFloat(tokens[3]) * options.scale;
              currentFaceVertices.push(new Vector3(x, y, z));
            }
            break;
            
          case 'endfacet':
            // End of a facet - add the face to the mesh
            if (currentFaceVertices.length === 3 && currentNormal) {
              // Add vertices to the mesh
              const indices = [
                mesh.vertices.length,
                mesh.vertices.length + 1,
                mesh.vertices.length + 2
              ];
              
              // Add vertices
              mesh.vertices.push(currentFaceVertices[0]);
              mesh.vertices.push(currentFaceVertices[1]);
              mesh.vertices.push(currentFaceVertices[2]);
              
              // Add face
              mesh.faces.push(new Face(
                indices[0],
                indices[1],
                indices[2],
                currentNormal,
                material
              ));
              
              // Reset for the next face
              currentFaceVertices = [];
              currentNormal = null;
            }
            break;
        }
      }
      
      // Only add the mesh if it has faces
      if (mesh.faces.length > 0) {
        modelRoot.add(mesh);
        
        // Normalize size if requested
        if (options.normalizeSize) {
          this._normalizeModelSize(modelRoot);
        }
      } else {
        console.warn('No valid faces found in STL file');
      }
      
      return modelRoot;
    }
    
    /**
     * Check if an STL file is in binary format
     * 
     * @param {string} data - The file content
     * @returns {boolean} True if binary, false if ASCII
     * @private
     */
    _isBinarySTL(data) {
      // A simple heuristic - binary STL files typically begin with "solid" followed by whitespace
      // and then non-ASCII characters, or don't start with "solid" at all
      
      // Check if the file starts with "solid "
      if (!data.startsWith('solid ')) {
        return true; // Not ASCII STL
      }
      
      // Check if the file contains "endsolid" - ASCII STL should have this
      if (data.includes('endsolid')) {
        return false; // Likely ASCII STL
      }
      
      // If the file has "solid" but no "endsolid", or has binary data, it's probably binary
      return true;
    }
  }
  
  // Example usage:
  // 
  // const loader = new ModelLoader({
  //   scale: 1.0,
  //   normalizeSize: true,
  //   calculateNormals: true
  // });
  // 
  // // Load from URL
  // loader.loadFromUrl('models/teapot.obj')
  //   .then(model => {
  //     scene.add(model);
  //   })
  //   .catch(error => {
  //     console.error('Failed to load model:', error);
  //   });
  // 
  // // Or load from file input
  // document.getElementById('fileInput').addEventListener('change', event => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     loader.loadFromFile(file)
  //       .then(model => {
  //         scene.add(model);
  //       })
  //       .catch(error => {
  //         console.error('Failed to load model:', error);
  //       });
  //   }
  // });