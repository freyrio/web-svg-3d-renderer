import { degToRad } from '../math/utils';

/**
 * Transforms a 3D vertex based on camera rotation and projects it into 2D space.
 * @param {{x: number, y: number, z: number}} vertex - The original vertex.
 * @param {{rotationX: number, rotationY: number, rotationZ: number, distance: number}} camera - Camera state.
 * @returns {{x: number, y: number, z: number, projectedX: number, projectedY: number, projectedZ: number}} Transformed vertex with 2D projection.
 */
export function transformAndProjectVertex(vertex, camera) {
  // Safety check for NaN values in camera
  const rotX = isNaN(camera.rotationX) ? 0 : camera.rotationX;
  const rotY = isNaN(camera.rotationY) ? 0 : camera.rotationY;
  const rotZ = isNaN(camera.rotationZ) ? 0 : camera.rotationZ;
  const dist = isNaN(camera.distance) ? 800 : camera.distance;

  const radX = degToRad(rotX);
  const radY = degToRad(rotY);
  const radZ = degToRad(rotZ);

  // Safety check for NaN values in vertex
  let x = isNaN(vertex.x) ? 0 : vertex.x;
  let y = isNaN(vertex.y) ? 0 : vertex.y;
  let z = isNaN(vertex.z) ? 0 : vertex.z;

  // Temporary variables for rotation steps
  let tempX, tempY, tempZ;

  // Rotate around Z-axis
  tempX = x;
  tempY = y;
  x = tempX * Math.cos(radZ) - tempY * Math.sin(radZ);
  y = tempX * Math.sin(radZ) + tempY * Math.cos(radZ);

  // Rotate around X-axis
  tempY = y;
  tempZ = z;
  y = tempY * Math.cos(radX) - tempZ * Math.sin(radX);
  z = tempY * Math.sin(radX) + tempZ * Math.cos(radX);

  // Rotate around Y-axis
  tempX = x;
  tempZ = z;
  x = tempX * Math.cos(radY) + tempZ * Math.sin(radY);
  z = -tempX * Math.sin(radY) + tempZ * Math.cos(radY);

  // Apply perspective projection
  // Avoid division by zero or projecting points behind the camera
  const perspectiveFactor = dist - z;
  // Re-introduce safety check: Set scale to 0 if behind camera or if result is NaN
  const scale = perspectiveFactor > 0 ? dist / perspectiveFactor : 0;

  // Final safety check for projections
  const projectedX = isFinite(x * scale) ? x * scale : 0;
  const projectedY = isFinite(y * scale) ? y * scale : 0;

  return {
    x, // Rotated X
    y, // Rotated Y
    z, // Rotated Z (depth before projection)
    projectedX,
    projectedY,
    projectedZ: z // Use rotated Z for depth sorting
  };
} 