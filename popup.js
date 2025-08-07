/**
 * ========================================
 * UNIVERSAL WEB SCRAPER - POPUP SCRIPT
 * ========================================
 * 
 * Main popup interface for the Chrome extension
 * Handles UI interactions, element selection, data scraping, and export functionality
 * 
 * Key Features:
 * - Responsive design with detached window support
 * - Point-and-click element selection
 * - CSS/XPath selector input
 * - Data preview and export (CSV, JSON, Excel)
 * - Progress tracking and status updates
 * - Local storage for persistence
 */

class WebScraperPopup {
  constructor() {
    // ========================================
    // INITIALIZATION PROPERTIES
    // ========================================
    this.selectedElements = [];     // Array of selected elements with their selectors
    this.currentMode = 'select';    // Current selection mode: 'select' or 'css'
    this.scrapedData = [];         // Scraped data array
    this.isSelecting = false;      // Flag for selection mode state
    this.editingElementId = null;  // ID of element currently being edited
    this.isDetachedWindow = false; // Flag for detached window mode
    this.targetTabId = null;       // Store target tab ID for detached windows
    
    // Initialize the popup
    this.initializeElements();
    this.attachEventListeners();
    this.checkIfDetachedWindow();
    this.loadStoredData();
  }

  // ========================================
  // RESPONSIVE DESIGN & WINDOW MANAGEMENT
  // ========================================

