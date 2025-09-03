import React, { useEffect, useRef, useState } from 'react';
import './PanoramaViewer.css';

const PanoramaViewer = () => {
  const containerRef = useRef(null);
  const panoramaRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const velocityRef = useRef(0);
  const animationIdRef = useRef(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const autoRotateRef = useRef(false);
  const autoRotateSpeedRef = useRef(0.5);

  useEffect(() => {
    const container = containerRef.current;
    const panorama = panoramaRef.current;
    
    if (!container || !panorama) return;

    let lastTime = 0;
    let isAnimating = false;

    // Mouse events
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      currentXRef.current = e.clientX;
      container.style.cursor = 'grabbing';
      
      // Stop auto-rotate when user starts dragging
      if (isAutoRotating) {
        setIsAutoRotating(false);
        autoRotateRef.current = false;
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
      }
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = e.clientX - currentXRef.current;
      currentXRef.current = e.clientX;
      
      // Calculate velocity for inertia
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTime;
      if (timeDelta > 0) {
        velocityRef.current = deltaX / timeDelta * 16; // Normalize to 60fps
      }
      lastTime = currentTime;
      
      // Move panorama
      const currentLeft = parseFloat(panorama.style.left) || 0;
      panorama.style.left = `${currentLeft + deltaX}px`;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
      
      // Apply inertia
      if (Math.abs(velocityRef.current) > 0.1) {
        applyInertia();
      }
    };

    // Touch events
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        startXRef.current = e.touches[0].clientX;
        currentXRef.current = e.touches[0].clientX;
        container.style.cursor = 'grabbing';
        
        // Stop auto-rotate when user starts touching
        if (isAutoRotating) {
          setIsAutoRotating(false);
          autoRotateRef.current = false;
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
          }
        }
      }
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      
      e.preventDefault();
      const deltaX = e.touches[0].clientX - currentXRef.current;
      currentXRef.current = e.touches[0].clientX;
      
      // Calculate velocity for inertia
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTime;
      if (timeDelta > 0) {
        velocityRef.current = deltaX / timeDelta * 16;
      }
      lastTime = currentTime;
      
      // Move panorama
      const currentLeft = parseFloat(panorama.style.left) || 0;
      panorama.style.left = `${currentLeft + deltaX}px`;
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;
      
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
      
      // Apply inertia
      if (Math.abs(velocityRef.current) > 0.1) {
        applyInertia();
      }
    };

    // Inertia function
    const applyInertia = () => {
      if (isAnimating) return;
      isAnimating = true;
      
      const animate = () => {
        if (Math.abs(velocityRef.current) < 0.1) {
          isAnimating = false;
          return;
        }
        
        const currentLeft = parseFloat(panorama.style.left) || 0;
        panorama.style.left = `${currentLeft + velocityRef.current}px`;
        
        // Apply friction
        velocityRef.current *= 0.95;
        
        animationIdRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    };

    // Auto-rotate function
    const autoRotate = () => {
      if (!isAutoRotating) return;
      
      const currentLeft = parseFloat(panorama.style.left) || 0;
      panorama.style.left = `${currentLeft - autoRotateSpeedRef.current}px`;
      
      // Reset position when panorama goes too far left
      const panoramaWidth = panorama.offsetWidth;
      const containerWidth = container.offsetWidth;
      if (Math.abs(currentLeft) > panoramaWidth - containerWidth) {
        panorama.style.left = '0px';
      }
      
      requestAnimationFrame(autoRotate);
    };

    // Start auto-rotate if enabled
    if (autoRotateRef.current) {
      autoRotate();
    }

    // Add event listeners
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isAutoRotating]);

  // Auto-rotate function
  const autoRotate = () => {
    if (!autoRotateRef.current) return;
    
    const panorama = panoramaRef.current;
    if (!panorama) return;
    
    const currentLeft = parseFloat(panorama.style.left) || 0;
    panorama.style.left = `${currentLeft - autoRotateSpeedRef.current}px`;
    
    // Reset position when panorama goes too far left
    const panoramaWidth = panorama.offsetWidth;
    const containerWidth = containerRef.current?.offsetWidth || 0;
    if (Math.abs(currentLeft) > panoramaWidth - containerWidth) {
      panorama.style.left = '0px';
    }
    
    // Continue animation if still auto-rotating
    if (autoRotateRef.current) {
      animationIdRef.current = requestAnimationFrame(autoRotate);
    }
  };

  // Toggle auto-rotate
  const toggleAutoRotate = () => {
    const newState = !isAutoRotating;
    console.log('Toggling auto-rotate:', newState);
    setIsAutoRotating(newState);
    autoRotateRef.current = newState;
    
    if (newState) {
      // Start auto-rotate
      autoRotate();
    } else {
      // Stop auto-rotate by canceling the animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    }
  };

  // Reset panorama position
  const resetPanorama = () => {
    if (panoramaRef.current) {
      panoramaRef.current.style.left = '0px';
      velocityRef.current = 0;
      setIsAutoRotating(false);
      autoRotateRef.current = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    }
  };

  return (
    <section className="panorama-section">
      <div className="container">
        <div className="panorama-header">
          <h2 className="panorama-title">Explore Our Virtual Art Gallery</h2>
          <p className="panorama-subtitle">Take a 360° tour of our curated art spaces</p>
        </div>
        
        <div className="panorama-container" ref={containerRef}>
          <div className="panorama-hint">
            <span className="hint-icon">👆</span>
            <span>Drag or swipe to look around</span>
          </div>
          
          <div className="panorama-viewer" ref={panoramaRef}>
            {/* Panorama image will be set via CSS background */}
          </div>
          
          <div className="panorama-controls">
            <button 
              className={`control-btn ${isAutoRotating ? 'active' : ''}`}
              onClick={toggleAutoRotate}
              aria-label="Toggle auto-rotate"
            >
              <span className="control-icon">🔄</span>
              <span className="control-text">
                {isAutoRotating ? 'Stop' : 'Auto-rotate'}
              </span>
            </button>
            
            <button 
              className="control-btn"
              onClick={resetPanorama}
              aria-label="Reset panorama view"
            >
              <span className="control-icon">🏠</span>
              <span className="control-text">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PanoramaViewer;
