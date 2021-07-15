# amp-iframe vs native iframe

## Background

amp-iframe has been an AMP component since ~2015. It was designed to make native iframes more secure while
enforcing restrictions like its position outside the top 75% or 600px in an AMP document to not degrade user experience. With the migration of amp-iframe to Bento, we want to assess if we retire amp-iframe component in favor of native iframes, which now support new features like lazy loading.

## So - can we retire amp-iframe?

No, we still need the amp-iframe component. There are several features that cannot be implemented using native iframes, like the ones discussed below.

### AMP Cache

Content is preloaded and cached by the AMP cache and displayed in the AMP viewer when an AMP document is requested. With native iframes, we cannot ensure that the content is not preloaded or cached.

### Supporting Dynamic Resizing, Viewability and Consent Data

Currently, amp-iframe supports features like [dynamic resizing](https://amp.dev/documentation/components/amp-iframe/#iframe-resizing), [viewability](https://amp.dev/documentation/components/amp-iframe/#iframe-viewability) and [sending consent data](https://amp.dev/documentation/components/amp-iframe/#iframe-&-consent-data) to the parent frame by sending a `postMessage` to the parent window. These require including custom JS which is not trivial with native iframes.

### Cross browser support

Lazy loading using `loading="lazy"` attribute is currently only supported in Chromium based browsers (https://caniuse.com/loading-lazy-attr). And the thresholds to lazy load resources may differ among browsers. Chrome, for example, takes into account connection type, whether Lite mode is enabled, etc. The differences between browser implementations may lead to inconsistent behavior if we choose to support native iframes with lazy loading.
