/**
 * Converts degrees to radians.
 * @param {number} degrees Angle in degrees.
 * @returns {number} Angle in radians.
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Normalizes an angle to a value between 0 and 360 degrees
 * @param {number} angle - The angle in degrees
 * @returns {number} Normalized angle between 0 and 360
 */
export function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

/**
 * Converts radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Adjusts the brightness of a hex color.
 * @param {string} hexColor Color in hex format (e.g., "#ff0000").
 * @param {number} factor Brightness factor (e.g., 1.0 is no change, 0.5 is darker, 1.5 is brighter).
 * @returns {string} Adjusted color in hex format.
 */
export function adjustColorBrightness(hexColor, factor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Adjust brightness, clamping between 0 and 255
  const adjustR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const adjustG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const adjustB = Math.min(255, Math.max(0, Math.round(b * factor)));

  // Convert back to hex
  return `#${adjustR.toString(16).padStart(2, '0')}${adjustG.toString(16).padStart(2, '0')}${adjustB.toString(16).padStart(2, '0')}`;
}

/**
 * Maps a value from one range to another.
 * @param {number} value The value to map.
 * @param {number} fromLow The lower bound of the source range.
 * @param {number} fromHigh The upper bound of the source range.
 * @param {number} toLow The lower bound of the target range.
 * @param {number} toHigh The upper bound of the target range.
 * @returns {number} The mapped value.
 */
export function mapRange(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}

/**
 * Clamps a value between a minimum and maximum
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
} 