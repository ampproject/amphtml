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

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Installs a <a href="https://developers.google.com/web/fundamentals/primers/service-worker/">ServiceWorker</a> for the current page.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-install-serviceworker" src="https://cdn.ampproject.org/v0/amp-install-serviceworker-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-install-serviceworker/">Annotated code example for amp-install-serviceworker</a></td>
  </tr>
</table>

## Behavior

Registers the ServiceWorker given by the `src` attribute if the AMP document is loaded from the same origin as the given ServiceWorker URL. If the `data-iframe-src` is set, loads that URL as an iframe when the AMP document is served from an AMP cache. This allows ServiceWorker installation from the AMP cache, so that the ServiceWorker is installed by the time users visit the origin site.

This ServiceWorker runs whenever the AMP file is served from the origin where you publish the AMP file. The ServiceWorker will not be loaded when the document is loaded from an AMP cache.

See [this article](https://medium.com/@cramforce/amps-and-websites-in-the-age-of-the-service-worker-8369841dc962) for how ServiceWorkers can help with making the AMP experience awesome with ServiceWorkers.

Example:

```html
<amp-install-serviceworker
  src="https://www.your-domain.com/serviceworker.js"
  data-iframe-src="https://www.your-domain.com/install-serviceworker.html"
  layout="nodisplay">
</amp-install-serviceworker>
```

## Attributes

##### src (required)

The URL of the ServiceWorker to register, which must use `https` protocol.

##### data-iframe-src (optional)

The URL of an HTML document that installs a ServiceWorker. The URL must use `https` protocol.

##### layout

Must have the value `nodisplay`.

##### data-no-service-worker-fallback-url-match

The is a regular expression that matches URLs to be rewritten to navigate via shell for no-service-worker fallback. See [Shell URL rewrite](#shell-url-rewrite) section for more details. The value must be a valid JavaScript RegExp string. For example:
 - `amp.html`
 - `.*amp`
 - `.*\.amp\.html`
 - `.*\/amp$`

##### data-no-service-worker-fallback-shell-url

The URL to the shell to use to rewrite URL navigations for no-service-worker fallback. See [Shell URL rewrite](#shell-url-rewrite) section for more details. The value must be an URL on the same origin as the AMP document itself.

## Shell URL rewrite

When service workers are not available or not yet active, it's possible to configure URL rewrite to direct navigations to the shell. This way, for example, AMP Runtime can redirect navigation to the "shell" instead of
a "leaf" AMP document.

This fallback is only used when the document is opened on the source origin, and NOT on proxy origin.

The URL rewrite is configured using `data-no-service-worker-fallback-url-match` and `data-no-service-worker-fallback-shell-url`
attributes as following:

```html
<amp-install-serviceworker layout="nodisplay"
    src="https://www.your-domain.com/serviceworker.js"
    data-no-service-worker-fallback-url-match=".*\.amp\.html"
    data-no-service-worker-fallback-shell-url="https://pub.com/shell">
</amp-install-serviceworker>
```

Where:
 - `data-no-service-worker-fallback-shell-url` specifies the link for AMP+PWA shell. It's required to be on the source origin as the AMP document.
 - `data-no-service-worker-fallback-url-match` is a JavaScript regular expression that describes how to match “in-shell” links vs non-in-shell links.
 - Both of these attributes must be present to trigger URL rewrite.

URL rewrite works as following:
 1. The document provides a configuration that explains how to navigate within the shell.
 2. AMP Runtime tries to install the service worker.
 3. If service worker is not installed (not installable), as a fallback AMP Runtime will preload the shell page via a hidden iframe.
 4. AMP Runtime will intercept the “in-shell” navigations (which will often be AMP-to-AMP navigations) and if the service worker is not running, rewrite the navigation URL to proceed to the “shell”-based URL.
 5. The shell will startup and run the requested navigation via its router. Typically the shell will immediately execute history.replaceState(href).

A URL is rewritten in the form `shell-url#href={encodeURIComponent(href)}`. For example:
```text
https://pub.com/doc.amp.html
-->
https://pub.com/shell#href=%2Fdoc.amp.html
```

Besides rewriting URLs, `amp-install-serviceworker` also will try to preload the shell. This is done by creating an iframe with `#preload` fragment:

```html
<iframe src="https://pub.com/shell#preload" hidden sandbox="allow-scripts allow-same-origin"></iframe>
```

For the preload to be effective, of course, the shell response must have appropriate HTTP cache headers.

## Validation

See [amp-install-serviceworker rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-install-serviceworker/validator-amp-install-serviceworker.protoascii) in the AMP validator specification.
