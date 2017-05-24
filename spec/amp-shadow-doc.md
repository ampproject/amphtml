<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

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
(window.AMP = window.AMP || []).push(function(AMP) {
  // AMP APIs can be used now via "AMP" object.
});
</script>
```

## API

### Fetching and attaching shadow docs

There are currently two ways how one can attach a shadow doc: using a `Document` object, loaded, for instance, via XHR. Or using an experimental streaming API. Once streaming API graduates from experimental, the non-streaming API will be deprecated.

Using the fully loaded `Document` object:
```javascript
fetchDocumentViaXhr(url).then(fetchedDoc => {
  const shadowDoc = AMP.attachShadowDoc(hostElement, fetchedDoc, url, options);
});
```

Using the streaming API:
```javascript
const shadowDoc = AMP.attachShadowDocAsStream(hostElement, url, options);
fetch(url).then(response => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  function readChunk() {
    return reader.read().then(chunk => {
      const text = decoder.decode(
          chunk.value || new Uint8Array(),
          {stream: !chunk.done});
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
The `options` argument is optional and can provide configuration parameters for AMP document. The most relevant of these options is `visibilityState`. By default it takes the value of "visible", but can be configured to "prerender" mode instead. Prerender mode can be used for minimal prerendering of the element. In this mode most of features are disabled, including analytics and ads. The mode can be later changed to "visibile" via `shadowDoc.setVisibilityState()` function.


### Shadow-doc API

Both `AMP.attachShadowDoc` and `AMP.attachShadowDocAsStream` return a `ShadowDoc` object that provides numerous ways for interracting with attached AMP documents. This object exposes the following methods and properties:

- `shadowDoc.writer` - the writer that can be used to stream the AMP document. Only available for `attachShadowDocAsStream`.
- `shadowDoc.url` - the URL used in the `attachShadowDoc` or `attachShadowDocAsStream`.
- `shadowDoc.title` - the title of the AMP document.
- `shadowDoc.canonicalUrl` - the canonical URL of the AMP document.
- `shadowDoc.ampdoc` - the instance of the AMP document.
- `shadowDoc.ampdoc.whenReady()` - returns a promise when the AMP document has been fully rendered.
- `shadowDoc.setVisibilityState()` - changes the visibility state of the AMP document.
- `shadowDoc.postMessage()` and `shadowDoc.onMessage()` - can be used to message with the AMP document.
- `shadowDoc.close()` - closes the AMP document and frees the resources.


## Examples and references

See [pwa.js](../examples/pwa/pwa.js) for examples of uses of boths APIs.

See [Combine AMP with PWA](https://www.ampproject.org/docs/guides/pwa-amp) and [Embed & use AMP as a data source](https://www.ampproject.org/docs/guides/pwa-amp/amp-in-pwa) guides.

