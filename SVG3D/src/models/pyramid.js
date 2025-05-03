export function generatePyramid(baseSize, height) {
  const halfBase = baseSize / 2;
  const halfHeight = height / 2;

  // Define vertices
  const vertices = [
    { x: 0, y: -halfHeight, z: 0 },               // 0: top
    { x: -halfBase, y: halfHeight, z: -halfBase }, // 1: front-left
    { x: halfBase, y: halfHeight, z: -halfBase },  // 2: front-right
    { x: halfBase, y: halfHeight, z: halfBase },   // 3: back-right
    { x: -halfBase, y: halfHeight, z: halfBase }   // 4: back-left
  ];

  // Define faces (indices into vertices array)
  const faces = [
    [0, 2, 1],    // front face
    [0, 3, 2],    // right face
    [0, 4, 3],    // back face
    [0, 1, 4],    // left face
    [1, 2, 3, 4]  // bottom face
  ];

  return { vertices, faces };
} 