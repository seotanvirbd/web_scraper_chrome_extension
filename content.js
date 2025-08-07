/**
 * ============================================================================
 * UNIVERSAL WEB SCRAPER - CONTENT SCRIPT
 * ============================================================================
 * This file handles all interactions with web pages:
 * - Element selection (point-and-click)
 * - Data scraping from selected elements
 * - CSS selector and XPath generation
 * - Communication with popup interface
 * ============================================================================
 */

class WebScraperContent {
  constructor() {
    // ====================================================================
    // INITIALIZATION VARIABLES
    // Core state management for the content script
    // ====================================================================
    this.isSelectionMode = false;        // Whether user can select elements
    this.highlightedElement = null;      // Currently hovered element
    this.selectedElements = new Set();   // Set of selected CSS selectors
    this.mutationObserver = null;        // Watches for DOM changes
    
    // Initialize the content script
    this.initializeStyles();
    this.attachEventListeners();
    this.setupMutationObserver();
  }

  // ======================================================================
  // STYLE INITIALIZATION
  // Inject CSS styles for element highlighting into the page
  // ======================================================================
  initializeStyles() {
    // Avoid injecting styles multiple times
    if (document.getElementById('web-scraper-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'web-scraper-styles';
    style.textContent = `
      /* Hover highlight - blue border */
      .web-scraper-highlight {
        outline: 2px solid #2196f3 !important;
        outline-offset: 2px !important;
        background-color: rgba(33, 150, 243, 0.1) !important;
        cursor: crosshair !important;
        position: relative !important;
      }
      
      /* Selected highlight - green border */
      .web-scraper-selected {
        outline: 2px solid #4caf50 !important;
        outline-offset: 2px !important;
        background-color: rgba(76, 175, 80, 0.1) !important;
      }
      
      /* Tooltip for element information */
      .web-scraper-tooltip {
        position: absolute;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        z-index: 10000;
        pointer-events: none;
        white-space: nowrap;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      /* Selection mode overlay */
      .web-scraper-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        z-index: 9999;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  // ======================================================================
  // MUTATION OBSERVER SETUP
  // Watch for dynamic content changes (AJAX, SPA navigation, etc.)
  // ======================================================================
  setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      // Re-apply selection highlights if elements are added/removed
      if (this.isSelectionMode) {
        setTimeout(() => this.updateHighlights(), 100);
      }
    });

    // Monitor changes to the page content
    this.mutationObserver.observe(document.body, {
      childList: true,    // Watch for added/removed elements
      subtree: true,      // Watch entire DOM tree
      attributes: false   // Don't watch attribute changes (performance)
    });
  }

  // ======================================================================
  // EVENT LISTENERS SETUP
  // Set up communication and interaction handlers
  // ======================================================================
  attachEventListeners() {
    // Listen for messages from popup interface
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    // Mouse event handlers for element selection
    this.mouseMoveHandler = (e) => this.handleMouseMove(e);
    this.clickHandler = (e) => this.handleClick(e);
    this.mouseLeaveHandler = () => this.clearHighlight();
  }

  // ======================================================================
  // MESSAGE HANDLER
  // Process commands from the popup interface
  // ======================================================================
  handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        // Health check - confirm content script is running
        case 'ping':
          sendResponse({ success: true });
          break;
          
        // Initialize content script
        case 'initialize':
          sendResponse({ success: true });
          break;
          
        // Enable point-and-click element selection
        case 'enableSelection':
          this.enableSelectionMode();
          sendResponse({ success: true });
          break;
          
        // Disable element selection
        case 'disableSelection':
          this.disableSelectionMode();
          sendResponse({ success: true });
          break;
          
        // Test a CSS selector or XPath and return match count
        case 'testSelector':
          const result = this.testSelector(message.selector, message.type);
          sendResponse(result);
          break;
          
        // Scrape data using provided selectors
        case 'scrapeData':
          const scrapedData = this.scrapeData(message.elements);
          sendResponse(scrapedData);
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // ======================================================================
  // SELECTION MODE - ENABLE
  // Turn on point-and-click element selection
  // ======================================================================
  enableSelectionMode() {
    this.isSelectionMode = true;
    
    // Add mouse event listeners
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('click', this.clickHandler);
    document.addEventListener('mouseleave', this.mouseLeaveHandler);
    
    // Add visual overlay to indicate selection mode
    const overlay = document.createElement('div');
    overlay.className = 'web-scraper-overlay';
    overlay.id = 'web-scraper-overlay';
    document.body.appendChild(overlay);
    
    // Change cursor to crosshair
    document.body.style.cursor = 'crosshair';
  }

  // ======================================================================
  // SELECTION MODE - DISABLE
  // Turn off element selection mode
  // ======================================================================
  disableSelectionMode() {
    this.isSelectionMode = false;
    
    // Remove mouse event listeners
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('click', this.clickHandler);
    document.removeEventListener('mouseleave', this.mouseLeaveHandler);
    
    // Remove visual overlay
    const overlay = document.getElementById('web-scraper-overlay');
    if (overlay) overlay.remove();
    
    // Reset cursor and clear highlights
    this.clearHighlight();
    document.body.style.cursor = '';
  }

  // ======================================================================
  // MOUSE INTERACTION - MOVE
  // Handle mouse movement for element highlighting
  // ======================================================================
  handleMouseMove(e) {
    if (!this.isSelectionMode) return;
    
    // Get element under mouse cursor
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element && element !== this.highlightedElement) {
      this.highlightElement(element, e.clientX, e.clientY);
    }
  }

  // ======================================================================
  // MOUSE INTERACTION - CLICK
  // Handle element selection on click
  // ======================================================================
  handleClick(e) {
    if (!this.isSelectionMode) return;
    
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.target;
    const cssSelector = this.generateCSSSelector(element);
    const xpath = this.generateXPath(element);
    
    // Send selected element info to popup
    chrome.runtime.sendMessage({
      action: 'elementSelected',
      cssSelector: cssSelector,
      xpath: xpath,
      tagName: element.tagName.toLowerCase(),
      textContent: element.textContent?.substring(0, 50) || ''
    });
    
    // Mark element as selected visually
    element.classList.add('web-scraper-selected');
    this.selectedElements.add(cssSelector);
  }

  // ======================================================================
  // ELEMENT HIGHLIGHTING
  // Show visual highlight and tooltip for hovered element
  // ======================================================================
  highlightElement(element, mouseX, mouseY) {
    this.clearHighlight();
    
    // Don't highlight body or html elements
    if (element === document.body || element === document.documentElement) return;
    
    this.highlightedElement = element;
    element.classList.add('web-scraper-highlight');
    
    // Create and show tooltip with element information
    const tooltip = document.createElement('div');
    tooltip.className = 'web-scraper-tooltip';
    tooltip.id = 'web-scraper-tooltip';
    
    const cssSelector = this.generateCSSSelector(element);
    const text = element.textContent?.substring(0, 30) || '';
    tooltip.textContent = `${cssSelector}${text ? ` | "${text}..."` : ''}`;
    
    // Position tooltip near cursor
    tooltip.style.left = `${mouseX + 10}px`;
    tooltip.style.top = `${mouseY - 30}px`;
    
    document.body.appendChild(tooltip);
  }

  // ======================================================================
  // CLEAR HIGHLIGHTING
  // Remove visual highlights and tooltip
  // ======================================================================
  clearHighlight() {
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('web-scraper-highlight');
      this.highlightedElement = null;
    }
    
    const tooltip = document.getElementById('web-scraper-tooltip');
    if (tooltip) tooltip.remove();
  }

  // ======================================================================
  // UPDATE HIGHLIGHTS
  // Re-apply highlights after DOM changes (for dynamic content)
  // ======================================================================
  updateHighlights() {
    // Re-apply selected element highlights
    this.selectedElements.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.classList.add('web-scraper-selected'));
      } catch (error) {
        console.warn('Invalid selector in updateHighlights:', selector);
      }
    });
  }

  // ======================================================================
  // CSS SELECTOR GENERATION
  // Generate unique CSS selector for any element
  // ======================================================================
  generateCSSSelector(element) {
    // Try ID first (most specific)
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Try unique class combination
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(cls => 
        cls && !cls.startsWith('web-scraper-')  // Exclude our own classes
      );
      
      if (classes.length > 0) {
        const classSelector = `.${classes.join('.')}`;
        if (document.querySelectorAll(classSelector).length === 1) {
          return classSelector;
        }
      }
    }
    
    // Build path-based selector
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      // Add nth-child if needed for uniqueness
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children)
          .filter(sibling => sibling.tagName === current.tagName);
        
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
      
      // Check if current path is unique
      const currentSelector = path.join(' > ');
      if (document.querySelectorAll(currentSelector).length === 1) {
        return currentSelector;
      }
      
      // Limit path length for performance
      if (path.length >= 5) break;
    }
    
    return path.join(' > ');
  }

  // ======================================================================
  // XPATH GENERATION
  // Generate XPath for any element
  // ======================================================================
  generateXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    const path = [];
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
      let selector = current.nodeName.toLowerCase();
      
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children)
          .filter(sibling => sibling.nodeName === current.nodeName);
        
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `[${index}]`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return '/' + path.join('/');
  }

  // ======================================================================
  // SELECTOR TESTING
  // Test CSS selector or XPath and return information about matches
  // ======================================================================
  testSelector(selector, type = 'css') {
    try {
      let elements;
      
      if (type === 'xpath') {
        const result = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        elements = [];
        for (let i = 0; i < result.snapshotLength; i++) {
          elements.push(result.snapshotItem(i));
        }
      } else {
        elements = document.querySelectorAll(selector);
      }
      
      return {
        success: true,
        count: elements.length,
        selector: selector,
        type: type
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        count: 0,
        type: type
      };
    }
  }

  // ======================================================================
  // DATA SCRAPING
  // Extract data from page using provided element configurations
  // ======================================================================
  scrapeData(elements) {
    try {
      const data = [];
      
      // Find the maximum number of elements for any selector
      const maxElements = Math.max(...elements.map(element => {
        try {
          if (element.type === 'xpath') {
            const result = document.evaluate(element.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength;
          } else {
            return document.querySelectorAll(element.selector).length;
          }
        } catch (error) {
          console.warn('Invalid selector:', element.selector);
          return 0;
        }
      }));

      // Extract data for each row
      for (let i = 0; i < maxElements; i++) {
        const row = {};
        
        elements.forEach((element) => {
          try {
            let matchedElements = [];
            
            if (element.type === 'xpath') {
              const result = document.evaluate(element.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
              for (let j = 0; j < result.snapshotLength; j++) {
                matchedElements.push(result.snapshotItem(j));
              }
            } else {
              matchedElements = Array.from(document.querySelectorAll(element.selector));
            }
            
            const domElement = matchedElements[i];
            
            if (domElement) {
              // Use user-provided column name
              const columnName = element.columnName || `Column_${elements.indexOf(element) + 1}`;
              
              // Extract text content, handling special cases
              let value = this.extractElementValue(domElement);
              row[columnName] = value;
            }
          } catch (error) {
            console.warn('Error processing selector:', element.selector, error);
          }
        });
        
        // Only add row if it has at least one non-empty value
        if (Object.values(row).some(value => value && value.toString().trim())) {
          data.push(row);
        }
      }

      return {
        success: true,
        data: data,
        count: data.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // ======================================================================
  // VALUE EXTRACTION
  // Extract appropriate value from different types of HTML elements
  // ======================================================================
  extractElementValue(element) {
    const tagName = element.tagName.toLowerCase();
    
    // Handle different input types
    if (tagName === 'input') {
      const type = element.type.toLowerCase();
      if (type === 'checkbox' || type === 'radio') {
        return element.checked;              // Boolean for checkboxes/radios
      }
      return element.value || element.getAttribute('value') || '';
    }
    
    // Handle select dropdowns
    if (tagName === 'select') {
      return element.value || element.options[element.selectedIndex]?.text || '';
    }
    
    // Handle textarea
    if (tagName === 'textarea') {
      return element.value;
    }
    
    // Handle images - extract src or alt text
    if (tagName === 'img') {
      return element.src || element.alt || '';
    }
    
    // Handle links - extract href or text
    if (tagName === 'a') {
      return element.href || element.textContent?.trim() || '';
    }
    
    // Handle elements with special data attributes
    const srcAttr = element.getAttribute('src');
    const hrefAttr = element.getAttribute('href');
    const dataValue = element.getAttribute('data-value');
    
    if (srcAttr) return srcAttr;
    if (hrefAttr) return hrefAttr;
    if (dataValue) return dataValue;
    
    // Default to text content
    return element.textContent?.trim() || element.innerText?.trim() || '';
  }
}

// ========================================================================
// INITIALIZE CONTENT SCRIPT
// Start the content script when DOM is ready
// ========================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WebScraperContent();
  });
} else {
  new WebScraperContent();
}