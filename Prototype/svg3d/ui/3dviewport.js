/**
 * 3D ViewPort UI Widget
 * Provides a rendering container with overlay layout for 3D viewport
 */

// Import required components
// Note: In a module-based system, you would use import statements instead
// import { Menubar } from './menubar.js';
// import { Toolbar } from './toolbar.js';

class ThreeDViewPort {
  constructor(options = {}) {
    // Default options
    const defaultOptions = {
      container: document.body,       // Container element
      width: 800,                     // Initial width
      height: 600,                    // Initial height
      scene: null,                    // Scene to render
      camera: null,                   // Camera to use
      renderer: null,                 // Renderer to use
      controller: null,               // Camera controller
      renderMode: 'normal',           // Initial render mode
      showGrid: true,                 // Show grid
      showAxes: true,                 // Show axes
      enableControls: true            // Enable camera controls
    };
    
    // Merge with user options
    this.options = Object.assign({}, defaultOptions, options);
    
    // Initialize properties
    this.scene = this.options.scene;
    this.camera = this.options.camera;
    this.renderer = this.options.renderer;
    this.controller = this.options.controller;
    this.renderMode = this.options.renderMode;
    
    // UI Components
    this.container = null;            // Main container
    this.renderContainer = null;      // Container for renderer
    this.overlay = null;              // Overlay with UI components
    this.header = null;               // Header section
    this.menubar = null;              // Menu bar in header
    this.leftSidebar = null;          // Left sidebar
    this.rightSidebar = null;         // Right sidebar
    this.center = null;               // Center area
    this.footer = null;               // Footer section
    this.toolbar = null;              // Toolbar instance
    
    // Initialize UI
    this.init();
  }
  
  init() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'svg3d-viewport-container';
    this.container.style.position = 'relative';
    this.container.style.width = `${this.options.width}px`;
    this.container.style.height = `${this.options.height}px`;
    this.container.style.overflow = 'hidden';
    
    // Create rendering container
    this.renderContainer = document.createElement('div');
    this.renderContainer.className = 'svg3d-render-container';
    this.renderContainer.style.position = 'absolute';
    this.renderContainer.style.width = '100%';
    this.renderContainer.style.height = '100%';
    this.renderContainer.style.top = '0';
    this.renderContainer.style.left = '0';
    this.container.appendChild(this.renderContainer);
    
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'svg3d-overlay';
    this.overlay.style.position = 'absolute';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.pointerEvents = 'none'; // Pass through inputs by default
    this.container.appendChild(this.overlay);
    
    // Create layout sections
    this._createLayout();
    
    // Initialize renderer if provided
    if (this.renderer) {
      this.renderContainer.appendChild(this.renderer.svg);
      this._resizeRenderer();
    }
    
    // Add to parent container
    this.options.container.appendChild(this.container);
    
    // Create UI components
    this._createMenuBar();
    this._createToolbar();
    this._createFooterInfo();
    
    // Set up rendering loop if all components are present
    if (this.scene && this.camera && this.renderer) {
      this._setupRenderLoop();
    }
    
