/**
 * SVG3D Toolbar
 * A Blender-inspired toolbar component for the SVG3D renderer
 */

class Toolbar {
  constructor(options = {}) {
    this.options = Object.assign({
      parent: document.body,          // Parent element to attach toolbar
      position: 'left',               // Position: 'left', 'right', 'top', 'bottom'
      theme: 'dark',                  // Theme: 'dark', 'light'
      width: 50,                      // Width of toolbar in pixels
      tools: ['select', 'add'],       // Array of tool names to include
      onToolChange: null,             // Callback when tool changes
      onShapeAdd: null                // Callback when shape is added
    }, options);

    this.currentTool = null;
    this.tools = {};
    this.toolButtons = {};
    this.popups = {};
    this.isAddingShape = false;
    this.shapeToAdd = 'cube';

    this.element = null;
    this.initialized = false;
    
    this.init();
  }

  init() {
    // Create toolbar element
    this.element = document.createElement('div');
    this.element.className = `svg3d-toolbar svg3d-toolbar-${this.options.position} svg3d-theme-${this.options.theme}`;
    
    // Add styles specific to this instance
    this.element.style.width = `${this.options.width}px`;
    if (this.options.position === 'left') {
      this.element.style.left = '10px';
      this.element.style.top = '20px';
    }

    // Create toolbar container for tools
    const toolContainer = document.createElement('div');
    toolContainer.className = 'svg3d-toolbar-tools';
    this.element.appendChild(toolContainer);

    // Create tools based on options
    this.options.tools.forEach(toolName => {
      let toolButton = null;
      
      if (toolName === 'select') {
        toolButton = this.createSelectTool();
      } else if (toolName === 'add') {
        toolButton = this.createAddTool();
      }
      
      if (toolButton) {
        toolContainer.appendChild(toolButton);
        this.toolButtons[toolName] = toolButton;
      }
    });

    // Add to DOM
    this.options.parent.appendChild(this.element);
    
    // Set default tool
    if (this.options.tools.includes('select')) {
      this.setTool('select');
    } else if (this.options.tools.length > 0) {
      this.setTool(this.options.tools[0]);
    }

    // Add global click handler for adding shapes
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    
    // Add styles to document
    this.addStyles();
    
    this.initialized = true;
  }

