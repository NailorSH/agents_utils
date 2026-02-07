# Environment Mocking Reference

This document explains how to mock the Telegram environment for local development.

## Why Mock?

When developing locally (outside Telegram), the SDK methods won't work because:
1. Launch parameters aren't available
2. Theme parameters aren't set
3. Telegram client methods aren't available
4. Init data isn't present

Mocking allows you to:
- Develop and test without deploying
- See the actual layout and styling
- Test different user scenarios

## Full Mock Environment

Create `mockEnv.ts` and import it in `main.tsx`:

```typescript
import { emitEvent, isTMA, mockTelegramEnv } from '@tma.js/sdk-react';

// Only mock in development mode
if (import.meta.env.DEV) {
  // Check if we're already inside Telegram
  if (!await isTMA('complete')) {
    
    // Define theme parameters (dark theme example)
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    } as const;
    
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    mockTelegramEnv({
      // Handle Telegram Mini Apps methods
      onEvent(e) {
        // Return theme when requested
        if (e.name === 'web_app_request_theme') {
          return emitEvent('theme_changed', { theme_params: themeParams });
        }
        
        // Return viewport when requested
        if (e.name === 'web_app_request_viewport') {
          return emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: true,
            is_state_stable: true,
          });
        }
        
        // Return safe areas when requested
        if (e.name === 'web_app_request_content_safe_area') {
          return emitEvent('content_safe_area_changed', noInsets);
        }
        if (e.name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', noInsets);
        }
      },
      
      // Define launch parameters
      launchParams: new URLSearchParams([
        ['tgWebAppThemeParams', JSON.stringify(themeParams)],
        ['tgWebAppData', new URLSearchParams([
          ['auth_date', (Date.now() / 1000 | 0).toString()],
          ['hash', 'mock-hash'],
          ['signature', 'mock-signature'],
          ['user', JSON.stringify({
            id: 12345678,
            first_name: 'Developer',
            last_name: 'Test',
            username: 'devtest',
            language_code: 'en',
          })],
        ]).toString()],
        ['tgWebAppVersion', '8.4'],
        ['tgWebAppPlatform', 'tdesktop'],
        // Optional: Add start param for deep link testing
        // ['tgWebAppStartParam', 'your-encoded-start-param'],
      ]),
    });

    console.info('⚠️ Running in mocked Telegram environment');
  }
}
```

## Light Theme Example

```typescript
const lightThemeParams = {
  accent_text_color: '#3390EC',
  bg_color: '#ffffff',
  button_color: '#3390EC',
  button_text_color: '#ffffff',
  destructive_text_color: '#FF3B30',
  header_bg_color: '#ffffff',
  hint_color: '#999999',
  link_color: '#3390EC',
  secondary_bg_color: '#F4F4F5',
  section_bg_color: '#ffffff',
  section_header_text_color: '#3390EC',
  subtitle_text_color: '#999999',
  text_color: '#000000',
};
```

## Mocking Different Platforms

Test different platforms by changing `tgWebAppPlatform`:

```typescript
// iOS
['tgWebAppPlatform', 'ios'],

// Android
['tgWebAppPlatform', 'android'],

// macOS
['tgWebAppPlatform', 'macos'],

// Desktop
['tgWebAppPlatform', 'tdesktop'],

// Web A
['tgWebAppPlatform', 'weba'],

// Web K
['tgWebAppPlatform', 'web'],
```

## Mocking Start Parameters (Deep Links)

Test deep linking by adding a start parameter:

```typescript
// Encode your parameters
const params = new URLSearchParams({
  route: '/booking/123',
  action: 'view',
});
const startParam = btoa(params.toString())
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

// Add to launch params
['tgWebAppStartParam', startParam],
```

## Mocking Real Init Data

For testing server-side validation, use real init data:

```typescript
// Copy from browser console when running in real Telegram:
// console.log(window.location.hash)

['tgWebAppData', 'user=%7B%22id%22%3A12345...actual-encoded-data'],
```

> **Warning:** Never commit real init data to version control!

## Production Safety

The mock is automatically excluded from production builds:

```typescript
// This entire block is tree-shaken in production
if (import.meta.env.DEV) {
  // Mock code here
}
```

## Handling More Events

You can mock any Telegram Mini Apps method:

```typescript
onEvent(e) {
  switch (e.name) {
    case 'web_app_request_theme':
      return emitEvent('theme_changed', { theme_params: themeParams });
    
    case 'web_app_request_viewport':
      return emitEvent('viewport_changed', {
        height: window.innerHeight,
        width: window.innerWidth,
        is_expanded: true,
        is_state_stable: true,
      });
    
    case 'web_app_setup_back_button':
      console.log('Back button:', e);
      break;
    
    case 'web_app_setup_main_button':
      console.log('Main button:', e);
      break;
    
    case 'web_app_close':
      console.log('App would close');
      break;
    
    case 'web_app_open_link':
      console.log('Opening link:', e);
      window.open(e.url, '_blank');
      break;
    
    default:
      console.log('Unhandled event:', e);
  }
}
```

## Simulating Mobile Safe Areas

For testing mobile layouts with notches:

```typescript
if (e.name === 'web_app_request_safe_area') {
  // Simulate iPhone notch
  return emitEvent('safe_area_changed', {
    left: 0,
    top: 47,  // Status bar + notch
    right: 0,
    bottom: 34, // Home indicator
  });
}

if (e.name === 'web_app_request_content_safe_area') {
  return emitEvent('content_safe_area_changed', {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });
}
```
