// ---- Shapes Factory ----
class Shapes {
  // Create a cube with the given dimensions and materials
  static createCube(width = 1, height = 1, depth = 1, materials = []) {
    // Use our new Mesh.createBox() method internally
    const mesh = Mesh.createBox(width, height, depth);
    
    // Handle materials
    if (materials.length > 0) {
      if (Array.isArray(materials)) {
        mesh.setMaterial(materials);
      } else {
        mesh.setMaterial([materials]);
      }
    }
    
    return mesh;
  }
  
  // Create a sphere with the given radius, segments, and material
  static createSphere(radius = 1, segments = 16, material = null) {
    // Use our new Mesh.createSphere() method internally
    const mesh = Mesh.createSphere(radius, segments, segments / 2);
    
    if (material) {
      mesh.setMaterial(material);
    }
    
    return mesh;
  }
  
  // Create a plane with the given dimensions, segments, and material
  static createPlane(width = 10, height = 10, widthSegments = 1, heightSegments = 1, material = null) {
    // Use our new Mesh.createPlane() method internally
    const mesh = Mesh.createPlane(width, height, widthSegments, heightSegments);
    
    if (material) {
      mesh.setMaterial(material);
    }
    
    return mesh;
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