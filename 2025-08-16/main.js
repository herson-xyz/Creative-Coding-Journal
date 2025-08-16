class LiquidGlassRenderer {
    constructor() {
        this.canvas = document.getElementById('glCanvas');
        this.gl = null;
        this.program = null;
        
        this.init();
        this.setupEventListeners();
        this.resizeCanvas();
        this.render();
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
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
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
        
        console.log(`Canvas resized to ${size}x${size}px`);
    }

    render() {
        if (!this.gl) return;

        // Clear the canvas
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // For now, just render a simple colored background
        // This will be replaced with actual 3D scene rendering in the next phase
        
        // Request next frame
        requestAnimationFrame(() => this.render());
    }
}

// Initialize the renderer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Liquid Glass Renderer...');
    new LiquidGlassRenderer();
}); 