// ---- Math Utilities ----
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    
    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }
    
    clone() {
      return new Vector3(this.x, this.y, this.z);
    }
    
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
    
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
    
    multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      return this;
    }
    
    divideScalar(s) {
      if (s !== 0) {
        this.x /= s;
        this.y /= s;
        this.z /= s;
      }
      return this;
    }
    
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    
    cross(v) {
      const x = this.y * v.z - this.z * v.y;
      const y = this.z * v.x - this.x * v.z;
      const z = this.x * v.y - this.y * v.x;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
  }

  class Matrix4 {
    constructor() {
      // Elements stored in column-major order to match WebGL/OpenGL convention
      this.elements = [
        1, 0, 0, 0,  // Column 1
        0, 1, 0, 0,  // Column 2
        0, 0, 1, 0,  // Column 3
        0, 0, 0, 1   // Column 4
      ];
    }
    
    copy(m) {
      const te = this.elements;
      const me = m.elements;
      
      for (let i = 0; i < 16; i++) {
        te[i] = me[i];
      }
      
      return this;
    }
    
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      const te = this.elements;
      
      // Set in column-major order
      te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
      te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
      te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
      te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
      
      return this;
    }
    
    identity() {
      return this.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );
    }
    
    clone() {
      return new Matrix4().copy(this);
    }
    
    multiply(m) {
      // In column-major WebGL convention, multiply this * m
      return this.multiplyMatrices(this, m);
    }
    
    premultiply(m) {
      // In column-major WebGL convention, multiply m * this
      return this.multiplyMatrices(m, this);
    }
    
    multiplyMatrices(a, b) {
      const ae = a.elements;
      const be = b.elements;
      const te = this.elements;
      
      // Column-major multiplication implementation
      const a11 = ae[0], a21 = ae[1], a31 = ae[2], a41 = ae[3];
      const a12 = ae[4], a22 = ae[5], a32 = ae[6], a42 = ae[7];
      const a13 = ae[8], a23 = ae[9], a33 = ae[10], a43 = ae[11];
      const a14 = ae[12], a24 = ae[13], a34 = ae[14], a44 = ae[15];
      
      const b11 = be[0], b21 = be[1], b31 = be[2], b41 = be[3];
      const b12 = be[4], b22 = be[5], b32 = be[6], b42 = be[7];
      const b13 = be[8], b23 = be[9], b33 = be[10], b43 = be[11];
      const b14 = be[12], b24 = be[13], b34 = be[14], b44 = be[15];
      
      te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      
      te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      
      te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      
      te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      
      return this;
    }
    
    makeTranslation(x, y, z) {
      // Column-major translation matrix
      return this.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
      );
    }
    
    makeRotationX(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      
      // Column-major rotation X matrix
      return this.set(
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
      );
    }
    
    makeRotationY(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      
      // Column-major rotation Y matrix
      return this.set(
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
      );
    }
    
    makeRotationZ(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      
      // Column-major rotation Z matrix
      return this.set(
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );
    }
    
    // Invert the matrix - needed for camera view matrix
    invert() {
      // Based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
      // Adapted for column-major format
      const te = this.elements;
        
      // Cache elements for readability
      const m11 = te[0], m21 = te[1], m31 = te[2], m41 = te[3];
      const m12 = te[4], m22 = te[5], m32 = te[6], m42 = te[7];
      const m13 = te[8], m23 = te[9], m33 = te[10], m43 = te[11];
      const m14 = te[12], m24 = te[13], m34 = te[14], m44 = te[15];

      // Compute cofactors
      const t11 = m22 * (m33 * m44 - m43 * m34) - m23 * (m32 * m44 - m42 * m34) + m24 * (m32 * m43 - m42 * m33);
      const t12 = m21 * (m33 * m44 - m43 * m34) - m23 * (m31 * m44 - m41 * m34) + m24 * (m31 * m43 - m41 * m33);
      const t13 = m21 * (m32 * m44 - m42 * m34) - m22 * (m31 * m44 - m41 * m34) + m24 * (m31 * m42 - m41 * m32);
      const t14 = m21 * (m32 * m43 - m42 * m33) - m22 * (m31 * m43 - m41 * m33) + m23 * (m31 * m42 - m41 * m32);
      
      // Compute determinant
      const det = m11 * t11 - m12 * t12 + m13 * t13 - m14 * t14;
      
      if (det === 0) {
        return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
      
      const detInv = 1 / det;
      
      // Compute remaining cofactors
      const t21 = m12 * (m33 * m44 - m43 * m34) - m13 * (m32 * m44 - m42 * m34) + m14 * (m32 * m43 - m42 * m33);
      const t22 = m11 * (m33 * m44 - m43 * m34) - m13 * (m31 * m44 - m41 * m34) + m14 * (m31 * m43 - m41 * m33);
      const t23 = m11 * (m32 * m44 - m42 * m34) - m12 * (m31 * m44 - m41 * m34) + m14 * (m31 * m42 - m41 * m32);
      const t24 = m11 * (m32 * m43 - m42 * m33) - m12 * (m31 * m43 - m41 * m33) + m13 * (m31 * m42 - m41 * m32);
      
      const t31 = m12 * (m23 * m44 - m43 * m24) - m13 * (m22 * m44 - m42 * m24) + m14 * (m22 * m43 - m42 * m23);
      const t32 = m11 * (m23 * m44 - m43 * m24) - m13 * (m21 * m44 - m41 * m24) + m14 * (m21 * m43 - m41 * m23);
      const t33 = m11 * (m22 * m44 - m42 * m24) - m12 * (m21 * m44 - m41 * m24) + m14 * (m21 * m42 - m41 * m22);
      const t34 = m11 * (m22 * m43 - m42 * m23) - m12 * (m21 * m43 - m41 * m23) + m13 * (m21 * m42 - m41 * m22);
      
      const t41 = m12 * (m23 * m34 - m33 * m24) - m13 * (m22 * m34 - m32 * m24) + m14 * (m22 * m33 - m32 * m23);
      const t42 = m11 * (m23 * m34 - m33 * m24) - m13 * (m21 * m34 - m31 * m24) + m14 * (m21 * m33 - m31 * m23);
      const t43 = m11 * (m22 * m34 - m32 * m24) - m12 * (m21 * m34 - m31 * m24) + m14 * (m21 * m32 - m31 * m22);
      const t44 = m11 * (m22 * m33 - m32 * m23) - m12 * (m21 * m33 - m31 * m23) + m13 * (m21 * m32 - m31 * m22);
      
      // Set inverse matrix using adjugate / determinant
      te[0] = t11 * detInv;
      te[1] = -t12 * detInv;
      te[2] = t13 * detInv;
      te[3] = -t14 * detInv;
      
      te[4] = -t21 * detInv;
      te[5] = t22 * detInv;
      te[6] = -t23 * detInv;
      te[7] = t24 * detInv;
      
      te[8] = t31 * detInv;
      te[9] = -t32 * detInv;
      te[10] = t33 * detInv;
      te[11] = -t34 * detInv;
      
      te[12] = -t41 * detInv;
      te[13] = t42 * detInv;
      te[14] = -t43 * detInv;
      te[15] = t44 * detInv;
      
      return this;
    }
    
    makePerspective(fov, aspect, near, far) {
      const top = near * Math.tan(fov * 0.5);
      const height = 2 * top;
      const width = aspect * height;
      const left = -width / 2;
      const right = left + width;
      const bottom = -top;
      
      // Column-major perspective projection matrix
      const x = 2 * near / (right - left);
      const y = 2 * near / (top - bottom);
      
      const a = (right + left) / (right - left);
      const b = (top + bottom) / (top - bottom);
      const c = -(far + near) / (far - near);
      const d = -2 * far * near / (far - near);
      
      return this.set(
        x, 0, 0, 0,
        0, y, 0, 0,
        a, b, c, -1,
        0, 0, d, 0
      );
    }
    
    lookAt(eye, target, up) {
      if (!eye || !target || !up) return this;
      
      // Calculate the orthonormal basis vectors for the camera
      const z = new Vector3().copy(eye).sub(target).normalize();
      
      if (z.length() === 0) {
        z.z = 1;
      }
      
      const x = new Vector3().copy(up).cross(z).normalize();
      
      if (x.length() === 0) {
        z.z += 0.0001;
        x.copy(up).cross(z).normalize();
      }
      
      const y = new Vector3().copy(z).cross(x);
      
      // Column-major view matrix construction
      this.set(
        x.x, y.x, z.x, 0,
        x.y, y.y, z.y, 0,
        x.z, y.z, z.z, 0,
        0, 0, 0, 1
      );
      
      // Apply translation
      const te = this.elements;
      te[12] = -x.dot(eye);
      te[13] = -y.dot(eye);
      te[14] = -z.dot(eye);
      
      return this;
    }
    
    transformPoint(point) {
      const e = this.elements;
      const x = point.x, y = point.y, z = point.z;
      
      // Column-major point transformation (treating the point as a column vector)
      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      
      const newX = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
      const newY = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
      const newZ = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
      
      point.x = newX;
      point.y = newY;
      point.z = newZ;
      
      return point;
    }
  }

  // ---- Intersection Utilities ----
  class Line3D {
    constructor(p1, p2) {
      this.p1 = p1.clone();
      this.p2 = p2.clone();
    }
    
    // Get a point along the line based on parameter t (0-1)
    getPoint(t) {
      return new Vector3(
        this.p1.x + (this.p2.x - this.p1.x) * t,
        this.p1.y + (this.p2.y - this.p1.y) * t,
        this.p1.z + (this.p2.z - this.p1.z) * t
      );
    }
    
    // Get the direction vector of the line
    getDirection() {
      return new Vector3(
        this.p2.x - this.p1.x,
        this.p2.y - this.p1.y,
        this.p2.z - this.p1.z
      ).normalize();
    }
  }
  
  class Plane3D {
    constructor(p1, p2, p3) {
      this.p1 = p1.clone();
      
      // Calculate plane normal using cross product of two edges
      const v1 = new Vector3(
        p2.x - p1.x,
        p2.y - p1.y,
        p2.z - p1.z
      );
      
      const v2 = new Vector3(
        p3.x - p1.x,
        p3.y - p1.y,
        p3.z - p1.z
      );
      
      this.normal = new Vector3().copy(v1).cross(v2).normalize();
      
      // Calculate plane constant: ax + by + cz + d = 0
      // d = -(ax + by + cz) for a point on the plane
      this.d = -(this.normal.x * p1.x + this.normal.y * p1.y + this.normal.z * p1.z);
    }
    
    // Get signed distance from point to plane
    distanceToPoint(point) {
      return this.normal.x * point.x + this.normal.y * point.y + this.normal.z * point.z + this.d;
    }
    
    // Check if a point is in front of, behind, or on the plane
    classifyPoint(point, epsilon = 0.00001) {
      const dist = this.distanceToPoint(point);
      if (dist > epsilon) return 1;      // In front
      if (dist < -epsilon) return -1;    // Behind
      return 0;                           // On plane
    }
    
    // Find intersection of line with plane
    intersectLine(line) {
      const direction = line.getDirection();
      const denominator = this.normal.dot(direction);
      
      // Line is parallel to plane
      if (Math.abs(denominator) < 0.00001) return null;
      
      // Calculate t where the line intersects the plane
      const t = -(this.normal.dot(line.p1) + this.d) / denominator;
      
      // Check if intersection is within line segment
      if (t < 0 || t > 1) return null;
      
      // Return the intersection point
      return line.getPoint(t);
    }
  }
  
  class IntersectionHelper {
    // Detect if two triangles intersect
    static trianglesIntersect(t1p1, t1p2, t1p3, t2p1, t2p2, t2p3) {
      // Create planes for both triangles
      const plane1 = new Plane3D(t1p1, t1p2, t1p3);
      const plane2 = new Plane3D(t2p1, t2p2, t2p3);
      
      // Classify triangle 2 vertices against plane 1
      const t2p1Class = plane1.classifyPoint(t2p1);
      const t2p2Class = plane1.classifyPoint(t2p2);
      const t2p3Class = plane1.classifyPoint(t2p3);
      
      // If all points of triangle 2 are on same side of plane 1, no intersection
      if (t2p1Class > 0 && t2p2Class > 0 && t2p3Class > 0) return false;
      if (t2p1Class < 0 && t2p2Class < 0 && t2p3Class < 0) return false;
      
      // Classify triangle 1 vertices against plane 2
      const t1p1Class = plane2.classifyPoint(t1p1);
      const t1p2Class = plane2.classifyPoint(t1p2);
      const t1p3Class = plane2.classifyPoint(t1p3);
      
      // If all points of triangle 1 are on same side of plane 2, no intersection
      if (t1p1Class > 0 && t1p2Class > 0 && t1p3Class > 0) return false;
      if (t1p1Class < 0 && t1p2Class < 0 && t1p3Class < 0) return false;
      
      // Triangles potentially intersect - for full check need to check if intersection
      // line segment passes through both triangles
      return true;
    }
    
    // Find intersection between a triangle and a plane
    static trianglePlaneIntersection(p1, p2, p3, plane) {
      // Create lines for each edge of the triangle
      const lines = [
        new Line3D(p1, p2),
        new Line3D(p2, p3),
        new Line3D(p3, p1)
      ];
      
      // Find intersections of each line with the plane
      const intersections = [];
      lines.forEach(line => {
        const intersection = plane.intersectLine(line);
        if (intersection) {
          intersections.push(intersection);
        }
      });
      
      return intersections;
    }
    
    // Subdivide a triangle along an intersection plane
    static subdivideTriangle(p1, p2, p3, plane) {
      // Classify each vertex against the plane
      const p1Class = plane.classifyPoint(p1);
      const p2Class = plane.classifyPoint(p2);
      const p3Class = plane.classifyPoint(p3);
      
      // Find intersection points
      const intersections = this.trianglePlaneIntersection(p1, p2, p3, plane);
      
      // If we don't have exactly 2 intersection points, return the original triangle
      if (intersections.length !== 2) {
        return [{p1, p2, p3}];
      }
      
      // Create new triangles based on subdivision
      const i1 = intersections[0];
      const i2 = intersections[1];
      
      // Arrange vertices based on which side of plane they're on
      // Front side triangles
      const frontTriangles = [];
      // Back side triangles
      const backTriangles = [];
      
      // Case 1: One vertex on one side, two on the other
      if (p1Class * p2Class < 0 && p1Class * p3Class < 0) {
        // p1 is on one side, p2 and p3 on the other
        if (p1Class > 0) {
          frontTriangles.push({p1, p2: i1, p3: i2});
          backTriangles.push({p1: i1, p2, p3});
          backTriangles.push({p1: i1, p2: p3, p3: i2});
        } else {
          frontTriangles.push({p1: i1, p2, p3});
          frontTriangles.push({p1: i1, p2: p3, p3: i2});
          backTriangles.push({p1, p2: i1, p3: i2});
        }
      }
      else if (p2Class * p1Class < 0 && p2Class * p3Class < 0) {
        // p2 is on one side, p1 and p3 on the other
        if (p2Class > 0) {
          frontTriangles.push({p1: p2, p2: i1, p3: i2});
          backTriangles.push({p1, p2: i1, p3});
          backTriangles.push({p1: i1, p2: p2, p3: i2});
        } else {
          frontTriangles.push({p1, p2: i1, p3});
          frontTriangles.push({p1: i1, p2: p2, p3: i2});
          backTriangles.push({p1: p2, p2: i1, p3: i2});
        }
      }
      else if (p3Class * p1Class < 0 && p3Class * p2Class < 0) {
        // p3 is on one side, p1 and p2 on the other
        if (p3Class > 0) {
          frontTriangles.push({p1: p3, p2: i1, p3: i2});
          backTriangles.push({p1, p2, p3: i1});
          backTriangles.push({p1: i1, p2: i2, p3: p3});
        } else {
          frontTriangles.push({p1, p2, p3: i1});
          frontTriangles.push({p1: i1, p2: i2, p3: p3});
          backTriangles.push({p1: p3, p2: i1, p3: i2});
        }
      }
      
      // Return all triangles with their depth classifications
      return {
        front: frontTriangles,
        back: backTriangles
      };
    }
    
    // Calculate intersection line between two planes
    static planePlaneIntersection(planeA, planeB) {
      // Direction is cross product of normals
      const direction = new Vector3().copy(planeA.normal).cross(planeB.normal);
      
      // Check if planes are parallel (cross product is zero)
      const dirLength = direction.length();
      if (dirLength < 0.00001) return null;
      
      // Normalize direction
      direction.divideScalar(dirLength);
      
      // Find a point on the intersection line
      // Solve system of equations:
      // planeA.normal.x * p.x + planeA.normal.y * p.y + planeA.normal.z * p.z + planeA.d = 0
      // planeB.normal.x * p.x + planeB.normal.y * p.y + planeB.normal.z * p.z + planeB.d = 0
      
      // If direction.x is not 0, we can set p.y = p.z = 0 and solve for p.x
      let point;
      if (Math.abs(direction.x) > 0.00001) {
        const pz = 0;
        const py = 0;
        const px = -(planeA.d + planeA.normal.y * py + planeA.normal.z * pz) / planeA.normal.x;
        point = new Vector3(px, py, pz);
      } 
      // If direction.y is not 0, we can set p.x = p.z = 0 and solve for p.y
      else if (Math.abs(direction.y) > 0.00001) {
        const pz = 0;
        const px = 0;
        const py = -(planeA.d + planeA.normal.x * px + planeA.normal.z * pz) / planeA.normal.y;
        point = new Vector3(px, py, pz);
      }
      // If direction.z is not 0, we can set p.x = p.y = 0 and solve for p.z
      else if (Math.abs(direction.z) > 0.00001) {
        const px = 0;
        const py = 0;
        const pz = -(planeA.d + planeA.normal.x * px + planeA.normal.y * py) / planeA.normal.z;
        point = new Vector3(px, py, pz);
      }
      else {
        // This shouldn't happen if we correctly checked for parallel planes
        return null;
      }
      
      return {
        point: point,
        direction: direction
      };
    }
    
    // Generate visual indicators for intersections
    static generateIntersectionMarkers(planeA, planeB, boundingBoxMin, boundingBoxMax) {
      const intersection = this.planePlaneIntersection(planeA, planeB);
      if (!intersection) return [];
      
      // Calculate bounding box dimensions
      const boxWidth = boundingBoxMax.x - boundingBoxMin.x;
      const boxHeight = boundingBoxMax.y - boundingBoxMin.y;
      const boxDepth = boundingBoxMax.z - boundingBoxMin.z;
      const boxSize = Math.sqrt(boxWidth * boxWidth + boxHeight * boxHeight + boxDepth * boxDepth);
      
      // Generate points along the intersection line within the bounding box
      const points = [];
      const center = new Vector3(
        (boundingBoxMin.x + boundingBoxMax.x) / 2,
        (boundingBoxMin.y + boundingBoxMax.y) / 2,
        (boundingBoxMin.z + boundingBoxMax.z) / 2
      );
      
      // Create points along the intersection line, centered at the bounding box center
      const numPoints = 10;
      const stepSize = boxSize / (numPoints - 1);
      
      for (let i = 0; i < numPoints; i++) {
        const t = (i - (numPoints - 1) / 2) * stepSize;
        const point = new Vector3(
          intersection.point.x + t * intersection.direction.x,
          intersection.point.y + t * intersection.direction.y,
          intersection.point.z + t * intersection.direction.z
        );
        
        // Check if the point is within the bounding box
        if (
          point.x >= boundingBoxMin.x && point.x <= boundingBoxMax.x &&
          point.y >= boundingBoxMin.y && point.y <= boundingBoxMax.y &&
          point.z >= boundingBoxMin.z && point.z <= boundingBoxMax.z
        ) {
          points.push(point);
        }
      }
      
      return points;
    }
  }

  // ---- Scene Graph ----
  class Object3D {
    constructor() {
      // Generate unique ID for each object
      this.id = Object3D.nextId++;
      
      this.position = new Vector3();
      this.rotation = new Vector3();
      this.scale = new Vector3(1, 1, 1);
      this.matrix = new Matrix4();
      this.worldMatrix = new Matrix4();
      this.children = [];
      this.parent = null;
      this.visible = true;
    }
    
    // Position setters with method chaining
    setPosition(x, y, z) {
      if (arguments.length === 1 && x instanceof Vector3) {
        this.position.copy(x);
      } else {
        this.position.set(x, y, z);
      }
      return this;
    }
    
    // Rotation setters with method chaining
    setRotation(x, y, z) {
      if (arguments.length === 1 && x instanceof Vector3) {
        this.rotation.copy(x);
      } else {
        this.rotation.set(x, y, z);
      }
      return this;
    }
    
    // Scale setters with method chaining
    setScale(x, y, z) {
      if (arguments.length === 1) {
        if (x instanceof Vector3) {
          this.scale.copy(x);
        } else {
          // Single number - uniform scale
          this.scale.set(x, x, x);
        }
      } else {
        this.scale.set(x, y, z);
      }
      return this;
    }
    
    // Visibility setter with method chaining
    setVisible(visible) {
      this.visible = visible;
      return this;
    }
    
    // Consistent getters
    getPosition() {
      return this.position.clone();
    }
    
    getRotation() {
      return this.rotation.clone();
    }
    
    getScale() {
      return this.scale.clone();
    }
    
    isVisible() {
      return this.visible;
    }
    
    add(object) {
      if (object === this) return this;
      
      if (object.parent !== null) {
        object.parent.remove(object);
      }
      
      object.parent = this;
      this.children.push(object);
      
      return this;
    }
    
    remove(object) {
      const index = this.children.indexOf(object);
      
      if (index !== -1) {
        object.parent = null;
        this.children.splice(index, 1);
      }
      
      return this;
    }
    
    updateMatrix() {
      // Create transformation matrices
      const translation = new Matrix4().makeTranslation(
        this.position.x, 
        this.position.y, 
        this.position.z
      );
      
      const rotationX = new Matrix4().makeRotationX(this.rotation.x);
      const rotationY = new Matrix4().makeRotationY(this.rotation.y);
      const rotationZ = new Matrix4().makeRotationZ(this.rotation.z);
      
      // Combine transformations in column-major order: Rz * Rx * Ry * T
      // This is equivalent to T * Ry * Rx * Rz in row-major order
      this.matrix.identity()
        .multiply(rotationZ)
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(translation);
      
      return this;
    }
    
    updateWorldMatrix(forceUpdate = false) {
      if (this.parent === null) {
        this.updateMatrix();
        this.worldMatrix.copy(this.matrix);
      } else {
        if (forceUpdate) this.updateMatrix();
        // In column-major, multiply parent's world matrix by object's local matrix
        this.worldMatrix.copy(this.matrix).premultiply(this.parent.worldMatrix);
      }
      
      // Update children
      this.children.forEach(child => {
        child.updateWorldMatrix(forceUpdate);
      });
      
      return this;
    }
  }

  // Static counter for unique IDs
  Object3D.nextId = 1;

  // Scene - Root container
  class Scene extends Object3D {
    constructor() {
      super();
      this.background = '#000000';
    }
  }

  // ---- Camera Classes ----
  /**
   * The base ProjectionMode class - defines the interface for all projection modes
   */
  class ProjectionMode {
    constructor(camera) {
      this.camera = camera;
    }
    
    updateProjectionMatrix() {
      // Base implementation to be overridden
      console.warn("ProjectionMode.updateProjectionMatrix() not implemented");
      return this;
    }
    
    get type() {
      return 'base';
    }
  }

  /**
   * MatrixProjection - Core implementation of different projection types
   * 
   * This class provides a unified approach to creating different types of
   * projection matrices (perspective, orthographic, oblique) with consistent
   * behavior. It handles frustum calculation and matrix construction for
   * all projection types.
   */
  class MatrixProjection {
    /**
     * Create a new MatrixProjection
     * 
     * @param {Camera} camera - The camera this projection belongs to
     * @param {Object} options - Configuration options
     * @param {string} [options.type='perspective'] - Projection type ('perspective', 'orthographic', 'oblique')
     * @param {number} [options.near=0.1] - Near clipping plane
     * @param {number} [options.far=2000] - Far clipping plane
     * @param {number} [options.fov=50] - Field of view in degrees (perspective mode)
     * @param {number} [options.aspect=1] - Aspect ratio (perspective mode)
     * @param {number} [options.zoom=1] - Zoom factor (orthographic mode)
     * @param {Object} [options.obliqueAngle={x:45,y:45}] - Oblique projection angles (oblique mode)
     */
    constructor(camera, options = {}) {
      this.camera = camera;
      
      // Core configuration options
      this.config = {
        // Projection type
        type: options.type || 'perspective', // 'perspective', 'orthographic', 'oblique'
        
        // Common parameters
        near: options.near !== undefined ? options.near : 0.1,
        far: options.far !== undefined ? options.far : 2000,
        
        // Perspective-specific parameters
        fov: options.fov || 50,              // Field of view (degrees)
        aspect: options.aspect || 1,         // Aspect ratio
        
        // Orthographic-specific parameters
        zoom: options.zoom !== undefined ? options.zoom : 1,
        
        // Oblique projection parameters
        obliqueAngle: options.obliqueAngle || { x: 45, y: 45 }, // in degrees
      };
      
      // Internal calculated values
      this._frustum = {
        left: 0, right: 0, top: 0, bottom: 0
      };
      
      // Initialize
      this._updateFrustum();
    }
    
    /**
     * Update the frustum dimensions based on current settings
     * @private
     */
    _updateFrustum() {
      const c = this.config;
      const f = this._frustum;
      
      if (c.type === 'perspective' || c.type === 'oblique') {
        // Calculate frustum based on FOV
        const tanHalfFov = Math.tan((c.fov * Math.PI / 180) / 2);
        f.top = c.near * tanHalfFov;
        f.bottom = -f.top;
        f.right = f.top * c.aspect;
        f.left = -f.right;
      } 
      else { // orthographic
        // Calculate orthographic frustum with consistent sizing
        // Base size of 10 units at zoom=1
        const baseSize = 10; 
        
        // Calculate dimensions with zoom applied
        const size = baseSize / c.zoom;
        
        // Apply aspect ratio
        if (c.aspect >= 1) {
          // Landscape
          f.right = size * c.aspect / 2;
          f.left = -f.right;
          f.top = size / 2;
          f.bottom = -f.top;
        } else {
          // Portrait
          f.right = size / 2;
          f.left = -f.right;
          f.top = size / c.aspect / 2;
          f.bottom = -f.top;
        }
      }
    }
    
    /**
     * Update the projection matrix
     * 
     * This method calculates the appropriate projection matrix
     * based on the current projection type and parameters.
     * 
     * @returns {MatrixProjection} The projection instance for method chaining
     */
    updateProjectionMatrix() {
      // Make sure frustum is up to date
      this._updateFrustum();
      
      const c = this.config;
      const f = this._frustum;
      
      // Create the appropriate matrix based on projection type
      if (c.type === 'perspective') {
        this._makePerspectiveMatrix(f.left, f.right, f.top, f.bottom, c.near, c.far);
      } 
      else if (c.type === 'orthographic') {
        this._makeOrthographicMatrix(f.left, f.right, f.top, f.bottom, c.near, c.far);
      }
      else if (c.type === 'oblique') {
        // For oblique, start with orthographic and then apply oblique shear
        this._makeOrthographicMatrix(f.left, f.right, f.top, f.bottom, c.near, c.far);
        this._applyObliqueProjection(c.obliqueAngle.x, c.obliqueAngle.y);
      }
      
      return this;
    }
    
    /**
     * Create a perspective projection matrix
     * @private
     */
    _makePerspectiveMatrix(left, right, top, bottom, near, far) {
      const te = this.camera.projectionMatrix.elements;
      
      const x = 2 * near / (right - left);
      const y = 2 * near / (top - bottom);
      
      const a = (right + left) / (right - left);
      const b = (top + bottom) / (top - bottom);
      const c = -(far + near) / (far - near);
      const d = -2 * far * near / (far - near);
      
      te[0] = x;    te[4] = 0;    te[8] = a;     te[12] = 0;
      te[1] = 0;    te[5] = y;    te[9] = b;     te[13] = 0;
      te[2] = 0;    te[6] = 0;    te[10] = c;    te[14] = d;
      te[3] = 0;    te[7] = 0;    te[11] = -1;   te[15] = 0;
    }
    
    /**
     * Create an orthographic projection matrix
     * @private
     */
    _makeOrthographicMatrix(left, right, top, bottom, near, far) {
      const te = this.camera.projectionMatrix.elements;
      
      const w = 1.0 / (right - left);
      const h = 1.0 / (top - bottom);
      const p = 1.0 / (far - near);
      
      // Fix for the orthographic projection:
      // Flip both X and Y scaling to match the perspective handedness convention
      // This ensures consistent coordinate system between projection modes
      
      te[0] = -2 * w;  te[4] = 0;       te[8] = 0;        te[12] = (right + left) * w;
      te[1] = 0;       te[5] = -2 * h;  te[9] = 0;        te[13] = (top + bottom) * h;
      te[2] = 0;       te[6] = 0;       te[10] = -1 * p;  te[14] = -(far + near) * p / 2;
      te[3] = 0;       te[7] = 0;       te[11] = 0;       te[15] = 1;
    }
    
    /**
     * Apply oblique projection modification to the matrix
     * 
     * This transforms an orthographic projection into an oblique projection
     * by applying shearing factors based on specified angles.
     * 
     * @param {number} angleX - X-axis shear angle in degrees
     * @param {number} angleY - Y-axis shear angle in degrees
     * @private
     */
    _applyObliqueProjection(angleX, angleY) {
      const te = this.camera.projectionMatrix.elements;
      
      // Convert angles from degrees to radians
      const radX = angleX * Math.PI / 180;
      const radY = angleY * Math.PI / 180;
      
      // Calculate oblique factors
      const cotX = 1 / Math.tan(radX);
      const cotY = 1 / Math.tan(radY);
      
      // Apply to the projection matrix
      te[8] = cotX;
      te[9] = cotY;
    }
    
    /**
     * Apply a preset configuration
     * 
     * This method provides easy access to common projection configurations.
     * 
     * Available presets:
     * - standard: Default perspective projection
     * - wide: Wide-angle perspective (75° FOV)
     * - narrow: Narrow perspective (25° FOV)
     * - ortho: Standard orthographic projection
     * - isometric: True isometric projection (equal angles)
     * - dimetric: Dimetric projection (unequal angles)
     * - cabinet: Cabinet projection (45° elevation)
     * 
     * @param {string} name - Name of the preset to apply
     * @returns {MatrixProjection} The projection instance for method chaining
     * 
     * @example
     * // Apply isometric projection
     * camera.perspective.setPreset('isometric');
     * camera.updateProjectionMatrix();
     */
    setPreset(name) {
      switch (name) {
        case 'standard':
          this.config.type = 'perspective';
          this.config.fov = 50;
          this.config.near = 0.1;
          this.config.far = 2000;
          break;
          
        case 'wide':
          this.config.type = 'perspective';
          this.config.fov = 75;
          break;
          
        case 'narrow':
          this.config.type = 'perspective';
          this.config.fov = 25; // Telephoto-like narrow FOV
          break;
          
        case 'ortho':
          this.config.type = 'orthographic';
          this.config.zoom = 1;
          break;
          
        case 'isometric':
          this.config.type = 'oblique';
          this.config.obliqueAngle = { x: 45, y: 35.264 }; // True isometric angles
          break;
          
        case 'dimetric':
          this.config.type = 'oblique';
          this.config.obliqueAngle = { x: 45, y: 30 };
          break;
          
        case 'cabinet':
          this.config.type = 'oblique';
          this.config.obliqueAngle = { x: 63.4, y: 45 }; // Cabinet projection
          break;
          
        default:
          console.warn(`Unknown preset: ${name}. Using 'standard' instead.`);
          this.setPreset('standard');
      }
      
      this._updateFrustum();
      return this;
    }
  }

  class PerspectiveProjection extends ProjectionMode {
    constructor(camera, fov = 50, aspect = 1, near = 0.1, far = 2000) {
      super(camera);
      this.fov = fov;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
    }
    
    updateProjectionMatrix() {
      // Convert FOV from degrees to radians
      const fovRad = this.fov * (Math.PI / 180);
      
      // Create the perspective projection matrix
      this.camera.projectionMatrix.makePerspective(
        fovRad, 
        this.aspect || this.camera.aspect, 
        this.near, 
        this.far
      );
      
      return this;
    }
    
    get type() {
      return 'perspective';
    }
  }

  class OrthographicProjection extends ProjectionMode {
    constructor(camera, left = -10, right = 10, top = 10, bottom = -10, near = 0.1, far = 2000) {
      super(camera);
      this.left = left;
      this.right = right;
      this.top = top;
      this.bottom = bottom;
      this.near = near;
      this.far = far;
      this.zoom = 1;
    }
    
    updateProjectionMatrix() {
      const dx = (this.right - this.left) / (2 * this.zoom);
      const dy = (this.top - this.bottom) / (2 * this.zoom);
      const cx = (this.right + this.left) / 2;
      const cy = (this.top + this.bottom) / 2;
      
      let left = cx - dx;
      let right = cx + dx;
      let top = cy + dy;
      let bottom = cy - dy;
      
      // In OpenGL/WebGL column-major format, the orthographic matrix has this structure:
      // 2/(r-l)      0            0           -(r+l)/(r-l)
      //    0      2/(t-b)         0           -(t+b)/(t-b)
      //    0         0        -2/(f-n)        -(f+n)/(f-n)
      //    0         0            0                 1
      
      const w = 1.0 / (right - left);
      const h = 1.0 / (top - bottom);
      const p = 1.0 / (this.far - this.near);
      
      // Calculate matrix elements
      const te = this.camera.projectionMatrix.elements;
      
      // Fixed orthographic projection with both X and Y flipping for consistent handedness
      te[0] = -2 * w;  te[4] = 0;       te[8] = 0;        te[12] = (right + left) * w;
      te[1] = 0;       te[5] = -2 * h;  te[9] = 0;        te[13] = (top + bottom) * h;
      te[2] = 0;       te[6] = 0;       te[10] = -1 * p;  te[14] = -(this.far + this.near) * p / 2;
      te[3] = 0;       te[7] = 0;       te[11] = 0;       te[15] = 1;
      
      return this;
    }
    
    setSize(width, height) {
      const aspect = width / height;
      
      if (aspect > 1) {
        // Landscape
        this.left = -10 * aspect;
        this.right = 10 * aspect;
        this.top = 10;
        this.bottom = -10;
      } else {
        // Portrait
        this.left = -10;
        this.right = 10;
        this.top = 10 / aspect;
        this.bottom = -10 / aspect;
      }
      
      return this;
    }
    
    get type() {
      return 'orthographic';
    }
  }

  /**
   * Camera class for 3D rendering
   * 
   * The Camera class provides a unified API for creating and controlling cameras in a 3D scene.
   * It supports multiple projection modes including perspective and orthographic projection,
   * and provides methods for configuring camera properties, positioning, and orientation.
   * 
   * Key features:
   * - Multiple projection modes (perspective, orthographic)
   * - Matrix-based projection for consistent rendering
   * - Fluent API with method chaining
   * - Scene-graph integration through Object3D inheritance
   * 
   * The camera uses a matrix-based projection system that provides consistent results
   * across different projection modes, making it easy to switch between modes while
   * maintaining the visible area of the scene.
   * 
   * @extends Object3D
   */
  class Camera extends Object3D {
    /**
     * Create a new Camera
     * @param {string} initialMode - Initial projection mode ('perspective' or 'orthographic')
     */
    constructor(initialMode = 'perspective') {
      super();
      this.viewMatrix = new Matrix4();
      this.projectionMatrix = new Matrix4();
      this.viewProjectionMatrix = new Matrix4();
      this.aspect = 1;
      
      // Create registry for all modes (built-in and custom)
      this.projectionModes = {};
      
      // Create and register built-in modes using MatrixProjection
      this.perspective = new MatrixProjection(this, {
        type: 'perspective',
        fov: 50,
        aspect: 1,
        near: 0.1,
        far: 2000
      });
      
      this.orthographic = new MatrixProjection(this, {
        type: 'orthographic',
        left: -10,
        right: 10,
        top: 10,
        bottom: -10,
        near: 0.1,
        far: 2000,
        zoom: 1
      });
      
      // Register the built-in modes
      this.registerProjectionMode('perspective', this.perspective);
      this.registerProjectionMode('orthographic', this.orthographic);
      
      // Set initial mode
      this.setProjectionMode(initialMode);
    }
    
    /**
     * Configure camera for a specific viewport
     * 
     * This method sets up both perspective and orthographic projections
     * in a single call, making it easy to initialize the camera.
     * 
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     * @param {number} fov - Field of view in degrees (for perspective mode)
     * @param {number} near - Near clipping plane
     * @param {number} far - Far clipping plane
     * @param {number} zoom - Zoom factor (for orthographic mode)
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Initialize camera for a 800x600 viewport
     * camera.setupForViewport(800, 600, 45, 0.1, 100, 1.0);
     */
    setupForViewport(width, height, fov = 45, near = 0.1, far = 100, zoom = 1) {
      const aspect = width / height;
      
      // Configure perspective
      this.setPerspectiveParameters(fov, aspect, near, far);
      
      // Configure orthographic
      // Set basic ortho parameters
      this.orthographic.config.near = near;
      this.orthographic.config.far = far;
      this.orthographic.config.zoom = zoom;
      
      // Calculate orthographic bounds based on aspect ratio
      this.setOrthographicSize(width, height);
      
      // Update all matrices
      this.updateAll();
      
      return this;
    }
    
    /**
     * Update all camera matrices in the correct order
     * 
     * This method updates local, world, view, and projection matrices,
     * ensuring that all transformations are correctly applied.
     * 
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Update all camera matrices after changing position
     * camera.position.set(0, 10, 20);
     * camera.updateAll();
     */
    updateAll() {
      this.updateMatrix();
      this.updateWorldMatrix();
      this.updateViewMatrix();
      this.updateProjectionMatrix();
      return this;
    }
    
    /**
     * Set the field of view for perspective projection
     * @param {number} fov - Field of view in degrees
     * @returns {Camera} The camera instance for method chaining
     */
    setFov(fov) {
      this.perspective.config.fov = fov;
      if (this.activeMode === this.perspective) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Set aspect ratio for perspective projection
     * @param {number} aspect - Aspect ratio (width/height)
     * @returns {Camera} The camera instance for method chaining
     */
    setAspect(aspect) {
      this.aspect = aspect;
      this.perspective.config.aspect = aspect;
      if (this.activeMode === this.perspective) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Set near clipping plane distance
     * 
     * The near clipping plane defines where rendering begins in the scene.
     * Objects closer to the camera than this distance will be clipped.
     * 
     * @param {number} near - Near clipping plane distance
     * @returns {Camera} The camera instance for method chaining
     */
    setNear(near) {
      this.activeMode.config.near = near;
      this.updateProjectionMatrix();
      return this;
    }
    
    /**
     * Set far clipping plane distance
     * 
     * The far clipping plane defines the maximum render distance.
     * Objects farther from the camera than this distance will be clipped.
     * 
     * @param {number} far - Far clipping plane distance
     * @returns {Camera} The camera instance for method chaining
     */
    setFar(far) {
      this.activeMode.config.far = far;
      this.updateProjectionMatrix();
      return this;
    }
    
    /**
     * Set zoom factor for orthographic projection
     * 
     * Higher zoom values make objects appear larger in orthographic mode.
     * 
     * @param {number} zoom - Zoom factor (1.0 is normal scale)
     * @returns {Camera} The camera instance for method chaining
     */
    setZoom(zoom) {
      this.orthographic.config.zoom = zoom;
      if (this.activeMode === this.orthographic) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Set orthographic frustum boundaries directly
     * 
     * This method allows direct control over the orthographic view volume.
     * 
     * @param {number} left - Left boundary
     * @param {number} right - Right boundary
     * @param {number} top - Top boundary
     * @param {number} bottom - Bottom boundary
     * @returns {Camera} The camera instance for method chaining
     */
    setOrthographicFrustum(left, right, top, bottom) {
      this.orthographic.config.left = left;
      this.orthographic.config.right = right;
      this.orthographic.config.top = top;
      this.orthographic.config.bottom = bottom;
      if (this.activeMode === this.orthographic) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Set orthographic size based on viewport dimensions
     * 
     * This automatically calculates appropriate orthographic bounds
     * to match the given aspect ratio.
     * 
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     * @returns {Camera} The camera instance for method chaining
     */
    setOrthographicSize(width, height) {
      const aspect = width / height;
      this.orthographic.config.aspect = aspect;
      
      // The frustum will be calculated in MatrixProjection._updateFrustum
      // This automatically handles the aspect ratio adjustment
      
      if (this.activeMode === this.orthographic) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Configure all perspective projection parameters
     * 
     * @param {number} fov - Field of view in degrees
     * @param {number} aspect - Aspect ratio (width/height)
     * @param {number} near - Near clipping plane distance
     * @param {number} far - Far clipping plane distance
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Set up perspective with 60° FOV
     * camera.setPerspectiveParameters(60, window.innerWidth/window.innerHeight, 0.1, 1000);
     */
    setPerspectiveParameters(fov, aspect, near, far) {
      this.perspective.config.fov = fov;
      this.perspective.config.aspect = aspect;
      this.perspective.config.near = near;
      this.perspective.config.far = far;
      this.aspect = aspect;
      if (this.activeMode === this.perspective) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Configure all orthographic projection parameters
     * 
     * @param {number} left - Left boundary
     * @param {number} right - Right boundary
     * @param {number} top - Top boundary
     * @param {number} bottom - Bottom boundary
     * @param {number} near - Near clipping plane distance
     * @param {number} far - Far clipping plane distance
     * @param {number} zoom - Zoom factor (1.0 is normal scale)
     * @returns {Camera} The camera instance for method chaining
     */
    setOrthographicParameters(left, right, top, bottom, near, far, zoom = 1) {
      this.orthographic.config.left = left;
      this.orthographic.config.right = right;
      this.orthographic.config.top = top;
      this.orthographic.config.bottom = bottom;
      this.orthographic.config.near = near;
      this.orthographic.config.far = far;
      this.orthographic.config.zoom = zoom;
      if (this.activeMode === this.orthographic) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Get the current projection mode
     * @returns {string} The current projection mode ('perspective' or 'orthographic')
     */
    getProjectionMode() {
      return this.activeMode ? this.activeMode.config.type : null;
    }
    
    /**
     * Get all camera parameters for the current mode
     * @returns {Object} Camera parameters object
     */
    getParameters() {
      const common = {
        mode: this.getProjectionMode(),
        position: this.position.clone(),
        near: this.activeMode.config.near,
        far: this.activeMode.config.far
      };
      
      if (this.activeMode === this.perspective) {
        return {
          ...common,
          fov: this.perspective.config.fov,
          aspect: this.perspective.config.aspect
        };
      } else if (this.activeMode === this.orthographic) {
        return {
          ...common,
          left: this.orthographic.config.left,
          right: this.orthographic.config.right,
          top: this.orthographic.config.top,
          bottom: this.orthographic.config.bottom,
          zoom: this.orthographic.config.zoom
        };
      }
      
      return common;
    }
    
    /**
     * Register a new projection mode
     * 
     * This allows extending the camera with custom projection modes.
     * 
     * @param {string} name - Name of the projection mode
     * @param {Object} mode - Projection mode implementation
     * @returns {Camera} The camera instance for method chaining
     */
    registerProjectionMode(name, mode) {
      this.projectionModes[name] = mode;
      return this;
    }
    
    /**
     * Switch to a specific projection mode
     * 
     * @param {string} name - Name of the projection mode to use
     * @returns {Camera} The camera instance for method chaining
     */
    setProjectionMode(name) {
      if (this.projectionModes[name]) {
        this.activeMode = this.projectionModes[name];
        this.isOrthographic = (name === 'orthographic');
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Switch to perspective projection mode
     * @returns {Camera} The camera instance for method chaining
     */
    setPerspectiveMode() {
      return this.setProjectionMode('perspective');
    }
    
    /**
     * Switch to orthographic projection mode
     * @returns {Camera} The camera instance for method chaining
     */
    setOrthographicMode() {
      return this.setProjectionMode('orthographic');
    }
    
    /**
     * Update the projection matrix
     * 
     * This updates the projection matrix based on the current
     * projection mode and its parameters.
     * 
     * @returns {Camera} The camera instance for method chaining
     */
    updateProjectionMatrix() {
      if (this.activeMode) {
        this.activeMode.updateProjectionMatrix();
        this.updateViewProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Update the view matrix
     * @returns {Camera} The camera instance for method chaining
     */
    updateViewMatrix() {
      // Called by the renderer or OrbitController
      return this;
    }
    
    /**
     * Make the camera look at a specific target point
     * 
     * This points the camera at the target and computes
     * the appropriate view matrix.
     * 
     * @param {Vector3} target - The point to look at
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Make camera look at the origin
     * camera.lookAt(new Vector3(0, 0, 0));
     */
    lookAt(target) {
      // Calculate direction from camera to target
      const lookDir = new Vector3().copy(target).sub(this.position).normalize();
      
      // Calculate right vector as cross product of world up and look direction
      const worldUp = new Vector3(0, 1, 0);
      const right = new Vector3().copy(worldUp).cross(lookDir).normalize();
      
      // Calculate camera up vector as cross product of look direction and right
      const up = new Vector3().copy(lookDir).cross(right).normalize();
      
      // Set the view matrix in column-major format
      this.viewMatrix.set(
        right.x, right.y, right.z, 0,
        up.x, up.y, up.z, 0,
        lookDir.x, lookDir.y, lookDir.z, 0,
        0, 0, 0, 1
      );
      
      // Apply translation component
      const te = this.viewMatrix.elements;
      te[12] = -right.dot(this.position);
      te[13] = -up.dot(this.position);
      te[14] = -lookDir.dot(this.position);
      
      // Update the combined view-projection matrix
      this.updateViewProjectionMatrix();
      
      return this;
    }
    
    /**
     * Position camera in an orbit around a target point
     * 
     * This method places the camera at a specific spherical position
     * relative to the target point and ensures the camera is looking
     * at the target.
     * 
     * @param {Vector3} target - The point to orbit around
     * @param {number} distance - Distance from target
     * @param {number} phi - Vertical angle in radians (0 = top, π = bottom)
     * @param {number} theta - Horizontal angle in radians (0 = front)
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Position camera at 45° angles looking at origin
     * const target = new Vector3(0, 0, 0);
     * camera.orbit(target, 10, Math.PI/4, Math.PI/4);
     */
    orbit(target, distance, phi, theta) {
      // Calculate position in spherical coordinates
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      // Calculate position in spherical coordinates relative to target
      this.position.x = target.x + distance * sinPhi * sinTheta;
      this.position.y = target.y + distance * cosPhi;
      this.position.z = target.z + distance * sinPhi * cosTheta;
      
      // Make the camera look at the target
      this.lookAt(target);
      
      return this;
    }
    
    /**
     * Update the combined view-projection matrix
     * 
     * This combines the view and projection matrices to create
     * the final transformation matrix for rendering.
     * 
     * @returns {Camera} The camera instance for method chaining
     */
    updateViewProjectionMatrix() {
      // Combine view and projection matrices
      this.viewProjectionMatrix.copy(this.projectionMatrix).multiply(this.viewMatrix);
      return this;
    }
  }

  /**
   * ViewCamera - Extended camera with standard views support
   * 
   * The ViewCamera extends the base Camera with predefined views
   * and provides an API for managing and switching between these views.
   * 
   * Predefined views include:
   * - front, back, top, bottom, left, right
   * - user (customizable)
   * 
   * @extends Camera
   */
  class ViewCamera extends Camera {
    /**
     * Create a new ViewCamera
     * @param {string} initialMode - Initial projection mode ('perspective' or 'orthographic')
     */
    constructor(initialMode = 'perspective') {
      super(initialMode);
      
      // Define standard views (phi = vertical angle, theta = horizontal angle)
      this.views = {
        front: { phi: Math.PI/2, theta: 0 },
        back: { phi: Math.PI/2, theta: Math.PI },
        top: { phi: 0, theta: 0 },
        bottom: { phi: Math.PI, theta: 0 },
        left: { phi: Math.PI/2, theta: Math.PI/2 },
        right: { phi: Math.PI/2, theta: -Math.PI/2 },
        user: { phi: Math.PI/4, theta: Math.PI/4 } // Default user view
      };
      
      // Event system for view changes
      this.onViewChange = null; // Callback for view changes
      this.currentView = 'user'; // Track current view name
    }
    
    /**
     * Set camera to a predefined view
     * 
     * @param {string} viewName - Name of the predefined view
     * @returns {ViewCamera} The camera instance for method chaining
     * 
     * @example
     * // Set to top view
     * camera.setView('top');
     */
    setView(viewName) {
      if (!this.views[viewName]) {
        console.warn(`View "${viewName}" not found`);
        return this;
      }
      
      this.currentView = viewName;
      
      // Trigger event with view data
      if (typeof this.onViewChange === 'function') {
        this.onViewChange(viewName, this.views[viewName]);
      }
      
      return this;
    }
    
    /**
     * Save current angles as user view
     * 
     * @param {number} phi - Vertical angle in radians
     * @param {number} theta - Horizontal angle in radians
     * @returns {ViewCamera} The camera instance for method chaining
     */
    saveUserView(phi, theta) {
      this.views.user = { phi, theta };
      return this;
    }
    
    /**
     * Register a callback for view changes
     * 
     * @param {Function} callback - Function to call when view changes
     * @returns {ViewCamera} The camera instance for method chaining
     */
    registerViewChangeCallback(callback) {
      if (typeof callback === 'function') {
        this.onViewChange = callback;
      }
      return this;
    }
    
    /**
     * Add a custom view
     * 
     * @param {string} name - Name of the view
     * @param {number} phi - Vertical angle in radians
     * @param {number} theta - Horizontal angle in radians
     * @returns {ViewCamera} The camera instance for method chaining
     * 
     * @example
     * // Add a custom 3/4 view
     * camera.addView('threeQuarter', Math.PI/4, Math.PI/4);
     */
    addView(name, phi, theta) {
      if (typeof name !== 'string' || name.trim() === '') {
        console.warn('Invalid view name');
        return this;
      }
      
      this.views[name] = { phi, theta };
      return this;
    }
    
    /**
     * Remove a custom view
     * 
     * @param {string} name - Name of the view to remove
     * @returns {ViewCamera} The camera instance for method chaining
     */
    removeView(name) {
      // Don't allow removing standard views
      const standardViews = ['front', 'back', 'top', 'bottom', 'left', 'right', 'user'];
      if (standardViews.includes(name)) {
        console.warn(`Cannot remove standard view: ${name}`);
        return this;
      }
      
      delete this.views[name];
      return this;
    }
    
    /**
     * Get the name of the current view
     * @returns {string} Name of the current view
     */
    getCurrentView() {
      return this.currentView;
    }
    
    /**
     * Get list of all available views
     * @returns {string[]} Array of view names
     */
    getAvailableViews() {
      return Object.keys(this.views);
    }
  }

  // ---- Material ----
  class Material {
    constructor(color = '#FFFFFF', opacity = 1.0) {
      this.color = color;
      this.opacity = opacity;
      this.wireframe = false;
      this.transparent = opacity < 1.0; // Flag to indicate if material is transparent
    }
    
    setOpacity(value) {
      this.opacity = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
      this.transparent = this.opacity < 1.0;
      return this;
    }
    
    setColor(color) {
      this.color = color;
      return this;
    }
    
    setWireframe(wireframe) {
      this.wireframe = wireframe;
      return this;
    }
    
    // Clone the material
    clone() {
      const newMaterial = new Material(this.color, this.opacity);
      newMaterial.wireframe = this.wireframe;
      return newMaterial;
    }
  }

  // ---- Geometry ----
  class Face {
    constructor(a, b, c, normal = new Vector3(), material = null) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.normal = normal;
      this.material = material;
      this.depth = 0; // Will be calculated during rendering
    }
    
    calculateDepth(vertices) {
      const za = vertices[this.a].z;
      const zb = vertices[this.b].z;
      const zc = vertices[this.c].z;
      // Depth for painter's algorithm sorting
      this.depth = (za + zb + zc) / 3;
      return this;
    }
  }

  // ---- SVG Renderer ----
  class SVGRenderer {
    constructor(container, width = 800, height = 600) {
      this.container = container;
      this.width = width;
      this.height = height;
      this.svg = null;
      this.showWireframe = true;
      this.renderMode = 'normal'; // 'normal', 'depth', 'wireframe', 'solid'
      this.handleIntersections = true;
      this.showIntersectionLines = true;
      this.intersectionMarkers = null;
      this.lightDirection = new Vector3(1, 1, 1).normalize();
      this.renderableFaces = [];
      this.backfaceCullingEnabled = true;
      this.intersectionThreshold = 0.05;
      this.planeDepthBias = 0.01; // Small bias for plane depth to avoid z-fighting
      
      this.initialize();
    }
    
    initialize() {
      // Create SVG element with namespaces
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('width', this.width);
      this.svg.setAttribute('height', this.height);
      this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
      this.svg.style.backgroundColor = '#111';
      
      // Create a group for the scene
      this.sceneGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.svg.appendChild(this.sceneGroup);
      
      // Add SVG to container
      this.container.appendChild(this.svg);
    }
    
    setSize(width, height) {
      this.width = width;
      this.height = height;
      
      this.svg.setAttribute('width', width);
      this.svg.setAttribute('height', height);
      this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Update camera aspect ratio if it exists
      if (this.camera) {
        // Handle different camera types
        if (this.camera.perspective) {
          // Camera with perspective projection mode
          this.camera.perspective.aspect = width / height;
          this.camera.updateProjectionMatrix();
        } else if (this.camera.aspect) {
          // Direct aspect ratio property
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
        }
      }
      
      return this;
    }
    
    setRenderMode(mode) {
      if (['normal', 'depth', 'wireframe', 'solid'].includes(mode)) {
        this.renderMode = mode;
      }
      return this;
    }
    
    toggleWireframe() {
      this.showWireframe = !this.showWireframe;
      return this;
    }
    
    getWireframeState() {
      return this.showWireframe;
    }
    
    // Calculate depth color - converts depth to a color gradient
    getDepthColor(depth) {
      // Map depth to a value between 0 and 1
      const normalizedDepth = Math.max(0, Math.min(1, 
        (depth - this.depthNear) / (this.depthFar - this.depthNear)
      ));
      
      // Convert to a grayscale color (white=near, black=far)
      const colorValue = Math.floor(255 * (1 - normalizedDepth));
      return `rgb(${colorValue},${colorValue},${colorValue})`;
    }
    
    // Generate a hue color for depth visualization
    getDepthColorHue(depth) {
      // Map depth to a hue value (0-360)
      // Near objects are blue (240), far objects are red (0)
      const normalizedDepth = Math.max(0, Math.min(1, 
        (depth - this.depthNear) / (this.depthFar - this.depthNear)
      ));
      
      // Convert to hue (far = red, near = blue)
      const hue = 240 - (normalizedDepth * 240);
      return `hsl(${hue}, 100%, 50%)`;
    }
    
    toggleIntersectionHandling() {
      this.handleIntersections = !this.handleIntersections;
      return this;
    }
    
    getIntersectionHandlingState() {
      return this.handleIntersections;
    }
    
    toggleIntersectionLines() {
      this.showIntersectionLines = !this.showIntersectionLines;
      return this;
    }
    
    getIntersectionLinesState() {
      return this.showIntersectionLines;
    }
    
    render(scene, camera) {
      this.camera = camera;
      
      // Clear previous rendering
      while (this.sceneGroup.firstChild) {
        this.sceneGroup.removeChild(this.sceneGroup.firstChild);
      }
      
      // Reset renderable faces array for global sorting
      this.renderableFaces = [];
      this.intersectionMarkers = [];
      
      // Update camera matrices
      camera.updateMatrix();
      camera.updateWorldMatrix();
      camera.updateViewMatrix();
      camera.updateViewProjectionMatrix();
      
      // Process the scene graph to collect all renderable faces
      this.processObject(scene, camera);
      
      // Sort all faces by depth (furthest first) - Painter's algorithm globally across all objects
      this.renderableFaces.sort((a, b) => b.depth - a.depth);
      
      // Render all faces in order
      this.renderFaces();
      
      // Render intersection markers if enabled
      if (this.handleIntersections && this.showIntersectionLines) {
        this.renderIntersectionMarkers();
      }
    }
    
    processObject(object, camera) {
      if (!object.visible) return;
      
      // Update object's matrix
      object.updateMatrix();
      object.updateWorldMatrix();
      
      // Process faces for all geometry objects
      if (object instanceof Cube || object instanceof Sphere || object instanceof Plane) {
        this.processFaces(object, camera);
      }
      
      // Process children
      object.children.forEach(child => {
        this.processObject(child, camera);
      });
    }
    
    // Generic method to process faces for any geometry object
    processFaces(object, camera) {
      // Get the object type from its constructor
      const objectType = object.constructor.name;
      
      // Project all vertices
      const projectedVertices = [];
      
      for (let i = 0; i < object.vertices.length; i++) {
        projectedVertices.push(this.projectVertex(object.vertices[i], object, camera, true));
      }
      
      // Process each face
      const facesToProcess = [];
      
      object.faces.forEach(face => {
        // Get the projected vertices for this face
        const va = projectedVertices[face.a];
        const vb = projectedVertices[face.b];
        const vc = projectedVertices[face.c];
        
        // Calculate face normal in world space for backface culling
        const edge1 = new Vector3(
          vb.worldPos.x - va.worldPos.x,
          vb.worldPos.y - va.worldPos.y,
          vb.worldPos.z - va.worldPos.z
        );
        
        const edge2 = new Vector3(
          vc.worldPos.x - va.worldPos.x,
          vc.worldPos.y - va.worldPos.y,
          vc.worldPos.z - va.worldPos.z
        );
        
        const normal = new Vector3().copy(edge1).cross(edge2).normalize();
        
        // Calculate view direction from face to camera
        const center = new Vector3(
          (va.worldPos.x + vb.worldPos.x + vc.worldPos.x) / 3,
          (va.worldPos.y + vb.worldPos.y + vc.worldPos.y) / 3,
          (va.worldPos.z + vb.worldPos.z + vc.worldPos.z) / 3
        );
        
        const viewDirection = new Vector3(
          camera.position.x - center.x,
          camera.position.y - center.y,
          camera.position.z - center.z
        ).normalize();
        
        // Dot product - if positive, face is visible to camera
        const dot = normal.dot(viewDirection);
        
        // Use a small epsilon value to prevent faces from disappearing when almost perpendicular
        // This allows faces that are very slightly facing away to still be rendered
        const BACKFACE_CULLING_EPSILON = this.backfaceCullingEnabled ? -0.01 : -0.05; // Tighter tolerance when enabled
        
        // Special handling for very thin objects (like planes)
        const isVeryThin = Math.abs(normal.dot(viewDirection)) < 0.1;
        
        // Only collect faces facing the camera or almost perpendicular
        if (dot > BACKFACE_CULLING_EPSILON || (isVeryThin && objectType === 'Plane')) {
          // Calculate the distance from camera to each vertex and take the minimum
          // This ensures that the closest point of the face is used for depth sorting
          const d1 = this.calculatePointDistance(va.worldPos, camera.position);
          const d2 = this.calculatePointDistance(vb.worldPos, camera.position);
          const d3 = this.calculatePointDistance(vc.worldPos, camera.position);
          
          // Use minimum distance for more accurate depth sorting
          const depth = Math.min(d1, d2, d3);
          
          // Store face data for potential intersection processing
          facesToProcess.push({
            vertices: [object.vertices[face.a], object.vertices[face.b], object.vertices[face.c]],
            worldVertices: [va.worldPos, vb.worldPos, vc.worldPos],
            screenPoints: [va, vb, vc],
            depth: depth,
            normal: normal,
            material: face.material,
            objectId: object.id,
            objectType: objectType
          });
        }
      });
      
      // Process intersections if enabled
      if (this.handleIntersections && facesToProcess.length > 0) {
        this.processIntersections(facesToProcess);
      } else {
        // If intersection handling is disabled, just add faces directly
        facesToProcess.forEach(face => {
          this.renderableFaces.push({
            points: face.screenPoints,
            depth: face.depth,
            material: face.material,
            objectId: face.objectId
          });
        });
      }
    }
    
    // Helper method to calculate distance between two points in 3D space
    calculatePointDistance(point1, point2) {
      const dx = point1.x - point2.x;
      const dy = point1.y - point2.y;
      const dz = point1.z - point2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Process potential intersections between faces
    processIntersections(faces) {
      // Reset intersection markers
      this.intersectionMarkers = [];
      
      // If we have very few faces, don't bother with intersection checks
      if (faces.length < 2) {
        // Just add the original faces and return
        faces.forEach(face => {
          this.renderableFaces.push({
            points: face.screenPoints,
            depth: face.depth,
            material: face.material,
            objectId: face.objectId,
            isSubdivided: false
          });
        });
        return;
      }
      
      // Track which faces have been processed
      const processedFaces = new Set();
      
      // Calculate world-space bounding box to help generate intersection markers
      let worldMin = new Vector3(Infinity, Infinity, Infinity);
      let worldMax = new Vector3(-Infinity, -Infinity, -Infinity);
      
      faces.forEach(face => {
        face.worldVertices.forEach(vertex => {
          worldMin.x = Math.min(worldMin.x, vertex.x);
          worldMin.y = Math.min(worldMin.y, vertex.y);
          worldMin.z = Math.min(worldMin.z, vertex.z);
          
          worldMax.x = Math.max(worldMax.x, vertex.x);
          worldMax.y = Math.max(worldMax.y, vertex.y);
          worldMax.z = Math.max(worldMax.z, vertex.z);
        });
      });
      
      // Add some padding to the bounding box
      worldMin.x -= 1;
      worldMin.y -= 1;
      worldMin.z -= 1;
      worldMax.x += 1;
      worldMax.y += 1;
      worldMax.z += 1;
      
      // Check for potential intersections
      for (let i = 0; i < faces.length; i++) {
        for (let j = i + 1; j < faces.length; j++) {
          const faceA = faces[i];
          const faceB = faces[j];
          
          // Skip faces from the same object
          if (faceA.objectId === faceB.objectId) continue;
          
          // Early rejection test - if the depth difference is large, they can't intersect
          // This now uses the closest point from each face for a more accurate test
          if (Math.abs(faceA.depth - faceB.depth) > this.intersectionThreshold) continue;
          
          // Check if triangles potentially intersect using a more accurate method
          // that considers the actual 3D geometry rather than just depth
          const intersects = IntersectionHelper.trianglesIntersect(
            faceA.worldVertices[0], faceA.worldVertices[1], faceA.worldVertices[2],
            faceB.worldVertices[0], faceB.worldVertices[1], faceB.worldVertices[2]
          );
          
          if (intersects) {
            // Create planes for both faces
            const planeA = new Plane3D(
              faceA.worldVertices[0], faceA.worldVertices[1], faceA.worldVertices[2]
            );
            
            const planeB = new Plane3D(
              faceB.worldVertices[0], faceB.worldVertices[1], faceB.worldVertices[2]
            );
            
            // Generate intersection markers if enabled
            if (this.showIntersectionLines) {
              const markers = IntersectionHelper.generateIntersectionMarkers(
                planeA, planeB, worldMin, worldMax
              );
              
              markers.forEach(marker => {
                // Project marker to screen space
                const projectedMarker = this.projectVertex(marker, { worldMatrix: new Matrix4() }, this.camera);
                
                // Calculate depth
                const depth = this.calculatePointDistance(marker, this.camera.position);
                
                // Store marker for rendering
                this.intersectionMarkers.push({
                  point: projectedMarker,
                  depth: depth
                });
              });
            }
            
            // Subdivide face A along plane B
            const subdividedA = IntersectionHelper.subdivideTriangle(
              faceA.worldVertices[0], faceA.worldVertices[1], faceA.worldVertices[2], planeB
            );
            
            // Subdivide face B along plane A
            const subdividedB = IntersectionHelper.subdivideTriangle(
              faceB.worldVertices[0], faceB.worldVertices[1], faceB.worldVertices[2], planeA
            );
            
            // Only process subdivided faces if they exist
            if (subdividedA) {
              this.processSubdividedFaces(subdividedA, faceA, true);
              processedFaces.add(i);
            }
            
            if (subdividedB) {
              this.processSubdividedFaces(subdividedB, faceB, false);
              processedFaces.add(j);
            }
          }
        }
      }
      
      // Add any unprocessed faces (those that didn't intersect with others)
      faces.forEach((face, index) => {
        if (!processedFaces.has(index)) {
          this.renderableFaces.push({
            points: face.screenPoints,
            depth: face.depth,
            material: face.material,
            objectId: face.objectId,
            isSubdivided: false
          });
        }
      });
    }
    
    // Process subdivided faces from intersection
    processSubdividedFaces(subdivided, originalFace, isFront) {
      // Extract material and screen points from the original face
      const material = originalFace.material;
      const originalScreenPoints = originalFace.screenPoints;
      
      // Process front faces and back faces
      const subset = isFront ? subdivided.front : subdivided.back;
      
      // Skip if the subset is empty
      if (!subset || subset.length === 0) return;
      
      // Process each triangle in the subset
      subset.forEach(triangle => {
        // Get world-space points
        const p1 = triangle[0];
        const p2 = triangle[1];
        const p3 = triangle[2];
        
        // Project to screen space
        const s1 = this.projectVertex(p1, { worldMatrix: new Matrix4() }, this.camera);
        const s2 = this.projectVertex(p2, { worldMatrix: new Matrix4() }, this.camera);
        const s3 = this.projectVertex(p3, { worldMatrix: new Matrix4() }, this.camera);
        
        // Combine into a list
        const screenPoints = [s1, s2, s3];
        
        // Calculate depth based on the minimum distance to camera
        const d1 = this.calculatePointDistance(p1, this.camera.position);
        const d2 = this.calculatePointDistance(p2, this.camera.position);
        const d3 = this.calculatePointDistance(p3, this.camera.position);
        const depth = Math.min(d1, d2, d3);
        
        // Add subdivided face with depth based on true geometric distance
        this.renderableFaces.push({
          points: screenPoints,
          depth: depth,
          material: material,
          objectId: originalFace.objectId,
          isSubdivided: true,
          isFront: isFront
        });
      });
    }
    
    // Render all sorted faces
    renderFaces() {
      // First pass: update depth range for visualization modes
      if (this.renderMode === 'depth' || this.renderMode === 'color-depth') {
        // Find min and max depth in the current frame
        let minDepth = Infinity;
        let maxDepth = -Infinity;
        
        this.renderableFaces.forEach(face => {
          minDepth = Math.min(minDepth, face.depth);
          maxDepth = Math.max(maxDepth, face.depth);
        });
        
        // Add a small padding to avoid division by zero
        if (maxDepth - minDepth < 0.001) {
          maxDepth = minDepth + 0.001;
        }
        
        // Update depth range
        this.depthNear = minDepth;
        this.depthFar = maxDepth;
      }
      
      // More precise sorting function that respects object type and depth
      const sortFaces = (a, b) => {
        // First compare by depth (back to front for painter's algorithm)
        const depthDifference = b.depth - a.depth;
        
        // If depth difference is very small, use additional sorting criteria
        if (Math.abs(depthDifference) < 0.001) {
          // If faces are from the same object, preserve original order
          if (a.objectId === b.objectId) {
            return 0;
          }
          
          // If one is subdivided and the other is not, render subdivided first
          if (a.isSubdivided !== b.isSubdivided) {
            return a.isSubdivided ? -1 : 1;
          }
          
          // If both are subdivided, sort by isFront parameter
          if (a.isSubdivided && b.isSubdivided) {
            if (a.isFront !== b.isFront) {
              return a.isFront ? -1 : 1;
            }
          }
          
          // If still tied, prefer opaque objects before transparent
          if ((a.material.opacity === 1) !== (b.material.opacity === 1)) {
            return a.material.opacity === 1 ? -1 : 1;
          }
          
          // Last resort: sort by objectId for consistency
          return a.objectId - b.objectId;
        }
        
        // Otherwise, use standard back-to-front sorting
        return depthDifference;
      };
      
      // For normal rendering, separate transparent and opaque faces
      if (this.renderMode === 'normal') {
        // Separate transparent and opaque faces
        const opaqueFaces = [];
        const transparentFaces = [];
        
        this.renderableFaces.forEach(face => {
          if (face.material.opacity < 1) {
            transparentFaces.push(face);
          } else {
            opaqueFaces.push(face);
          }
        });
        
        // Sort both sets of faces using our improved sorting function
        opaqueFaces.sort(sortFaces);
        transparentFaces.sort(sortFaces);
        
        // Combine: render opaque faces first, then transparent
        this.renderableFaces = [...opaqueFaces, ...transparentFaces];
      } else {
        // For all other modes, use our improved sorting
        this.renderableFaces.sort(sortFaces);
      }
      
      // Render sorted faces
      this.renderableFaces.forEach(face => {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        
        // Set points attribute
        const pointsAttr = face.points.map(p => `${p.x},${p.y}`).join(' ');
        polygon.setAttribute('points', pointsAttr);
        
        // Apply styling based on render mode
        switch (this.renderMode) {
          case 'normal':
            // Regular material rendering, but highlight subdivided faces
            if (face.isSubdivided) {
              // Use a slightly different color to indicate subdivision
              const originalColor = face.material.color;
              let highlightColor = originalColor;
              
              // Alter the color slightly to show it's subdivided
              if (face.isFront) {
                // Brighter for front faces
                highlightColor = this.adjustColor(originalColor, 1.2);
              } else {
                // Darker for back faces
                highlightColor = this.adjustColor(originalColor, 0.8);
              }
              
              polygon.setAttribute('fill', highlightColor);
              // Add a special stroke to highlight intersection boundaries
              polygon.setAttribute('stroke', '#fff');
              polygon.setAttribute('stroke-width', '1.5');
              polygon.setAttribute('stroke-opacity', '0.8');
            } else {
              polygon.setAttribute('fill', face.material.color);
              // Only add stroke if wireframe is enabled
              if (this.showWireframe) {
                polygon.setAttribute('stroke', '#000');
                polygon.setAttribute('stroke-width', '1');
              } else {
                polygon.setAttribute('stroke', 'none');
              }
            }
            polygon.setAttribute('fill-opacity', face.material.opacity.toString());
            break;
            
          case 'depth':
            // Depth visualization - white is near, black is far
            // Normalize depth for visualization
            const normalizedDepth = (face.depth - this.depthNear) / (this.depthFar - this.depthNear);
            // Convert to grayscale (darker = further away)
            const colorValue = Math.floor(255 * (1 - normalizedDepth));
            polygon.setAttribute('fill', `rgb(${colorValue},${colorValue},${colorValue})`);
            // Only add stroke if wireframe is enabled
            if (this.showWireframe) {
              polygon.setAttribute('stroke', '#333');
              polygon.setAttribute('stroke-width', '1');
            } else {
              polygon.setAttribute('stroke', 'none');
            }
            polygon.setAttribute('fill-opacity', '1.0'); // Always opaque for depth view
            break;
            
          case 'wireframe':
            // Just show lines
            polygon.setAttribute('fill', 'none');
            polygon.setAttribute('stroke', '#fff');
            polygon.setAttribute('stroke-width', '1');
            break;
            
          case 'solid':
            // Solid color based on object, ignore transparency
            polygon.setAttribute('fill', face.material.color);
            // Only add stroke if wireframe is enabled
            if (this.showWireframe) {
              polygon.setAttribute('stroke', '#000');
              polygon.setAttribute('stroke-width', '1');
            } else {
              polygon.setAttribute('stroke', 'none');
            }
            polygon.setAttribute('fill-opacity', '1.0'); // Always fully opaque
            break;
        }
        
        // Store depth as data attribute for debugging
        polygon.setAttribute('data-depth', face.depth.toFixed(2));
        if (face.objectId) {
          polygon.setAttribute('data-object-id', face.objectId);
        }
        
        // Add a transparency flag for debugging
        if (face.material.transparent) {
          polygon.setAttribute('data-transparent', 'true');
        }
        
        this.sceneGroup.appendChild(polygon);
      });
    }
    
    // Helper to adjust a color's brightness
    adjustColor(hexColor, factor) {
      // Convert hex to RGB
      let r = parseInt(hexColor.slice(1, 3), 16);
      let g = parseInt(hexColor.slice(3, 5), 16);
      let b = parseInt(hexColor.slice(5, 7), 16);
      
      // Adjust brightness
      r = Math.min(255, Math.max(0, Math.floor(r * factor)));
      g = Math.min(255, Math.max(0, Math.floor(g * factor)));
      b = Math.min(255, Math.max(0, Math.floor(b * factor)));
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Project a vertex from 3D to 2D screen space
    projectVertex(vertex, object, camera, storeWorldPos = false) {
      // Clone vertex to avoid modifying original
      const v = vertex.clone();
      
      // Transform to world space (Object Space -> World Space)
      object.worldMatrix.transformPoint(v);
      
      // Store world position for possible use
      const worldPos = v.clone();
      
      // Transform to view space (World Space -> View Space)
      camera.viewMatrix.transformPoint(v);
      
      // Store view space Z if needed
      const viewZ = v.z;
      
      // Apply projection matrix to get clip space coordinates
      const clipSpacePos = vertex.clone();
      
      // In column-major order:
      // First transform to world space
      object.worldMatrix.transformPoint(clipSpacePos);
      // Then to view space
      camera.viewMatrix.transformPoint(clipSpacePos);
      // Then to clip space
      camera.projectionMatrix.transformPoint(clipSpacePos);
      
      // Perspective division to get NDC coordinates
      // Only needed for perspective projection, not for orthographic
      const isOrthographic = camera.activeMode && camera.activeMode.type === 'orthographic';
      if (!isOrthographic && clipSpacePos.z !== 0) {
        clipSpacePos.x /= Math.abs(clipSpacePos.z);
        clipSpacePos.y /= Math.abs(clipSpacePos.z);
      }
      
      // Convert from NDC to screen coordinates
      const screenX = (clipSpacePos.x + 1) * 0.5 * this.width;
      const screenY = (clipSpacePos.y + 1) * 0.5 * this.height; // No longer need to flip Y
      
      return {
        x: screenX,
        y: screenY,
        z: viewZ,
        worldPos: worldPos
      };
    }
    
    renderCube(cube, camera) {
      // This method is now just a wrapper for processFaces
      // The actual rendering is done globally after sorting all faces
      this.processFaces(cube, camera);
    }
    
    // Render intersection markers
    renderIntersectionMarkers() {
      // Sort markers by depth
      this.intersectionMarkers.sort((a, b) => b.depth - a.depth);
      
      // Render each marker
      this.intersectionMarkers.forEach(marker => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', marker.point.x);
        circle.setAttribute('cy', marker.point.y);
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', '#ffff00');
        circle.setAttribute('stroke', '#000000');
        circle.setAttribute('stroke-width', '1');
        
        this.sceneGroup.appendChild(circle);
      });
    }
    
    // Toggle backface culling
    setBackfaceCulling(enabled) {
      this.backfaceCullingEnabled = enabled;
    }
    
    // Get backface culling state
    getBackfaceCullingState() {
      return this.backfaceCullingEnabled;
    }
  }

  // ---- Animation Loop ----
  class RenderLoop {
    constructor(renderer, scene, camera, controllers = [], minimap = null) {
      this.renderer = renderer;
      this.scene = scene;
      this.camera = camera;
      this.controllers = Array.isArray(controllers) ? controllers : [controllers];
      this.minimap = minimap;
      this.lastTime = 0;
      this.fps = 60;
      this.frameCount = 0;
      this.lastFpsUpdate = 0;
      this.isRunning = false;
      this.animationId = null;
      
      // Stats tracking
      this.meshCount = 0;
      this.faceCount = 0;
    }
    
    start() {
      this.isRunning = true;
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    stop() {
      this.isRunning = false;
      cancelAnimationFrame(this.animationId);
    }
    
    updateStats() {
      // Count meshes and faces in the scene (can be overridden)
      this.meshCount = 0;
      this.faceCount = 0;
      
      const countObjects = (object) => {
        // Check if object has faces (shape objects will have faces)
        if (object.faces) {
          this.meshCount++;
          this.faceCount += object.faces.length;
        }
        
        if (object.children) {
          object.children.forEach(child => {
            countObjects(child);
          });
        }
      };
      
      countObjects(this.scene);
      
      // Update minimap if available
      if (this.minimap) {
        this.minimap.update();
      }
    }
    
    animate(time) {
      if (!this.isRunning) return;
      
      // Calculate delta time
      const deltaTime = (time - this.lastTime) / 1000; // in seconds
      this.lastTime = time;
      
      // Update FPS calculation
      this.frameCount++;
      if (time - this.lastFpsUpdate > 1000) { // Update FPS every second
        this.fps = this.frameCount * 1000 / (time - this.lastFpsUpdate);
        this.frameCount = 0;
        this.lastFpsUpdate = time;
        
        // Update stats
        this.updateStats();
      }
      
      // Update controllers
      this.controllers.forEach(controller => {
        if (controller && typeof controller.update === 'function') {
          controller.update(deltaTime);
        }
      });
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
      
      // Continue animation loop
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
  }