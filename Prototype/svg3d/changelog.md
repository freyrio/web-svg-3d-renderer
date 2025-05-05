# SVG3D Renderer Changelog

## Version 1.0.1

### Depth Calculation and Backface Culling Improvements

#### Improved Depth Calculation
- Enhanced `Face.calculateDepth()` method to use minimum distance to camera instead of average Z coordinate
- Added camera position parameter to depth calculation for more accurate results
- Implemented small material-based bias to ensure consistent ordering of adjacent faces
- Added helper method `Face.calculatePointDistance()` for distance calculations

#### Adaptive Intersection Detection
- Added `SVGRenderer.calculateAdaptiveThreshold()` method to calculate intersection thresholds based on scene scale
- Updated intersection detection to use adaptive thresholds instead of fixed values
- Improved intersection handling to scale with scene size and camera distance

#### Refined Backface Culling
- Added `SVGRenderer.isBackFacing()` method for more accurate and adaptive backface culling
- Made backface culling epsilon adaptive based on camera distance
- Updated `processFaces()` method to use the new adaptive backface culling
- Improved handling of special cases like plane meshes

These improvements help eliminate visible seams between adjacent triangle faces, resulting in:
- More accurate depth sorting for overlapping faces
- Better handling of intersecting geometry
- More consistent backface culling that adapts to viewing distance
- Smoother and more cohesive surface rendering
