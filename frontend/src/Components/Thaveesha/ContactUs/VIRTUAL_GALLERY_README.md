# Virtual Art Gallery Component

A fully navigable 360° virtual art gallery room built with Three.js for React applications.

## Features

### 🎨 **Immersive 3D Environment**
- **Cube-shaped gallery room** with four walls, floor, and ceiling
- **Realistic lighting** with ambient, directional, and point lights
- **Shadow mapping** for enhanced depth perception
- **Smooth camera controls** for natural navigation

### 🖼️ **Artwork Display**
- **6 curated artworks** positioned on different walls
- **Styled frames** with wooden borders and subtle shadows
- **Artwork information** including title, artist, and description
- **Hover interactions** to display artwork details

### 🎮 **Navigation Controls**
- **Mouse drag** for desktop users (click and drag to rotate)
- **Touch swipe** for mobile devices (swipe in any direction)
- **360° horizontal rotation** around the gallery
- **Vertical tilt** with natural limits for comfortable viewing
- **Smooth interpolation** for fluid camera movement

### 📱 **Responsive Design**
- **Mobile-optimized** touch controls
- **Responsive layout** that adapts to different screen sizes
- **Touch-friendly interface** with appropriate cursor states
- **Cross-platform compatibility** (desktop, tablet, mobile)

### 🎯 **User Experience**
- **Intuitive controls** with visual feedback
- **Loading states** with animated spinners
- **Accessibility features** including reduced motion support
- **High contrast mode** support for better visibility

## Installation

### Prerequisites
- React 16.8+ (for hooks support)
- Three.js library

### Install Dependencies
```bash
npm install three @types/three
```

### Import Component
```jsx
import VirtualGallery from './VirtualGallery';
```

## Usage

### Basic Implementation
```jsx
import React from 'react';
import VirtualGallery from './VirtualGallery';

function App() {
  return (
    <div>
      <h1>My Art Gallery</h1>
      <VirtualGallery />
    </div>
  );
}
```

### Integration in ContactUs Page
The VirtualGallery is already integrated into the ContactUs component:

```jsx
// In ContactUs.js
import VirtualGallery from './VirtualGallery';

// ... existing code ...

{/* Virtual Art Gallery */}
<section className="gallery-section">
  <VirtualGallery />
</section>
```

### Dedicated Gallery Page
A standalone gallery page is also available:

```jsx
import GalleryPage from './GalleryPage';

// Use in routing
<Route path="/gallery" element={<GalleryPage />} />
```

## Component Structure

### VirtualGallery.js
- **Main component** with Three.js scene setup
- **Artwork data** with positions, rotations, and metadata
- **Event handlers** for mouse and touch interactions
- **Animation loop** for smooth camera movement
- **Resource cleanup** and memory management

### VirtualGallery.css
- **Responsive styling** for the gallery container
- **Header and controls** styling
- **Artwork information** popup styling
- **Mobile optimizations** and accessibility features

### GalleryPage.js
- **Dedicated gallery page** with additional information
- **Navigation instructions** and feature highlights
- **Collection statistics** and artwork categories
- **Call-to-action** sections for user engagement

## Artwork Configuration

### Artwork Data Structure
```javascript
const artworks = [
  {
    id: 1,
    image: Pic1, // Imported image
    title: "Abstract Harmony",
    artist: "Sarah Chen",
    description: "A vibrant exploration of color and form",
    position: { x: -4.5, y: 0, z: -4.5 }, // 3D position
    rotation: { y: Math.PI / 2 }, // Wall orientation
    size: { width: 2, height: 1.5 } // Dimensions
  }
  // ... more artworks
];
```

### Wall Positions
- **Left Wall**: `x: -4.5, z: ±4.5` (rotation: `Math.PI / 2`)
- **Right Wall**: `x: 4.5, z: ±4.5` (rotation: `-Math.PI / 2`)
- **Back Wall**: `x: 0, z: -4.5` (rotation: `0`)
- **Front Wall**: `x: 0, z: 4.5` (rotation: `Math.PI`)

## Customization

### Adding New Artworks
1. Import new image files
2. Add artwork data to the `artworks` array
3. Position artwork on appropriate wall
4. Set correct rotation for wall orientation

### Modifying Gallery Dimensions
```javascript
// Change room size
const roomGeometry = new THREE.BoxGeometry(10, 6, 10); // width, height, depth

// Adjust camera distance
const radius = 8; // Distance from center
```

### Styling Customization
- Modify `VirtualGallery.css` for visual changes
- Update color schemes and typography
- Adjust responsive breakpoints
- Customize animations and transitions

## Performance Considerations

### Optimization Features
- **Efficient rendering** with proper material disposal
- **Event listener cleanup** to prevent memory leaks
- **Responsive canvas sizing** for different devices
- **Smooth animation** with requestAnimationFrame

### Mobile Performance
- **Touch event optimization** for smooth swiping
- **Reduced shadow complexity** on mobile devices
- **Efficient texture loading** and management
- **Battery-friendly** rendering loops

## Browser Compatibility

### Supported Browsers
- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+

### WebGL Requirements
- **WebGL 1.0** support required
- **Hardware acceleration** recommended
- **Modern graphics drivers** for best performance

## Troubleshooting

### Common Issues

#### Gallery Not Loading
- Check Three.js installation
- Verify image imports are correct
- Check browser console for errors

#### Performance Issues
- Reduce artwork resolution
- Simplify lighting setup
- Check device capabilities

#### Touch Controls Not Working
- Ensure touch events are enabled
- Test on actual mobile device
- Check for conflicting event listeners

### Debug Mode
Enable console logging for debugging:
```javascript
// Add to VirtualGallery component
console.log('Gallery loaded:', { scene, camera, renderer });
```

## Future Enhancements

### Planned Features
- **VR support** for immersive experiences
- **Artwork filtering** by category or artist
- **Audio guides** for artwork descriptions
- **Social sharing** of favorite pieces
- **Artwork purchase** integration

### Technical Improvements
- **WebGL 2.0** support for advanced features
- **Progressive loading** for large collections
- **Offline support** with service workers
- **Analytics tracking** for user interactions

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies
3. Run development server
4. Make changes and test
5. Submit pull request

### Code Style
- Follow existing React patterns
- Use consistent naming conventions
- Add comments for complex logic
- Maintain responsive design principles

## License

This component is part of the KalaaLink project and follows the project's licensing terms.

## Support

For technical support or feature requests:
- Check the troubleshooting section
- Review browser compatibility
- Test on different devices
- Contact the development team

---

**Note**: This component requires Three.js to be properly installed and configured in your React project. Ensure all dependencies are correctly installed before use.
