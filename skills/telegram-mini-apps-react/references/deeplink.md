# Deep Linking Reference

This document explains how to implement deep linking in Telegram Mini Apps.

## How Deep Links Work

1. User opens a link like `https://t.me/your_bot/your_app?startapp=ENCODED_DATA`
2. Telegram opens your Mini App and passes `ENCODED_DATA` as `tgWebAppStartParam`
3. Your app reads the start param and navigates accordingly

## Start Parameter Constraints

- Must be 0-512 characters
- Only characters `A-Z`, `a-z`, `0-9`, `_`, and `-` are allowed
- Use base64url encoding for complex data

## Basic Implementation

```typescript
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { initData } from "@tma.js/sdk-react";

export function useDeeplink() {
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (processedRef.current) return;

    const startParam = initData.startParam();
    if (!startParam) return;

    processedRef.current = true;

    try {
      // Decode base64url to base64
      const base64 = startParam.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);

      // Parse as URL params
      if (decoded.includes('=')) {
        const params = new URLSearchParams(decoded);
        
        // Example: Extract route
        const route = params.get('route');
        if (route) {
          navigate(route, { 
            replace: true, 
            state: { fromDeeplink: true } 
          });
        }
      }
    } catch (e) {
      console.error("Failed to parse startParam:", e);
    }
  }, [navigate]);
}
```

## Usage in App

```typescript
// App.tsx
import { useDeeplink } from "@/hooks/useDeeplink";

function AppRoutes() {
  useDeeplink(); // Process deep link on mount

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking/:id" element={<BookingPage />} />
      {/* ... */}
    </Routes>
  );
}
```

## Encoding Deep Link Data

### Simple Route

```typescript
function createDeepLink(route: string): string {
  const params = new URLSearchParams({ route });
  const encoded = btoa(params.toString())
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Remove padding
  
  return `https://t.me/your_bot/your_app?startapp=${encoded}`;
}

// Usage
createDeepLink('/booking/123');
// Returns: https://t.me/your_bot/your_app?startapp=cm91dGU9JTJGYm9va2luZyUyRjEyMw
```

### With Multiple Parameters

```typescript
function createDeepLink(data: Record<string, string>): string {
  const params = new URLSearchParams(data);
  const encoded = btoa(params.toString())
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return `https://t.me/your_bot/your_app?startapp=${encoded}`;
}

// Usage
createDeepLink({
  route: '/slots',
  date: '2024-03-15',
  time: '14:00',
  sport: 'tennis',
});
```

### With UTM Tracking

```typescript
function createTrackedDeepLink(
  route: string,
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  }
): string {
  const params = new URLSearchParams({
    route,
    ...(utm.source && { utm_source: utm.source }),
    ...(utm.medium && { utm_medium: utm.medium }),
    ...(utm.campaign && { utm_campaign: utm.campaign }),
    ...(utm.content && { utm_content: utm.content }),
  });
  
  const encoded = btoa(params.toString())
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return `https://t.me/your_bot/your_app?startapp=${encoded}`;
}

// Usage
createTrackedDeepLink('/promo', {
  source: 'instagram',
  medium: 'story',
  campaign: 'summer_sale',
});
```

## Decoding with Analytics

```typescript
export function useDeeplink() {
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const startParam = initData.startParam();
    if (!startParam) return;

    processedRef.current = true;

    try {
      const base64 = startParam.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      const params = new URLSearchParams(decoded);

      // Track UTM parameters
      const utmSource = params.get('utm_source');
      const utmMedium = params.get('utm_medium');
      const utmCampaign = params.get('utm_campaign');
      const utmContent = params.get('utm_content');

      if (utmSource || utmMedium || utmCampaign) {
        analytics.track('deeplink_open', {
          source: utmSource,
          medium: utmMedium,
          campaign: utmCampaign,
          content: utmContent,
        });
      }

      // Navigate to route
      const route = params.get('route');
      if (route) {
        navigate(route, { 
          replace: true, 
          state: { fromDeeplink: true } 
        });
      }
    } catch (e) {
      console.error("Failed to parse startParam:", e);
    }
  }, [navigate]);
}
```

## Handling fromDeeplink State

Use the `fromDeeplink` state to modify back button behavior:

```typescript
// Page.tsx
useEffect(() => {
  if (back) {
    backButton.show();
    return backButton.onClick(() => {
      const isDeeplink = location.state?.fromDeeplink;
      const isFirstPage = !window.history.state || window.history.state.idx === 0;

      if (isDeeplink || isFirstPage) {
        miniApp.close(); // Close app if opened directly
      } else {
        navigate(-1); // Normal back navigation
      }
    });
  }
  backButton.hide();
}, [back, navigate, location]);
```

## Deep Link Examples

### Product Page

```
Link: https://t.me/shop_bot/shop?startapp=cHJvZHVjdF9pZD0xMjM0NQ

Decoded: product_id=12345

Handler:
const productId = params.get('product_id');
if (productId) {
  navigate(`/product/${productId}`, { state: { fromDeeplink: true } });
}
```

### Referral

```
Link: https://t.me/game_bot/game?startapp=cmVmPWFiYzEyMw

Decoded: ref=abc123

Handler:
const referralCode = params.get('ref');
if (referralCode) {
  localStorage.setItem('referral', referralCode);
  navigate('/', { state: { fromDeeplink: true, referral: referralCode } });
}
```

### Action Trigger

```
Link: https://t.me/app_bot/app?startapp=YWN0aW9uPXN1YnNjcmliZQ

Decoded: action=subscribe

Handler:
const action = params.get('action');
if (action === 'subscribe') {
  navigate('/subscribe', { state: { fromDeeplink: true } });
}
```

## Sharing Deep Links

Generate shareable links:

```typescript
import { shareURL } from '@tma.js/sdk-react';

function shareProduct(productId: string) {
  const deepLink = createDeepLink({ route: `/product/${productId}` });
  
  if (shareURL.isAvailable()) {
    shareURL(deepLink, 'Check out this product!');
  } else {
    navigator.clipboard.writeText(deepLink);
  }
}
```

## Testing Deep Links

1. **Encode test data:**
   ```javascript
   btoa('route=/test&param=value').replace(/\+/g, '-').replace(/\//g, '_')
   ```

2. **Add to mock environment:**
   ```typescript
   ['tgWebAppStartParam', 'cm91dGU9L3Rlc3QmcGFyYW09dmFsdWU'],
   ```

3. **Or open in test environment:**
   ```
   https://t.me/your_test_bot/your_app?startapp=cm91dGU9L3Rlc3QmcGFyYW09dmFsdWU
   ```
