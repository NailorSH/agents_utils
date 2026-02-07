# SDK Initialization Reference

This document provides a comprehensive reference for initializing the `@tma.js/sdk-react` SDK.

## Full Init Function

```typescript
import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  mockTelegramEnv,
  type ThemeParams,
  retrieveLaunchParams,
  emitEvent,
  miniApp,
  backButton,
  swipeBehavior,
} from '@tma.js/sdk-react';

/**
 * Initializes the Telegram Mini App SDK and configures its dependencies.
 * 
 * @param options.debug - Enable debug logging
 * @param options.eruda - Enable Eruda console for mobile debugging
 * @param options.mockForMacOS - Apply macOS-specific fixes
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // Step 1: Set debug mode (must be before init)
  setDebug(options.debug);
  
  // Step 2: Initialize the SDK (REQUIRED)
  initSDK();

  // Step 3: Optional - Add Eruda for mobile debugging
  if (options.eruda && import.meta.env.DEV) {
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 100 });
    });
  }

  // Step 4: Apply macOS-specific fixes
  // Telegram for macOS has bugs with theme and safe area requests
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event.name === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) {
            tp = themeParams.state();
          } else {
            firstThemeSent = true;
            tp ||= retrieveLaunchParams().tgWebAppThemeParams;
          }
          return emitEvent('theme_changed', { theme_params: tp });
        }

        if (event.name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
        }

        next();
      },
    });
  }

  // Step 5: Mount commonly used components
  // Use ifAvailable to safely mount only if supported
  backButton.mount.ifAvailable();
  
  // Restore init data from storage (for persistence across refreshes)
  initData.restore();

  // Step 6: Configure swipe behavior
  if (swipeBehavior.isSupported()) {
    swipeBehavior.mount();
    swipeBehavior.disableVertical(); // Prevents swipe-to-close
  }

  // Step 7: Setup Mini App and theme
  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars(); // Binds --tg-theme-* CSS variables
  }

  // Step 8: Configure viewport
  if (viewport.mount.isAvailable()) {
    viewport.mount().then(() => {
      viewport.bindCssVars();      // Binds --tg-viewport-* CSS variables
      viewport.requestFullscreen(); // Request fullscreen mode
    });
  }
}
```

## Entry Point (main.tsx)

```typescript
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { init } from './init';
import App from "./App";
import { EnvUnsupported } from "./components/EnvUnsupported";

// Import mock environment BEFORE anything else
import './mockEnv';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  // Get launch parameters from Telegram
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  
  // Enable debug mode if:
  // 1. Start param contains 'debug'
  // 2. Running in development mode
  const debug = (launchParams.tgWebAppStartParam || '').includes('debug')
    || import.meta.env.DEV;

  // Initialize SDK and render app
  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  }).then(() => {
    root.render(
      <StrictMode>
        <App/>
      </StrictMode>,
    );
  });
} catch (e) {
  // If initialization fails (not in Telegram), show fallback
  root.render(<EnvUnsupported/>);
}
```

## Initialization Order

The initialization must follow this order:

1. **Import mock environment** - Before any SDK usage
2. **setDebug()** - Enable/disable debug logging
3. **init()** - Initialize SDK global dependencies
4. **mount components** - Mount components you'll use
5. **bind CSS vars** - Connect theme/viewport to CSS

## What Each Step Does

### `setDebug(true/false)`
Enables or disables debug logging to console. Useful for development.

### `initSDK()`
Configures global SDK dependencies. **Required before using any features.**

### `backButton.mount()`
Retrieves actual back button state from Telegram client. Required before using `backButton.show()`, `backButton.hide()`, etc.

### `initData.restore()`
Restores init data from session storage. Useful when the app is refreshed; init data would otherwise be lost from the URL hash.

### `swipeBehavior.disableVertical()`
Disables vertical swipe gesture that would close the app. Useful for apps with scrollable content or swipe gestures.

### `themeParams.mount()` + `bindCssVars()`
Gets theme colors from Telegram and creates CSS custom properties for them.

### `viewport.mount()` + `bindCssVars()`
Gets viewport dimensions and safe areas, then creates CSS custom properties.

### `viewport.requestFullscreen()`
Requests fullscreen mode for the Mini App.

## Available Mount Methods

| Component | Mount Method | CSS Binding |
|-----------|--------------|-------------|
| `backButton` | `backButton.mount()` | N/A |
| `mainButton` | `mainButton.mount()` | N/A |
| `themeParams` | `themeParams.mount()` | `themeParams.bindCssVars()` |
| `viewport` | `viewport.mount()` | `viewport.bindCssVars()` |
| `miniApp` | `miniApp.mount()` | N/A |
| `swipeBehavior` | `swipeBehavior.mount()` | N/A |
| `settingsButton` | `settingsButton.mount()` | N/A |

## Safe Mounting Pattern

Always use `ifAvailable` for safety:

```typescript
// Mounts only if the method is available
backButton.mount.ifAvailable();

// Or check explicitly
if (backButton.mount.isAvailable()) {
  backButton.mount();
}
```
