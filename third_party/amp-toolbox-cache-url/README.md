# AMP-Toolbox Cache URL

Translates an URL from the origin to the AMP Cache URL format, according to the specification
available in the [AMP documentation](https://developers.google.com/amp/cache/overview). This includes the SHA256 fallback URLs used by the AMP Cache on invalid human-readable cache urls.

## Usage

### Including the Module

#### ES Module (Browser)

```javascript
import ampToolboxCacheUrl from 'amp-toolbox-cache-url';
```

#### CommonJs (Node)

```javascript
const ampToolboxCacheUrl = require('amp-toolbox-cache-url');
```

#### UMD (Node, Browser)

In the browser, include the UMD module in an HTML `<script>` tag. If using node, replace `window` with `global`.

```javascript
const ampToolboxCacheUrl = window.AmpToolboxCacheUrl;
```

### Using the module

```javascript
// Get an AMP Cache URL from a cache domain, and a canonical URL
ampToolboxCacheUrl
  .createCacheUrl('cdn.ampproject.org', 'https://www.example.com')
  .then((cacheUrl) => {
    // This would log:
    // 'https://www-example-com.cdn.ampproject.org/c/s/www.example.com/'
    console.log(cacheUrl);
  });

// Transform a canonical URL to an AMP Cache subdomain
ampToolboxCacheUrl
  .createCurlsSubdomain('https://www.example.com')
  .then((curlsSubdomain) => {
    // This would log:
    // 'www-example-com'
    console.log(curlsSubdomain);
  });
```
