# SVG3D Library

A lightweight 3D rendering library that uses SVG for graphics output.

## Features

- 3D math utilities (vectors, matrices)
- Scene management
- Camera controls
- 3D to SVG rendering pipeline

## Installation

```bash
npm install svg3d-lib
```

## Usage

```javascript
import { SceneManager, CameraManager, SceneRenderer } from 'svg3d-lib';

// Initialize your 3D scene
const scene = new SceneManager();
const camera = new CameraManager();
const renderer = new SceneRenderer();

// Add objects to your scene
// ...

// Render the scene
renderer.render(scene, camera);
```

## Development

```bash
# Build the library
npm run build

# Lint the code
npm run lint
```
