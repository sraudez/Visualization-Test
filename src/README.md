# React Project Structure

This project follows React best practices for folder organization:

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── index.js        # Component exports
│   ├── Map.js          # Main Map component
│   ├── MapContainer.js # Map container logic
│   ├── MarkerLayer.js  # Map markers
│   ├── LayerControls.js # UI controls
│   ├── GeoJsonLoader.js # Census tracts loader
│   └── HeatmapLayerWrapper.js # Heatmap component
├── pages/              # Top-level page components
│   └── App.js          # Main application page
├── utils/              # Utility functions and helpers
│   ├── index.js        # Utility exports
│   └── mapUtils.js     # Map-related utilities
├── hooks/              # Custom React hooks
│   └── index.js        # Hook exports
├── contexts/           # React Context API
│   └── index.js        # Context exports
├── assets/             # Static assets
│   ├── data/           # Data files
│   └── menu_icon.png   # Images
├── index.js            # Application entry point
└── README.md           # This file
```

## Organization Principles

### Components (`/components`)
- **Reusable UI components** that can be used across different parts of the application
- Each component should be self-contained with its own logic and styling
- Use index.js for clean imports

### Pages (`/pages`)
- **Top-level components** that represent entire pages or major sections
- App.js contains the main application logic and state management

### Utils (`/utils`)
- **Utility functions, helpers, and constants**
- mapUtils.js contains map-related functions like CSV parsing, coordinate detection, etc.
- Use index.js for clean exports

### Hooks (`/hooks`)
- **Custom React hooks** for reusable stateful logic
- Currently empty but ready for future custom hooks

### Contexts (`/contexts`)
- **React Context API** related files for global state management
- Currently empty but ready for future context providers

### Assets (`/assets`)
- **Static assets** like images, fonts, and data files
- Contains census tracts data and menu icons

## Import Patterns

### From components:
```javascript
import { Map, MapContainer } from '../components';
```

### From utils:
```javascript
import { parseCSV, detectCSVFormat } from '../utils';
```

### From pages:
```javascript
import App from '../pages/App';
```

## Benefits of This Structure

1. **Scalability**: Easy to add new components, pages, and utilities
2. **Maintainability**: Clear separation of concerns
3. **Reusability**: Components and utilities are easily importable
4. **Organization**: Logical grouping by function
5. **Best Practices**: Follows React community standards

## Future Considerations

- Add TypeScript for better type safety
- Implement custom hooks for data fetching
- Add React Context for global state management
- Consider adding a services/ directory for API calls
- Add tests/ directory for unit and integration tests
