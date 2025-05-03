/**
 * SVG3D Menubar
 * A component for the 3D viewport header that provides menu options and viewport controls
 */

class Menubar {
  constructor(options = {}) {
    this.options = Object.assign({
      parent: document.body,          // Parent element to attach menubar
      theme: 'dark',                  // Theme: 'dark', 'light'
      height: 40,                     // Height of menubar in pixels
      menuItems: [],                  // Array of menu items to include
      onMenuItemClick: null,          // Callback when menu item is clicked
      viewCamera: null,               // ViewCamera instance for view controls
      renderer: null                  // Renderer instance for render settings
    }, options);

    this.element = null;              // The main menubar element
    this.leftSection = null;          // Left section of menubar (title, views)
    this.rightSection = null;         // Right section of menubar (settings, controls)
    this.dropdowns = {};              // Dropdown menus
    
    this.init();
  }

  init() {
    // Create menubar element
    this.element = document.createElement('div');
    this.element.className = `svg3d-menubar svg3d-theme-${this.options.theme}`;
    
    // Add basic styles
    this.element.style.display = 'flex';
    this.element.style.justifyContent = 'space-between';
    this.element.style.alignItems = 'center';
    this.element.style.height = `${this.options.height}px`;
    this.element.style.padding = '0 10px';
    this.element.style.color = '#ccc';
    this.element.style.backgroundColor = 'rgba(30,30,30,0.7)';
    this.element.style.borderBottom = '1px solid rgba(50,50,50,0.8)';
    
    // Create left section
    this.leftSection = document.createElement('div');
    this.leftSection.className = 'svg3d-menubar-left';
    this.leftSection.style.display = 'flex';
    this.leftSection.style.alignItems = 'center';
    this.element.appendChild(this.leftSection);
    
    // Create title
    const title = document.createElement('div');
    title.className = 'svg3d-viewport-title';
    title.textContent = '3D View';
    title.style.color = '#fff';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '14px';
    title.style.marginRight = '15px';
    this.leftSection.appendChild(title);
    
    // Create view controls if camera is provided
    if (this.options.viewCamera) {
      this._createViewControls();
    }
    
    // Create right section
    this.rightSection = document.createElement('div');
    this.rightSection.className = 'svg3d-menubar-right';
    this.rightSection.style.display = 'flex';
    this.rightSection.style.alignItems = 'center';
    this.element.appendChild(this.rightSection);
    
    // Create standard controls
    this._createStandardControls();
    
    // Add to parent
    this.options.parent.appendChild(this.element);
    
    // Add global document click handler for dropdowns
    document.addEventListener('click', this._handleDocumentClick.bind(this));
    
    // Add styles
    this._addStyles();
  }

