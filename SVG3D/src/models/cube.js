export function generateCube(size) {
  const halfSize = size / 2;

  // Define vertices
  const vertices = [
    { x: -halfSize, y: -halfSize, z: -halfSize }, // 0: front-top-left
    { x: halfSize, y: -halfSize, z: -halfSize },  // 1: front-top-right
    { x: halfSize, y: halfSize, z: -halfSize },   // 2: front-bottom-right
    { x: -halfSize, y: halfSize, z: -halfSize },  // 3: front-bottom-left
    { x: -halfSize, y: -halfSize, z: halfSize },  // 4: back-top-left
    { x: halfSize, y: -halfSize, z: halfSize },   // 5: back-top-right
    { x: halfSize, y: halfSize, z: halfSize },    // 6: back-bottom-right
    { x: -halfSize, y: halfSize, z: halfSize }    // 7: back-bottom-left
  ];

  // Define faces (indices into vertices array)
  const faces = [
    [0, 1, 2, 3], // front
    [5, 4, 7, 6], // back
    [4, 0, 3, 7], // left
    [1, 5, 6, 2], // right
    [4, 5, 1, 0], // top
    [3, 2, 6, 7]  // bottom
  ];

  return { vertices, faces };
} 