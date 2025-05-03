import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';
import { Quaternion } from '../math/Quaternion';

/**
 * Base class for all objects in the 3D scene.
 * Handles transformation hierarchy and parent-child relationships.
 */
export class Object3D {
  constructor() {
    this.id = crypto.randomUUID(); // Unique identifier
    this.name = '';
    this.visible = true;
    
    // Transform properties
    this.position = new Vector3();
    this.rotation = new Vector3();         // Euler angles in radians (consistent with Math.cos/sin)
    this.quaternion = new Quaternion();    // Quaternion representation of rotation
    this.scale = new Vector3(1, 1, 1);
    
    // Matrices
    this.matrix = new Matrix4();
    this.worldMatrix = new Matrix4();
    
    // Scene graph
    this.parent = null;
    this.children = [];
    
    // Flags
    this.matrixNeedsUpdate = true;
    this.useQuaternion = false;  // Whether to use quaternion or Euler angles for rotation
  }
  
  /**
   * Adds a child object to this object
   * @param {Object3D} object - The object to add as a child
   * @returns {Object3D} This object (for chaining)
   */
  add(object) {
    if (object === this) {
      console.error("Object3D.add: An object can't be added as a child of itself.");
      return this;
    }
    
    if (object.parent !== null) {
      object.parent.remove(object);
    }
    
    object.parent = this;
    this.children.push(object);
    
    return this;
  }
  
  /**
   * Removes a child object from this object
   * @param {Object3D} object - The object to remove
   * @returns {Object3D} This object (for chaining)
   */
  remove(object) {
    const index = this.children.indexOf(object);
    if (index !== -1) {
      object.parent = null;
      this.children.splice(index, 1);
    }
    return this;
  }
  
  /**
   * Updates the local matrix from position, rotation, and scale
   * @returns {Object3D} This object (for chaining)
   */
  updateMatrix() {
    // Create transformation matrices (use radians for rotation)
    const translation = new Matrix4().makeTranslation(
      this.position.x, 
      this.position.y, 
      this.position.z
    );
    
    const rotationX = new Matrix4().makeRotationX(this.rotation.x);
    const rotationY = new Matrix4().makeRotationY(this.rotation.y);
    const rotationZ = new Matrix4().makeRotationZ(this.rotation.z);

    // Note: Prototype code applies Y * X * Z but calls makeRotation with X, Y, Z arguments.
    // Standard Euler order is often ZYX or XYZ. Let's stick to prototype's apparent YXZ order.
    // If issues arise, this multiplication order might need review.
    const rotation = new Matrix4().multiplyMatrices(rotationY, rotationX).multiply(rotationZ);

    const scale = new Matrix4().set(
        this.scale.x, 0, 0, 0,
        0, this.scale.y, 0, 0,
        0, 0, this.scale.z, 0,
        0, 0, 0, 1
    );

    // Combine transformations: T * R * S for row-major
    this.matrix.identity()
      .multiplyMatrices(translation, rotation) // T * R
      .multiply(scale);                     // (T * R) * S
    
    return this;
  }
  
  /**
   * Updates the world matrix by combining parent's world matrix with this object's local matrix
   * @param {boolean} forceUpdate - Whether to force an update of the local matrix
   * @returns {Object3D} This object (for chaining)
   */
  updateWorldMatrix(forceUpdate = false) {
    // Force update local matrix first if needed
    // (Prototype implicitly updated matrix before calling world update)
    this.updateMatrix(); 

    if (this.parent === null) {
      this.worldMatrix.copy(this.matrix);
    } else {
      // Multiply parent's world matrix by local matrix
      this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.matrix);
    }
    
