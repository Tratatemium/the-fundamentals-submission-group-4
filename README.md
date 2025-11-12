# Rendered Realities - AI-Powered Image Gallery

An AI-powered image gallery application featuring Google Gemini 2.5 Pro integration for automatic metadata generation, dual viewing modes, and advanced pagination system with dynamic category filtering.

## Features

### Core Functionality
- **Dual Gallery Modes**: 
  - **Grid View**: Displays 2 API pages (20 images) per gallery page with responsive grid layout
  - **Carousel View**: 3D rotating carousel displaying 1 API page (10 images) with interactive navigation
- **AI Metadata Generation**: Google Gemini 2.5 Pro vision model integration for automatic:
  - Image categorization and classification
  - Detailed scene descriptions
  - Random realistic author name attribution
- **Advanced Pagination**: Intelligent pagination system with:
  - Previous/Next navigation buttons
  - Numbered page controls with active state indicators
  - Automatic page caching to prevent duplicate API calls
  - Mode-specific page calculations (grid vs carousel)
- **Dynamic Category Filtering**: 
  - Real-time category buttons generated from AI metadata
  - "All" and "Uncategorised" filter options
  - Seamless category switching with maintained pagination
- **Interactive Lightbox**: Full-screen image viewing with:
  - Real-time commenting system with name/comment inputs
  - Comment history display with user attribution
  - Keyboard navigation (Escape to close)
- **Theme System**: Comprehensive light/dark mode with:
  - Animated toggle switch 
  - CSS custom properties for consistent theming
  - LocalStorage persistence for user preference
- **Responsive Design**: Mobile-first approach with:
  - CSS Grid and Flexbox layouts
  - Adaptive carousel for touch devices
  - Collapsible hamburger navigation menu

### Interactive Elements
- **Social Media Features**: 
  - Heart button with like counting and localStorage persistence
  - Comment display with real counts from API data
  - Like synchronization with external API endpoints
- **Advanced Animations**:
  - Hover overlays revealing AI-generated metadata (category/author)
  - 3D carousel with smooth rotation transitions
  - Loading skeleton animations with rotating gear icons
  - Image scaling effects and smooth state transitions
- **Real-time Feedback**:
  - AI processing timer with live second counter
  - Loading animations during API requests
  - Processing status indicators and error handling
- **Navigation Experience**:
  - Smooth hamburger menu with morphing icon animation
  - About dialog with team information and project details
  - Subscription popup with email validation

## Architecture

### Modular ES6 Architecture
The application uses a clean modular architecture with ES6 imports/exports and clear separation of concerns:

- **main.js** (Core Module) - Central state management, DOM manipulation, and cross-module coordination
- **api.js** - External image API integration with error handling and loading feedback  
- **pagination.js** - Advanced dual-mode pagination system with loading animations and page caching
- **gemini-api.js** - Google Gemini 2.5 Pro AI integration with batch processing and real-time timers
- **image-categories.js** - Dynamic category filtering system with UI management
- **header-functionality.js** - Navigation controls, theme switching, and subscription popup
- **lightbox.js** - Modal image viewer with commenting functionality and keyboard navigation
- **grid-carousel.js** - 3D carousel implementation with interactive rotation controls
- **likes-function.js** - Social interaction system with localStorage and API synchronization

## Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher) and **npm** installed
- **Google AI API key** for Gemini 2.5 Pro model access
- Modern web browser with ES6+ support

### Quick Start
1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd the-fundamentals-submission-group-4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_google_ai_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Dependencies
```json
{
  "dependencies": {
    "@google/genai": "^1.28.0",
    "mime": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^24.10.0",
    "vite": "^7.1.7"
  }
}
```

### Available Scripts
```bash
npm run dev     # Start development server with hot reload
npm run build   # Build optimized production bundle
npm run preview # Preview production build locally
```

## Usage Guide

### Getting Started
1. **Initial Load**: Application automatically loads the first 2 pages (20 images) in grid mode
2. **View Modes**: Toggle between grid and carousel using the "Switch to carousel/grid" button
3. **Navigation**: Use Previous/Next buttons or numbered pagination to browse images
4. **AI Enhancement**: Click "Get Metadata" to generate AI-powered categories and descriptions
5. **Filtering**: Select category buttons to filter images by AI-generated classifications
6. **Image Interaction**: Click any image to open lightbox with commenting functionality

### Gallery Modes Explained

#### Grid Mode (Default)
- **Layout**: Responsive grid displaying 20 images per page (2 API pages combined)
- **Interaction**: Hover to reveal metadata overlay with category and author information
- **Social Features**: Like and comment counts visible on hover
- **Navigation**: Pagination controls navigate between grid pages

#### Carousel Mode  
- **Layout**: 3D rotating carousel displaying 10 images per page (1 API page)
- **Interaction**: Click Previous/Next arrows to rotate through images in 3D space
- **Visual Effects**: Images positioned in circular 3D arrangement with smooth transitions
- **Navigation**: Each pagination page represents one API page in carousel view

### AI-Powered Features

