# amp-iframe vs native iframe

## Background
amp-iframe has been an AMP component since ~2015. It serves as a wrapper around native iframes and enforces restrictions like its position in an AMP document to not degrade user experience. It also includes features like dynamic resizing. With the migration to Bento, we want to take a step back and assess if we need an amp-iframe component, given native iframes now support features like lazy loading.

## Do we need amp-iframe?
Yes. We cannot retire amp-iframe since there are several features that it includes that cannot be satisfied using native iframe. Some of these are discussed in detail below.

### AMP Cache
When an AMP document is viewed in the AMP viewer, the content is typically loaded from the AMP cache. We need to ensure that the content is not preloaded and cached, which is not possible with native iframes.

### Supporting Dynamic Resizing, Viewability and Consent Data
Currently, amp-iframe supports features like [dynamic resizing](https://amp.dev/documentation/components/amp-iframe/#iframe-resizing), [viewability](https://amp.dev/documentation/components/amp-iframe/#iframe-viewability) and [sending consent data](https://amp.dev/documentation/components/amp-iframe/#iframe-&-consent-data) with the parent frame by sending a `postMessage` to the parent window. These require including custom JS which is not trivial with native iframes.


### Cross browser support
Lazy loading using `loading="lazy"` attribute is currently only supported in Chromium based browsers (https://caniuse.com/loading-lazy-attr). Also the thresholds to lazy load resources may differ among browsers. Chrome, for example, takes into account connection type, whether Lite mode is enabled, etc. The differences between browser implementation may lead to inconsistent behavior if we choose to support native iframes with lazy loading.

