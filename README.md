# SVG3D Project

A project demonstrating 3D rendering in the browser using SVG, with a separation between the rendering library and the editor application.

## Project Structure

The project is divided into two main parts:

### SVG3D Library

A rendering library that implements 3D rendering using SVG. It provides:

- Math utilities for 3D operations
- Scene management
- Camera system
- SVG-based rendering
- Model loading and manipulation

### Editor Application

A React-based application that uses the SVG3D library to provide a 3D editing experience, similar to how Three.js would be used. It includes:

- UI controls for manipulating the scene
- Viewport for visualizing the 3D scene
- User interaction handlers
- Scene configuration

## Development

This project uses npm workspaces to manage the dependencies between the packages.

### Setup

```bash
# Install dependencies for all workspaces
npm install

# Build the SVG3D library
npm run build:lib

# Start the Editor application dev server
npm run dev:editor
```

### Working on the Library

```bash
# Run the library dev server
npm run dev:lib

# Build the library
npm run build:lib
```

### Working on the Editor

```bash
# Run the Editor dev server (after building the library)
npm run dev:editor

# Build the Editor for production
npm run build:editor
```

## License

This project is licensed under the MIT License. 