  /**
   * Add responsive styles for detached window mode
   * Creates a comprehensive responsive design that adapts to different window sizes
   */
  addResponsiveStyles() {
    const style = document.createElement('style');
    style.id = 'responsive-styles';
    style.textContent = `
      /* =================== BASE RESPONSIVE STYLES =================== */
      
      /* Responsive Container */
      .container {
        padding: 1vw !important;
        width: 100% !important;
        height: 100vh !important;
        box-sizing: border-box !important;
        overflow-y: auto !important;
      }

      /* Responsive Typography */
      body {
        font-size: clamp(12px, 1.2vw, 16px) !important;
      }

      h1 {
        font-size: clamp(16px, 2vw, 24px) !important;
        margin-bottom: 1em !important;
      }

      h3 {
        font-size: clamp(14px, 1.5vw, 18px) !important;
        margin-bottom: 0.5em !important;
      }

      /* =================== UI COMPONENTS =================== */

      /* Responsive Sections */
      .section {
        margin-bottom: 1em !important;
        padding: clamp(8px, 1vw, 16px) !important;
        border-radius: clamp(4px, 0.5vw, 8px) !important;
      }

      /* Responsive Buttons */
      .btn {
        padding: clamp(6px, 0.8vw, 12px) clamp(12px, 1.5vw, 20px) !important;
        font-size: clamp(10px, 1vw, 14px) !important;
        border-radius: clamp(3px, 0.4vw, 6px) !important;
        min-height: clamp(32px, 3vw, 40px) !important;
      }

      .btn-sm {
        padding: clamp(4px, 0.5vw, 8px) clamp(8px, 1vw, 12px) !important;
        font-size: clamp(9px, 0.9vw, 12px) !important;
        min-height: clamp(28px, 2.5vw, 32px) !important;
      }

      /* Responsive Form Elements */
      input[type="text"], input[type="number"], select {
        padding: clamp(4px, 0.6vw, 10px) clamp(6px, 0.8vw, 12px) !important;
        font-size: clamp(10px, 1vw, 14px) !important;
        border-radius: clamp(3px, 0.4vw, 6px) !important;
        min-height: clamp(32px, 3vw, 40px) !important;
      }

      label {
        font-size: clamp(10px, 1vw, 13px) !important;
        margin-bottom: clamp(2px, 0.3vw, 6px) !important;
      }

      /* =================== ELEMENT SELECTION AREA =================== */

      /* Responsive Lists */
      .elements-list {
        max-height: clamp(120px, 15vh, 200px) !important;
      }

      .element-item {
        padding: clamp(6px, 0.8vw, 12px) !important;
        margin-bottom: clamp(4px, 0.5vw, 8px) !important;
        border-radius: clamp(3px, 0.4vw, 6px) !important;
      }

      .element-column-name {
        font-size: clamp(11px, 1.1vw, 14px) !important;
      }

      .element-selector {
        font-size: clamp(9px, 0.9vw, 11px) !important;
        padding: clamp(3px, 0.4vw, 6px) !important;
        border-radius: clamp(2px, 0.3vw, 4px) !important;
      }

      .element-type {
        padding: clamp(1px, 0.2vw, 3px) clamp(4px, 0.5vw, 8px) !important;
        font-size: clamp(8px, 0.8vw, 10px) !important;
        border-radius: clamp(6px, 0.8vw, 12px) !important;
      }

      .action-btn {
        padding: clamp(2px, 0.3vw, 4px) clamp(3px, 0.4vw, 6px) !important;
        font-size: clamp(9px, 0.9vw, 12px) !important;
        min-width: clamp(24px, 2.5vw, 32px) !important;
        min-height: clamp(24px, 2.5vw, 32px) !important;
      }

      /* =================== DATA PREVIEW AREA =================== */

      /* Responsive Preview - Increased height for better data visibility */
      .preview-container {
        max-height: clamp(300px, 40vh, 600px) !important;
        padding: clamp(6px, 0.8vw, 12px) !important;
        border-radius: clamp(3px, 0.4vw, 6px) !important;
        overflow-y: auto !important;
        overflow-x: auto !important;
      }

      .preview-table {
        font-size: clamp(9px, 0.9vw, 12px) !important;
      }

      .preview-table th, .preview-table td {
        padding: clamp(3px, 0.4vw, 8px) clamp(4px, 0.5vw, 10px) !important;
        max-width: clamp(100px, 15vw, 200px) !important;
      }

      /* =================== OTHER UI ELEMENTS =================== */

      /* Responsive Status Bar */
      .status-bar {
        padding: clamp(6px, 0.8vw, 12px) !important;
        font-size: clamp(10px, 1vw, 13px) !important;
        border-radius: clamp(3px, 0.4vw, 6px) !important;
        margin-bottom: 1em !important;
      }

      /* Responsive Edit Forms */
      .edit-form {
        padding: clamp(6px, 0.8vw, 12px) !important;
        border-radius: clamp(3px, 0.4vw, 6px) !important;
      }

      .edit-form .form-group {
        margin-bottom: clamp(4px, 0.5vw, 8px) !important;
      }

      .edit-form label {
        font-size: clamp(9px, 0.9vw, 12px) !important;
      }

      .edit-form input, .edit-form select {
        padding: clamp(3px, 0.4vw, 6px) clamp(5px, 0.6vw, 10px) !important;
        font-size: clamp(9px, 0.9vw, 12px) !important;
        min-height: clamp(28px, 2.8vw, 36px) !important;
      }

      /* Responsive Progress */
      .progress-bar {
        height: clamp(16px, 2vw, 24px) !important;
        border-radius: clamp(8px, 1vw, 12px) !important;
        margin-bottom: clamp(6px, 0.8vw, 12px) !important;
      }

      #progress-text {
        font-size: clamp(10px, 1vw, 14px) !important;
      }

      /* Responsive Button Groups */
      .button-group {
        gap: clamp(4px, 0.5vw, 12px) !important;
      }

      /* Responsive Form Groups */
      .form-group {
        margin-bottom: clamp(6px, 0.8vw, 12px) !important;
      }

      .form-row {
        gap: clamp(4px, 0.5vw, 12px) !important;
      }

      /* Responsive Help Content */
      .help-content {
        font-size: clamp(10px, 1vw, 13px) !important;
        padding: clamp(6px, 0.8vw, 12px) 0 !important;
        line-height: 1.4 !important;
      }

      /* Responsive Placeholder Text */
      .placeholder {
        font-size: clamp(10px, 1vw, 14px) !important;
        padding: clamp(15px, 2vw, 25px) !important;
      }

      /* =================== RESPONSIVE GRID LAYOUTS =================== */

      /* Adaptive Grid for Large Windows (800px+) */
      @media (min-width: 800px) {
        .container {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 1vw !important;
          grid-template-areas: 
            "header header"
            "status status"
            "modes modes"
            "input input"
            "elements elements"
            "preview preview"
            "scraping export"
            "progress progress"
            "help help" !important;
        }

        h1 { grid-area: header; }
        .status-bar { grid-area: status; }
        #elements-section { grid-area: elements; }
        #preview-section { grid-area: preview; }
        #scraping-section { grid-area: scraping; }
        #export-section { grid-area: export; }
        #progress-section { grid-area: progress; }
        .section:has(details) { grid-area: help; }
      }

      /* Extra Large Windows - 3 Column Layout (1200px+) */
      @media (min-width: 1200px) {
        .container {
          grid-template-columns: 1fr 1fr 1fr !important;
          grid-template-areas: 
            "header header header"
            "status status status"
            "modes input input"
            "elements elements elements"
            "preview preview preview"
            "scraping export export"
            "progress progress progress"
            "help help help" !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Handle window resize events
   * Ensures proper responsive behavior when window is resized
   */
  handleWindowResize() {
    // Update any specific responsive behaviors if needed
    const container = document.querySelector('.container');
    if (container) {
      // Force reflow to ensure proper responsive behavior
      container.style.display = 'none';
      container.offsetHeight; // Trigger reflow
      container.style.display = '';
    }
  }

  /**
   * Check if popup is running in detached window mode
   * Sets up appropriate interface based on window type
   */
  checkIfDetachedWindow() {
    // Check if we're in a detached window (has window controls)
    this.isDetachedWindow = window.location.search.includes('detached=true');
    
    if (this.isDetachedWindow) {
      // Setup for detached window
      this.setupDetachedWindow();
      // Get target tab ID from URL params or storage
      this.loadTargetTabId();
    } else {
      // Add button to detach the popup
      this.addDetachButton();
    }
  }

  /**
   * Load target tab ID for detached window
   */
  async loadTargetTabId() {
    try {
      // Try to get tab ID from URL params first
      const urlParams = new URLSearchParams(window.location.search);
      const tabIdFromUrl = urlParams.get('tabId');
      
      if (tabIdFromUrl) {
        this.targetTabId = parseInt(tabIdFromUrl);
      } else {
        // Fallback: get from storage or find active tab in main window
        const result = await chrome.storage.local.get(['targetTabId']);
        if (result.targetTabId) {
          this.targetTabId = result.targetTabId;
        } else {
          // Find the most recently active tab in any window
          await this.findActiveTab();
        }
      }
    } catch (error) {
      console.error('Error loading target tab ID:', error);
      await this.findActiveTab();
    }
  }

  /**
   * Find active tab in main browser windows (not popup windows)
   */
  async findActiveTab() {
    try {
      // Get all tabs and find the most recently active one that's not in a popup window
      const allTabs = await chrome.tabs.query({});
      const windows = await chrome.windows.getAll();
      
      // Find normal windows (not popup windows)
      const normalWindows = windows.filter(w => w.type === 'normal');
      
      if (normalWindows.length > 0) {
        // Get tabs from normal windows only
        const normalTabs = allTabs.filter(tab => 
          normalWindows.some(w => w.id === tab.windowId)
        );
        
        // Find the active tab in the focused normal window
        const focusedWindow = normalWindows.find(w => w.focused);
        if (focusedWindow) {
          const activeTab = normalTabs.find(tab => 
            tab.windowId === focusedWindow.id && tab.active
          );
          if (activeTab) {
            this.targetTabId = activeTab.id;
            await chrome.storage.local.set({ targetTabId: activeTab.id });
            return;
          }
        }
        
        // Fallback: use any active tab from normal windows
        const anyActiveTab = normalTabs.find(tab => tab.active);
        if (anyActiveTab) {
          this.targetTabId = anyActiveTab.id;
          await chrome.storage.local.set({ targetTabId: anyActiveTab.id });
        }
      }
    } catch (error) {
      console.error('Error finding active tab:', error);
    }
  }

  /**
   * Setup detached window interface with full responsive design
   */
  setupDetachedWindow() {
    // Make window resizable and larger
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    document.body.style.minWidth = '400px';
    document.body.style.minHeight = '600px';
    document.body.style.maxWidth = 'none';
    document.body.style.maxHeight = 'none';
    document.body.style.resize = 'both';
    document.body.style.overflow = 'auto';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Add responsive styles
    this.addResponsiveStyles();
    
    // Add window title
    document.title = 'Web Scraper - Detached Mode';
    
    // Add close button to header
    const header = document.querySelector('h1');
    if (header) {
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.float = 'right';
      closeBtn.style.background = '#dc3545';
      closeBtn.style.color = 'white';
      closeBtn.style.border = 'none';
      closeBtn.style.borderRadius = '50%';
      closeBtn.style.width = '2em';
      closeBtn.style.height = '2em';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.fontSize = '1em';
      closeBtn.title = 'Close Window';
      
      closeBtn.addEventListener('click', () => {
        window.close();
      });
      
      header.appendChild(closeBtn);
    }

    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.handleWindowResize();
    });
  }

  /**
   * Add detach button to regular popup
   * Allows user to open extension in a separate window
   */
  addDetachButton() {
    // Make regular popup larger and more responsive
    document.body.style.width = '450px';
    document.body.style.minHeight = '650px';
    
    // Add basic responsive styles for popup mode too
    this.addBasicResponsiveStyles();
    
    const header = document.querySelector('h1');
    if (header) {
      const detachBtn = document.createElement('button');
      detachBtn.textContent = '⧉';
      detachBtn.style.float = 'right';
      detachBtn.style.background = '#2196f3';
      detachBtn.style.color = 'white';
      detachBtn.style.border = 'none';
      detachBtn.style.borderRadius = '4px';
      detachBtn.style.padding = '5px 10px';
      detachBtn.style.cursor = 'pointer';
      detachBtn.style.fontSize = '14px';
      detachBtn.title = 'Open in Detached Window';
      
      detachBtn.addEventListener('click', () => {
        this.openDetachedWindow();
      });
      
      header.appendChild(detachBtn);
    }
  }

  /**
   * Add basic responsive styles for popup mode
   * Lighter version of responsive styles for regular popup
   */
  addBasicResponsiveStyles() {
    const style = document.createElement('style');
    style.id = 'popup-responsive-styles';
    style.textContent = `
      /* Basic responsive improvements for popup */
      .container {
        padding: 12px !important;
      }

      .elements-list {
        max-height: 140px !important;
        overflow-y: auto !important;
      }

      .preview-container {
        max-height: 180px !important;
        overflow: auto !important;
      }

      .preview-table th, .preview-table td {
        max-width: 120px !important;
        font-size: 10px !important;
      }

      .element-item {
        font-size: 11px !important;
      }

      .btn {
        min-height: 32px !important;
        font-size: 12px !important;
      }

      .btn-sm {
        min-height: 28px !important;
        font-size: 11px !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Open detached window and close original popup
   */
  async openDetachedWindow() {
    try {
      // Get current active tab ID to pass to detached window
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = activeTab ? activeTab.id : '';
      
      // Store tab ID for the detached window
      await chrome.storage.local.set({ targetTabId: tabId });
      
      const url = chrome.runtime.getURL(`popup.html?detached=true&tabId=${tabId}`);
      
      chrome.windows.create({
        url: url,
        type: 'popup',
        width: 600,
        height: 800,
        focused: true
      }, (window) => {
        // Close the original popup
        if (chrome.extension.getViews({type: 'popup'})[0]) {
          chrome.extension.getViews({type: 'popup'})[0].close();
        }
      });
    } catch (error) {
      console.error('Error opening detached window:', error);
    }
  }

  // ========================================
  // DOM INITIALIZATION
  // ========================================

  /**
   * Initialize DOM element references
   * Gets references to all UI elements for later manipulation
   */
  initializeElements() {
    // Mode buttons
    this.selectModeBtn = document.getElementById('select-mode');
    this.cssModeBtn = document.getElementById('css-mode');
    
    // CSS selector input section
    this.cssInputSection = document.getElementById('css-input-section');
    this.columnNameInput = document.getElementById('column-name');
    this.selectorTypeSelect = document.getElementById('selector-type');
    this.cssSelectorInput = document.getElementById('css-selector');
    this.testSelectorBtn = document.getElementById('test-selector');
    this.addSelectorBtn = document.getElementById('add-selector');
    
    // Elements display section
    this.elementCount = document.getElementById('element-count');
    this.elementsList = document.getElementById('elements-list');
    this.clearSelectionsBtn = document.getElementById('clear-selections');
    
    // Scraping actions
    this.scrapeDataBtn = document.getElementById('scrape-data');
    this.refreshPreviewBtn = document.getElementById('refresh-preview');
    
    // Preview section
    this.previewData = document.getElementById('preview-data');
    this.dataCount = document.getElementById('data-count');
    
    // Export section
    this.exportCsvBtn = document.getElementById('export-csv');
    this.exportJsonBtn = document.getElementById('export-json');
    this.exportXlsxBtn = document.getElementById('export-xlsx');
    this.filenameInput = document.getElementById('filename');
    
    // Progress section
    this.progressSection = document.getElementById('progress-section');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');
    
    // Status section
    this.statusBar = document.getElementById('status-bar');
    this.statusText = document.getElementById('status-text');
  }

  /**
   * Attach event listeners to UI elements
   * Sets up all user interaction handlers
   */
  attachEventListeners() {
    // ========= MODE SWITCHING =========
    this.selectModeBtn.addEventListener('click', () => this.switchMode('select'));
    this.cssModeBtn.addEventListener('click', () => this.switchMode('css'));
    
    // ========= CSS SELECTOR TESTING AND ADDING =========
    this.testSelectorBtn.addEventListener('click', () => this.testCssSelector());
    this.addSelectorBtn.addEventListener('click', () => this.addManualSelector());
    this.cssSelectorInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.testCssSelector();
    });
    
    // ========= ELEMENT MANAGEMENT =========
    this.clearSelectionsBtn.addEventListener('click', () => this.clearAllSelections());
    
    // ========= SCRAPING ACTIONS - FIXED for detached window =========
    this.scrapeDataBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.scrapeData();
    });
    
    this.refreshPreviewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.scrapeData();
    });
    
    // ========= EXPORT BUTTONS =========
    this.exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
    this.exportJsonBtn.addEventListener('click', () => this.exportData('json'));
    this.exportXlsxBtn.addEventListener('click', () => this.exportData('xlsx'));
    
    // ========= CHROME EXTENSION MESSAGING =========
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
    
    // ========= INITIALIZATION =========
    // Load initial data when popup opens
    this.loadCurrentPageData();
  }

  // ========================================
  // MODE MANAGEMENT
  // ========================================

  /**
   * Switch between selection modes: 'select' (point-and-click) or 'css' (manual input)
   * @param {string} mode - The mode to switch to ('select' or 'css')
   */
  switchMode(mode) {
    this.currentMode = mode;
    
    if (mode === 'select') {
      // ========= SELECT MODE (Point-and-click) =========
      this.selectModeBtn.classList.add('btn-primary');
      this.selectModeBtn.classList.remove('btn-secondary');
      this.cssModeBtn.classList.add('btn-secondary');
      this.cssModeBtn.classList.remove('btn-primary');
      this.cssInputSection.classList.add('hidden');
      this.enableElementSelection();
    } else {
      // ========= CSS MODE (Manual selector input) =========
      this.cssModeBtn.classList.add('btn-primary');
      this.cssModeBtn.classList.remove('btn-secondary');
      this.selectModeBtn.classList.add('btn-secondary');
      this.selectModeBtn.classList.remove('btn-primary');
      this.cssInputSection.classList.remove('hidden');
      this.disableElementSelection();
    }
  }

  // ========================================
  // COMMUNICATION WITH CONTENT SCRIPT - FIXED
  // ========================================

  /**
   * Send message to content script with timeout and error handling - FIXED for detached window
   * @param {Object} message - Message to send to content script
   * @param {number} timeout - Timeout in milliseconds (default: 10000)
   * @returns {Promise} Response from content script
   */
  async sendMessageToTab(message, timeout = 10000) {
    try {
      let targetTabId = null;

      if (this.isDetachedWindow) {
        // For detached windows, use stored target tab ID
        if (this.targetTabId) {
          targetTabId = this.targetTabId;
        } else {
          // Try to find an active tab if we don't have a stored one
          await this.findActiveTab();
          targetTabId = this.targetTabId;
        }

        if (!targetTabId) {
          throw new Error('No target tab found. Please click on a webpage tab first.');
        }
      } else {
        // For regular popup, get active tab in current window
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
          throw new Error('No active tab found');
        }
        targetTabId = tab.id;
      }

      // Verify the tab still exists and is accessible
      try {
        const tab = await chrome.tabs.get(targetTabId);
        if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
          throw new Error('Cannot access this type of page. Please navigate to a regular webpage.');
        }
      } catch (tabError) {
        if (this.isDetachedWindow) {
          // Tab might have been closed, try to find a new one
          await this.findActiveTab();
          targetTabId = this.targetTabId;
          if (!targetTabId) {
            throw new Error('Target tab no longer exists. Please click on a webpage tab first.');
          }
        } else {
          throw new Error('Cannot access the current tab');
        }
      }
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Message timeout - the webpage may not be responding'));
        }, timeout);
        
        chrome.tabs.sendMessage(targetTabId, message, (response) => {
          clearTimeout(timeoutId);
          
          if (chrome.runtime.lastError) {
            const errorMsg = chrome.runtime.lastError.message;
            if (errorMsg.includes('Could not establish connection')) {
              reject(new Error('Cannot connect to webpage. The page may need to be refreshed or the content script may not be loaded.'));
            } else {
              reject(new Error(errorMsg));
            }
            return;
          }
          
          if (!response) {
            reject(new Error('No response from webpage'));
            return;
          }
          
          resolve(response);
        });
      });
    } catch (error) {
      throw new Error(`Failed to communicate with webpage: ${error.message}`);
    }
  }

  // ========================================
  // ELEMENT SELECTION FUNCTIONALITY
  // ========================================

  /**
   * Enable point-and-click element selection on the webpage
   */
  async enableElementSelection() {
    try {
      await this.sendMessageToTab({ action: 'enableSelection' });
      this.isSelecting = true;
      this.updateStatus('Click elements on the page to select them', 'info');
    } catch (error) {
      this.updateStatus(`Error enabling selection: ${error.message}`, 'error');
      console.error('Selection enable error:', error);
    }
  }

  /**
   * Disable point-and-click element selection
   */
  async disableElementSelection() {
    try {
      await this.sendMessageToTab({ action: 'disableSelection' });
      this.isSelecting = false;
      this.updateStatus('Selection mode disabled', 'info');
    } catch (error) {
      console.error('Selection disable error:', error);
    }
  }

  /**
   * Test CSS selector and show results count
   */
  async testCssSelector() {
    const selector = this.cssSelectorInput.value.trim();
    const type = this.selectorTypeSelect.value;
    
    if (!selector) {
      this.updateStatus('Please enter a selector', 'error');
      return;
    }

    try {
      const response = await this.sendMessageToTab({
        action: 'testSelector',
        selector: selector,
        type: type
      });

      if (response.success && response.count > 0) {
        this.updateStatus(`Found ${response.count} elements with this ${type} selector`, 'success');
      } else {
        this.updateStatus(`No elements found with this ${type} selector`, 'error');
      }
    } catch (error) {
      this.updateStatus(`Error testing selector: ${error.message}`, 'error');
      console.error('Selector test error:', error);
    }
  }

  /**
   * Add selector manually from input fields
   */
  async addManualSelector() {
    const columnName = this.columnNameInput.value.trim();
    const selector = this.cssSelectorInput.value.trim();
    const type = this.selectorTypeSelect.value;
    
    // Validate inputs
    if (!columnName) {
      this.updateStatus('Please enter a column name', 'error');
      return;
    }
    
    if (!selector) {
      this.updateStatus('Please enter a selector', 'error');
      return;
    }

    try {
      // Test selector first
      const response = await this.sendMessageToTab({
        action: 'testSelector',
        selector: selector,
        type: type
      });

      if (response.success && response.count > 0) {
        // Add element to selection
        this.addElement(selector, type, columnName, response.count);
        this.updateStatus(`Added ${response.count} elements with ${type} selector`, 'success');
        
        // Clear input fields
        this.columnNameInput.value = '';
        this.cssSelectorInput.value = '';
      } else {
        this.updateStatus(`No elements found with this ${type} selector`, 'error');
      }
    } catch (error) {
      this.updateStatus(`Error adding selector: ${error.message}`, 'error');
      console.error('Selector add error:', error);
    }
  }

  // ========================================
  // ELEMENT MANAGEMENT
  // ========================================

  /**
   * Add element to selection list
   * @param {string} selector - CSS selector or XPath
   * @param {string} type - Selector type ('css' or 'xpath')
   * @param {string} columnName - Column name for data export
   * @param {number} count - Number of matching elements
   */
  addElement(selector, type = 'css', columnName = '', count = 1) {
    // Check if selector already exists
    const existing = this.selectedElements.find(el => el.selector === selector && el.type === type);
    if (existing) {
      this.updateStatus('Element already selected', 'error');
      return;
    }

    // Create element object
    const element = {
      selector: selector,
      type: type,
      columnName: columnName || `Column_${this.selectedElements.length + 1}`,
      count: count,
      id: Date.now().toString()
    };

    // Add to selection and update UI
    this.selectedElements.push(element);
    this.updateElementsList();
    this.updateExportButtons();
    this.saveStoredData();
  }

  /**
   * Edit an existing element - enters edit mode
   * @param {string} elementId - ID of element to edit
   */
  editElement(elementId) {
    const element = this.selectedElements.find(el => el.id === elementId);
    if (!element) return;

    this.editingElementId = elementId;
    this.updateElementsList();
  }

  /**
   * Save edited element after validation
   * @param {string} elementId - ID of element being edited
   * @param {string} newColumnName - New column name
   * @param {string} newSelector - New selector
   * @param {string} newType - New selector type
   */
  async saveEditedElement(elementId, newColumnName, newSelector, newType) {
    const elementIndex = this.selectedElements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) return;

    // Validate inputs
    if (!newColumnName.trim()) {
      this.updateStatus('Column name cannot be empty', 'error');
      return;
    }

    if (!newSelector.trim()) {
      this.updateStatus('Selector cannot be empty', 'error');
      return;
    }

    try {
      // Test the new selector
      const response = await this.sendMessageToTab({
        action: 'testSelector',
        selector: newSelector,
        type: newType
      });

      if (response.success && response.count > 0) {
        // Update element
        this.selectedElements[elementIndex] = {
          ...this.selectedElements[elementIndex],
          columnName: newColumnName.trim(),
          selector: newSelector.trim(),
          type: newType,
          count: response.count
        };
        
        // Exit edit mode and update UI
        this.editingElementId = null;
        this.updateElementsList();
        this.updateStatus(`Element updated successfully (${response.count} matches)`, 'success');
        this.saveStoredData();
      } else {
        this.updateStatus(`No elements found with this ${newType} selector`, 'error');
      }
    } catch (error) {
      this.updateStatus(`Error testing updated selector: ${error.message}`, 'error');
      console.error('Selector test error:', error);
    }
  }

  /**
   * Cancel editing element
   */
  cancelEditElement() {
    this.editingElementId = null;
    this.updateElementsList();
  }

  /**
   * Remove element from selection
   * @param {string} elementId - ID of element to remove
   */
  removeElement(elementId) {
    this.selectedElements = this.selectedElements.filter(el => el.id !== elementId);
    this.editingElementId = null;
    this.updateElementsList();
    this.updateExportButtons();
    this.saveStoredData();
  }

  /**
   * Clear all selected elements and reset data
   */
  clearAllSelections() {
    this.selectedElements = [];
    this.scrapedData = [];
    this.editingElementId = null;
    this.updateElementsList();
    this.updatePreview([]);
    this.updateExportButtons();
    this.saveStoredData();
    this.updateStatus('All selections cleared', 'info');
  }

  /**
   * Update the elements list display with edit functionality - FIXED for detached window
   * Creates the UI for managing selected elements
   */
  updateElementsList() {
    this.elementCount.textContent = this.selectedElements.length;
    
    // Show placeholder if no elements selected
    if (this.selectedElements.length === 0) {
      this.elementsList.innerHTML = '<p class="placeholder">No elements selected</p>';
      return;
    }

    // Generate HTML for each element
    this.elementsList.innerHTML = this.selectedElements.map(element => {
      const isEditing = this.editingElementId === element.id;
      
      if (isEditing) {
        // ========= EDIT MODE UI =========
        return `
          <div class="element-item edit-mode">
            <div class="edit-form">
              <div class="form-group">
                <label>Column Name:</label>
                <input type="text" class="edit-column-name" value="${element.columnName}">
              </div>
              <div class="form-group">
                <label>Selector Type:</label>
                <select class="edit-selector-type">
                  <option value="css" ${element.type === 'css' ? 'selected' : ''}>CSS Selector</option>
                  <option value="xpath" ${element.type === 'xpath' ? 'selected' : ''}>XPath</option>
                </select>
              </div>
              <div class="form-group">
                <label>Selector:</label>
                <input type="text" class="edit-selector" value="${element.selector}">
              </div>
              <div class="button-group">
                <button class="btn btn-sm btn-success save-edit-btn" data-id="${element.id}">Save</button>
                <button class="btn btn-sm btn-secondary cancel-edit-btn">Cancel</button>
              </div>
            </div>
          </div>
        `;
      } else {
        // ========= DISPLAY MODE UI =========
        return `
          <div class="element-item">
            <div class="element-header">
              <span class="element-column-name">${element.columnName}</span>
              <span class="element-type ${element.type}">${element.type}</span>
              <div class="element-actions">
                <button class="action-btn edit-btn" data-id="${element.id}" title="Edit">✏️</button>
                <button class="action-btn remove-btn" data-id="${element.id}" title="Remove">🗑️</button>
              </div>
            </div>
            <div class="element-selector" title="${element.selector}">
              ${element.selector} (${element.count} matches)
            </div>
          </div>
        `;
      }
    }).join('');

    // ========= ATTACH EVENT LISTENERS - FIXED using event delegation =========
    // Remove any existing event listener to prevent duplicates
    this.elementsList.removeEventListener('click', this.elementsListClickHandler);
    
    // Create and store the click handler
    this.elementsListClickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Handle edit button clicks
      if (e.target.classList.contains('edit-btn')) {
        const elementId = e.target.getAttribute('data-id');
        this.editElement(elementId);
        return;
      }
      
      // Handle remove button clicks
      if (e.target.classList.contains('remove-btn')) {
        const elementId = e.target.getAttribute('data-id');
        this.removeElement(elementId);
        return;
      }
      
      // Handle save edit button clicks
      if (e.target.classList.contains('save-edit-btn')) {
        const elementId = e.target.getAttribute('data-id');
        const editForm = e.target.closest('.edit-form');
        if (editForm) {
          const newColumnName = editForm.querySelector('.edit-column-name').value;
          const newSelector = editForm.querySelector('.edit-selector').value;
          const newType = editForm.querySelector('.edit-selector-type').value;
          
          this.saveEditedElement(elementId, newColumnName, newSelector, newType);
        }
        return;
      }
      
      // Handle cancel edit button clicks
      if (e.target.classList.contains('cancel-edit-btn')) {
        this.cancelEditElement();
        return;
      }
    };

    // Use event delegation to handle dynamically created buttons
    this.elementsList.addEventListener('click', this.elementsListClickHandler);
  }

  // ========================================
  // DATA SCRAPING FUNCTIONALITY
  // ========================================

  /**
   * Scrape data from the page using selected elements - FIXED for detached window
   * Communicates with content script to extract data
   */
  async scrapeData() {
    if (this.selectedElements.length === 0) {
      this.updateStatus('No elements selected for scraping', 'error');
      return;
    }

    this.showProgress(true, 0, 'Scraping data...');
    
    try {
      // Send scraping request to content script
      const response = await this.sendMessageToTab({
        action: 'scrapeData',
        elements: this.selectedElements
      });

      if (response && response.success) {
        this.scrapedData = response.data;
        this.updatePreview(response.data);
        this.updateExportButtons();
        this.updateStatus(`Successfully scraped ${response.data.length} rows of data`, 'success');
        this.saveStoredData();
      } else {
        throw new Error(response?.error || 'Failed to scrape data');
      }
    } catch (error) {
      this.updateStatus(`Scraping failed: ${error.message}`, 'error');
      console.error('Scraping error:', error);
    } finally {
      this.showProgress(false);
    }
  }

  /**
   * Update preview display with table format - Shows all data
   * @param {Array} data - Array of scraped data objects
   */
  updatePreview(data) {
    this.dataCount.textContent = data ? data.length : 0;
    
    if (!data || data.length === 0) {
      this.previewData.innerHTML = '<p class="placeholder">No data to preview</p>';
      return;
    }

    // Get all column names from selected elements
    const columns = this.selectedElements.map(el => el.columnName);
    
    // Create table HTML with ALL data (no limit)
    const tableHtml = `
      <table class="preview-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => `<td title="${row[col] || ''}">${row[col] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Show total count
    const totalText = `<p class="placeholder">Total: ${data.length} rows</p>`;
    this.previewData.innerHTML = tableHtml + totalText;
  }

  /**
   * Update export buttons state based on available data
   */
  updateExportButtons() {
    const hasData = this.scrapedData && this.scrapedData.length > 0;
    
    this.exportCsvBtn.disabled = !hasData;
    this.exportJsonBtn.disabled = !hasData;
    this.exportXlsxBtn.disabled = !hasData;
  }

  // ========================================
  // DATA EXPORT FUNCTIONALITY - FIXED
  // ========================================

  /**
   * Export data in specified format - UPDATED with working Excel export
   * @param {string} format - Export format ('csv', 'json', 'xlsx')
   */
  async exportData(format) {
    if (!this.scrapedData || this.scrapedData.length === 0) {
      this.updateStatus('No data to export. Please scrape data first.', 'error');
      return;
    }

    this.showProgress(true, 0, 'Preparing export...');
    
    try {
      const filename = this.filenameInput.value.trim() || 'scraped-data';
      await this.downloadData(this.scrapedData, format, filename);
      this.updateStatus(`Successfully exported ${this.scrapedData.length} rows as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      this.updateStatus(`Export failed: ${error.message}`, 'error');
      console.error('Export error:', error);
    } finally {
      this.showProgress(false);
    }
  }

  /**
   * Download data in specified format using native JavaScript - FIXED
   * @param {Array} data - Data to export
   * @param {string} format - File format ('csv', 'json', 'xlsx')
   * @param {string} filename - Base filename (without extension)
   */
  async downloadData(data, format, filename) {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    let blob, extension;

    try {
      switch (format) {
        case 'csv':
          const csvContent = this.createCSV(data);
          blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          extension = 'csv';
          break;
          
        case 'json':
          const json = JSON.stringify(data, null, 2);
          blob = new Blob([json], { type: 'application/json' });
          extension = 'json';
          break;
          
        case 'xlsx':
          const xlsxBlob = await this.createExcel(data);
          blob = xlsxBlob;
          extension = 'xls'; // Changed from xlsx to xls for native XML format
          break;
          
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      throw new Error(`Failed to create ${format.toUpperCase()} file: ${error.message}`);
    }
  }

  /**
   * Create CSV content from data - FIXED
   */
  createCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    // Get column names from selected elements to maintain order
    const headers = this.selectedElements.map(el => el.columnName);
    
    // Escape CSV values
    const escapeCSV = (value) => {
      if (value == null) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Create header row
    const csvHeader = headers.map(escapeCSV).join(',') + '\n';
    
    // Create data rows
    const csvRows = data.map(row => 
      headers.map(header => escapeCSV(row[header] || '')).join(',')
    ).join('\n');

    return csvHeader + csvRows;
  }

  /**
   * Create Excel file from data using native implementation - FIXED
   */
  async createExcel(data) {
    return new Promise((resolve, reject) => {
      try {
        // Create a simple Excel file using XML format
        const excelXML = this.createExcelXML(data);
        const blob = new Blob([excelXML], { 
          type: 'application/vnd.ms-excel'
        });
        resolve(blob);
      } catch (error) {
        reject(new Error(`Excel creation failed: ${error.message}`));
      }
    });
  }

  /**
   * Create Excel XML content - FIXED
   */
  createExcelXML(data) {
    if (!data || data.length === 0) {
      return '';
    }

    // Get column names from selected elements to maintain order
    const headers = this.selectedElements.map(el => el.columnName);
    
    // Escape XML characters
    const escapeXML = (value) => {
      if (value == null) return '';
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // Build Excel XML
    let xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Scraped Data">
  <Table>`;

    // Add header row
    xml += '\n   <Row>';
    headers.forEach(header => {
      xml += `\n    <Cell><Data ss:Type="String">${escapeXML(header)}</Data></Cell>`;
    });
    xml += '\n   </Row>';

    // Add data rows
    data.forEach(row => {
      xml += '\n   <Row>';
      headers.forEach(header => {
        const value = row[header] || '';
        // Detect if value is a number
        const isNumber = !isNaN(value) && !isNaN(parseFloat(value)) && value !== '';
        const dataType = isNumber ? 'Number' : 'String';
        xml += `\n    <Cell><Data ss:Type="${dataType}">${escapeXML(value)}</Data></Cell>`;
      });
      xml += '\n   </Row>';
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    return xml;
  }

  // ========================================
  // UI FEEDBACK & STATUS MANAGEMENT
  // ========================================

  /**
   * Show/hide progress indicator
   * @param {boolean} show - Whether to show progress
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} text - Progress text to display
   */
  showProgress(show, progress = 0, text = 'Processing...') {
    if (show) {
      this.progressSection.classList.remove('hidden');
      this.progressFill.style.width = `${progress}%`;
      this.progressText.textContent = text;
    } else {
      this.progressSection.classList.add('hidden');
    }
  }

  /**
   * Update status bar with message and styling
   * @param {string} message - Status message
   * @param {string} type - Status type ('info', 'success', 'error', 'warning')
   */
  updateStatus(message, type = 'info') {
    this.statusText.textContent = message;
    this.statusBar.className = `status-bar ${type}`;
  }

  // ========================================
  // CHROME EXTENSION MESSAGING
  // ========================================

  /**
   * Handle messages from content script
   * @param {Object} message - Message from content script
   * @param {Object} sender - Message sender info
   * @param {Function} sendResponse - Response callback
   */
  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'elementSelected':
        // Generate a default column name for selected element
        const columnName = `Column_${this.selectedElements.length + 1}`;
        this.addElement(message.cssSelector, 'css', columnName, 1);
        this.updateStatus('Element selected. Click "Scrape Data" to extract information.', 'success');
        break;
    }
  }

  // ========================================
  // DATA PERSISTENCE (Chrome Storage)
  // ========================================

  /**
   * Load data from Chrome storage on startup
   * Restores selected elements and scraped data from previous session
   */
  async loadStoredData() {
    try {
      const result = await chrome.storage.local.get(['selectedElements', 'scrapedData']);
      
      // Restore selected elements
      if (result.selectedElements && Array.isArray(result.selectedElements)) {
        this.selectedElements = result.selectedElements;
        this.updateElementsList();
        this.updateExportButtons();
      }
      
      // Restore scraped data
      if (result.scrapedData && Array.isArray(result.scrapedData)) {
        this.scrapedData = result.scrapedData;
        this.updatePreview(result.scrapedData);
        this.updateExportButtons();
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  }

  /**
   * Save data to Chrome storage
   * Persists selected elements and scraped data for next session
   */
  async saveStoredData() {
    try {
      await chrome.storage.local.set({
        selectedElements: this.selectedElements,
        scrapedData: this.scrapedData
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // ========================================
  // INITIALIZATION & SETUP
  // ========================================

  /**
   * Load current page data and setup extension - FIXED for detached window
   * Initializes communication with content script and sets up initial state
   */
  async loadCurrentPageData() {
    try {
      // Initialize content script
      const response = await this.sendMessageToTab({ action: 'initialize' });
      
      // Auto-enable selection mode if no elements are selected and in select mode
      if (this.selectedElements.length === 0 && this.currentMode === 'select') {
        this.enableElementSelection();
      }
      
      this.updateStatus('Extension ready', 'success');
    } catch (error) {
      console.error('Error initializing page:', error);
      
      // Provide specific guidance based on error type
      if (error.message.includes('Cannot access this type of page')) {
        this.updateStatus('Cannot access this type of page. Please navigate to a regular webpage (not chrome:// or extension pages).', 'error');
      } else if (error.message.includes('No target tab found') || error.message.includes('Click on a webpage tab first')) {
        this.updateStatus('Please click on a webpage tab first, then use the extension.', 'warning');
      } else if (error.message.includes('Cannot connect to webpage')) {
        this.updateStatus('Cannot connect to webpage. Please refresh the page and try again.', 'error');
      } else {
        this.updateStatus(`Connection error: ${error.message}`, 'error');
      }
    }
  }
}

// ========================================
// EXTENSION INITIALIZATION
// ========================================

/**
 * Initialize popup when DOM is loaded
 * Entry point for the extension popup
 */
document.addEventListener('DOMContentLoaded', () => {
  new WebScraperPopup();
});