/**
 * Base ViewPort UI Widget
 * A container for rendering with Blender-like UI overlays
 */
class ViewPort {
  constructor(options = {}) {
    this.options = Object.assign({
      parent: document.body,       // Parent element to attach viewport
      width: '100%',               // Width of viewport
      height: '100%',              // Height of viewport
      theme: 'dark',               // Theme: 'dark', 'light'
      showHeader: true,            // Show header bar
      showToolbar: true,           // Show left toolbar
      showFooter: true,            // Show footer/info bar
      headerTitle: 'ViewPort',     // Header title
      onResize: null,              // Callback when viewport resizes
    }, options);

    // Main elements
    this.container = null;         // Main container
    this.viewArea = null;          // View area (where content is rendered)
    this.header = null;            // Header bar
    this.toolbar = null;           // Left toolbar
    this.footer = null;            // Footer bar
    this.overlays = {};            // Named overlay layers
    
    // Internal state
    this.isInitialized = false;
    this.isFullscreen = false;
    this.activeOverlay = null;
    
    // Initialize the viewport
    this.init();
  }
  
  init() {
    // Create the main container
    this.container = document.createElement('div');
    this.container.className = `svg3d-viewport svg3d-theme-${this.options.theme}`;
    
    // Set size
    this.container.style.width = this.options.width;
    this.container.style.height = this.options.height;
    
    // Create layout structure
    this._createUIStructure();
    
    // Add to parent
    this.options.parent.appendChild(this.container);
    
    // Add global styles if not already added
    this._addStyles();
    
    // Setup resize observer
    this._setupResizeObserver();
    
    // Setup event listeners
    this._setupEventListeners();
    
    this.isInitialized = true;
  }
  
  _createUIStructure() {
    // Create header bar if enabled
    if (this.options.showHeader) {
      this.header = document.createElement('div');
      this.header.className = 'svg3d-viewport-header';
      
      // Add title
      const title = document.createElement('div');
      title.className = 'svg3d-viewport-title';
      title.textContent = this.options.headerTitle;
      this.header.appendChild(title);
      
      // Add header actions container (empty by default, to be filled by extensions)
      const actions = document.createElement('div');
      actions.className = 'svg3d-viewport-header-actions';
      this.header.appendChild(actions);
      
      this.container.appendChild(this.header);
    }
    
    // Create main content area with optional toolbar
    const contentContainer = document.createElement('div');
    contentContainer.className = 'svg3d-viewport-content';
    
    // Create toolbar if enabled
    if (this.options.showToolbar) {
      this.toolbar = document.createElement('div');
      this.toolbar.className = 'svg3d-viewport-toolbar';
      contentContainer.appendChild(this.toolbar);
    }
    
    // Create view area (where content is rendered)
    this.viewArea = document.createElement('div');
    this.viewArea.className = 'svg3d-viewport-view';
    contentContainer.appendChild(this.viewArea);
    
    this.container.appendChild(contentContainer);
    
    // Create footer/info bar if enabled
    if (this.options.showFooter) {
      this.footer = document.createElement('div');
      this.footer.className = 'svg3d-viewport-footer';
      this.container.appendChild(this.footer);
    }
    
    // Create overlay container
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.className = 'svg3d-viewport-overlays';
    this.container.appendChild(this.overlayContainer);
  }
  
