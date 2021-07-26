# amp-iframe vs native iframe

## Background

amp-iframe has been an AMP component since ~2015. It was designed to make native iframes more secure and impove user experience by
enforcing restrictions on it's position outside the top 75% or 600px in an AMP document. With the migration of amp-iframe to Bento, we want to assess if we retire amp-iframe component in favor of native iframes, which now support features like lazy loading.

## So - can we retire amp-iframe?

No, we cannot retire amp-iframe. There are several features that are not supported by native iframes, like the ones discussed below.

### AMP Cache

Content is preloaded and cached by the AMP cache and displayed in the AMP viewer when an AMP document is requested. With native iframes, we cannot ensure that the content is not preloaded or cached.

### Dynamic Resizing Support

Currently, amp-iframe supports [dynamic resizing](https://amp.dev/documentation/components/amp-iframe/#iframe-resizing) i.e. updating the iframe height and/or width at runtime. This requires dispatching a postMessage from the iframe to the parent window that includes a payload with `type="embed-size"` and desired height as the `height` property. The parent window then requests the AMP runtime to accomodate the resize request when possible to reduce layout shift. Native iframes lack a standardized way to dynamically resize, especially in a manner that reduces layout shift.

### Consent Data Support

amp-iframe also supports requesting and receiving consent data from the parent window if a consent management platform (CMP) is present. This works by dispatching a `send-consent-data` postMessage and receiving a `consent-data` message from the parent, allowing amp-iframe to block components based on the user's consent. This behavior is not supported in any standardized way in native iframes.

### Cross browser support

Lazy loading using `loading="lazy"` attribute is currently only supported in Chromium based browsers (https://caniuse.com/loading-lazy-attr). We lose the lazy loading outside of Chromium based browsers without polyfills.

Additionally, if and when implemented, the thresholds to lazy load resources may differ among browsers. Chrome, for example, takes into account connection type, whether Lite mode (previously known as "Data Saver" it improves loading speed on slow network connections and is only avilable for Chrome on Android) is enabled, etc. The differences between browser implementations may lead to inconsistent behavior if we choose to support native iframes with lazy loading.
