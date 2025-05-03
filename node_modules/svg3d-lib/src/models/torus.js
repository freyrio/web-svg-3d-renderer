export function generateTorus(outerRadius, innerRadius, radialSegments, tubularSegments) {
  const vertices = [];
  const faces = [];

  // Generate vertices
  for (let j = 0; j <= radialSegments; j++) {
    for (let i = 0; i <= tubularSegments; i++) {
      const u = i / tubularSegments * Math.PI * 2;
      const v = j / radialSegments * Math.PI * 2;

      const x = (outerRadius + innerRadius * Math.cos(v)) * Math.cos(u);
      const y = innerRadius * Math.sin(v);
      const z = (outerRadius + innerRadius * Math.cos(v)) * Math.sin(u);

      vertices.push({ x, y, z });
    }
  }

  // Generate faces
  for (let j = 1; j <= radialSegments; j++) {
    for (let i = 1; i <= tubularSegments; i++) {
      const a = (tubularSegments + 1) * j + i - 1;
      const b = (tubularSegments + 1) * (j - 1) + i - 1;
      const c = (tubularSegments + 1) * (j - 1) + i;
      const d = (tubularSegments + 1) * j + i;

      faces.push([a, b, c, d]);
    }
  }

  return { vertices, faces };
} 