export function generateCylinder(radius, height, segments) {
  const vertices = [];
  const faces = [];

  const halfHeight = height / 2;

  // Generate vertices
  // Top and bottom center points
  vertices.push({ x: 0, y: -halfHeight, z: 0 });  // Top center (0)
  vertices.push({ x: 0, y: halfHeight, z: 0 });   // Bottom center (1)

  // Generate circle vertices for top and bottom caps
  for (let i = 0; i < segments; i++) {
    const angle = i * 2 * Math.PI / segments;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);

    // Top rim vertex
    vertices.push({ x, y: -halfHeight, z });

    // Bottom rim vertex
    vertices.push({ x, y: halfHeight, z });
  }

  // Generate faces for the cylinder walls
  for (let i = 0; i < segments; i++) {
    const topIdx = 2 + i * 2;       // Top rim vertex
    const bottomIdx = 3 + i * 2;    // Bottom rim vertex
    const nextTopIdx = 2 + ((i + 1) % segments) * 2;    // Next top rim vertex
    const nextBottomIdx = 3 + ((i + 1) % segments) * 2; // Next bottom rim vertex

    // Wall face
    faces.push([topIdx, nextTopIdx, nextBottomIdx, bottomIdx]);

    // Top cap triangle
    faces.push([0, nextTopIdx, topIdx]);

    // Bottom cap triangle
    faces.push([1, bottomIdx, nextBottomIdx]);
  }

  return { vertices, faces };
} 