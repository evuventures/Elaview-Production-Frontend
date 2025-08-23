# Loading Animation Migration Guide

## Quick Reference

### Import the new component
```jsx
import { LoadingAnimation, PageLoader, ButtonLoader, InlineLoader } from '@/components/ui/LoadingAnimation';
```

## Common Replacements

### 1. Basic Spinner
**Old:**
```jsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
```

**New:**
```jsx
<LoadingAnimation size="md" variant="spinner" color="primary" />
```

### 2. Loader2 Icon from Lucide
**Old:**
```jsx
<Loader2 className="w-4 h-4 animate-spin" />
```

**New:**
```jsx
<LoadingAnimation size="sm" variant="loader2" />
```

### 3. Page Loading State
**Old:**
```jsx
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  <p>Loading...</p>
</div>
```

**New:**
```jsx
<PageLoader message="Loading..." />
```

### 4. Button Loading State
**Old:**
```jsx
<button>
  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
</button>
```

**New:**
```jsx
<button>
  {isLoading ? <ButtonLoader /> : 'Submit'}
</button>
```

### 5. Pulse Animation
**Old:**
```jsx
<div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
```

**New:**
```jsx
<LoadingAnimation size="xs" variant="pulse" color="secondary" />
```

### 6. Dots Loading
**Old:**
```jsx
<div className="flex space-x-1">
  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
</div>
```

**New:**
```jsx
<LoadingAnimation variant="dots" size="sm" />
```

## Configuration

The loading animations can be configured globally by modifying the `LOADING_CONFIG` object in `/frontend/src/components/ui/LoadingAnimation.jsx`:

```javascript
const LOADING_CONFIG = {
  defaultAnimation: 'spinner',  // Change default animation type
  colors: {
    primary: '#4668AB',        // Customize brand colors
    // Add more colors
  },
  speeds: {
    fast: 0.6,                 // Adjust animation speeds
    // Add more speeds
  },
  sizes: {
    md: { dimension: 32, strokeWidth: 3 }, // Customize sizes
    // Add more sizes
  }
};
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Size of the loader |
| variant | 'spinner' \| 'dots' \| 'pulse' \| 'bars' \| 'loader2' | 'spinner' | Animation type |
| color | 'primary' \| 'secondary' \| 'white' \| 'gray' | 'primary' | Color theme |
| speed | 'fast' \| 'normal' \| 'slow' | 'normal' | Animation speed |
| message | string | '' | Loading message |
| showMessage | boolean | true | Show/hide message |
| centered | boolean | false | Center in container |
| fullScreen | boolean | false | Full screen overlay |
| className | string | '' | Additional CSS classes |