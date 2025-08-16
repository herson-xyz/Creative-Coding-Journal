# Liquid Glass Shader Project

A step-by-step implementation of liquid glass shaders using WebGL, built incrementally to demonstrate various shader techniques.

## Current Status: Phase 3 - Step 1: Basic Transparency & Alpha Blending ✅

### What's Implemented:
- **Responsive Canvas**: Automatically resizes to maintain square aspect ratio
- **WebGL Context**: Proper WebGL initialization with error handling
- **Responsive Design**: Canvas takes 80% of the smallest window dimension
- **Centered Layout**: Canvas is perfectly centered both horizontally and vertically
- **Event Handling**: Window resize events properly handled
- **Modern UI**: Clean, glassmorphic design with backdrop blur effects
- **3D Scene Setup**: Three.js integration with proper camera and renderer
- **Background Object**: Animated sphere with custom shader material (colorful gradient)
- **Glass Object**: Custom shader material with basic transparency and Fresnel effects
- **Lighting System**: Ambient, directional, and point lighting with shadows
- **Animation Loop**: Smooth rotation of both objects with shader time updates
- **Interactive Controls**: Real-time opacity slider for glass transparency adjustment
- **Custom Shaders**: Fragment and vertex shaders for glass material with alpha blending

### Files Created:
- `index.html` - Main HTML structure with canvas and Three.js import
- `styles.css` - Responsive styling and centering
- `main.js` - WebGL context, 3D scene, objects, and animation
- `README.md` - Project documentation

## Next Steps (Phase 3):
- Implement basic transparency/alpha blending shaders
- Add Fresnel effect (reflection at grazing angles)
- Begin refraction implementation
- Enhance glass material with custom shaders

## How to Run:
1. Open `index.html` in a modern web browser
2. The canvas will automatically size itself to fit your window
3. You'll see a rotating colorful sphere (background) and a transparent glass cube (foreground)
4. Check the browser console for scene initialization details

## Technical Details:
- Uses Three.js for 3D scene management
- Custom shader material for animated background object
- MeshPhysicalMaterial for realistic glass properties
- Proper lighting setup with shadows
- Responsive 3D camera and renderer
- Animation loop with delta time calculations 