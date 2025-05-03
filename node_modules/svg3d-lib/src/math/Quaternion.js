import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';
import { degToRad } from './utils';

/**
 * Class representing a quaternion for smooth 3D rotations.
 * Quaternions avoid gimbal lock and provide better interpolation than Euler angles.
 */
export class Quaternion {
  /**
   * Create a quaternion.
   * @param {number} x - The x component (imaginary i).
   * @param {number} y - The y component (imaginary j).
   * @param {number} z - The z component (imaginary k).
   * @param {number} w - The w component (real).
   */
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * Set the quaternion components.
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @param {number} w - The w component.
   * @returns {Quaternion} This quaternion for chaining.
   */
  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  /**
   * Set this quaternion from a rotation specified by an axis and angle.
   * @param {Vector3} axis - Rotation axis, should be normalized.
   * @param {number} angle - Rotation angle in degrees.
   * @returns {Quaternion} This quaternion for chaining.
   */
  setFromAxisAngle(axis, angle) {
    // Convert angle to radians
    const halfAngle = degToRad(angle) / 2;
    const s = Math.sin(halfAngle);

    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos(halfAngle);

    return this;
  }

  /**
   * Set the quaternion from Euler angles (in degrees).
   * @param {number} x - Rotation around x-axis in degrees.
   * @param {number} y - Rotation around y-axis in degrees.
   * @param {number} z - Rotation around z-axis in degrees.
   * @returns {Quaternion} This quaternion for chaining.
   */
  setFromEuler(x, y, z) {
    // Convert to radians
    const xRad = degToRad(x) / 2;
    const yRad = degToRad(y) / 2;
    const zRad = degToRad(z) / 2;

    // Calculate sine and cosine
    const cx = Math.cos(xRad);
    const sx = Math.sin(xRad);
    const cy = Math.cos(yRad);
    const sy = Math.sin(yRad);
    const cz = Math.cos(zRad);
    const sz = Math.sin(zRad);

    // XYZ order (most common for 3D graphics)
    this.x = sx * cy * cz + cx * sy * sz;
    this.y = cx * sy * cz - sx * cy * sz;
    this.z = cx * cy * sz + sx * sy * cz;
    this.w = cx * cy * cz - sx * sy * sz;

    return this;
  }

