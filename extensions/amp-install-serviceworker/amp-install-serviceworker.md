<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-install-serviceworker"></a> `amp-install-serviceworker`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Installs a <a href="https://developers.google.com/web/fundamentals/primers/service-worker/">ServiceWorker</a> for the current page.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-install-serviceworker" src="https://cdn.ampproject.org/v0/amp-install-serviceworker-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>None</td>
  </tr>
</table>

## Behavior

Registers the ServiceWorker given by the `src` attribute if the AMP document is loaded from the same origin as the given ServiceWorker URL. If the `data-iframe-src` is set, loads that URL as an iframe when the AMP document is served from an AMP cache. This allows ServiceWorker installation from the AMP cache, so that the ServiceWorker is installed by the time users visit the origin site.

This ServiceWorker runs whenever the AMP file is served from the origin where you publish the AMP file. The ServiceWorker will not be loaded when the document is loaded from an AMP cache.

See [this article](https://medium.com/@cramforce/amps-and-websites-in-the-age-of-the-service-worker-8369841dc962) for how ServiceWorkers can help with making the AMP experience awesome with ServiceWorkers.

Example

```html

  <amp-install-serviceworker
      src="https://www.your-domain.com/serviceworker.js"
      data-iframe-src="https://www.your-domain.com/install-serviceworker.html"
      layout="nodisplay">
  </amp-install-serviceworker>

```

## Attributes

### `src`

URL of the ServiceWorker to register.

### `data-iframe-src` (optional)

URL of a HTML document that install a ServiceWorker.

### `layout`

Must have the value `nodisplay`.

## Validation errors

The following lists validation errors specific to the `amp-install-serviceworker` tag
(see also `amp-install-serviceworker` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-install-serviceworker/0.1/validator-amp-install-serviceworker.protoascii)):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-install-serviceworker</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#missing-url">Missing URL for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute is missing its URL.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url">Malformed URL 'example3' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute's URL is invalid.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url-protocol">Invalid URL protocol 'example3:' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown <code>src</code> attribute's URL is <code>http</code>; <code>https</code> protocol required.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>The only supported layout type is <code>NODISPLAY</code>. Error thrown if implied layout is any other value.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>The only supported layout type is <code>NODISPLAY</code>. Error thrown if specified layout is any other value.</td>
  </tr>
</table>
