# Liquid Glass Shader Project

A step-by-step implementation of liquid glass shaders using WebGL, built incrementally to demonstrate various shader techniques.

## Current Status: Phase 1 - Rendering Pipeline Setup ✅

### What's Implemented:
- **Responsive Canvas**: Automatically resizes to maintain square aspect ratio
- **WebGL Context**: Proper WebGL initialization with error handling
- **Responsive Design**: Canvas takes 80% of the smallest window dimension
- **Centered Layout**: Canvas is perfectly centered both horizontally and vertically
- **Event Handling**: Window resize events properly handled
- **Modern UI**: Clean, glassmorphic design with backdrop blur effects

### Files Created:
- `index.html` - Main HTML structure with canvas
- `styles.css` - Responsive styling and centering
- `main.js` - WebGL context and canvas management
- `README.md` - Project documentation

## Next Steps (Phase 2):
- Add basic 3D scene with camera and renderer
- Implement background object geometry
- Add foreground glass object
- Basic lighting setup

## How to Run:
1. Open `index.html` in a modern web browser
2. The canvas will automatically size itself to fit your window
3. Check the browser console for WebGL initialization details

## Technical Details:
- Uses vanilla WebGL (no external libraries)
- Responsive canvas sizing with square aspect ratio
- Proper WebGL viewport management
- Event-driven resize handling 