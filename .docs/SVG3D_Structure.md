# SVG3D Library Project Structure

## Overview

The SVG3D library is a lightweight 3D rendering engine that uses SVG for rendering instead of WebGL. It provides a scene graph, camera systems, transformations, and other features similar to Three.js but with SVG as the rendering backend.

## Directory Structure

```
svg3d/
├── lib/                       # Core library files
│   ├── core/                  # Core components
│   │   ├── Object3D.js        # Base class for all 3D objects
│   │   ├── Scene.js           # Scene container
│   │   ├── SceneGraph.js      # Scene graph management
│   │   └── Renderer.js        # Main SVG renderer
│   ├── math/                  # Math utilities
│   │   ├── Vector3.js         # 3D vector implementation
│   │   ├── Matrix4.js         # 4x4 matrix for transformations
│   │   ├── Quaternion.js      # Quaternion for rotations
│   │   └── MathUtils.js       # General math utilities
│   ├── cameras/               # Camera implementations
│   │   ├── Camera.js          # Base camera class
│   │   ├── PerspectiveCamera.js  # Perspective projection camera
│   │   └── OrthographicCamera.js # Orthographic projection camera
│   ├── objects/               # 3D object implementations
│   │   ├── Mesh.js            # Basic mesh object
│   │   ├── Group.js           # Group container for multiple objects
│   │   ├── Line.js            # Line object
│   │   └── Points.js          # Points object
│   ├── geometries/            # Geometry implementations
│   │   ├── Geometry.js        # Base geometry class
│   │   ├── BoxGeometry.js     # Cube geometry
│   │   ├── SphereGeometry.js  # Sphere geometry
│   │   ├── PlaneGeometry.js   # Plane geometry
│   │   ├── CylinderGeometry.js # Cylinder geometry
│   │   └── TorusGeometry.js   # Torus geometry
│   ├── materials/             # Material implementations
│   │   ├── Material.js        # Base material class
│   │   ├── BasicMaterial.js   # Simple color material
│   │   ├── LambertMaterial.js # Basic diffuse lighting
│   │   └── WireframeMaterial.js # Wireframe rendering
│   ├── lights/                # Light implementations
│   │   ├── Light.js           # Base light class
│   │   ├── DirectionalLight.js # Directional light
│   │   └── AmbientLight.js    # Ambient light
│   ├── controls/              # User interaction controls
│   │   ├── OrbitControls.js   # Orbit camera controls
│   │   └── TransformControls.js # Object transformation controls
│   ├── loaders/               # Model loaders
│   │   └── OBJLoader.js       # Simple OBJ file loader
│   └── svg3d.js               # Main library entry point (exports everything)
```

## Core Library Design

### Key Components

1. **Object3D**: Base class for all objects in the 3D scene
   - Maintains position, rotation, scale
   - Handles parent-child relationships
   - Computes world matrix

2. **Scene**: Container for all objects to be rendered
   - Manages the scene graph
   - Handles adding/removing objects

3. **Renderer**: Handles rendering the scene
   - Creates and manages SVG elements
   - Performs view transformations
   - Handles z-sorting and visibility

4. **Camera**: Defines the view into the scene
   - PerspectiveCamera: Perspective projection
   - OrthographicCamera: Orthographic projection

5. **Geometry**: Defines the vertex and face data
   - Various predefined shapes
   - Support for custom geometries

6. **Material**: Defines appearance properties
   - Color, wireframe, opacity
   - Basic lighting properties

## Usage Example

Here's how the API would be used in an application:

```javascript
// Import the library
import { Scene, PerspectiveCamera, Renderer, BoxGeometry, Mesh, BasicMaterial, OrbitControls } from 'svg3d';

// Create scene
const scene = new Scene();

// Create camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create renderer
const renderer = new Renderer({
  container: document.getElementById('scene-container'),
  width: window.innerWidth,
  height: window.innerHeight
});

// Create geometry
const geometry = new BoxGeometry(1, 1, 1);

// Create material
const material = new BasicMaterial({ color: '#3080ff' });

// Create mesh
const cube = new Mesh(geometry, material);
scene.add(cube);

// Add camera controls
const controls = new OrbitControls(camera, renderer.domElement);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update objects
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  // Update controls
  controls.update();
  
  // Render scene
  renderer.render(scene, camera);
}

// Start animation
animate();
```