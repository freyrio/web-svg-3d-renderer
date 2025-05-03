// --- Helper function to calculate face normal ---
function calculateNormal(v0, v1, v2) {
  if (!v0 || !v1 || !v2) {
      return { x: 0, y: 0, z: 0 }; // Not enough vertices
  }
  // Vectors edge1 = v1 - v0, edge2 = v2 - v0
  const edge1 = {
    x: v1.x - v0.x,
    y: v1.y - v0.y,
    z: v1.z - v0.z
  };
  const edge2 = {
    x: v2.x - v0.x,
    y: v2.y - v0.y,
    z: v2.z - v0.z
  };

  // Cross product edge1 x edge2
  const normal = {
    x: edge1.y * edge2.z - edge1.z * edge2.y,
    y: edge1.z * edge2.x - edge1.x * edge2.z,
    z: edge1.x * edge2.y - edge1.y * edge2.x
  };

  // Normalize the normal vector
  const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
  if (length > 0) {
    normal.x /= length;
    normal.y /= length;
    normal.z /= length;
  }

  return normal;
}

/**
 * Calculates derived data for a single face (depth, normal) from its transformed vertices.
 * @param {Array<number>} faceIndices - Array of indices into the transformedVertices array.
 * @param {Array<object>} transformedVertices - Array of all transformed vertices for the model.
 * @param {number} originalIndex - The original index of the face in the model's face array.
 * @returns {object | null} Object containing vertices, depth, normal, and originalIndex, or null if face should be clipped.
 */
function calculateAndClipFaceData(faceIndices, transformedVertices, originalIndex, nearPlane) {
  const faceVertices = faceIndices.map(index => transformedVertices[index]);

  // Near plane clipping: Check if ALL vertices are behind the near plane (z >= nearPlane)
  // A more robust clipping algorithm would clip the polygon edges, but this is simpler.
  let allVerticesBehind = true;
  for (const v of faceVertices) {
      if (!v || v.z < nearPlane) { // Check if vertex exists and is in front of the plane
          allVerticesBehind = false;
          break;
      }
  }
  // If all vertices are behind the near plane, clip the entire face
  if (allVerticesBehind) {
      return null;
  }
  
  // TODO: A more advanced approach would clip faces that *intersect* the near plane.
  // For now, we only clip faces entirely behind it.

  // Calculate face center and average depth (using projected Z for sorting)
  let sumX = 0, sumY = 0, sumDepth = 0;
  let validVertices = 0;
  faceVertices.forEach(v => {
      // Ensure vertices are valid (e.g., not projected to infinity)
      if (v && isFinite(v.projectedX) && isFinite(v.projectedY)) {
          sumX += v.projectedX;
          sumY += v.projectedY;
          sumDepth += v.projectedZ;
          validVertices++;
      }
  });

  // Avoid division by zero if no valid vertices
  const depth = validVertices > 0 ? sumDepth / validVertices : -Infinity;
  const centerX = validVertices > 0 ? sumX / validVertices : 0;
  const centerY = validVertices > 0 ? sumY / validVertices : 0;

  // Calculate face normal using the *rotated* (not projected) vertices
  const normal = calculateNormal(faceVertices[0], faceVertices[1], faceVertices[2]);

  return {
    vertices: faceVertices, // The array of transformed vertex objects for this face
    depth,
    normal,
    centerX, // Center X (projected)
    centerY, // Center Y (projected)
    originalIndex // Keep track of the original face if needed
  };
}

/**
 * Processes model faces to calculate depth and normals, performs near-plane clipping, then sorts them using Painter's Algorithm.
 * @param {Array<Array<number>>} modelFaces - Array of faces, where each face is an array of vertex indices.
 * @param {Array<object>} transformedVertices - Array of all transformed vertices for the model.
 * @param {number} nearPlaneDistance - The z-distance of the near clipping plane (should be less than camera.distance).
 * @returns {Array<object>} Array of face data objects, clipped and sorted by depth (furthest first).
 */
export function processAndSortFaces(modelFaces, transformedVertices, nearPlaneDistance) {
  if (!modelFaces || !transformedVertices) {
    return [];
  }

  const facesWithData = modelFaces
    .map((faceIndices, index) =>
      calculateAndClipFaceData(faceIndices, transformedVertices, index, nearPlaneDistance)
    )
    .filter(Boolean); // Filter out null faces that were clipped

  // Sort remaining faces by depth (descending order - furthest away first)
  facesWithData.sort((a, b) => b.depth - a.depth);

  return facesWithData;
} 