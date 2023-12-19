# AMP Shadow Doc API

## Overview

AMP can be used in a shadow-doc mode where a single web page can open many AMP
documents. This is especially useful for shell-style PWA documents.

## Using shadow doc API

The special runtime should be used in place of `v0.js`. It can be declared in the
shell page as following:

```html
<script async src="https://cdn.ampproject.org/shadow-v0.js"></script>

<!-- Wait for API to initialize -->
<script>
  (window.AMP = window.AMP || []).push(function (AMP) {
    // AMP APIs can be used now via "AMP" object.
  });
</script>
```

## API

### Fetching and attaching shadow docs

There are currently two ways how one can attach a shadow doc: using a `Document` object, loaded, for instance, via XHR. Or using an experimental streaming API. Once streaming API graduates from experimental, the non-streaming API will be deprecated.

Using the fully loaded `Document` object:

```javascript
fetchDocumentViaXhr(url).then((fetchedDoc) => {
  const shadowDoc = AMP.attachShadowDoc(hostElement, fetchedDoc, url, options);
});
```

Using the streaming API:

```javascript
const shadowDoc = AMP.attachShadowDocAsStream(hostElement, url, options);
fetch(url).then((response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  function readChunk() {
    return reader.read().then((chunk) => {
      const text = decoder.decode(chunk.value || new Uint8Array(), {
        stream: !chunk.done,
      });
      if (text) {
        shadowDoc.writer.write(text);
      }
      if (chunk.done) {
        shadowDoc.writer.close();
      } else {
        return readChunk();
      }
    });
  }
  return readChunk();
});
```

Notice, that XHR and Fetch API are only some of the sources of documents. Other sources could include local storage and other. AMP APIs assume a basic HTML streaming. The details of raw HTTP streaming are outside of AMP APIs, but examples below provide additional information and prototypes.

#### Visibility state (`visibilityState`)

The `options` argument is optional and can provide configuration parameters for AMP document. The most relevant of these options is `visibilityState`. By default it takes the value of "visible", but can be configured to "prerender" mode instead. Prerender mode can be used for minimal prerendering of the element. In this mode most of features are disabled, including analytics and ads. The mode can be later changed to "visible" via `shadowDoc.setVisibilityState()` function.

### Shadow-doc API

Both `AMP.attachShadowDoc` and `AMP.attachShadowDocAsStream` return a `ShadowDoc` object that provides numerous ways for interacting with attached AMP documents. This object exposes the following methods and properties:

-   `shadowDoc.writer` - the writer that can be used to stream the AMP document. Only available for `attachShadowDocAsStream`.
-   `shadowDoc.url` - the URL used in the `attachShadowDoc` or `attachShadowDocAsStream`.
-   `shadowDoc.title` - the title of the AMP document.
-   `shadowDoc.canonicalUrl` - the canonical URL of the AMP document.
-   `shadowDoc.ampdoc` - the instance of the AMP document.
-   `shadowDoc.ampdoc.whenReady()` - returns a promise when the AMP document has been fully rendered.
-   `shadowDoc.setVisibilityState()` - changes the visibility state of the AMP document.
-   `shadowDoc.postMessage()` and `shadowDoc.onMessage()` - can be used to message with the AMP document.
-   `shadowDoc.close()` - closes the AMP document, frees the resources, and returns a promise that resolves when cleanup is complete.
-   `shadowDoc.getState(expr)` - Get an `amp-bind` state from the AMP document using a JSON expression string, e.g. `foo.bar`
-   `shadowDoc.setState(state)` - Deep merge an object into the AMP document's global `amp-bind` state. `state` can be passed as either an `Object` or an expression string matching the syntax used by `amp-bind` in `on="AMP.setState()` attributes.

## Shadow DOM API and polyfills

AMP Shadow Docs rely heavily on the [Shadow DOM API](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM). This is a powerful and elegant API, part of the Web Components family. It allows for natural isolation between major parts of the page and, as such, is an ideal tool for PWAs and AMP Shadow Docs.

Shadow DOM is currently only implemented in Chrome and newer Safari. AMP Shadow Docs API internally polyfills the necessary parts of Shadow DOM.

However, not all advanced Shadow DOM features are polyfilled by AMP Shadow Docs. In particular, [shadow slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Slot) are not polyfilled. If you'd like to use slots and similar advanced features, please use one of the Shadow DOM polyfill, such as [WebComponents.js](https://github.com/webcomponents/webcomponentsjs). If you do, we recommend the following code structure (using Web Components polyfills as an example):

HTML:

```html
<script async src="https://cdn.ampproject.org/shadow-v0.js"></script>
<script
  async
  src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.0.3/webcomponents-sd-ce.js"
></script>
```

JavaScript:

```javascript
const ampReadyPromise = new Promise(resolve => {
  (window.AMP = window.AMP || []).push(resolve);
});
const sdReadyPromise = new Promise(resolve => {
  if (Element.prototype.attachShadow) {
    // Native available.
    resolve();
  } else {
    // Otherwise, wait for polyfill to be installed.
    window.addEventListener('WebComponentsReady', resolve);
  }
});
Promise.all([ampReadyPromise, sdReadyPromise]).then(() => {
  return AMP.attachShadowDocAsStream(...);
});
```

The working example can be found in [pwa.js sample](https://github.com/ampproject/amphtml/blob/f8b1e925c65ad29da288aab743b3c37da290e74e/examples/pwa/pwa.js#L216).

We tested with [WebComponents.js polyfill](https://github.com/webcomponents/webcomponentsjs), but this should work transparently with any other polyfill. Let us know if you run into difficulties with other polyfills.

## Examples and references

See [pwa.js](../../examples/pwa/pwa.js) for examples of uses of both APIs.

See [Combine AMP with PWA](https://amp.dev/documentation/guides-and-tutorials/learn/combine-amp-pwa) and [Embed & use AMP as a data source](https://amp.dev/documentation/guides-and-tutorials/integrate/amp-in-pwa) guides.
