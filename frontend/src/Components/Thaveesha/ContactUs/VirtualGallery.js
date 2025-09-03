import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import './VirtualGallery.css';

// Import artwork images
import Pic1 from '../../Home/Pic1.jpg';
import Pic2 from '../../Home/Pic2.jpg';
import Pic3 from '../../Home/Pic3.jpg';
import Pic4 from '../../Home/Pic4.jpg';
import Pic5 from '../../Home/Pic5.jpg';
import Pic6 from '../../Home/Pic6.jpg';

const VirtualGallery = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const [hoveredArtwork, setHoveredArtwork] = useState(null);

  // Artwork data with positions and information
  const artworks = useMemo(() => [
    {
      id: 1,
      image: Pic1,
      title: "Abstract Harmony",
      artist: "Sarah Chen",
      description: "A vibrant exploration of color and form",
      position: { x: -4.5, y: 0, z: -4.5 }, // Left wall
      rotation: { y: Math.PI / 2 },
      size: { width: 2, height: 1.5 }
    },
    {
      id: 2,
      image: Pic2,
      title: "Urban Dreams",
      artist: "Marcus Rodriguez",
      description: "Contemporary cityscape in mixed media",
      position: { x: 4.5, y: 0, z: -4.5 }, // Right wall
      rotation: { y: -Math.PI / 2 },
      size: { width: 2, height: 1.5 }
    },
    {
      id: 3,
      image: Pic3,
      title: "Nature's Whisper",
      artist: "Elena Petrov",
      description: "Serene landscape with impressionistic touches",
      position: { x: 0, y: 0, z: -4.5 }, // Back wall
      rotation: { y: 0 },
      size: { width: 2.5, height: 1.8 }
    },
    {
      id: 4,
      image: Pic4,
      title: "Digital Fusion",
      artist: "Alex Kim",
      description: "Modern digital art meets traditional techniques",
      position: { x: -4.5, y: 0, z: 4.5 }, // Left wall (opposite side)
      rotation: { y: Math.PI / 2 },
      size: { width: 2, height: 1.5 }
    },
    {
      id: 5,
      image: Pic5,
      title: "Emotional Canvas",
      artist: "Maria Santos",
      description: "Expressionist work exploring human emotions",
      position: { x: 4.5, y: 0, z: 4.5 }, // Right wall (opposite side)
      rotation: { y: -Math.PI / 2 },
      size: { width: 2, height: 1.5 }
    },
    {
      id: 6,
      image: Pic6,
      title: "Cultural Heritage",
      artist: "David Okafor",
      description: "Celebrating traditional cultural motifs",
      position: { x: 0, y: 0, z: 4.5 }, // Front wall
      rotation: { y: Math.PI },
      size: { width: 2.5, height: 1.8 }
    }
  ], []);

  useEffect(() => {
    const mountElement = mountRef.current;
    if (!mountElement) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add point lights for better artwork illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight1.position.set(0, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 15);
    pointLight2.position.set(0, -2, 0);
    scene.add(pointLight2);

    // Create gallery room (cube)
    const roomGeometry = new THREE.BoxGeometry(10, 6, 10);
    const roomMaterial = new THREE.MeshLambertMaterial({
      color: 0xe8e8e8,
      transparent: true,
      opacity: 0.1
    });
    const room = new THREE.Mesh(roomGeometry, roomMaterial);
    room.receiveShadow = true;
    scene.add(room);

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(10, 10);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3;
    scene.add(ceiling);

    // Load and create artworks
    const textureLoader = new THREE.TextureLoader();
    const artworkMeshes = [];

    artworks.forEach((artwork) => {
      const texture = textureLoader.load(artwork.image);
      const geometry = new THREE.PlaneGeometry(artwork.size.width, artwork.size.height);
      
      // Create frame material
      const frameGeometry = new THREE.PlaneGeometry(
        artwork.size.width + 0.1,
        artwork.size.height + 0.1
      );
      const frameMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.9
      });
      
      // Create artwork mesh
      const artworkMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const artworkMesh = new THREE.Mesh(geometry, artworkMaterial);
      artworkMesh.position.set(
        artwork.position.x,
        artwork.position.y,
        artwork.position.z
      );
      artworkMesh.rotation.set(
        artwork.rotation.x || 0,
        artwork.rotation.y,
        artwork.rotation.z || 0
      );
      artworkMesh.castShadow = true;
      artworkMesh.receiveShadow = true;
      
      // Create frame mesh
      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
      frameMesh.position.set(
        artwork.position.x,
        artwork.position.y,
        artwork.position.z
      );
      frameMesh.rotation.set(
        artwork.rotation.x || 0,
        artwork.rotation.y,
        artwork.rotation.z || 0
      );
      frameMesh.position.z += artwork.rotation.y === 0 ? 0.01 : 
                              artwork.rotation.y === Math.PI / 2 ? -0.01 : 
                              artwork.rotation.y === -Math.PI / 2 ? 0.01 : -0.01;
      
      // Add artwork and frame to scene
      scene.add(artworkMesh);
      scene.add(frameMesh);
      
      // Store reference for interaction
      artworkMesh.userData = { artwork, frameMesh };
      artworkMeshes.push(artworkMesh);
    });

    // Mouse controls for rotation
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handleMouseDown = (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseMove = (event) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      // Limit vertical rotation
      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    // Touch controls for mobile
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        isMouseDown = true;
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event) => {
      if (!isMouseDown || event.touches.length !== 1) return;

      const deltaX = event.touches[0].clientX - mouseX;
      const deltaY = event.touches[0].clientY - mouseY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));

      mouseX = event.touches[0].clientX;
      mouseY = event.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      isMouseDown = false;
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('touchstart', handleTouchStart);
    renderer.domElement.addEventListener('touchmove', handleTouchMove);
    renderer.domElement.addEventListener('touchend', handleTouchEnd);

    // Raycaster for artwork interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMoveInteraction = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(artworkMeshes);

      if (intersects.length > 0) {
        const intersectedArtwork = intersects[0].object.userData.artwork;
        setHoveredArtwork(intersectedArtwork);
      } else {
        setHoveredArtwork(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMoveInteraction);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth camera rotation
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      // Update camera position based on rotation
      const radius = 8;
      camera.position.x = Math.sin(currentRotationY) * radius;
      camera.position.z = Math.cos(currentRotationY) * radius;
      camera.position.y = Math.sin(currentRotationX) * radius + 1.6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchmove', handleTouchMove);
      renderer.domElement.removeEventListener('touchend', handleTouchEnd);
      renderer.domElement.removeEventListener('mousemove', handleMouseMoveInteraction);
      
      if (mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [artworks]);

  return (
    <div className="virtual-gallery-container">
      <div className="gallery-controls">
        <span>🖱️ Drag to rotate • 📱 Swipe on mobile</span>
      </div>
      
      <div ref={mountRef} className="gallery-viewport" />
      
      {hoveredArtwork && (
        <div className="artwork-info">
          <h3>{hoveredArtwork.title}</h3>
          <p className="artist-name">by {hoveredArtwork.artist}</p>
          <p className="artwork-description">{hoveredArtwork.description}</p>
        </div>
      )}
    </div>
  );
};

export default VirtualGallery;
