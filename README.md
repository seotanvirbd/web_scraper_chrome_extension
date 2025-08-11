# 🕷️ Universal Web Scraper Chrome Extension

A powerful, user-friendly Chrome extension for scraping data from any webpage with a point-and-click interface. Extract structured data and export it to CSV, JSON, or Excel formats with support for pagination and multiple selection methods.

## ✨ Features

### 🎯 Element Selection
- **Visual Point-and-Click**: Hover and click to select elements directly on any webpage
- **Manual Input**: Add CSS selectors or XPath expressions manually
- **Smart Highlighting**: Visual feedback with hover effects and selection indicators
- **Real-time Testing**: Test selectors instantly to see how many elements match

### 📊 Data Extraction
- **Multi-element Support**: Select multiple different elements per page
- **Intelligent Value Extraction**: Automatically extracts text, links, images, form values, and attributes
- **Column Naming**: Assign custom names to each data column
- **Live Preview**: See extracted data before exporting

### 📄 Pagination Support
- **Automatic Page Navigation**: Configure next button selectors for multi-page scraping
- **Configurable Settings**: Set maximum pages and delays between page loads
- **Progress Tracking**: Visual progress indicators during pagination
- **Error Handling**: Robust handling of navigation failures and missing buttons

### 💾 Export Options
- **CSV Export**: Standard comma-separated values with proper escaping
- **JSON Export**: Structured JSON format for developers
- **Excel Export**: Native .xls format for spreadsheet applications
- **Custom Filenames**: Set your own export file names

### 🔧 Advanced Features
- **Detached Window Mode**: Open the extension in a separate window for better workflow
- **Data Persistence**: Automatically saves selections and scraped data
- **Cross-tab Support**: Works with multiple browser tabs
- **Error Recovery**: Comprehensive error handling and user feedback
- **Responsive Design**: Optimized interface for different screen sizes

## 🚀 Installation

### Manual Installation (Developer Mode)

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd universal-web-scraper
   ```

2. **Enable Developer Mode in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should appear in your extensions list

4. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "Universal Web Scraper" and click the pin icon

## 📋 Usage Guide

### Basic Scraping Workflow

1. **Navigate to Target Website**
   - Open the webpage you want to scrape
   - Click the extension icon to open the popup

2. **Select Elements**
   
   **Method 1: Visual Selection**
   - Click "🎯 Select Elements" button
   - Hover over elements on the page to see them highlighted
   - Click on elements you want to scrape
   - Each click adds the element to your selection list

   **Method 2: Manual Input**
   - Click "📝 Manual Input" button
   - Enter a column name for your data
   - Choose between CSS Selector or XPath
   - Enter your selector (e.g., `.product-title` or `//h2[@class="title"]`)
   - Click "Test" to verify the selector finds elements
   - Click "Add" to add it to your selection

3. **Configure Data Extraction**
   - Review your selected elements in the list
   - Edit column names or selectors as needed
   - Use the "🗑️" button to remove unwanted elements

4. **Scrape Data**
   - Click "🔍 Scrape Data" to extract information
   - Review the data preview to ensure accuracy
   - Use "🔄 Refresh" to re-scrape if needed

5. **Export Results**
   - Choose your preferred format: CSV, JSON, or Excel
   - Optionally customize the filename
   - Click the export button to download your data

### Advanced: Pagination Scraping

1. **Enable Pagination**
   - Check the "Enable Pagination" checkbox
   - Configure maximum pages (1-100)
   - Set delay between pages (500-10000ms)

2. **Configure Next Button**
   - Enter the selector for the "Next" button
   - Choose between CSS Selector or XPath
   - Examples:
     - CSS: `.next-page`, `a[aria-label="Next"]`, `.pagination .next`
     - XPath: `//a[contains(text(), 'Next')]`, `//button[@aria-label='Next page']`

3. **Test Configuration**
   - Click "🔍 Test" to verify the next button is found
   - Ensure the button is visible and clickable

4. **Start Pagination**
   - Click "▶️ Start Pagination"
   - Monitor progress in the status bar
   - Data from all pages will be combined automatically
   - Click "⏹️ Stop" to halt pagination at any time

## 🛠️ Technical Details

### File Structure
```
universal-web-scraper/
├── manifest.json          # Extension configuration
├── background.js           # Service worker for extension lifecycle
├── content.js             # Content script for page interaction
├── content.css            # Styles for element highlighting
├── popup.html             # Main extension interface
├── popup.css              # Popup styling
└── popup.js               # Popup functionality and logic
```

### Key Components

