# <a name="amp-ad"></a> `amp-ad`

NOTE: The specification of `amp-ad` is likely to significantly evolve over time. The current approach is designed to bootstrap the format to be able to show ads.

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

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A container to display an ad. AMP documents only support ads served via HTTPS.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-ad">amp-ad.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/ads.amp.html">ads.amp.html</a></td>
  </tr>
</table>

## Behavior

Ads are loaded like all other resources in AMP documents, with a special
custom element called `<amp-ad>`. No ad network provided JavaScript is allowed to run inside the AMP document. Instead the AMP runtime loads an iframe from a
different origin (via iframe sandbox) as the AMP document and executes the ad
network’s JS inside that iframe sandbox.

The `<amp-ad>` requires width and height values to be specified like all
resources in AMP. It requires a `type` argument that select what ad network is displayed. All `data-*` attributes on the tag are automatically passed as arguments to the code that eventually renders the ad. What `data-` attributes are required for a given type of network depends and must be documented with the ad network.

```html
<amp-ad width=300 height=250
    type="a9"
    data-aax_size="300x250"
    data-aax_pubname="test123"
    data-aax_src="302">
</amp-ad>
```
```html
<amp-ad width=320 height=140
    type="colombia"
    layout=responsive
    data-clmb_slot="129883"
    data-clmb_position="1"
    data-clmb_section="0">
</amp-ad>
```

## Supported ad networks

- [A9](../ads/a9.md)
- [Adblade](../ads/adblade.md)
- [Adform](../ads/adform.md)
- [Adman](../ads/adman.md)
- [AdReactor](../ads/adreactor.md)
- [AdSense](../ads/google/adsense.md)
- [AdStir](../ads/adstir.md)
- [AdTech](../ads/adtech.md)
- [Ad Up Technology](../ads/adup.md)
- [Colombia](../ads/colombia.md)
- [Criteo](../ads/criteo.md)
- [Dot and Media](../ads/dotandads.md)
- [Doubleclick](../ads/google/doubleclick.md)
- [Flite](../ads/flite.md)
- [GMOSSP](../ads/gmossp.md)
- [I-Mobile](../ads/imobile.md)
- [Improve Digital](../ads/improvedigital.md)
- [Industrybrains](../ads/industrybrains.md)
- [MediaImpact](../ads/mediaimpact.md)
- [OpenX](../ads/openx.md)
- [plista](../ads/plista.md)
- [PubMatic](../ads/pubmatic.md)
- [Revcontent](../ads/revcontent.md)
- [Rubicon Project](../ads/rubicon.md)
- [Smart AdServer](../ads/smartadserver.md)
- [Sortable](../ads/sortable.md)
- [TripleLift](../ads/triplelift.md)
- [Teads](../ads/teads.md)
- [Webediads](../ads/webediads.md)
- [Weborama](../ads/weborama.md)
- [Yieldbot](../ads/yieldbot.md)
- [Yieldmo](../ads/yieldmo.md)

## Styling

`<amp-ad>` elements may not themselves have or be placed in containers that have CSS `position: fixed` set (with the exception of `amp-lightbox`).
This is due to the UX implications of full page overlay ads. It may be considered to allow similar ad formats in the future inside of AMP controlled containers that maintain certain UX invariants.

## Attributes

### type

Identifier for the ad network. This selects the template that is used for the ad tag.

### src

Optional src value for a script tag loaded for this ad network. This can be used with ad networks that require exactly a single script tag to be inserted in the page. The src value must have a prefix that is whitelisted for this ad network.

### data-foo-bar

Most ad networks require further configuration. This can be passed to the network using HTML `data-` attributes. The parameter names are subject to standard data attribute dash to camel case conversion. E.g. "data-foo-bar" is send to the ad for configuration as "fooBar".

### json

Optional attribute to pass configuration to the ad as an arbitrarily complex JSON object. The object is passed to the ad as-is with no mangling done on the names.

### data-consent-notification-id

