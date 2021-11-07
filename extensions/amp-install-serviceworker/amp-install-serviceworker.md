---
$category@: dynamic-content
formats:
  - websites
  - stories
teaser:
  text: Installs a ServiceWorker for the current page.
---

# amp-install-serviceworker

## Usage

Registers the service worker given by the `src` attribute if the AMP document is
loaded from the same origin as the given service worker URL. If the
`data-iframe-src` is set, loads that URL as an iframe when the AMP document is
served from an AMP cache. This allows ServiceWorker installation from the AMP
cache, so that the service worker is installed by the time users visit the
origin site.

This service worker runs whenever the AMP file is served from the origin where
you publish the AMP file. On documents served from an AMP cache, the service
worker will be installed in the background but will not execute or affect the
page's behavior.

See [this article](https://medium.com/@cramforce/amps-and-websites-in-the-age-of-the-service-worker-8369841dc962)
for how ServiceWorkers can help with making the AMP experience awesome with
ServiceWorkers.

```html
<amp-install-serviceworker
  src="https://www.your-domain.com/serviceworker.js"
  data-iframe-src="https://www.your-domain.com/install-serviceworker.html"
  layout="nodisplay"
>
</amp-install-serviceworker>
```

### Shell URL rewrite<a name="shell-url-rewrite"></a>

When service workers are not available or not yet active, it's possible to
configure URL rewrite to direct navigations to the shell. This way, for example,
AMP Runtime can redirect navigation to the "shell" instead of a "leaf" AMP
document.

This fallback is only used when the document is opened on the source origin, and
NOT on proxy origin.

The URL rewrite is configured using `data-no-service-worker-fallback-url-match`
and `data-no-service-worker-fallback-shell-url` attributes as following:

```html
<amp-install-serviceworker
  layout="nodisplay"
  src="https://www.your-domain.com/serviceworker.js"
  data-no-service-worker-fallback-url-match=".*\.amp\.html"
  data-no-service-worker-fallback-shell-url="https://pub.com/shell"
>
</amp-install-serviceworker>
```

Where:

-   `data-no-service-worker-fallback-shell-url` specifies the link for AMP+PWA
    shell. It's required to be on the source origin as the AMP document.
-   `data-no-service-worker-fallback-url-match` is a JavaScript regular expression
    that describes how to match "in-shell" links vs non-in-shell links.
-   Both of these attributes must be present to trigger URL rewrite.

URL rewrite works as following:

1. The document provides a configuration that explains how to navigate within
   the shell.
1. AMP Runtime tries to install the service worker.
1. If service worker is not installed (not installable), as a fallback AMP
   Runtime will preload the shell page via a hidden iframe.
1. AMP Runtime will intercept the "in-shell" navigations (which will often be
   AMP-to-AMP navigations) and if the service worker is not running, rewrite the
   navigation URL to proceed to the "shell"-based URL.
1. The shell will startup and run the requested navigation via its router.
   Typically the shell will immediately execute `history.replaceState(href)`.

A URL is rewritten in the form `shell-url#href={encodeURIComponent(href)}`. For
example:

```http
https://pub.com/doc.amp.html
-->
https://pub.com/shell#href=%2Fdoc.amp.html
```

Besides rewriting URLs, `amp-install-serviceworker` also will try to preload the
shell. This is done by creating an iframe with `#preload` fragment:

```html
<iframe
  src="https://pub.com/shell#preload"
  hidden
  sandbox="allow-scripts allow-same-origin"
></iframe>
```

For the preload to be effective, of course, the shell response must have
appropriate HTTP cache headers.

## Attributes

### `src` (required)

The URL of the ServiceWorker to register, which must use `https` protocol.

### `data-iframe-src`

The URL of an HTML document that installs a ServiceWorker. The URL must use `https` protocol. This attribute is necessary if the AMP page is going to be served from an AMP Cache.

### `data-scope`

The scope of the service worker to be installed.

### `layout`

Must have the value `nodisplay`.

### `data-no-service-worker-fallback-url-match`

The is a regular expression that matches URLs to be rewritten to navigate via
shell for no-service-worker fallback. See [Shell URL rewrite](#shell-url-rewrite)
section for more details. The value must be a valid JavaScript RegExp string.
For example:

<ul>
  <li><code>amp.html</code></li>
  <li><code>.*amp</code></li>
  <li><code>.*\.amp\.html</code></li>
  <li><code>.*\/amp$</code></li>
</ul>

### `data-no-service-worker-fallback-shell-url`

The URL to the shell to use to rewrite URL navigations for no-service-worker
fallback. See [Shell URL rewrite](#shell-url-rewrite) section for more details.
The value must be an URL on the same origin as the AMP document itself.

## Validation

See [amp-install-serviceworker rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-install-serviceworker/validator-amp-install-serviceworker.protoascii) in the AMP validator specification.