  _createViewControls() {
    // Create view controls container
    const viewControls = document.createElement('div');
    viewControls.className = 'svg3d-view-controls';
    viewControls.style.display = 'flex';
    
    // Define standard views to display
    const views = [
      { id: 'front', label: 'Front' },
      { id: 'top', label: 'Top' },
      { id: 'right', label: 'Right' },
      { id: 'user', label: 'User' }
    ];
    
    // Create view buttons
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
      
      // Add event listeners
      button.addEventListener('mouseover', () => {
        button.style.color = '#fff';
      });
      
      button.addEventListener('mouseout', () => {
        button.style.color = '#ccc';
      });
      
      button.addEventListener('click', () => {
        this.options.viewCamera.setView(view.id);
        this._updateActiveView(view.id);
      });
      
      viewControls.appendChild(button);
    });
    
    this.leftSection.appendChild(viewControls);
  }
  
  _updateActiveView(viewId) {
    // Update active state of view buttons
    const viewButtons = this.element.querySelectorAll('.svg3d-view-button');
    viewButtons.forEach(button => {
      if (button.getAttribute('data-view') === viewId) {
        button.style.color = '#fff';
        button.style.fontWeight = 'bold';
      } else {
        button.style.color = '#ccc';
        button.style.fontWeight = 'normal';
      }
    });
  }
  
  _createStandardControls() {
    // Create camera mode toggle if camera is available
    if (this.options.viewCamera && this.options.viewCamera.setProjectionMode) {
      this._createProjectionToggle();
    }
    
    // Create wireframe toggle if renderer is available
    if (this.options.renderer && typeof this.options.renderer.toggleWireframe === 'function') {
      this._createWireframeToggle();
    }
    
    // Create render mode dropdown
    this._createRenderModeDropdown();
    
    // Create settings button
    this._createSettingsButton();
  }
  
  _createProjectionToggle() {
    const camera = this.options.viewCamera;
    const isOrthographic = camera.isOrthographic;
    
    const button = document.createElement('button');
    button.className = 'svg3d-icon-button';
    button.innerHTML = isOrthographic ? 
      '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6,8L10,8L10,6L14,6L14,8L18,8L18,12L20,12L20,18L14,18L14,20L10,20L10,18L4,18L4,12L6,12L6,8M16,16L18,16L18,14L16,14L16,16M10,16L14,16L14,14L10,14L10,16M4,16L8,16L8,14L4,14L4,16M10,10L10,12L14,12L14,10L10,10Z" /></svg>' : 
      '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17,3H7C4.24,3 2,5.24 2,8V16C2,18.76 4.24,21 7,21H17C19.76,21 22,18.76 22,16V8C22,5.24 19.76,3 17,3M10,17L5,12L6.41,10.59L10,14.17L17.59,6.58L19,8L10,17Z" /></svg>';
    button.title = `Switch to ${isOrthographic ? 'Perspective' : 'Orthographic'} view`;
    
    button.addEventListener('click', () => {
      if (camera.isOrthographic) {
        camera.setPerspectiveMode();
        button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17,3H7C4.24,3 2,5.24 2,8V16C2,18.76 4.24,21 7,21H17C19.76,21 22,18.76 22,16V8C22,5.24 19.76,3 17,3M10,17L5,12L6.41,10.59L10,14.17L17.59,6.58L19,8L10,17Z" /></svg>';
        button.title = 'Switch to Orthographic view';
      } else {
        camera.setOrthographicMode();
        button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6,8L10,8L10,6L14,6L14,8L18,8L18,12L20,12L20,18L14,18L14,20L10,20L10,18L4,18L4,12L6,12L6,8M16,16L18,16L18,14L16,14L16,16M10,16L14,16L14,14L10,14L10,16M4,16L8,16L8,14L4,14L4,16M10,10L10,12L14,12L14,10L10,10Z" /></svg>';
        button.title = 'Switch to Perspective view';
      }
    });
    
    this.rightSection.appendChild(button);
  }
  
  _createWireframeToggle() {
    const renderer = this.options.renderer;
    const isWireframe = renderer.getWireframeState && renderer.getWireframeState();
    
    const button = document.createElement('button');
    button.className = 'svg3d-icon-button';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 3V21H21V3H3M19 19H5V5H19V19M11 7H13V9H15V11H13V13H11V11H9V9H11V7M7 15H17V17H7V15Z" /></svg>';
    button.title = 'Toggle Wireframe';
    button.style.marginLeft = '10px';
    
    if (isWireframe) {
      button.classList.add('active');
    }
    
    button.addEventListener('click', () => {
      renderer.toggleWireframe();
      button.classList.toggle('active');
    });
    
    this.rightSection.appendChild(button);
  }
  
  _createRenderModeDropdown() {
    // Create dropdown button
    const button = document.createElement('button');
    button.className = 'svg3d-icon-button';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z"/></svg>';
    button.title = 'Viewport Shading';
    button.style.marginLeft = '10px';
    button.setAttribute('data-dropdown', 'render-mode');
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'svg3d-dropdown';
    dropdown.setAttribute('id', 'render-mode-dropdown');
    dropdown.style.position = 'absolute';
    dropdown.style.top = `${this.options.height}px`;
    dropdown.style.right = '10px';
    dropdown.style.backgroundColor = 'rgba(40,40,40,0.95)';
    dropdown.style.border = '1px solid rgba(60,60,60,0.8)';
    dropdown.style.borderRadius = '4px';
    dropdown.style.padding = '5px 0';
    dropdown.style.display = 'none';
    dropdown.style.zIndex = '100';
    dropdown.style.minWidth = '150px';
    
    // Add render mode options
    const renderModes = [
      { id: 'normal', name: 'Normal' },
      { id: 'wireframe', name: 'Wireframe' },
      { id: 'solid', name: 'Solid' },
      { id: 'depth', name: 'Depth' },
      { id: 'color-depth', name: 'Color Depth' }
    ];
    
    const renderer = this.options.renderer;
    const currentMode = renderer ? renderer.renderMode : 'normal';
    
    renderModes.forEach(mode => {
      const option = document.createElement('div');
      option.className = 'svg3d-dropdown-item';
      option.textContent = mode.name;
      option.setAttribute('data-value', mode.id);
      option.style.padding = '8px 12px';
      option.style.cursor = 'pointer';
      
      // Highlight active mode
      if (currentMode === mode.id) {
        option.classList.add('active');
      }
      
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        if (renderer) {
          renderer.setRenderMode(mode.id);
          
          // Update selected state
          dropdown.querySelectorAll('.svg3d-dropdown-item').forEach(item => {
            item.classList.remove('active');
          });
          option.classList.add('active');
        }
        dropdown.style.display = 'none';
      });
      
      dropdown.appendChild(option);
    });
    
    // Toggle dropdown on button click
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      
      // Hide other dropdowns
      Object.values(this.dropdowns).forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
      });
    });
    
    // Add to menubar
    this.rightSection.appendChild(button);
    this.element.appendChild(dropdown);
    
    // Store dropdown reference
    this.dropdowns['render-mode'] = dropdown;
  }
  
  _createSettingsButton() {
    // Create settings button
    const button = document.createElement('button');
    button.className = 'svg3d-icon-button';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>';
    button.title = 'Viewport Settings';
    button.style.marginLeft = '10px';
    
    // Add click event to trigger settings panel
    button.addEventListener('click', () => {
      // Emit an event that the settings button was clicked
      if (typeof this.options.onMenuItemClick === 'function') {
        this.options.onMenuItemClick('settings');
      }
    });
    
    this.rightSection.appendChild(button);
  }
  
  _handleDocumentClick() {
    // Hide all dropdowns when clicking elsewhere
    Object.values(this.dropdowns).forEach(dropdown => {
      dropdown.style.display = 'none';
    });
  }
  
  _addStyles() {
    // Create style element if not exists
    if (!document.getElementById('svg3d-menubar-styles')) {
      const style = document.createElement('style');
      style.id = 'svg3d-menubar-styles';
      
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
        
        .svg3d-dropdown-item {
          color: #ccc;
          transition: background-color 0.2s, color 0.2s;
        }
        
        .svg3d-dropdown-item:hover {
          background-color: rgba(70,70,70,0.6);
          color: #fff;
        }
        
        .svg3d-dropdown-item.active {
          background-color: rgba(70,70,70,0.8);
          color: #fff;
        }
      `;
      
      document.head.appendChild(style);
    }
  }
  
  // Public methods
  
  setTitle(title) {
    const titleElement = this.element.querySelector('.svg3d-viewport-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
    return this;
  }
  
  setViewCamera(camera) {
    this.options.viewCamera = camera;
    // Update UI as needed
    return this;
  }
  
  setRenderer(renderer) {
    this.options.renderer = renderer;
    // Update UI as needed
    return this;
  }
  
  updateActiveView(viewId) {
    this._updateActiveView(viewId);
    return this;
  }
  
  dispose() {
    // Remove event listeners
    document.removeEventListener('click', this._handleDocumentClick);
    
    // Remove element from DOM
    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
} 