    // Set up resize handling
    window.addEventListener('resize', this._onWindowResize.bind(this));
  }
  
  _createLayout() {
    // Create header
    this.header = document.createElement('div');
    this.header.className = 'svg3d-viewport-header';
    this.header.style.position = 'absolute';
    this.header.style.top = '0';
    this.header.style.left = '0';
    this.header.style.width = '100%';
    this.header.style.height = '40px';
    this.header.style.pointerEvents = 'auto';
    this.overlay.appendChild(this.header);
    
    // Create left sidebar
    this.leftSidebar = document.createElement('div');
    this.leftSidebar.className = 'svg3d-viewport-sidebar-left';
    this.leftSidebar.style.position = 'absolute';
    this.leftSidebar.style.top = '40px'; // Below header
    this.leftSidebar.style.left = '0';
    this.leftSidebar.style.width = '60px';
    this.leftSidebar.style.bottom = '30px'; // Above footer
    this.leftSidebar.style.backgroundColor = 'rgba(30,30,30,0.7)';
    this.leftSidebar.style.borderRight = '1px solid rgba(50,50,50,0.8)';
    this.leftSidebar.style.pointerEvents = 'auto';
    this.overlay.appendChild(this.leftSidebar);
    
    // Create right sidebar
    this.rightSidebar = document.createElement('div');
    this.rightSidebar.className = 'svg3d-viewport-sidebar-right';
    this.rightSidebar.style.position = 'absolute';
    this.rightSidebar.style.top = '40px'; // Below header
    this.rightSidebar.style.right = '0';
    this.rightSidebar.style.width = '0'; // Initially hidden
    this.rightSidebar.style.bottom = '30px'; // Above footer
    this.rightSidebar.style.backgroundColor = 'rgba(30,30,30,0.7)';
    this.rightSidebar.style.borderLeft = '1px solid rgba(50,50,50,0.8)';
    this.rightSidebar.style.pointerEvents = 'auto';
    this.rightSidebar.style.overflow = 'hidden';
    this.rightSidebar.style.transition = 'width 0.2s ease-in-out';
    this.overlay.appendChild(this.rightSidebar);
    
    // Create center area (this just defines the area, doesn't create an element)
    // The center area is the rendering surface, which passes inputs to the controller
    
    // Create footer
    this.footer = document.createElement('div');
    this.footer.className = 'svg3d-viewport-footer';
    this.footer.style.position = 'absolute';
    this.footer.style.bottom = '0';
    this.footer.style.left = '0';
    this.footer.style.width = '100%';
    this.footer.style.height = '30px';
    this.footer.style.backgroundColor = 'rgba(30,30,30,0.7)';
    this.footer.style.borderTop = '1px solid rgba(50,50,50,0.8)';
    this.footer.style.color = '#ccc';
    this.footer.style.fontSize = '12px';
    this.footer.style.lineHeight = '30px';
    this.footer.style.padding = '0 10px';
    this.footer.style.pointerEvents = 'auto';
    this.overlay.appendChild(this.footer);
  }
  
  _createMenuBar() {
    // Create menubar using the Menubar component
    this.menubar = new Menubar({
      parent: this.header,
      height: 40,
      theme: 'dark',
      viewCamera: this.camera,
      renderer: this.renderer,
      onMenuItemClick: (item) => {
        if (item === 'settings') {
          this.toggleRightSidebar();
          this._createSettingsPanel();
        }
      }
    });
    
    // If camera has a view change callback, register it
    if (this.camera && this.camera.registerViewChangeCallback) {
      this.camera.registerViewChangeCallback((viewName) => {
        this.menubar.updateActiveView(viewName);
      });
    }
  }
  
  _createViewControls() {
    const viewControls = document.createElement('div');
    viewControls.className = 'svg3d-view-controls';
    viewControls.style.display = 'flex';
    viewControls.style.marginLeft = '15px';
    
    // Add standard view buttons
    const views = [
      { id: 'front', label: 'Front' },
      { id: 'top', label: 'Top' },
      { id: 'right', label: 'Right' },
      { id: 'user', label: 'User' }
    ];
    
      views.forEach(view => {
        const button = document.createElement('button');
      button.className = 'svg3d-view-button';
      button.textContent = view.label;
      button.setAttribute('data-view', view.id);
      button.style.color = '#ccc';
      button.style.background = 'none';
      button.style.border = 'none';
      button.style.padding = '0 8px';
      button.style.fontSize = '12px';
      button.style.cursor = 'pointer';
      button.style.transition = 'color 0.2s';
      
      button.addEventListener('mouseover', () => {
        button.style.color = '#fff';
      });
      
      button.addEventListener('mouseout', () => {
        button.style.color = '#ccc';
      });
      
      button.addEventListener('click', () => {
        this.camera.setView(view.id);
      });
      
      viewControls.appendChild(button);
    });
    
    return viewControls;
  }
  
  _createToolbar() {
    // Create toolbar in left sidebar
    if (!this.leftSidebar) return;
    
    // Initialize toolbar
    this.toolbar = new Toolbar({
      parent: this.leftSidebar,
      position: 'left',
      width: 60,
      tools: ['select', 'add'],
      onToolChange: (tool) => {
        console.log(`Tool changed to: ${tool}`);
      },
      onShapeAdd: (shape, position) => {
        console.log(`Adding ${shape} at position:`, position);
        // Here we would normally add the shape to the scene
        }
      });
  }
  
  _createSettingsPanel() {
    // Clear existing content
    this.rightSidebar.innerHTML = '';
    
    // Create settings panel
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'svg3d-settings-panel';
    settingsPanel.style.padding = '15px';
    settingsPanel.style.color = '#ccc';
    
    // Add heading
    const heading = document.createElement('h3');
    heading.textContent = 'Viewport Settings';
    heading.style.margin = '0 0 15px 0';
    heading.style.fontSize = '16px';
    heading.style.borderBottom = '1px solid rgba(80,80,80,0.6)';
    heading.style.paddingBottom = '8px';
    heading.style.color = '#fff';
    settingsPanel.appendChild(heading);
    
    // Intersection handling settings
    if (this.renderer && typeof this.renderer.toggleIntersectionHandling === 'function') {
      const intersectionSection = document.createElement('div');
      intersectionSection.className = 'svg3d-settings-section';
      intersectionSection.style.marginBottom = '15px';
      
      const isHandlingIntersections = this.renderer.getIntersectionHandlingState && 
                                     this.renderer.getIntersectionHandlingState();
      
      // Create checkbox for intersection handling
      const intersectionOption = this._createCheckboxOption(
        'handle-intersections',
        'Handle intersections',
        isHandlingIntersections,
        () => this.renderer.toggleIntersectionHandling()
      );
      
      intersectionSection.appendChild(intersectionOption);
      
      // Create checkbox for intersection lines
    if (this.renderer && typeof this.renderer.toggleIntersectionLines === 'function') {
        const isShowingLines = this.renderer.getIntersectionLinesState && 
                              this.renderer.getIntersectionLinesState();
      
        const linesOption = this._createCheckboxOption(
          'show-intersection-lines',
          'Show intersection lines',
          isShowingLines,
          () => this.renderer.toggleIntersectionLines()
        );
        
        intersectionSection.appendChild(linesOption);
      }
      
      settingsPanel.appendChild(intersectionSection);
    }
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'svg3d-button';
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '20px';
    closeButton.style.padding = '8px 12px';
    closeButton.style.backgroundColor = 'rgba(60,60,60,0.8)';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.color = '#fff';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('mouseover', () => {
      closeButton.style.backgroundColor = 'rgba(80,80,80,0.8)';
    });
    
    closeButton.addEventListener('mouseout', () => {
      closeButton.style.backgroundColor = 'rgba(60,60,60,0.8)';
    });
    
    closeButton.addEventListener('click', () => {
      this.toggleRightSidebar();
    });
    
    settingsPanel.appendChild(closeButton);
    
    // Add panel to sidebar
    this.rightSidebar.appendChild(settingsPanel);
  }
  
  _createCheckboxOption(id, label, checked, onChange) {
    const container = document.createElement('div');
    container.className = 'svg3d-checkbox-option';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginBottom = '10px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = checked;
    checkbox.style.margin = '0 8px 0 0';
    
    checkbox.addEventListener('change', onChange);
    
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    labelElement.style.fontSize = '14px';
    
    container.appendChild(checkbox);
    container.appendChild(labelElement);
    
    return container;
  }
  
  _createFooterInfo() {
    if (!this.footer) return;
    
    // Create info content
    this.footerInfo = document.createElement('div');
    this.footerInfo.className = 'svg3d-footer-info';
    this.footerInfo.style.display = 'flex';
    this.footerInfo.style.justifyContent = 'space-between';
        
    // Left info section
    const leftInfo = document.createElement('div');
    leftInfo.className = 'svg3d-footer-left';
    this.footerInfo.appendChild(leftInfo);
    
    // Right info section (FPS counter)
    const rightInfo = document.createElement('div');
    rightInfo.className = 'svg3d-footer-right';
    this.footerInfo.appendChild(rightInfo);
    
    this.footer.appendChild(this.footerInfo);
    
    // Initial update
    this.updateFooterInfo();
  }
  
  updateFooterInfo() {
    if (!this.footerInfo) return;
    
    const leftInfo = this.footerInfo.querySelector('.svg3d-footer-left');
    const rightInfo = this.footerInfo.querySelector('.svg3d-footer-right');
    
    if (!leftInfo || !rightInfo) return;
    
    // Update left info
    let infoText = '';
    
    // Add camera info
    if (this.camera) {
      const projMode = this.camera.isOrthographic ? 'Orthographic' : 'Perspective';
      infoText += `${projMode}`;
      
      // Add current view if using ViewCamera
      if (this.camera.getCurrentView) {
        const viewName = this.camera.getCurrentView();
        const formattedName = viewName.charAt(0).toUpperCase() + viewName.slice(1);
        infoText += ` | View: ${formattedName}`;
      }
    }
    
    // Add render mode
    if (this.renderer) {
      const renderMode = this.renderMode.charAt(0).toUpperCase() + 
                        this.renderMode.replace(/-/g, ' ').slice(1);
      infoText += ` | Render: ${renderMode}`;
    }
    
    leftInfo.textContent = infoText;
    
    // Update right info (FPS counter)
    if (this.renderLoop && this.renderLoop.fps) {
      rightInfo.textContent = `FPS: ${Math.round(this.renderLoop.fps)}`;
    } else {
      rightInfo.textContent = '';
    }
  }
  
  _setupRenderLoop() {
    // Use existing RenderLoop if we have one
    if (window.renderLoop) {
      this.renderLoop = window.renderLoop;
    } else {
      // Create new render loop
      this.renderLoop = new RenderLoop(
        this.renderer,
        this.scene,
        this.camera,
        this.controller
      );
      this.renderLoop.start();
    }
    
    // Store original render method
    const originalRender = this.renderer.render.bind(this.renderer);
    
    // Override renderer's render method to update our UI
    this.renderer.render = (scene, camera) => {
      // Call the original render method
      originalRender(scene, camera);
      
      // Update footer info
      this.updateFooterInfo();
    };
  }
  
  _resizeRenderer() {
    if (!this.renderer || !this.renderContainer) return;
    
    const rect = this.renderContainer.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);
    
    // Update camera aspect ratio
    if (this.camera) {
      if (this.camera.perspective) {
        this.camera.perspective.aspect = rect.width / rect.height;
      } else if (this.camera.aspect) {
        this.camera.aspect = rect.width / rect.height;
      }
      this.camera.updateProjectionMatrix();
    }
  }
  
  _onWindowResize() {
    if (!this.container) return;
    
    // Only update if container size is controlled by parent
    if (!this.options.width || !this.options.height) {
      const rect = this.container.parentElement.getBoundingClientRect();
      this.container.style.width = `${rect.width}px`;
      this.container.style.height = `${rect.height}px`;
      this._resizeRenderer();
    }
  }
  
  toggleRightSidebar() {
    if (!this.rightSidebar) return;
    
    if (this.rightSidebar.style.width === '0px' || this.rightSidebar.style.width === '') {
      this.rightSidebar.style.width = '250px';
    } else {
      this.rightSidebar.style.width = '0px';
    }
  }
  
  _addHeaderStyles() {
    // Create style element if not exists
    if (!document.getElementById('svg3d-viewport-styles')) {
      const style = document.createElement('style');
      style.id = 'svg3d-viewport-styles';
      
      style.textContent = `
        .svg3d-icon-button {
          background: none;
          border: none;
          color: #ccc;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .svg3d-icon-button:hover {
          background-color: rgba(70,70,70,0.6);
          color: #fff;
        }
        
        .svg3d-icon-button.active {
          background-color: rgba(70,70,70,0.8);
          color: #fff;
        }
        
        .svg3d-dropdown-item:hover {
          background-color: rgba(70,70,70,0.6);
        }
      `;
      
      document.head.appendChild(style);
    }
  }
  
  // Public methods
  setSize(width, height) {
    if (!this.container) return;
    
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
    this._resizeRenderer();
  }
  
  setScene(scene) {
    this.scene = scene;
    
    // Update render loop if needed
    if (this.renderLoop) {
      this.renderLoop.scene = scene;
    } else if (scene && this.camera && this.renderer) {
      this._setupRenderLoop();
    }
  }
  
  setCamera(camera) {
    this.camera = camera;
    
    // Update render loop if needed
    if (this.renderLoop) {
      this.renderLoop.camera = camera;
    } else if (this.scene && camera && this.renderer) {
      this._setupRenderLoop();
    }
    
    // Update menubar if it exists
    if (this.menubar) {
      this.menubar.setViewCamera(camera);
    }
  }
  
  setController(controller) {
    this.controller = controller;
    
    // Update render loop if needed
    if (this.renderLoop) {
      this.renderLoop.controllers = Array.isArray(controller) ? controller : [controller];
    }
  }
  
  dispose() {
    // Stop render loop if we created it
    if (this.renderLoop && this.renderLoop !== window.renderLoop) {
      this.renderLoop.stop();
    }
    
    // Dispose UI components
    if (this.menubar) {
      this.menubar.dispose();
    }
    
    // Remove resize listener
    window.removeEventListener('resize', this._onWindowResize);
    
    // Remove container from parent
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
} 