  createSelectTool() {
    const button = document.createElement('div');
    button.className = 'svg3d-toolbar-button';
    button.setAttribute('data-tool', 'select');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24" class="duo-tone-icon">
        <path class="icon-secondary" d="M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7Z" />
        <path class="icon-primary" d="M13,2.05V5.08C16.39,5.57 19,8.47 19,12C19,15.87 15.87,19 12,19C8.47,19 5.57,16.39 5.08,13H2.05C2.56,17.84 6.81,21.5 12,21.5C17.51,21.5 22,17.01 22,11.5C22,6.34 18.34,2.18 13,2.05Z" />
      </svg>
      <span>Select</span>
    `;
    
    button.addEventListener('click', () => {
      this.setTool('select');
    });
    
    return button;
  }

  createAddTool() {
    const button = document.createElement('div');
    button.className = 'svg3d-toolbar-button';
    button.setAttribute('data-tool', 'add');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24" class="duo-tone-icon">
        <path class="icon-secondary" d="M11,5H13V11H19V13H13V19H11V13H5V11H11V5Z" opacity="0.6" />
        <path class="icon-primary" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
      </svg>
      <span>Add</span>
    `;
    
    // Create popup for shape selection
    const popup = document.createElement('div');
    popup.className = 'svg3d-toolbar-popup';
    popup.style.display = 'none';
    popup.setAttribute('id', 'svg3d-add-popup');
    
    // Add shape options
    const shapes = [
      { id: 'cube', name: 'Cube', 
        iconPrimary: 'M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z',
        iconSecondary: 'M12,6.5L7,9.5V14.5L12,17.5L17,14.5V9.5L12,6.5Z'
      },
      { id: 'sphere', name: 'Sphere', 
        iconPrimary: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z',
        iconSecondary: 'M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7Z'
      },
      { id: 'plane', name: 'Plane', 
        iconPrimary: 'M22,17V7H2V17H22M22,5A2,2 0 0,1 24,7V17A2,2 0 0,1 22,19H2A2,2 0 0,1 0,17V7A2,2 0 0,1 2,5H22Z',
        iconSecondary: 'M4,9H20V15H4V9Z'
      }
    ];
    
    shapes.forEach(shape => {
      const shapeOption = document.createElement('div');
      shapeOption.className = 'svg3d-toolbar-popup-item';
      shapeOption.setAttribute('data-shape', shape.id);
      shapeOption.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24" class="duo-tone-icon">
          <path class="icon-secondary" d="${shape.iconSecondary}" />
          <path class="icon-primary" d="${shape.iconPrimary}" />
        </svg>
        <span>${shape.name}</span>
      `;
      
      shapeOption.addEventListener('click', (e) => {
        e.stopPropagation();
        this.shapeToAdd = shape.id;
        this.isAddingShape = true;
        popup.style.display = 'none';
        // Update the add button icon to show selected shape
        const buttonSvg = button.querySelector('svg');
        buttonSvg.innerHTML = `
          <path class="icon-secondary" d="${shape.iconSecondary}" />
          <path class="icon-primary" d="${shape.iconPrimary}" />
        `;
        // Update the span text
        const buttonText = button.querySelector('span');
        buttonText.textContent = `Add ${shape.name}`;
        this.setTool('add');
      });
      
      popup.appendChild(shapeOption);
    });
    
    // Add popup to document body instead of the button 
    document.body.appendChild(popup);
    this.popups.add = popup;
    
    // Toggle popup on button click
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentTool === 'add') {
        // If already the current tool, toggle popup
        if (popup.style.display === 'none') {
          // Position the popup relative to the button
          const buttonRect = button.getBoundingClientRect();
          
          // Set position in absolute page coordinates
          if (this.options.position === 'left') {
            popup.style.position = 'fixed';
            popup.style.left = `${buttonRect.right + 5}px`;
            popup.style.top = `${buttonRect.top}px`;
          } else {
            popup.style.position = 'fixed';
            popup.style.right = `${window.innerWidth - buttonRect.left + 5}px`;
            popup.style.top = `${buttonRect.top}px`;
          }
          
          // Show popup after positioning
          popup.style.display = 'block';
          
          console.log('Showing popup at:', {
            position: this.options.position,
            left: popup.style.left,
            top: popup.style.top,
            buttonRect
          });
        } else {
          popup.style.display = 'none';
        }
      } else {
        // Set as current tool
        this.setTool('add');
        this.isAddingShape = true;
      }
    });
    
    return button;
  }

  setTool(toolName) {
    // Remove active class from all buttons
    Object.values(this.toolButtons).forEach(button => {
      button.classList.remove('active');
    });
    
    // Set active class on selected tool
    if (this.toolButtons[toolName]) {
      this.toolButtons[toolName].classList.add('active');
      this.currentTool = toolName;
      
      // Hide all popups
      Object.values(this.popups).forEach(popup => {
        popup.style.display = 'none';
      });
      
      // Call callback if provided
      if (this.options.onToolChange) {
        this.options.onToolChange(toolName);
      }
    }
  }

  handleDocumentClick(e) {
    // If we're adding a shape and clicked on the container (not toolbar)
    if (this.isAddingShape && this.currentTool === 'add') {
      // Make sure we're not clicking on the toolbar or popup
      const popup = this.popups.add;
      if (!this.element.contains(e.target) && (!popup || !popup.contains(e.target))) {
        // Get click position
        const x = e.clientX;
        const y = e.clientY;
        
        // Call callback if provided
        if (this.options.onShapeAdd) {
          this.options.onShapeAdd(this.shapeToAdd, x, y);
        }
      }
    }
    
    // Hide all popups when clicking outside toolbar and popups
    const clickedPopup = Object.values(this.popups).some(popup => popup.contains(e.target));
    if (!this.element.contains(e.target) && !clickedPopup) {
      Object.values(this.popups).forEach(popup => {
        popup.style.display = 'none';
      });
    }
  }

  addStyles() {
    // Only add styles once
    if (document.getElementById('svg3d-toolbar-styles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'svg3d-toolbar-styles';
    styleElement.textContent = `
      .svg3d-toolbar {
        position: fixed;
        display: flex;
        flex-direction: column;
        z-index: 1000;
        user-select: none;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      
      .svg3d-toolbar-left {
        width: 50px;
      }
      
      .svg3d-theme-dark {
        background-color: rgba(40, 40, 40, 0.8);
        color: #CCCCCC;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }
      
      .svg3d-theme-light {
        background-color: rgba(224, 224, 224, 0.8);
        color: #333333;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }
      
      .svg3d-toolbar-tools {
        display: flex;
        flex-direction: column;
        padding: 4px;
      }
      
      .svg3d-toolbar-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 6px 4px;
        margin: 2px 0;
        border-radius: 4px;
        cursor: pointer;
        position: relative;
      }
      
      .svg3d-toolbar-button:hover {
        background-color: rgba(255,255,255,0.15);
      }
      
      .svg3d-toolbar-button.active {
        background-color: rgba(100,100,255,0.4);
      }
      
      .svg3d-theme-light .svg3d-toolbar-button:hover {
        background-color: rgba(0,0,0,0.15);
      }
      
      .svg3d-theme-light .svg3d-toolbar-button.active {
        background-color: rgba(100,100,255,0.3);
      }
      
      .svg3d-toolbar-button svg {
        width: 20px;
        height: 20px;
        margin-bottom: 2px;
      }
      
      .svg3d-toolbar-button span {
        font-size: 9px;
        text-align: center;
      }
      
      .svg3d-toolbar-popup {
        position: fixed;
        background-color: rgba(40, 40, 40, 0.9);
        border-radius: 4px;
        padding: 5px;
        z-index: 1002;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        min-width: 120px;
      }
      
      .svg3d-theme-light .svg3d-toolbar-popup {
        background-color: rgba(224, 224, 224, 0.9);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      
      .svg3d-toolbar-popup-item {
        display: flex;
        align-items: center;
        padding: 5px;
        cursor: pointer;
        border-radius: 3px;
        margin: 2px 0;
      }
      
      .svg3d-toolbar-popup-item:hover {
        background-color: rgba(255,255,255,0.15);
      }
      
      .svg3d-theme-light .svg3d-toolbar-popup-item:hover {
        background-color: rgba(0,0,0,0.15);
      }
      
      .svg3d-toolbar-popup-item svg {
        width: 20px;
        height: 20px;
        margin-right: 5px;
      }
      
      .svg3d-toolbar-popup-item span {
        font-size: 12px;
        white-space: nowrap;
      }
      
      /* Duo-tone icon styles */
      .duo-tone-icon .icon-primary {
        fill: currentColor;
      }
      
      .duo-tone-icon .icon-secondary {
        fill: currentColor;
        opacity: 0.5;
      }
      
      .svg3d-theme-dark .duo-tone-icon .icon-secondary {
        opacity: 0.6;
      }
      
      .svg3d-theme-light .duo-tone-icon .icon-secondary {
        opacity: 0.4;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
} 