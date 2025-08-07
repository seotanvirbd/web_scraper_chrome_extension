/**
 * ============================================================================
 * UNIVERSAL WEB SCRAPER - BACKGROUND SCRIPT
 * ============================================================================
 * This file handles:
 * - Extension installation and setup
 * - Communication between popup and content scripts
 * - Tab management and content script injection
 * - Cross-tab messaging relay
 * ============================================================================
 */

class WebScraperBackground {
  constructor() {
    this.setupEventListeners();
  }

  // ========================================================================
  // EVENT LISTENERS SETUP
  // Set up all Chrome extension event listeners
  // ========================================================================
  setupEventListeners() {
    // Handle extension installation/update
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle messages between content script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    // Handle tab updates for dynamic content detection
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });
  }

  // ========================================================================
  // INSTALLATION HANDLER
  // Set up default settings when extension is first installed
  // ========================================================================
  handleInstallation(details) {
    if (details.reason === 'install') {
      // Set default storage values
      chrome.storage.local.set({
        selectedElements: [],                    // User's selected CSS selectors with column names
        scrapedData: [],                        // Previously scraped data
        settings: {
          autoDetectDynamicContent: true,       // Automatically detect AJAX content
          defaultExportFormat: 'csv'            // Default file format for exports
        }
      });
      
      console.log('Web Scraper Extension installed successfully');
    }
  }

  // ========================================================================
  // MESSAGE HANDLER
  // Handle communication between different parts of the extension
  // ========================================================================
  handleMessage(message, sender, sendResponse) {
    // Process different types of messages
    switch (message.action) {
      // Get information about the current active tab
      case 'getTabInfo':
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          sendResponse({ tab: tabs[0] });
        });
        return true; // Keep message channel open for async response
        
      // Inject content script into a specific tab
      case 'injectContentScript':
        this.injectContentScript(message.tabId)
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
    }
  }

  // ========================================================================
  // TAB UPDATE HANDLER
  // Monitor tab changes and re-inject content script if needed
  // ========================================================================
  handleTabUpdate(tabId, changeInfo, tab) {
    // Re-inject content script if page is refreshed or changed
    if (changeInfo.status === 'complete' && 
        tab.url && 
        !tab.url.startsWith('chrome://')) {
      this.ensureContentScriptInjected(tabId);
    }
  }

  // ========================================================================
  // CONTENT SCRIPT INJECTION
  // Inject the content script that enables element selection on web pages
  // ========================================================================
  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']                   // The file that handles element selection
      });
    } catch (error) {
      console.error('Failed to inject content script:', error);
      throw error;
    }
  }

  // ========================================================================
  // ENSURE CONTENT SCRIPT IS ACTIVE
  // Check if content script is running, inject if not
  // ========================================================================
  async ensureContentScriptInjected(tabId) {
    try {
      // Test if content script is already present by sending a ping
      const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    } catch (error) {
      // Content script not present, inject it
      await this.injectContentScript(tabId);
    }
  }
}

// ========================================================================
// INITIALIZE BACKGROUND SCRIPT
// Start the background script when extension loads
// ========================================================================
new WebScraperBackground();