#### Metadata Generation Process
1. Click **"Get Metadata"** button in navigation menu
2. **Real-time Timer** shows processing duration
3. **Batch Processing**: AI analyzes all loaded images simultaneously
4. **Structured Output**: Generates category, description, and author for each image
5. **Dynamic Categories**: New filter buttons appear based on AI classifications

#### Smart Category System
- **"All"**: View all loaded images without filtering
- **"Uncategorised"**: Images that haven't been processed by AI yet
- **Dynamic Categories**: AI-generated categories like "Nature", "Architecture", "People", etc.
- **Intelligent Pagination**: Category filtering maintains proper page calculations

### Interactive Features

#### Lightbox Experience
- **Full-Screen Viewing**: Click any image to open in lightbox overlay
- **Live Commenting**: Add comments with your name in real-time
- **Comment History**: View existing comments from API data
- **Easy Navigation**: Press Escape key or click X to close

#### Theme & Accessibility  
- **Light/Dark Toggle**: Animated switch in navigation menu
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Navigation**: Support for Escape key interactions
- **Screen Reader Friendly**: Semantic HTML structure with proper ARIA labels

## API Integration

### External Image Feed API
- **Base URL**: `https://image-feed-api.vercel.app/api/images`
- **Structure**: RESTful API with page-based pagination (10 images per page)
- **Features**: 
  - Image metadata with URLs, IDs, and social stats
  - Comment threads for each image
  - Like/unlike endpoints with POST/DELETE methods
  - Total page count for pagination calculations
- **Error Handling**: Comprehensive try-catch blocks with user feedback
- **Caching**: Page-level caching prevents duplicate API calls

### Google Gemini 2.5 Pro AI Integration
- **Model**: `gemini-2.5-pro` with advanced vision capabilities
- **Processing Approach**: 
  - **Batch Processing**: Analyzes multiple images simultaneously for efficiency
  - **Page-Based Organization**: Maintains API page structure in AI responses
  - **Image Processing**: Converts images to Base64 for AI analysis
- **AI Configuration**:
  ```javascript
  {
    thinkingConfig: { thinkingBudget: -1 }, // Unlimited thinking time
    responseMimeType: "application/json",
    responseSchema: { /* Structured JSON schema */ }
  }
  ```
- **Output Format**: Structured JSON with:
  - `category`: Single descriptive category per image
  - `description`: Detailed scene analysis
  - `authorName`: Realistic full name attribution
- **Performance**: Real-time processing timer and loading animations

## State Management

### Centralized State Management
```javascript
export const state = {
  imagesData: [],           // Array of page objects with image data
  totalAmountOfPages: 0,    // Total pages available from API
  galleryType: "grid",      // Current view: "grid" or "carousel"
  currentPage: 1,           // Active pagination page
  loadedPages: [],          // Cache of loaded page numbers
  activeCategory: "All",    // Current category filter
  imagesByCategory: []      // Filtered images for category view
}
```

**State Features:**
- **Cross-Module Sharing**: Exported state object accessible by all modules
- **Page-Based Structure**: Images organized by API page for efficient management
- **Smart Caching**: Prevents duplicate API requests for already loaded pages
- **Category Management**: Separate array for filtered image display
- **Gallery Mode Persistence**: Maintains view state during navigation

## File Structure

```
📁 Project Structure
├── 📄 index.html                    # Main HTML document with semantic structure
├── 📄 package.json                  # Dependencies and build scripts
├── 📄 .gitignore                    # Git exclusion rules (includes .env)
├── 📄 README.md                     # Project documentation
└── 📁 src/
    ├── 📄 main.js                   # 🎯 Core state management & DOM coordination
    ├── 📄 api.js                    # 🌐  External image API integration
    ├── 📄 pagination.js             # 📄 Dual-mode pagination system  
    ├── 📄 gemini-api.js             # 🤖 Google Gemini AI integration
    ├── 📄 image-categories.js       # 🏷️ Dynamic category filtering
    ├── 📄 header-functionality.js   # 🎚️ Navigation & theme controls
    ├── 📄 lightbox.js               # 🖼️ Modal image viewer
    ├── 📄 grid-carousel.js          # 🎠 3D carousel implementation
    ├── 📄 likes-function.js         # ❤️ Social interaction system
    └── 📄 style.css                 # 🎨 Comprehensive CSS styling
```

## Performance & Optimization

### Loading Performance
- **Lazy AI Loading**: Google Gemini SDK loaded dynamically only when needed
- **Smart Caching**: Page-level caching prevents redundant API requests  
- **Batch Processing**: AI processes multiple images simultaneously for efficiency
- **Skeleton Animations**: Custom loading skeletons with rotating gear icons
- **Progressive Enhancement**: Core functionality works without AI features

### Rendering Optimization  
- **Efficient DOM Manipulation**: Minimal reflows with targeted element updates
- **CSS Custom Properties**: Theme switching without style recalculation
- **Image Optimization**: Object-fit cover for consistent aspect ratios
- **3D Transforms**: Hardware-accelerated carousel animations
- **Memory Management**: Proper event listener cleanup and state reset

