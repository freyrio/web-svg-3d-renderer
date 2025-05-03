import { Object3D } from '../core/Object3D';
import { Vector3 } from '../math/Vector3';
import { Face } from '../geometries/Geometry'; // Assuming Face is here now
import { Material } from '../materials/Material';

/**
 * Mesh class representing a 3D object with geometry and material.
 */
export class Mesh extends Object3D {
  /**
   * Creates a new mesh with the given geometry and material
   * @param {Geometry} geometry - The geometry for this mesh
   * @param {Material} material - The material for this mesh
   */
  constructor(width = 1, height = 1, depth = 1, materials = []) {
    super();
    this.type = 'Mesh'; // Identify as Mesh

    this.width = width;
    this.height = height;
    this.depth = depth;
    
    // Geometry and materials are now part of the Mesh itself, like the prototype
    this.vertices = [];
    this.faces = [];
    this.materials = [];

    // Handle materials (from prototype Cube logic)
    if (!Array.isArray(materials)) {
        // If a single material is passed, wrap it in an array
        materials = [materials];
    }

    if (materials.length < 6) {
      const defaultColors = [
        '#FF0000', // Right - Red
        '#00FF00', // Left - Green
        '#0000FF', // Top - Blue
        '#FFFF00', // Bottom - Yellow
        '#FF00FF', // Front - Magenta
        '#00FFFF'  // Back - Cyan
      ];
      this.materials = [...materials];
      while (this.materials.length < 6) {
        // Ensure we create Material instances if colors are provided
        let mat = defaultColors[this.materials.length];
        if (typeof mat === 'string') {
            mat = new Material(mat);
        }
        this.materials.push(mat);
      }
    } else {
      // Ensure all provided items are Material instances
      this.materials = materials.slice(0, 6).map(mat => 
          mat instanceof Material ? mat : new Material(mat?.color || '#FFFFFF')
      );
    }
    
    // Create geometry (from prototype Cube logic)
    this.createGeometry();
  }
  
  // createGeometry from prototype Cube
  createGeometry() {
    const w2 = this.width / 2;
    const h2 = this.height / 2;
    const d2 = this.depth / 2;
    
    this.vertices = [
      new Vector3(-w2, -h2, -d2), // 0: left-bottom-back
      new Vector3(w2, -h2, -d2),  // 1: right-bottom-back
      new Vector3(w2, h2, -d2),   // 2: right-top-back
      new Vector3(-w2, h2, -d2),  // 3: left-top-back
      new Vector3(-w2, -h2, d2),  // 4: left-bottom-front
      new Vector3(w2, -h2, d2),   // 5: right-bottom-front
      new Vector3(w2, h2, d2),    // 6: right-top-front
      new Vector3(-w2, h2, d2)    // 7: left-top-front
    ];
    
    // Define the faces using prototype's order and normals
    this.faces = [
      // Right face (+X) - Material 0
      new Face(1, 2, 6, new Vector3(1, 0, 0), this.materials[0]),
      new Face(1, 6, 5, new Vector3(1, 0, 0), this.materials[0]),
      
      // Left face (-X) - Material 1
      new Face(0, 4, 7, new Vector3(-1, 0, 0), this.materials[1]),
      new Face(0, 7, 3, new Vector3(-1, 0, 0), this.materials[1]),
      
      // Top face (+Y) - Material 2
      new Face(3, 7, 6, new Vector3(0, 1, 0), this.materials[2]),
      new Face(3, 6, 2, new Vector3(0, 1, 0), this.materials[2]),
      
      // Bottom face (-Y) - Material 3
      new Face(0, 1, 5, new Vector3(0, -1, 0), this.materials[3]),
      new Face(0, 5, 4, new Vector3(0, -1, 0), this.materials[3]),
      
      // Front face (+Z) - Material 4
      new Face(4, 5, 6, new Vector3(0, 0, 1), this.materials[4]),
      new Face(4, 6, 7, new Vector3(0, 0, 1), this.materials[4]),
      
      // Back face (-Z) - Material 5
      new Face(0, 3, 2, new Vector3(0, 0, -1), this.materials[5]),
      new Face(0, 2, 1, new Vector3(0, 0, -1), this.materials[5])
    ];
  }
  
  /**
   * Creates a clone of this mesh with the same geometry and material
   * @returns {Mesh} A new mesh
   */
  clone() {
    const mesh = new Mesh(
      this.width,
      this.height,
      this.depth,
      this.materials
    );
    
    mesh.name = this.name;
    mesh.visible = this.visible;
    
    mesh.position.copy(this.position);
    mesh.rotation.copy(this.rotation);
    mesh.scale.copy(this.scale);
    
    return mesh;
  }
} 