**Background Script (`background.js`)**
- Manages extension lifecycle and installation
- Handles cross-tab communication
- Injects content scripts into webpages

**Content Script (`content.js`)**
- Enables element selection and highlighting
- Handles data extraction from DOM elements
- Manages pagination navigation
- Generates CSS selectors and XPath expressions

**Popup Interface (`popup.js`)**
- Provides user interface for configuration
- Manages data preview and export
- Handles detached window mode
- Coordinates between background and content scripts

### Supported Element Types

The extension can extract data from various HTML elements:

- **Text Elements**: `<p>`, `<span>`, `<div>`, `<h1-h6>`, etc.
- **Links**: `<a>` (extracts href and text)
- **Images**: `<img>` (extracts src and alt text)
- **Form Inputs**: `<input>`, `<textarea>`, `<select>`
- **Lists**: `<li>`, `<ul>`, `<ol>`
- **Tables**: `<td>`, `<th>`, `<table>`
- **Custom Attributes**: Any element with data attributes

### Selector Generation

**CSS Selectors**: Automatically generated using:
- Element IDs (`#unique-id`)
- Class names (`.class-name`)
- Hierarchical paths (`div > p > span`)
- Nth-child selectors for uniqueness

**XPath**: Generated using:
- Absolute paths from document root
- Relative paths with predicates
- Text content matching
- Attribute-based selection

## ⚙️ Configuration Options

### Pagination Settings
- **Max Pages**: Maximum number of pages to scrape (1-100)
- **Page Delay**: Wait time between page loads (500-10000ms)
- **Next Button Selector**: CSS or XPath selector for pagination button
- **Selector Type**: Choose between CSS Selector or XPath

### Export Settings
- **Filename**: Custom name for exported files
- **Format**: Choose between CSV, JSON, or Excel
- **Data Encoding**: UTF-8 encoding for international characters

### Interface Options
- **Detached Mode**: Open extension in separate window
- **Auto-save**: Automatically save selections and data
- **Progress Tracking**: Visual feedback during operations

## 🔍 Troubleshooting

### Common Issues

**"Cannot connect to webpage"**
- Refresh the target webpage
- Ensure the page has finished loading
- Try disabling and re-enabling the extension

**"No elements found with this selector"**
- Verify the selector syntax is correct
- Check if elements are loaded dynamically (wait for page load)
- Try using a more specific or less specific selector

**"Pagination not working"**
- Ensure the next button selector is accurate
- Check that the button is visible and clickable
- Verify the button actually navigates to the next page

**"Export failed"**
- Check if you have scraped data first
- Ensure your browser allows downloads
- Try a different export format

**"Permission denied on chrome:// pages"**
- The extension cannot access Chrome internal pages
- Navigate to a regular website (http:// or https://)

### Performance Tips

- **Limit Selections**: Too many selectors can slow down scraping
- **Increase Delays**: If pages load slowly, increase pagination delay
- **Use Specific Selectors**: More specific selectors are faster and more reliable
- **Close Unused Tabs**: Reduce browser memory usage during large scrapes

## 🔒 Privacy & Security

### Data Handling
- **Local Processing**: All data extraction happens locally in your browser
- **No External Servers**: No data is sent to external servers
- **Temporary Storage**: Data is stored temporarily in Chrome's local storage
- **User Control**: You control what data is extracted and exported

### Permissions
- **Active Tab**: Access to currently active browser tab
- **Storage**: Local storage for saving settings and data
- **Downloads**: Permission to save exported files
- **All URLs**: Required for universal website compatibility

### Security Features
- **Content Security Policy**: Prevents malicious script injection
- **Isolated Environment**: Content scripts run in isolated context
- **No Network Requests**: Extension doesn't make external network calls

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Make your changes
3. Test thoroughly on various websites
4. Submit a pull request with detailed description

### Testing Guidelines
- Test on different website structures
- Verify pagination on multiple sites
- Check export functionality with large datasets
- Ensure compatibility with dynamic content

### Code Style
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Follow established naming conventions
- Include error handling for all async operations

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

### Getting Help
- Check the troubleshooting section above
- Review browser console for error messages
- Test with simple selectors first

### Reporting Issues
When reporting bugs, please include:
- Browser version and operating system
- Steps to reproduce the issue
- Target website URL (if public)
- Console error messages
- Screenshots if applicable

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Basic element selection and data extraction
- CSV, JSON, and Excel export
- Pagination support
- Detached window mode
- Visual element highlighting
- Manual selector input
- Data persistence

---

**Made with ❤️ for the web scraping community**