    // Update children
    // Use standard for loop for potentially better performance than forEach
    const children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      children[i].updateWorldMatrix(forceUpdate); // Prototype just passed forceUpdate
    }
    
    return this;
  }
  
  /**
   * Set rotation using a quaternion
   * @param {Quaternion} q - The quaternion to set
   * @returns {Object3D} This object (for chaining)
   */
  setRotationFromQuaternion(q) {
    this.quaternion.copy(q);
    this.useQuaternion = true;
    this.matrixNeedsUpdate = true;
    
    // Update Euler angles for compatibility
    const euler = this.quaternion.toEuler();
    this.rotation.set(euler.x, euler.y, euler.z);
    
    return this;
  }
  
  /**
   * Set rotation using Euler angles (in degrees)
   * @param {number} x - Rotation around x-axis in degrees
   * @param {number} y - Rotation around y-axis in degrees
   * @param {number} z - Rotation around z-axis in degrees
   * @returns {Object3D} This object (for chaining)
   */
  setRotationFromEuler(x, y, z) {
    this.rotation.set(x, y, z);
    this.useQuaternion = false;
    this.matrixNeedsUpdate = true;
    
    // Update quaternion for compatibility
    this.quaternion.setFromEuler(x, y, z);
    
    return this;
  }
  
  /**
   * Set this object's rotation to look at a specific point
   * @param {Vector3} target - The point to look at
   * @returns {Object3D} This object (for chaining)
   */
  lookAt(target) {
    // Calculate direction vector (normalized)
    const direction = new Vector3(
      target.x - this.position.x,
      target.y - this.position.y,
      target.z - this.position.z
    );
    const length = Math.sqrt(
      direction.x * direction.x +
      direction.y * direction.y +
      direction.z * direction.z
    );
    
    if (length === 0) return this;
    
    direction.x /= length;
    direction.y /= length;
    direction.z /= length;
    
    // Set default up vector
    const up = new Vector3(0, 1, 0);
    
    // Calculate right vector using cross product of up and direction
    const right = new Vector3(
      up.y * direction.z - up.z * direction.y,
      up.z * direction.x - up.x * direction.z,
      up.x * direction.y - up.y * direction.x
    );
    
    // Recalculate up vector to ensure orthogonality
    const realUp = new Vector3(
      direction.y * right.z - direction.z * right.y,
      direction.z * right.x - direction.x * right.z,
      direction.x * right.y - direction.y * right.x
    );
    
    // Create a rotation matrix
    const rotMatrix = new Matrix4();
    const elements = rotMatrix.elements;
    
    // Set the matrix columns
    elements[0] = right.x;
    elements[4] = right.y;
    elements[8] = right.z;
    
    elements[1] = realUp.x;
    elements[5] = realUp.y;
    elements[9] = realUp.z;
    
    elements[2] = -direction.x;
    elements[6] = -direction.y;
    elements[10] = -direction.z;
    
    // Set rotation from matrix
    this.quaternion.setFromRotationMatrix(rotMatrix);
    this.useQuaternion = true;
    this.matrixNeedsUpdate = true;
    
    // Update Euler angles
    const euler = this.quaternion.toEuler();
    this.rotation.set(euler.x, euler.y, euler.z);
    
    return this;
  }
  
  /**
   * Traverses the object and its children, calling a callback for each object
   * @param {Function} callback - Function to call for each object
   */
  traverse(callback) {
    callback(this);
    
    for (const child of this.children) {
      child.traverse(callback);
    }
  }
  
  /**
   * Makes a clone of this object but not its children
   * @returns {Object3D} A new object with the same properties
   */
  clone() {
    const object = new Object3D();
    
    object.name = this.name;
    object.visible = this.visible;
    
    object.position.set(this.position.x, this.position.y, this.position.z);
    object.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    object.quaternion.copy(this.quaternion);
    object.scale.set(this.scale.x, this.scale.y, this.scale.z);
    
    object.matrix.copy(this.matrix);
    object.useQuaternion = this.useQuaternion;
    object.matrixNeedsUpdate = this.matrixNeedsUpdate;
    
    return object;
  }
} 