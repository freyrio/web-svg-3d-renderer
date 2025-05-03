import { adjustColorBrightness, mapRange } from '../math/utils';

// Define standard light vectors based on direction names
const LIGHT_VECTORS = {
  front: { x: 0, y: 0, z: -1 }, // Default
  top:   { x: 0, y: -1, z: 0 },
  side:  { x: -1, y: 0, z: 0 },
};

/**
 * Calculates the fill color for a face based on render options and face data.
 * @param {object} faceData - Object containing face vertices, depth, and normal.
 * @param {object} options - Render options (baseColor, lightDirection, shadingMode).
 * @returns {string} The calculated hex color string.
 */
export function calculateFaceColor(faceData, options) {
  const { normal, depth } = faceData;
  const { baseColor, lightDirection, shadingMode } = options;

  let finalColor = baseColor;

  if (shadingMode === 'flat') {
    // Get the light vector based on the selected direction
    const lightVector = LIGHT_VECTORS[lightDirection] || LIGHT_VECTORS.front;

    // Calculate lighting intensity based on the dot product of the face normal and light vector
    // Dot product range is -1 (light opposite) to 1 (light aligned)
    const dotProduct = normal.x * lightVector.x +
                       normal.y * lightVector.y +
                       normal.z * lightVector.z;

    // Map dot product to brightness factor (e.g., 0.5 to 1.0)
    // We use max(0, -dotProduct) because we want faces pointing *away* from the light to be brighter (assuming light source is behind viewer)
    // Adjust the baseline (0.5) and scale (0.5) as needed for desired effect.
    const lightIntensityFactor = 0.5 + Math.max(0, -dotProduct) * 0.5;

    finalColor = adjustColorBrightness(baseColor, lightIntensityFactor);

  } else if (shadingMode === 'gradient') {
    // Simple depth-based gradient shading
    // Map the face depth to a brightness factor
    // Adjust the input range (-500, 500) and output range (0.5, 1.5) as needed.
    const depthFactor = mapRange(depth, -500, 500, 0.5, 1.5);

    finalColor = adjustColorBrightness(baseColor, depthFactor);
  }
  // If other shading modes existed, they would go here.

  return finalColor;
} 