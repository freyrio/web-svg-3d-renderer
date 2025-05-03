import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';
import { Mesh } from '../objects/Mesh';

/**
 * Represents a ray used for intersection testing (picking) in the 3D scene.
 */
export class Raycaster {
    /**
     * Creates a new Raycaster.
     * @param {Vector3} [origin] - The origin point of the ray.
     * @param {Vector3} [direction] - The direction vector of the ray (should be normalized).
     * @param {number} [near=0] - The near distance threshold for intersections.
     * @param {number} [far=Infinity] - The far distance threshold for intersections.
     */
    constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1), near = 0, far = Infinity) {
        this.origin = origin;
        this.direction = direction;
        this.near = near;
        this.far = far;
        this.camera = null; // Reference to the camera, used by setFromCamera
        this._ray = { // Internal representation if needed, maybe rename properties later
            origin: this.origin,
            direction: this.direction
        };
    }

    /**
     * Sets the origin and direction of the ray.
     * @param {Vector3} origin - The origin point.
     * @param {Vector3} direction - The direction vector (should be normalized).
     */
    set(origin, direction) {
        this.origin.copy(origin);
        this.direction.copy(direction).normalize(); // Ensure direction is normalized
    }

    /**
     * Sets the ray from a camera and normalized device coordinates (NDC).
     * @param {{x: number, y: number}} coords - Normalized device coordinates (x, y from -1 to 1).
     * @param {Camera} camera - The camera from which the ray should originate.
     */
    setFromCamera(coords, camera) {
        if (!camera) {
            console.error("Raycaster.setFromCamera: Camera not provided.");
            return;
        }
        this.camera = camera;

        // Implementation depends on camera type (Perspective or Orthographic)
        if (camera.type === 'PerspectiveCamera') {
            this._setFromPerspectiveCamera(coords, camera);
        } else if (camera.type === 'OrthographicCamera') {
            this._setFromOrthographicCamera(coords, camera);
        } else {
            console.error(`Raycaster.setFromCamera: Unsupported camera type: ${camera.type}`);
        }
    }

    /**
     * Helper method for perspective camera ray setup.
     * @private
     */
    _setFromPerspectiveCamera(coords, camera) {
        // Ray origin is camera position in world space
        this.origin.setFromMatrixPosition(camera.worldMatrix); // Use camera world matrix position

        // Unproject NDC coordinates (coords.x, coords.y, 0.5) to get a point in world space
        // We use z=0.5, but any value between -1 and 1 works for direction finding
        const worldPoint = new Vector3(coords.x, coords.y, 0.5);
        worldPoint.applyMatrix4(camera.projectionMatrix.clone().invert());
        worldPoint.applyMatrix4(camera.worldMatrix); // camera.worldMatrix is inverse(viewMatrix)

        // Direction is from camera origin to the unprojected point
        this.direction.subVectors(worldPoint, this.origin).normalize();
    }

    /**
     * Helper method for orthographic camera ray setup.
     * @private
     */
    _setFromOrthographicCamera(coords, camera) {
        // For ortho, ray origin is the unprojected point on the near plane in world space
        this.origin.set(coords.x, coords.y, -1); // Start in NDC space near plane
        this.origin.applyMatrix4(camera.projectionMatrix.clone().invert());
        this.origin.applyMatrix4(camera.worldMatrix);

        // Ray direction is the camera's forward direction (negative Z axis of world matrix)
        this.direction.set(0, 0, -1);
        this.direction.transformDirection(camera.worldMatrix).normalize();
         // console.warn("Raycaster._setFromOrthographicCamera needs Vector3.transformDirection");
    }

    /**
     * Intersects the ray with a single object (and potentially its children).
     * @param {Object3D} object - The object to intersect with.
     * @param {boolean} [recursive=false] - If true, also checks children.
     * @param {Array} [intersects=[]] - Optional array to store results.
     * @returns {Array} An array of intersection objects [{ distance, point, object, face, faceIndex }].
     */
    intersectObject(object, recursive = false, intersects = []) {
        if (!object.visible) return intersects;

        // Intersection logic for Meshes
        if (object instanceof Mesh) {
            // Transform ray into object's local space
            const inverseMatrix = object.worldMatrix.clone().invert();
            const localRayOrigin = this.origin.clone().applyMatrix4AsPoint(inverseMatrix); // Use AsPoint for origin
            const localRayDirection = this.direction.clone().transformDirection(inverseMatrix);
            // DEBUG: Log local ray
            // console.log(`[Raycast Debug] Local Ray for ${object.type}:`, { origin: localRayOrigin, direction: localRayDirection });

            const vertices = object.vertices; 
            const faces = object.faces;
            const intersectionPoint = new Vector3(); // To store the local intersection point

            for (let i = 0; i < faces.length; i++) {
                const face = faces[i];
                const a = vertices[face.a];
                const b = vertices[face.b];
                const c = vertices[face.c];
                
                // DEBUG: Check vertices
                // if (!a || !b || !c) { console.error(`[Raycast Debug] Invalid vertices for face ${i}:`, a, b, c); continue; }

                // Use the local ray for intersection test
                const distance = this._intersectTriangle(localRayOrigin, localRayDirection, a, b, c, false, intersectionPoint);
                
                // DEBUG: Log intersection distance for every face
                if (distance !== null) {
                  console.log(`[Raycast Debug] Face ${i} intersection distance: ${distance.toFixed(4)}`);
                  // console.log(`[Raycast Debug] Local intersection point:`, intersectionPoint);
                } else {
                  // console.log(`[Raycast Debug] Face ${i} no intersection.`);
                }

                if (distance !== null) {
                    // DEBUG: Log near/far check
                    const isInRange = distance >= this.near && distance <= this.far;
                    // console.log(`[Raycast Debug] Face ${i} isInRange (${this.near} <= ${distance.toFixed(4)} <= ${this.far}): ${isInRange}`);

                    if (isInRange) {
                        // Transform intersection point back to world space
                        const worldIntersectionPoint = intersectionPoint.clone().applyMatrix4AsPoint(object.worldMatrix); 
                        // DEBUG: Log world intersection point
                        // console.log(`[Raycast Debug] World intersection point:`, worldIntersectionPoint);

                        intersects.push({
                            distance: distance, // Distance in local space along the ray
                            point: worldIntersectionPoint,
                            object: object,
                            face: face,      // The intersected face object
                            faceIndex: i     // Index of the face in the geometry
                        });
                    }
                }
            }
        }

        if (recursive) {
            const children = object.children;
            for (let i = 0, l = children.length; i < l; i++) {
                this.intersectObject(children[i], true, intersects);
            }
        }
        
        // Sorting is done once in intersectObjects
        // intersects.sort((a, b) => a.distance - b.distance);
        return intersects;
    }

    /**
     * Intersects the ray with an array of objects.
     * @param {Array<Object3D>} objects - An array of objects to intersect with.
     * @param {boolean} [recursive=false] - If true, also checks children of objects in the array.
     * @returns {Array} An array of intersection objects, sorted by distance.
     */
    intersectObjects(objects, recursive = false) {
        const intersects = [];
        if (!Array.isArray(objects)) {
            console.warn('Raycaster.intersectObjects: objects is not an array.');
            return intersects;
        }

        for (let i = 0, l = objects.length; i < l; i++) {
            this.intersectObject(objects[i], recursive, intersects);
        }

        intersects.sort((a, b) => a.distance - b.distance);
        return intersects;
    }

    // --- Private Intersection Helpers ---

    // Möller–Trumbore intersection algorithm
    // Adapted from Three.js
    // Now takes ray origin and direction as arguments
    _intersectTriangle( rayOrigin, rayDirection, a, b, c, backfaceCulling, targetPoint ) {

        const EPSILON = 1e-6;
        const edge1 = new Vector3();
        const edge2 = new Vector3();
        const diff = new Vector3();
        const normal = new Vector3(); // Will store the triangle normal

        // Calculate edges
        edge1.subVectors( b, a );
        edge2.subVectors( c, a );

        // Calculate normal vector (and check determinant)
        normal.crossVectors( edge1, edge2 ); 
        let det = rayDirection.dot( normal ); // Use provided rayDirection
        let sign;

        if ( backfaceCulling ) {
            if ( det < EPSILON ) return null;
            sign = 1;
        } else {
            if ( Math.abs( det ) < EPSILON ) return null;
            sign = Math.sign( det );
        }

        // Check distance from ray origin to triangle plane
        diff.subVectors( rayOrigin, a ); // Use provided rayOrigin
        const t = sign * diff.dot( normal ) / det; 

        // Check if triangle is behind ray origin
        if ( t < 0 ) return null;

        // Calculate intersection point P = rayOrigin + t * rayDirection
        targetPoint.copy( rayDirection ).multiplyScalar( t ).add( rayOrigin ); // Use provided ray components

        // Check if intersection point is inside triangle boundaries (using barycentric coordinates)
        // Calculate vector AP (targetPoint - a)
        diff.subVectors( targetPoint, a );
        
        // Calculate dot products for barycentric check
        const dot00 = edge1.dot( edge1 );
        const dot01 = edge1.dot( edge2 );
        const dot11 = edge2.dot( edge2 );
        const dotP0 = diff.dot( edge1 ); // Dot product of AP and edge1
        const dotP1 = diff.dot( edge2 ); // Dot product of AP and edge2

        const denom = dot00 * dot11 - dot01 * dot01;
        if ( denom === 0 ) return null; // Degenerate triangle
        
        const invDenom = 1 / denom;
        const u = ( dot11 * dotP0 - dot01 * dotP1 ) * invDenom;
        const v = ( dot00 * dotP1 - dot01 * dotP0 ) * invDenom;

        // Check if point is in triangle
        if ( u >= 0 && v >= 0 && ( u + v ) < 1 ) {
            // Intersection distance is t (distance along the ray)
            return t;
        }

        return null;
    }
} 