Optional attribute. If provided will require confirming the [amp-user-notification](../extensions/amp-user-notification/amp-user-notification.md) with the given HTML-id until the "AMP client id" for the user (similar to a cookie) is passed to the ad. The means ad rendering is delayed until the user confirmed the notification.

### Experimental: data-loading-strategy

Supported value: `prefer-viewability-over-views`. Instructs AMP to load ads in a way that prefers a high degree of viewability, while sometimes loading too late to generate a view.

## Placeholder

Optionally `amp-ad` supports a child element with the `placeholder` attribute. If supported by the ad network, this element is shown until the ad is available for viewing.
```html
<amp-ad width=300 height=250
    type="foo">
  <div placeholder>Have a great day!</div>
</amp-ad>
```

## No Ad available
- `amp-ad` supports a child element with the `fallback` attribute. If supported by the ad network, this element is shown if no ad is available for this slot.
```html
<amp-ad width=300 height=250
    type="foo">
  <div fallback>Have a great day!</div>
</amp-ad>
```

- If there is no fallback element available, the amp-ad tag will be collapsed (set to display: none) if the ad sends a message that the ad slot cannot be filled and AMP determines that this operation can be performed without affecting the user's scroll position.

## Running ads from a custom domain

AMP supports loading the bootstrap iframe that is used to load ads from a custom domain such as your own domain.

To enable this, copy the file [remote.html](../3p/remote.html) to your web server. Next up add the following meta tag to your AMP file(s):

```html
<meta name="amp-3p-iframe-src" content="https://assets.your-domain.com/path/to/remote.html">
```

The `content` attribute of the meta tag is the absolute URL to your copy of the remote.html file on your web server. This URL must use a "https" schema. It is not allowed to reside on the same origin as your AMP files. E.g. if you host AMP files on "www.example.com", this URL must not be on "www.example.com" but e.g. "something-else.example.com" is OK. See the doc ["Iframe origin policy"](../spec/amp-iframe-origin-policy.md) for further details on allowed origins for iframes.

### Security

**Validate incoming data** before passing it on to the `draw3p` function, to make sure your iframe only does things it expects to do. This is true, in particular, for ad networks that allow custom JavaScript injection.

Iframes should also enforce that they are only iframed into origins that they expect to be iframed into. The origins would be:

- your own origins
- https://cdn.ampproject.org for the AMP cache

In the case of the AMP cache you also need to check that the "source origin" (origin of the document served by cdn.ampproject.org) is one of your origins.

Enforcing origins can be done with the 3rd argument to `draw3p` and must additionally be done using the [allow-from](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options) directive for full browser support.

### Enhance incoming ad configuration

This is completely optional: It is sometimes desired to further process the incoming iframe configuration before drawing the ad using AMP's built-in system.

This is supported by passing a callback to the `draw3p` function call in the [remote.html](../3p/remote.html) file. The callback receives the incoming configuration as first argument and then receives another callback as second argument (Called `done` in the example below). This callback must be called with the updated config in order for ad rendering to proceed.

Example:

```JS
draw3p(function(config, done) {
  config.targeting = Math.random() > 0.5 ? 'sport' : 'fashion';
  // Don't actually call setTimeout here. This should only serve as an
  // example that is OK to call the done callback asynchronously.
  setTimeout(function() {
    done(config);
  }, 100)
}, ['allowed-ad-type'], ['your-domain.com']);
```
## Validation errors

The following lists validation errors specific to the `amp-ad` tag
(see also `amp-ad` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii)):

<table>
  <tr>
    <th class="col-fourty"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The mandatory attribute 'example1' is missing in tag 'example2'.</a></td>
    <td>Error thrown when <code>type</code> attribute missing.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#missing-url">Missing URL for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute is missing its URL.</td>
  </tr>
  <tr>
  <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url">Malformed URL 'example3' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>src</code> attribute's URL is invalid.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url-protocol">Invalid URL protocol 'example3:' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown <code>src</code> attribute's URL is <code>http</code>; <code>https</code> protocol required.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when implied set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when specified layout set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td class="col-fourty"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-property-value">The property 'example1' in attribute 'example2' in tag 'example3' is set to 'example4', which is invalid.</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>