### User Experience
- **Instant Feedback**: Real-time timers during AI processing
- **Smooth Transitions**: CSS transitions for all interactive elements
- **Error Boundaries**: Comprehensive error handling with user-friendly messages
- **Accessibility**: Keyboard navigation and semantic HTML structure

## Browser Compatibility

### Supported Browsers
- **Chrome** 80+ (recommended for optimal performance)
- **Firefox** 75+ 
- **Safari** 14+ (WebKit)
- **Edge** 80+ (Chromium-based)

### Required Features
- **ES6 Modules**: Import/export syntax support
- **CSS Custom Properties**: Theme switching functionality  
- **Fetch API**: HTTP requests (with fallback error handling)
- **CSS Grid & Flexbox**: Layout systems
- **CSS 3D Transforms**: Carousel animations

### Mobile Support
- **Responsive Design**: Mobile-first CSS approach
- **Touch Events**: Carousel and navigation optimized for touch
- **Viewport Meta**: Proper mobile scaling
- **Hamburger Menu**: Collapsible navigation for small screens

## Technical Implementation

### Architecture Highlights
- **ES6 Modular Design**: Clean import/export structure with single responsibility modules
- **State Management**: Centralized state pattern with cross-module data sharing
- **Event-Driven**: DOM event listeners with proper cleanup and delegation
- **Async Operations**: Promise-based API calls with comprehensive error handling

### Advanced Features
- **3D CSS Transforms**: Hardware-accelerated carousel with perspective and rotation
- **AI Integration**: Vision-capable Large Language Model for image understanding
- **LocalStorage**: Persistent user preferences (theme, liked images)
- **Dynamic DOM**: Runtime element creation with SVG icon parsing
- **CSS Variables**: Theme-aware custom properties with smooth transitions

### Code Quality
- **JSDoc Documentation**: Comprehensive function documentation with @param and @returns
- **Error Boundaries**: Try-catch blocks with user-friendly error messages  
- **Input Validation**: Form validation for comments and email subscription
- **Security**: XSS prevention through safe DOM manipulation
- **Performance**: Debounced operations and efficient re-rendering strategies

### Accessibility & Standards
- **Semantic HTML**: Proper heading hierarchy and landmark elements
- **ARIA Labels**: Screen reader support for interactive elements
- **Keyboard Navigation**: Full keyboard accessibility (Escape, Tab navigation)
- **Color Contrast**: WCAG compliant color schemes in both themes
- **Mobile First**: Progressive enhancement from mobile to desktop

## Development Workflow

### Contributing Guidelines
1. **Fork** the repository and create a feature branch
2. **Follow** the established code patterns and JSDoc documentation style
3. **Test** all functionality across different browsers and devices
4. **Validate** AI integration with proper error handling
5. **Submit** a pull request with detailed description of changes

### Development Standards
- **Code Style**: Consistent ES6+ syntax with proper indentation
- **Documentation**: JSDoc comments for all functions with @param and @returns
- **Error Handling**: Try-catch blocks for all async operations
- **Performance**: Efficient DOM manipulation and minimal re-renders
- **Accessibility**: Maintain keyboard navigation and semantic structure

### Testing Checklist
- [ ] Grid and carousel modes switch correctly
- [ ] Pagination works in both gallery modes
- [ ] AI metadata generation processes without errors
- [ ] Category filtering updates pagination appropriately
- [ ] Lightbox opens/closes with proper keyboard support
- [ ] Theme switching persists across page reloads
- [ ] Mobile responsive design works on various screen sizes

## License

© 2025 DOMinators - All rights reserved

## Project Information

### Development Team - The DOMinators
- **[Emma Wikström](https://github.com/EmmaWikstrom)** - Frontend Developer & UI/UX Design
- **[Irem Stalbrand](https://github.com/iremstalbrand)** - Frontend Developer & Component Architecture  
- **[Vladislav Zhuravskii](https://github.com/Tratatemium)** - Lead Developer & AI Integration Specialist
- **[Raheel Shan](https://github.com/raheel1435)** - Frontend Developer & API Integration

### Technology Stack
- **Frontend Framework**: Vanilla JavaScript ES6+ with Vite build system
- **AI Integration**: Google Gemini 2.5 Pro Vision API
- **External API**: Custom image feed service hosted on Vercel
- **Styling**: Modern CSS with custom properties and CSS Grid/Flexbox
- **Build Tool**: Vite 7.1.7 with hot module replacement
- **Version Control**: Git with GitHub repository hosting

### Third-Party Resources
- **Fonts**: Google Fonts (Roboto & Playfair Display)
- **Icons**: Custom SVG icons and community SVG resources
- **Image Source**: External image feed API with curated content
- **AI Model**: Google Gemini 2.5 Pro with vision capabilities

### Academic Context
This project was developed as part of **The Fundamentals** bootcamp program at **Hyper Island**, showcasing modern web development practices, AI integration, and collaborative development workflows.
