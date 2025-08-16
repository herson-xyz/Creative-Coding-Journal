class LiquidGlassRenderer {
    constructor() {
        this.canvas = document.getElementById('glCanvas');
        this.gl = null;
        this.program = null;
        
        // 3D Scene properties
        this.camera = null;
        this.renderer = null;
        this.scene = null;
        this.backgroundObject = null;
        this.glassObject = null;
        this.light = null;
        this.controls = null;
        
        // Animation properties
        this.clock = new THREE.Clock();
        this.rotationSpeed = 0.5;
        
        this.init();
        this.setupEventListeners();
        this.resizeCanvas();
        this.animate();
    }

    init() {
        // Get WebGL context
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        // Set clear color to dark blue
        this.gl.clearColor(0.1, 0.2, 0.4, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        
        console.log('WebGL context initialized successfully');
        console.log('Vendor:', this.gl.getParameter(this.gl.VENDOR));
        console.log('Renderer:', this.gl.getParameter(this.gl.RENDERER));
        console.log('WebGL Version:', this.gl.getParameter(this.gl.VERSION));
        
        // Initialize Three.js scene
        this.initThreeJS();
    }

    initThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.canvas.width / this.canvas.height, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 0, 5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Configure renderer for transparency
        this.renderer.sortObjects = true; // Important for transparent objects
        this.renderer.alpha = true;
        
        // Create lighting
        this.createLighting();
        
        // Create objects
        this.createBackgroundObject();
        this.createGlassObject();
        
        // Setup camera controls
        this.setupCameraControls();
        
        console.log('Three.js scene initialized successfully');
    }

    createLighting() {
        // Ambient light for overall scene illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(5, 5, 5);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.scene.add(this.light);
        
        // Point light for glass highlights
        const pointLight = new THREE.PointLight(0x88ccff, 0.8, 10);
        pointLight.position.set(-3, 2, 3);
        this.scene.add(pointLight);
        
        console.log('Lighting setup completed');
    }

    createBackgroundObject() {
        // Create a colorful background object (sphere with gradient material)
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        
        // Create a custom shader material for the background
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vPosition = position;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vec3 color1 = vec3(0.2, 0.4, 0.8); // Blue
                    vec3 color2 = vec3(0.8, 0.2, 0.6); // Pink
                    vec3 color3 = vec3(0.2, 0.8, 0.4); // Green
                    
                    float t = time * 0.5;
                    vec3 pos = vPosition;
                    
                    float noise1 = sin(pos.x * 3.0 + t) * sin(pos.y * 2.0 + t * 0.7) * sin(pos.z * 4.0 + t * 0.3);
                    float noise2 = sin(pos.x * 2.0 + t * 0.5) * sin(pos.y * 3.0 + t * 0.8) * sin(pos.z * 2.0 + t * 0.2);
                    
                    vec3 finalColor = mix(color1, color2, (noise1 + 1.0) * 0.5);
                    finalColor = mix(finalColor, color3, (noise2 + 1.0) * 0.5);
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
        
        this.backgroundObject = new THREE.Mesh(geometry, material);
        this.backgroundObject.position.set(0, 0, -3);
        this.backgroundObject.castShadow = true;
        this.backgroundObject.receiveShadow = true;
        this.scene.add(this.backgroundObject);
        
        console.log('Background object created');
    }

    createGlassObject() {
        // Create a glass object (cube) that will be superimposed
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        
        // Create a custom shader material for basic transparency
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                opacity: { value: 0.3 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                void main() {
                    vPosition = position;
                    vNormal = normalize(normalMatrix * normal);
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float opacity;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                void main() {
                    // Basic glass color with slight blue tint
                    vec3 glassColor = vec3(0.8, 0.9, 1.0);
                    
                    // Simple fresnel effect (more transparent at center, more opaque at edges)
                    float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
                    fresnel = pow(fresnel, 2.0);
                    
                    // Combine base color with fresnel
                    vec3 finalColor = mix(glassColor, vec3(1.0), fresnel * 0.3);
                    
                    // Calculate alpha based on fresnel and base opacity
                    float alpha = opacity + fresnel * 0.4;
                    alpha = clamp(alpha, 0.1, 0.8); // Keep alpha in reasonable range
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide, // Render both sides of faces
            depthWrite: false, // Important for transparency
            blending: THREE.AdditiveBlending // Additive blending for glass effect
        });
        
        this.glassObject = new THREE.Mesh(geometry, material);
        this.glassObject.position.set(0, 0, 2);
        this.glassObject.castShadow = false; // Transparent objects shouldn't cast shadows
        this.glassObject.receiveShadow = true;
        this.scene.add(this.glassObject);
        
        console.log('Glass object created with custom transparency shader');
    }

    setupCameraControls() {
        try {
            // Try to use OrbitControls if available
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                
                // Configure controls
                this.controls.enableDamping = true; // Smooth camera movement
                this.controls.dampingFactor = 0.05;
                this.controls.screenSpacePanning = false;
                
                // Set limits for better scene exploration
                this.controls.minDistance = 2; // Don't get too close
                this.controls.maxDistance = 15; // Don't get too far
                this.controls.maxPolarAngle = Math.PI; // Allow full rotation
                
                console.log('OrbitControls initialized successfully');
            } else {
                // Fallback to manual controls
                this.setupManualControls();
                console.log('Manual camera controls initialized (OrbitControls not available)');
            }
        } catch (error) {
            console.warn('OrbitControls failed, using manual controls:', error);
            this.setupManualControls();
        }
        
        // Set initial camera position for better view
        this.camera.position.set(3, 2, 8);
        this.camera.lookAt(0, 0, 0);
        
        console.log('Camera controls initialized');
    }

    setupManualControls() {
        // Manual camera control variables
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.cameraDistance = 8;
        this.isMouseDown = false;
        
        // Add event listeners for manual controls
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
        
        console.log('Manual camera controls setup complete');
    }

    setupShaderControls() {
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        
        if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', (event) => {
                const newOpacity = parseFloat(event.target.value);
                opacityValue.textContent = newOpacity.toFixed(2);
                
                // Update the shader uniform
                if (this.glassObject && this.glassObject.material.uniforms) {
                    this.glassObject.material.uniforms.opacity.value = newOpacity;
                }
                
                console.log(`Glass opacity updated to: ${newOpacity}`);
            });
        }
        
        console.log('Shader parameter controls initialized');
    }

    updateManualCamera() {
        // Calculate camera position based on rotation and distance
        const x = this.cameraDistance * Math.cos(this.targetRotationX) * Math.sin(this.targetRotationY);
        const y = this.cameraDistance * Math.sin(this.targetRotationX);
        const z = this.cameraDistance * Math.cos(this.targetRotationX) * Math.cos(this.targetRotationY);
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }

    onMouseDown(event) {
        this.isMouseDown = true;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        const deltaX = event.clientX - this.mouseX;
        const deltaY = event.clientY - this.mouseY;
        
        this.targetRotationY += deltaX * 0.01;
        this.targetRotationX += deltaY * 0.01;
        
        // Clamp vertical rotation
        this.targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.targetRotationX));
        
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    onMouseWheel(event) {
        event.preventDefault();
        this.cameraDistance += event.deltaY * 0.01;
        this.cameraDistance = Math.max(2, Math.min(15, this.cameraDistance));
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Setup shader parameter controls
        this.setupShaderControls();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Get the smallest dimension to maintain square aspect ratio
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
        
        // Set canvas size
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Set CSS size
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        // Update WebGL viewport
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Update Three.js camera and renderer
        if (this.camera && this.renderer) {
            this.camera.aspect = size / size;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(size, size);
            
            // Update controls if they exist
            if (this.controls) {
                this.controls.update();
            }
        }
        
        console.log(`Canvas resized to ${size}x${size}px`);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.scene || !this.camera || !this.renderer) return;
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Rotate background object
        if (this.backgroundObject) {
            this.backgroundObject.rotation.x += deltaTime * this.rotationSpeed * 0.3;
            this.backgroundObject.rotation.y += deltaTime * this.rotationSpeed * 0.5;
        }
        
        // Rotate glass object
        if (this.glassObject) {
            this.glassObject.rotation.x += deltaTime * this.rotationSpeed * 0.2;
            this.glassObject.rotation.y += deltaTime * this.rotationSpeed * 0.4;
        }
        
        // Update shader uniforms
        if (this.backgroundObject && this.backgroundObject.material.uniforms) {
            this.backgroundObject.material.uniforms.time.value = elapsedTime;
        }
        
        // Update glass shader uniforms
        if (this.glassObject && this.glassObject.material.uniforms) {
            this.glassObject.material.uniforms.time.value = elapsedTime;
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        } else {
            // Update manual camera controls
            this.updateManualCamera();
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the renderer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Liquid Glass Renderer...');
    new LiquidGlassRenderer();
}); 