  _setupResizeObserver() {
    // Create resize observer to handle viewport resize
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this.onResize(width, height);
        }
      });
      
      this.resizeObserver.observe(this.viewArea);
    } else {
      // Fallback for browsers without ResizeObserver
      window.addEventListener('resize', () => {
        const rect = this.viewArea.getBoundingClientRect();
        this.onResize(rect.width, rect.height);
      });
    }
  }
  
  _setupEventListeners() {
    // Setup click handler for the viewport
    this.container.addEventListener('click', (e) => {
      if (e.target === this.overlayContainer) {
        this.hideAllOverlays();
      }
    });
    
    // Prevent context menu by default
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  onResize(width, height) {
    // Call user-defined resize handler if provided
    if (typeof this.options.onResize === 'function') {
      this.options.onResize(width, height);
    }
  }
  
  // Add an overlay layer
  addOverlay(name, content, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'svg3d-viewport-overlay';
    
    // Apply options
    if (options.className) {
      overlay.classList.add(options.className);
    }
    
    if (options.position) {
      overlay.classList.add(`svg3d-overlay-${options.position}`);
    } else {
      overlay.classList.add('svg3d-overlay-center'); // Default position
    }
    
    // Add content
    if (typeof content === 'string') {
      overlay.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      overlay.appendChild(content);
    }
    
    // Store reference
    this.overlays[name] = overlay;
    
    // Add to container but keep hidden initially
    overlay.style.display = 'none';
    this.overlayContainer.appendChild(overlay);
    
    return overlay;
  }
  
  // Show a specific overlay
  showOverlay(name) {
    if (!this.overlays[name]) return;
    
    // Hide current active overlay if any
    if (this.activeOverlay) {
      this.overlays[this.activeOverlay].style.display = 'none';
    }
    
    // Show requested overlay
    this.overlays[name].style.display = 'block';
    this.activeOverlay = name;
    this.overlayContainer.style.display = 'flex';
    
    return this;
  }
  
  // Hide a specific overlay
  hideOverlay(name) {
    if (!this.overlays[name]) return;
    
    this.overlays[name].style.display = 'none';
    
    if (this.activeOverlay === name) {
      this.activeOverlay = null;
      this.overlayContainer.style.display = 'none';
    }
    
    return this;
  }
  
  // Hide all overlays
  hideAllOverlays() {
    Object.keys(this.overlays).forEach(name => {
      this.overlays[name].style.display = 'none';
    });
    
    this.activeOverlay = null;
    this.overlayContainer.style.display = 'none';
    
    return this;
  }
  
  // Add an element to the header actions area
  addHeaderAction(element, position = 'right') {
    if (!this.header) return this;
    
    const actions = this.header.querySelector('.svg3d-viewport-header-actions');
    if (!actions) return this;
    
    if (position === 'left') {
      actions.prepend(element);
    } else {
      actions.appendChild(element);
    }
    
    return this;
  }
  
  // Add an element to the toolbar
  addToolbarItem(element) {
    if (!this.toolbar) return this;
    
    this.toolbar.appendChild(element);
    return this;
  }
  
  // Set footer content
  setFooterContent(content) {
    if (!this.footer) return this;
    
    if (typeof content === 'string') {
      this.footer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.footer.innerHTML = '';
      this.footer.appendChild(content);
    }
    
    return this;
  }
  
  // Toggle fullscreen mode
  toggleFullscreen() {
    if (!this.isFullscreen) {
      // Store original styles
      this._originalStyles = {
        width: this.container.style.width,
        height: this.container.style.height,
        position: this.container.style.position,
        top: this.container.style.top,
        left: this.container.style.left,
        zIndex: this.container.style.zIndex
      };
      
      // Apply fullscreen styles
      Object.assign(this.container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '9999'
      });
      
      this.isFullscreen = true;
      this.container.classList.add('svg3d-viewport-fullscreen');
      
    } else {
      // Restore original styles
      Object.assign(this.container.style, this._originalStyles);
      
      this.isFullscreen = false;
      this.container.classList.remove('svg3d-viewport-fullscreen');
    }
    
    // Trigger resize event
    const rect = this.viewArea.getBoundingClientRect();
    this.onResize(rect.width, rect.height);
    
    return this;
  }
  
  // Update theme
  setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return this;
    
    this.container.classList.remove(`svg3d-theme-${this.options.theme}`);
    this.options.theme = theme;
    this.container.classList.add(`svg3d-theme-${theme}`);
    
    return this;
  }
  
  // Add global styles
  _addStyles() {
    if (document.getElementById('svg3d-viewport-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'svg3d-viewport-styles';
    style.textContent = `
      .svg3d-viewport {
        display: flex;
        flex-direction: column;
        position: relative;
        background-color: #2b2b2b;
        color: #e0e0e0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 13px;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }
      
      .svg3d-theme-light {
        background-color: #e8e8e8;
        color: #303030;
      }
      
      .svg3d-viewport-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 28px;
        padding: 0 8px;
        background-color: #383838;
        border-bottom: 1px solid #222;
      }
      
      .svg3d-theme-light .svg3d-viewport-header {
        background-color: #d0d0d0;
        border-bottom: 1px solid #b0b0b0;
      }
      
      .svg3d-viewport-title {
        font-weight: bold;
        font-size: 12px;
        user-select: none;
      }
      
      .svg3d-viewport-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .svg3d-viewport-content {
        display: flex;
        flex: 1;
        min-height: 0;
        position: relative;
      }
      
      .svg3d-viewport-toolbar {
        width: 36px;
        background-color: #333;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px 0;
        gap: 4px;
        border-right: 1px solid #222;
        overflow-y: auto;
      }
      
      .svg3d-theme-light .svg3d-viewport-toolbar {
        background-color: #c8c8c8;
        border-right: 1px solid #a0a0a0;
      }
      
      .svg3d-viewport-view {
        flex: 1;
        position: relative;
        overflow: hidden;
        background-color: #232323;
      }
      
      .svg3d-theme-light .svg3d-viewport-view {
        background-color: #f0f0f0;
      }
      
      .svg3d-viewport-footer {
        height: 24px;
        padding: 0 8px;
        display: flex;
        align-items: center;
        background-color: #383838;
        border-top: 1px solid #222;
        font-size: 11px;
      }
      
      .svg3d-theme-light .svg3d-viewport-footer {
        background-color: #d0d0d0;
        border-top: 1px solid #b0b0b0;
      }
      
      .svg3d-viewport-overlays {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: none;
        pointer-events: none;
        background-color: rgba(0,0,0,0.3);
      }
      
      .svg3d-theme-light .svg3d-viewport-overlays {
        background-color: rgba(255,255,255,0.3);
      }
      
      .svg3d-viewport-overlay {
        pointer-events: auto;
        background-color: #3c3c3c;
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
      }
      
      .svg3d-theme-light .svg3d-viewport-overlay {
        background-color: #f0f0f0;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }
      
      .svg3d-overlay-center {
        margin: auto;
      }
      
      .svg3d-overlay-top {
        margin: 20px auto auto auto;
      }
      
      .svg3d-overlay-bottom {
        margin: auto auto 20px auto;
      }
      
      .svg3d-overlay-left {
        margin: auto auto auto 20px;
      }
      
      .svg3d-overlay-right {
        margin: auto 20px auto auto;
      }
      
      .svg3d-viewport-button {
        background-color: #4a4a4a;
        color: #e0e0e0;
        border: 1px solid #222;
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .svg3d-theme-light .svg3d-viewport-button {
        background-color: #d8d8d8;
        color: #303030;
        border: 1px solid #a0a0a0;
      }
      
      .svg3d-viewport-button:hover {
        background-color: #555;
      }
      
      .svg3d-theme-light .svg3d-viewport-button:hover {
        background-color: #e8e8e8;
      }
      
      .svg3d-viewport-button:active {
        background-color: #666;
      }
      
      .svg3d-theme-light .svg3d-viewport-button:active {
        background-color: #c0c0c0;
      }
      
      .svg3d-viewport-toolbar-button {
        width: 28px;
        height: 28px;
        background-color: transparent;
        color: #e0e0e0;
        border: none;
        border-radius: 3px;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .svg3d-theme-light .svg3d-viewport-toolbar-button {
        color: #303030;
      }
      
      .svg3d-viewport-toolbar-button:hover {
        background-color: rgba(255,255,255,0.1);
      }
      
      .svg3d-theme-light .svg3d-viewport-toolbar-button:hover {
        background-color: rgba(0,0,0,0.1);
      }
      
      .svg3d-viewport-toolbar-button.active {
        background-color: rgba(255,255,255,0.2);
      }
      
      .svg3d-theme-light .svg3d-viewport-toolbar-button.active {
        background-color: rgba(0,0,0,0.2);
      }
      
      /* Fullscreen adjustments */
      .svg3d-viewport-fullscreen {
        border-radius: 0;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Dispose the viewport
  dispose() {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Remove from parent
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.isInitialized = false;
  }
} 