# Frames & Moments - AI-Powered Image Gallery

An image gallery application with AI-powered metadata generation, dual viewing modes, and advanced pagination system.

## Features

### Core Functionality
- **Dual Gallery Modes**: Grid view (2 API pages per view) and Carousel view (1 page per view)
- **AI Metadata Generation**: Google Gemini 2.5 Pro integration for automatic image categorization, descriptions, and author attribution
- **Advanced Pagination**: Seamless navigation with Previous/Next and numbered page controls
- **Category Filtering**: Dynamic filtering based on AI-generated categories
- **Loading Animations**: Skeleton placeholders and real-time processing feedback
- **Lightbox Display**: Full-screen image viewing with possibility to coment
- **Theme Switching**: Light/dark mode support with CSS custom properties
- **Responsive Design**: Mobile-first design with CSS Grid and Flexbox

### Interactive Elements
- **Social Media Style**: Heart and comment icons with engagement counts
- **Hover Effects**: Smooth animations revealing image metadata
- **Real-time Feedback**: Processing timers and animated loading indicators
- **Hamburger Navigation**: Collapsible menu with smooth transitions

## Architecture

### Modular structure
The application uses a modular architecture with clear separation of concerns:

- **main.js** - Central coordinator and state management
- **api.js** - External API integration with loading animations
- **pagination.js** - Advanced pagination with dual-mode gallery management
- **gemini-api.js** - AI metadata generation with Google Gemini 2.5 Pro
- **image-categories.js** - Category filtering and management
- **header-functionality.js** - Navigation and theme switching
- **lightbox.js** - Image popup functionality
- **grid-carousel.js** - Gallery mode switching
- **slider-banner-button.js** - UI component functionality

## Setup & Installation

### Prerequisites
- Node.js and npm installed
- Google AI API key (Gemini)

### Environment Variables
Create a `.env` file in the root directory:
```
VITE_GEMINI_API_KEY=your_google_ai_api_key_here
```

### Dependencies
```bash
npm install @google/genai mime
npm install -D @types/node
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Usage

### Basic Workflow
1. **Initial Load**: Application loads with first two pages of images
2. **Gallery Switching**: Use "Switch to carousel/grid" button to change view modes
3. **Navigation**: Use pagination controls to browse through image pages
4. **AI Processing**: Click "Get Metadata" to generate AI descriptions and categories
5. **Filtering**: Use category buttons to filter images by type
6. **Image Viewing**: Click images for lightbox view with full metadata

### Gallery Modes
- **Grid Mode**: Displays multiple images in a responsive grid layout
- **Carousel Mode**: Shows single images in a 3D carousel display

### AI Features
- **Category Classification**: Automatic image categorization
- **Descriptions**: Detailed AI-generated image descriptions
- **Author Attribution**: Random realistic author names for images
- **Processing Feedback**: Real-time timer and progress indicators

## API Integration

### External Image API
- **Source**: https://image-feed-api.vercel.app/
- **Structure**: Page-based with 10 images per page
- **Features**: Pagination, social stats (likes, comments)

### Google Gemini AI
- **Model**: Gemini 2.5 Pro with vision capabilities
- **Processing**: Batch processing with page-based organization
- **Output**: Structured JSON with category, description, and authorName
- **Configuration**: Unlimited thinking budget for optimal quality

## State Management

### Centralized State
```javascript
{
  imagesData: [],           // Page-structured image data
  totalAmountOfPages: 0,    // Total API pages available
  galleryType: "grid",      // Current display mode
  currentPage: 1,           // Active page number
  loadedPages: [],          // Cached pages to prevent duplicates
  activeCategory: "All"     // Current category filter
}
```

## File Structure

```
src/
├── main.js                 # Core application and state management
├── pagination.js           # Pagination system and gallery management
├── gemini-api.js          # AI metadata generation
├── api.js                 # External API integration
├── image-categories.js    # Category filtering system
├── header-functionality.js # Navigation and theme switching
├── lightbox.js            # Image popup functionality
├── grid-carousel.js       # Gallery mode switching
├── slider-banner-button.js # UI components
└── style.css              # Comprehensive styling
```

## Performance Features

- **Dynamic Loading**: AI SDK loaded only when needed
- **Efficient DOM**: Minimal reflows with optimized rendering
- **Page Caching**: Prevents duplicate API calls
- **Skeleton Loading**: Smooth loading transitions
- **Memory Management**: Proper cleanup and state reset

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile responsive design
- Touch and keyboard navigation support

## Technical Highlights

- **Modular Architecture**: Clean separation of concerns
- **Performance Optimized**: Efficient DOM manipulation and state management
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: ARIA labels and keyboard navigation
- **SEO Friendly**: Semantic HTML structure
- **Security**: Input validation and XSS prevention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2025 Group 4 - All rights reserved

## Credits

- **Development Team**: Group 4 - Emma Wikström, Irem Stalbrand, Vladislav Zhuravskii, Raheel Shan
- **AI Integration**: Google Gemini 2.5 Pro
- **Image API**: External image feed service
- **Icons**: SVG Repo community icons
- **Fonts**: Google Fonts (Roboto, Playfair Display)