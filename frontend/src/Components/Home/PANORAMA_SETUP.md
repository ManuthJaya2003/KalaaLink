# Panorama Viewer Setup Guide

## Overview
The Panorama Viewer component provides an interactive 360° panorama experience for showcasing art galleries. It's built with vanilla JavaScript and includes touch support, auto-rotate, and inertia effects.

## Features
- ✅ Interactive dragging (mouse) and swiping (touch)
- ✅ Inertia effect after dragging
- ✅ Auto-rotate toggle with smooth scrolling
- ✅ Reset button to restore initial view
- ✅ Responsive design for all devices
- ✅ Accessible controls with proper ARIA labels
- ✅ Cursor changes (grab/grabbing) for interaction

## Customization

### 1. Replace Panorama Image
To use your own panorama image:

1. **Image Requirements:**
   - Format: JPG, PNG, or WebP
   - Aspect ratio: Should be wide (3:1 or wider recommended)
   - Seamless: The left and right edges should connect seamlessly
   - Resolution: Minimum 2000px wide for good quality

2. **Update CSS:**
   In `PanoramaViewer.css`, find this line:
   ```css
   background: url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80') repeat-x;
   ```
   
   Replace with your image path:
   ```css
   background: url('/path/to/your/panorama.jpg') repeat-x;
   ```

### 2. Adjust Panorama Width
The panorama width is set to 300% of the container for seamless scrolling. Adjust if needed:

```css
.panorama-viewer {
  width: 300%; /* Adjust this value based on your image */
}
```

### 3. Customize Auto-rotate Speed
Modify the auto-rotate speed in `PanoramaViewer.js`:

```javascript
const autoRotateSpeedRef = useRef(0.5); // Increase for faster rotation
```

### 4. Styling Customization
- **Container dimensions**: Modify `.panorama-container` max-width and height
- **Colors**: Update CSS custom properties for theme consistency
- **Border radius**: Adjust `.panorama-container` border-radius for different styles

## Usage Examples

### Basic Implementation
```jsx
import PanoramaViewer from './PanoramaViewer';

function MyComponent() {
  return (
    <div>
      <PanoramaViewer />
    </div>
  );
}
```

### With Custom Props (Future Enhancement)
```jsx
<PanoramaViewer 
  imageUrl="/custom-panorama.jpg"
  autoRotateSpeed={0.3}
  containerHeight={600}
/>
```

## Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips
1. **Image Optimization**: Use WebP format when possible
2. **Image Size**: Keep panorama images under 2MB for fast loading
3. **Lazy Loading**: Consider lazy loading for multiple panorama viewers
4. **Touch Events**: Touch events are optimized for mobile performance

## Troubleshooting

### Common Issues

1. **Image Not Loading**
   - Check image path and format
   - Ensure image is accessible from your domain
   - Verify image dimensions are appropriate

2. **Dragging Not Working**
   - Check browser console for JavaScript errors
   - Ensure no CSS conflicts with pointer events
   - Verify touch events are enabled on mobile

3. **Auto-rotate Not Working**
   - Check if auto-rotate state is properly managed
   - Verify animation frame requests are working
   - Check for JavaScript errors in console

### Debug Mode
Add this to see panorama state:
```javascript
console.log('Panorama State:', {
  isDragging: isDraggingRef.current,
  autoRotate: autoRotateRef.current,
  velocity: velocityRef.current
});
```

## Accessibility Features
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ High contrast mode support
- ✅ Reduced motion support

## License
This component is part of the KalaaLink Artist Management System.
