 // ---- Cube ----
 class Cube extends Object3D {
    constructor(width = 1, height = 1, depth = 1, materials = []) {
      super();
      this.width = width;
      this.height = height;
      this.depth = depth;
      
      // If we have fewer than 6 materials (one for each face), create default materials
      if (materials.length < 6) {
        const defaultColors = [
          '#FF0000', // Right - Red
          '#00FF00', // Left - Green
          '#0000FF', // Top - Blue
          '#FFFF00', // Bottom - Yellow
          '#FF00FF', // Front - Magenta
          '#00FFFF'  // Back - Cyan
        ];
        
        // Fill with provided materials, then add defaults as needed
        this.materials = [...materials];
        while (this.materials.length < 6) {
          this.materials.push(new Material(defaultColors[this.materials.length]));
        }
      } else {
        this.materials = materials.slice(0, 6);
      }
      
      this.createGeometry();
    }
    
    setOpacity(opacity) {
      // Update opacity for all materials
      this.materials.forEach(material => {
        material.setOpacity(opacity);
      });
      return this;
    }
    
    createGeometry() {
      // Define the 8 vertices of the cube
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
      
      // Define the faces with consistent winding order (counter-clockwise when viewed from outside)
      this.faces = [
        // Right face (positive X) - Material 0
        new Face(1, 2, 6, new Vector3(1, 0, 0), this.materials[0]),
        new Face(1, 6, 5, new Vector3(1, 0, 0), this.materials[0]),
        
        // Left face (negative X) - Material 1
        new Face(0, 4, 7, new Vector3(-1, 0, 0), this.materials[1]),
        new Face(0, 7, 3, new Vector3(-1, 0, 0), this.materials[1]),
        
        // Top face (positive Y) - Material 2
        new Face(3, 7, 6, new Vector3(0, 1, 0), this.materials[2]),
        new Face(3, 6, 2, new Vector3(0, 1, 0), this.materials[2]),
        
        // Bottom face (negative Y) - Material 3
        new Face(0, 1, 5, new Vector3(0, -1, 0), this.materials[3]),
        new Face(0, 5, 4, new Vector3(0, -1, 0), this.materials[3]),
        
        // Front face (positive Z) - Material 4
        new Face(4, 5, 6, new Vector3(0, 0, 1), this.materials[4]),
        new Face(4, 6, 7, new Vector3(0, 0, 1), this.materials[4]),
        
        // Back face (negative Z) - Material 5
        new Face(0, 3, 2, new Vector3(0, 0, -1), this.materials[5]),
        new Face(0, 2, 1, new Vector3(0, 0, -1), this.materials[5])
      ];
    }
  }

   // ---- Sphere ----
   class Sphere extends Object3D {
    constructor(radius = 1, segments = 16, materials = []) {
      super();
      this.radius = radius;
      this.segments = Math.max(4, segments); // Minimum of 4 segments
      
      // If no materials provided, create a default material
      if (materials.length === 0) {
        this.materials = [new Material('#4488FF')];
      } else {
        this.materials = Array.isArray(materials) ? materials : [materials];
      }
      
      this.createGeometry();
    }
    
    setRadius(radius) {
      this.radius = radius;
      this.createGeometry();
      return this;
    }
    
    setSegments(segments) {
      this.segments = Math.max(4, segments);
      this.createGeometry();
      return this;
    }
    
    setOpacity(opacity) {
      // Update opacity for all materials
      this.materials.forEach(material => {
        material.setOpacity(opacity);
      });
      return this;
    }
    
    createGeometry() {
      // Create sphere geometry using UV sphere approach
      const segments = this.segments;
      const rings = segments / 2;
      
      // Generate vertices
      this.vertices = [];
      
      // Add top vertex
      this.vertices.push(new Vector3(0, this.radius, 0));
      
      // Generate rings of vertices
      for (let ring = 1; ring < rings; ring++) {
        const phi = (ring / rings) * Math.PI;
        const y = this.radius * Math.cos(phi);
        const ringRadius = this.radius * Math.sin(phi);
        
        for (let segment = 0; segment < segments; segment++) {
          const theta = (segment / segments) * Math.PI * 2;
          const x = ringRadius * Math.sin(theta);
          const z = ringRadius * Math.cos(theta);
          
          this.vertices.push(new Vector3(x, y, z));
        }
      }
      
      // Add bottom vertex
      this.vertices.push(new Vector3(0, -this.radius, 0));
      
      // Create faces
      this.faces = [];
      
      // Create top cap faces
      for (let segment = 0; segment < segments; segment++) {
        const current = segment + 1;
        const next = (segment + 1) % segments + 1;
        
        // Calculate face normal pointing outward from center
        const a = this.vertices[0];
        const b = this.vertices[current];
        const c = this.vertices[next];
        
        const normal = this.calculateNormal(a, b, c);
        
        this.faces.push(new Face(0, current, next, normal, this.materials[0]));
      }
      
      // Create middle faces
      for (let ring = 0; ring < rings - 2; ring++) {
        const ringStart = 1 + ring * segments;
        const nextRingStart = ringStart + segments;
        
        for (let segment = 0; segment < segments; segment++) {
          const current = ringStart + segment;
          const next = ringStart + (segment + 1) % segments;
          const nextRingCurrent = nextRingStart + segment;
          const nextRingNext = nextRingStart + (segment + 1) % segments;
          
          // Create two triangular faces for each quad
          const normal1 = this.calculateNormal(
            this.vertices[current],
            this.vertices[nextRingCurrent],
            this.vertices[next]
          );
          
          const normal2 = this.calculateNormal(
            this.vertices[next],
            this.vertices[nextRingCurrent],
            this.vertices[nextRingNext]
          );
          
          this.faces.push(new Face(current, nextRingCurrent, next, normal1, this.materials[0]));
          this.faces.push(new Face(next, nextRingCurrent, nextRingNext, normal2, this.materials[0]));
        }
      }
      
      // Create bottom cap faces
      const lastVertex = this.vertices.length - 1;
      const lastRingStart = lastVertex - segments;
      
      for (let segment = 0; segment < segments; segment++) {
        const current = lastRingStart + segment;
        const next = lastRingStart + (segment + 1) % segments;
        
        // Calculate face normal pointing outward from center
        const a = this.vertices[lastVertex];
        const b = this.vertices[next];
        const c = this.vertices[current];
        
        const normal = this.calculateNormal(a, b, c);
        
        this.faces.push(new Face(lastVertex, next, current, normal, this.materials[0]));
      }
    }
    
    calculateNormal(a, b, c) {
      // Calculate face normal using cross product
      const edge1 = new Vector3().copy(b).sub(a);
      const edge2 = new Vector3().copy(c).sub(a);
      return new Vector3().copy(edge1).cross(edge2).normalize();
    }
  }

  // ---- Plane ----
  class Plane extends Object3D {
    constructor(width = 10, height = 10, widthSegments = 1, heightSegments = 1, material = null) {
      super();
      this.width = width;
      this.height = height;
      this.widthSegments = Math.max(1, widthSegments);
      this.heightSegments = Math.max(1, heightSegments);
      this.material = material || new Material('#AAAAAA');
      
      this.createGeometry();
    }
    
    setSize(width, height) {
      this.width = width;
      this.height = height;
      this.createGeometry();
      return this;
    }
    
    setSegments(widthSegments, heightSegments) {
      this.widthSegments = Math.max(1, widthSegments);
      this.heightSegments = Math.max(1, heightSegments);
      this.createGeometry();
      return this;
    }
    
    setMaterial(material) {
      this.material = material;
      
      // Update all faces with the new material
      if (this.faces) {
        this.faces.forEach(face => {
          face.material = this.material;
        });
      }
      
      return this;
    }
    
    createGeometry() {
      const w2 = this.width / 2;
      const h2 = this.height / 2;
      
      // Create vertices
      this.vertices = [];
      
      // Calculate vertex positions in a grid
      for (let y = 0; y <= this.heightSegments; y++) {
        const yPos = h2 - (y / this.heightSegments) * this.height;
        
        for (let x = 0; x <= this.widthSegments; x++) {
          const xPos = -w2 + (x / this.widthSegments) * this.width;
          this.vertices.push(new Vector3(xPos, 0, yPos)); // Y-up, XZ plane
        }
      }
      
      // Create faces (two triangles per grid cell)
      this.faces = [];
      
      const normal = new Vector3(0, 1, 0); // Y-up normal
      
      // Create faces with proper indices
      for (let y = 0; y < this.heightSegments; y++) {
        for (let x = 0; x < this.widthSegments; x++) {
          // Calculate vertex indices for this grid cell
          const a = y * (this.widthSegments + 1) + x;
          const b = a + 1;
          const c = a + (this.widthSegments + 1);
          const d = c + 1;
          
          // Create two triangular faces
          this.faces.push(new Face(a, c, b, normal, this.material));
          this.faces.push(new Face(b, c, d, normal, this.material));
        }
      }
    }
  }

  // ---- Shapes Factory ----
  class Shapes {
    // Create a cube with the given dimensions and materials
    static createCube(width = 1, height = 1, depth = 1, materials = []) {
      return new Cube(width, height, depth, materials);
    }
    
    // Create a sphere with the given radius, segments, and material
    static createSphere(radius = 1, segments = 16, material = null) {
      return new Sphere(radius, segments, material ? [material] : []);
    }
    
    // Create a plane with the given dimensions, segments, and material
    static createPlane(width = 10, height = 10, widthSegments = 1, heightSegments = 1, material = null) {
      return new Plane(width, height, widthSegments, heightSegments, material);
    }
    
    // Create a box using a cube
    static createBox(size = 1, material = null) {
      // Create a cube with a single size parameter (uniform cube/box)
      return Shapes.createCube(size, size, size, material ? [material] : []);
    }
    
    // Create a grid plane (useful for visualizing the 3D space)
    static createGrid(size = 10, divisions = 10, color = '#444444') {
      const plane = Shapes.createPlane(size, size, divisions, divisions);
      // Set wireframe material for grid
      const material = new Material(color);
      material.wireframe = true;
      plane.setMaterial(material);
      return plane;
    }
  }