  /**
   * Set the quaternion from a rotation matrix.
   * @param {Matrix4} m - The rotation matrix.
   * @returns {Quaternion} This quaternion for chaining.
   */
  setFromRotationMatrix(m) {
    const elements = m.elements;
    const m11 = elements[0], m12 = elements[4], m13 = elements[8];
    const m21 = elements[1], m22 = elements[5], m23 = elements[9];
    const m31 = elements[2], m32 = elements[6], m33 = elements[10];

    const trace = m11 + m22 + m33;

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1.0);
      this.w = 0.25 / s;
      this.x = (m32 - m23) * s;
      this.y = (m13 - m31) * s;
      this.z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
      this.w = (m32 - m23) / s;
      this.x = 0.25 * s;
      this.y = (m12 + m21) / s;
      this.z = (m13 + m31) / s;
    } else if (m22 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
      this.w = (m13 - m31) / s;
      this.x = (m12 + m21) / s;
      this.y = 0.25 * s;
      this.z = (m23 + m32) / s;
    } else {
      const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
      this.w = (m21 - m12) / s;
      this.x = (m13 + m31) / s;
      this.y = (m23 + m32) / s;
      this.z = 0.25 * s;
    }

    return this;
  }

  /**
   * Convert the quaternion to Euler angles (in degrees).
   * @returns {Vector3} The euler angles (x, y, z in degrees).
   */
  toEuler() {
    // Convert to Euler angles in radians
    const x = Math.atan2(2 * (this.w * this.x + this.y * this.z), 1 - 2 * (this.x * this.x + this.y * this.y));
    
    // Avoid singularities (gimbal lock) at the poles
    let y = Math.asin(2 * (this.w * this.y - this.z * this.x));
    if (Math.abs(2 * (this.w * this.y - this.z * this.x)) >= 1) {
      y = Math.sign(2 * (this.w * this.y - this.z * this.x)) * Math.PI / 2;
    }
    
    const z = Math.atan2(2 * (this.w * this.z + this.x * this.y), 1 - 2 * (this.y * this.y + this.z * this.z));

    // Convert to degrees
    return new Vector3(
      x * (180 / Math.PI),
      y * (180 / Math.PI),
      z * (180 / Math.PI)
    );
  }

  /**
   * Normalize this quaternion.
   * @returns {Quaternion} This quaternion for chaining.
   */
  normalize() {
    let length = Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z +
      this.w * this.w
    );

    if (length === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      length = 1 / length;
      this.x *= length;
      this.y *= length;
      this.z *= length;
      this.w *= length;
    }

    return this;
  }

  /**
   * Calculate the length of this quaternion.
   * @returns {number} The length.
   */
  length() {
    return Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z +
      this.w * this.w
    );
  }

  /**
   * Calculate the squared length of this quaternion (more efficient).
   * @returns {number} The squared length.
   */
  lengthSquared() {
    return (
      this.x * this.x +
      this.y * this.y +
      this.z * this.z +
      this.w * this.w
    );
  }

  /**
   * Multiply this quaternion by another quaternion.
   * @param {Quaternion} q - The quaternion to multiply by.
   * @returns {Quaternion} This quaternion for chaining.
   */
  multiply(q) {
    const qax = this.x, qay = this.y, qaz = this.z, qaw = this.w;
    const qbx = q.x, qby = q.y, qbz = q.z, qbw = q.w;

    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  }

  /**
   * Set this quaternion to the product of two quaternions.
   * @param {Quaternion} a - The first quaternion.
   * @param {Quaternion} b - The second quaternion.
   * @returns {Quaternion} This quaternion for chaining.
   */
  multiplyQuaternions(a, b) {
    const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
    const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  }

  /**
   * Calculate the inverse (conjugate for unit quaternions) of this quaternion.
   * @returns {Quaternion} A new quaternion representing the inverse.
   */
  inverse() {
    // For a unit quaternion, the inverse is just the conjugate
    // For non-unit quaternions, we need to normalize
    const norm = this.lengthSquared();
    
    if (norm > 0) {
      const invNorm = 1 / norm;
      return new Quaternion(
        -this.x * invNorm,
        -this.y * invNorm,
        -this.z * invNorm,
        this.w * invNorm
      );
    }
    
    // Return identity if length is zero
    return new Quaternion();
  }

  /**
   * Calculate the conjugate of this quaternion.
   * @returns {Quaternion} A new quaternion representing the conjugate.
   */
  conjugate() {
    return new Quaternion(
      -this.x,
      -this.y,
      -this.z,
      this.w
    );
  }

  /**
   * Spherical linear interpolation between two quaternions.
   * @param {Quaternion} q1 - Starting quaternion.
   * @param {Quaternion} q2 - Ending quaternion.
   * @param {number} t - Interpolation factor (0 to 1).
   * @returns {Quaternion} This quaternion for chaining.
   */
  slerp(q1, q2, t) {
    // Clamp t to [0, 1]
    const clampedT = Math.max(0, Math.min(1, t));
    
    // Calculate cosine of angle between quaternions
    let cosHalfTheta = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    
    // If q1 and q2 are too close, just linearly interpolate
    if (Math.abs(cosHalfTheta) >= 1.0) {
      this.x = q1.x;
      this.y = q1.y;
      this.z = q1.z;
      this.w = q1.w;
      return this;
    }
    
    // Calculate interpolation parameters
    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
    
    // Check if we need to take the long or short path
    let q2x = q2.x, q2y = q2.y, q2z = q2.z, q2w = q2.w;
    if (cosHalfTheta < 0) {
      q2x = -q2x;
      q2y = -q2y;
      q2z = -q2z;
      q2w = -q2w;
      cosHalfTheta = -cosHalfTheta;
    }
    
    // Calculate factors
    const ratioA = Math.sin((1 - clampedT) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(clampedT * halfTheta) / sinHalfTheta;
    
    // Interpolate
    this.x = q1.x * ratioA + q2x * ratioB;
    this.y = q1.y * ratioA + q2y * ratioB;
    this.z = q1.z * ratioA + q2z * ratioB;
    this.w = q1.w * ratioA + q2w * ratioB;
    
    return this;
  }

  /**
   * Rotate a vector by this quaternion.
   * @param {Vector3} v - The vector to rotate.
   * @returns {Vector3} A new vector representing the rotated vector.
   */
  rotateVector(v) {
    // Create a pure quaternion from the vector
    const qv = new Quaternion(v.x, v.y, v.z, 0);
    
    // Calculate q * v * q^-1
    const qInv = this.conjugate();
    const qr = new Quaternion().multiplyQuaternions(
      this,
      new Quaternion().multiplyQuaternions(qv, qInv)
    );
    
    // Return the vector part
    return new Vector3(qr.x, qr.y, qr.z);
  }

  /**
   * Clone this quaternion.
   * @returns {Quaternion} A new quaternion with the same components.
   */
  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * Copy the components from another quaternion.
   * @param {Quaternion} q - The quaternion to copy from.
   * @returns {Quaternion} This quaternion for chaining.
   */
  copy(q) {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  }

  /**
   * Convert this quaternion to a 4x4 rotation matrix.
   * @returns {Matrix4} A rotation matrix representing this quaternion.
   */
  toMatrix4() {
    const matrix = new Matrix4();
    const elements = matrix.elements;
    
    const xx = this.x * this.x;
    const xy = this.x * this.y;
    const xz = this.x * this.z;
    const xw = this.x * this.w;
    
    const yy = this.y * this.y;
    const yz = this.y * this.z;
    const yw = this.y * this.w;
    
    const zz = this.z * this.z;
    const zw = this.z * this.w;
    
    elements[0] = 1 - 2 * (yy + zz);
    elements[4] = 2 * (xy - zw);
    elements[8] = 2 * (xz + yw);
    
    elements[1] = 2 * (xy + zw);
    elements[5] = 1 - 2 * (xx + zz);
    elements[9] = 2 * (yz - xw);
    
    elements[2] = 2 * (xz - yw);
    elements[6] = 2 * (yz + xw);
    elements[10] = 1 - 2 * (xx + yy);
    
    // Bottom row
    elements[3] = 0;
    elements[7] = 0;
    elements[11] = 0;
    
    // Right column
    elements[12] = 0;
    elements[13] = 0;
    elements[14] = 0;
    elements[15] = 1;
    
    return matrix;
  }
} 