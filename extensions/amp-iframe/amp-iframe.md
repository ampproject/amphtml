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

### <a name="amp-iframe"></a> `amp-iframe`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays an iframe.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
  </tr>
</table>

The following lists validation errors specific to the `amp-iframe` tag
(see also `amp-iframe` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii):

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">TAG_REQUIRED_BY_MISSING</a></td>
    <td>Error thrown when required <code>amp-iframe</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#mandatory-attribute-missing">MANDATORY_ONEOF_ATTR_MISSING</a></td>
    <td>Error thrown when neither <code>src</code> or <code>srcdoc</code> is included. One of these attributes is mandatory.</td>
  </tr>
    <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#missing-url">MISSING_URL</a></td>
    <td>Error thrown when <code>src</code> or <code>srcdoc</code> is missing it's URL.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#invalid-url">INVALID_URL</a></td>
    <td>Error thrown when <code>src</code> or <code>srcdoc</code> URL is invalid.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#invalid-url-protocol">INVALID_URL_PROTOCOL</a></td>
    <td>Error thrown <code>src</code> or <code>srcdoc</code> URL is <code>http</code>; <code>https</code> protocol required.</td>
  </tr>
    <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#invalid-attribute-value">INVALID_ATTR_VALUE</a></td>
    <td>Error thrown when <code>scrolling</code> attribute not <code>auto</code>, <code>yes</code>, or <code>no</code>. Error also thrown when <code>frameborder</code> not <code>0</code> or <code>1</code>. Attribute value must be <code>""</code> for <code>allowfullscreen</code>, <code>allowtransparency</code>, <code>resizable</code>.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">IMPLIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">SPECIFIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#invalid-property-value">INVALID_PROPERTY_VALUE_IN_ATTR_VALUE</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>

#### Behavior

`amp-iframe` has several important differences from vanilla iframes that are designed to make it more secure and avoid AMP files that are dominated by a single iframe:

- `amp-iframe` may not appear close to the top of the document (except for iframes that use `placeholder` as described below). They must be either 600px away from the top or not within the first 75% of the viewport when scrolled to the top – whichever is smaller. NOTE: We are currently looking for feedback as to how well this restriction works in practice.
- They are sandboxed by default. [Details](#sandbox)
- They must only request resources via HTTPS or from a data-URI or via the srcdoc attribute.
- They must not be in the same origin as the container unless they do not allow `allow-same-origin` in the sandbox attribute. See the doc ["Iframe origin policy"](../../spec/amp-iframe-origin-policy.md) for further details on allowed origins for iframes.

Example:
```html
<amp-iframe width=300 height=300
    sandbox="allow-scripts allow-same-origin"
    layout="responsive"
    frameborder="0"
    src="https://foo.com/iframe">
</amp-iframe>
```

#### Attributes

##### src, srcdoc, frameborder, allowfullscreen, allowtransparency

The attributes above should all behave like they do on standard iframes.

##### sandbox

Iframes created by `amp-iframe` always have the `sandbox` attribute defined on them. By default the value is empty. That means that they are "maximum sandboxed" by default. By setting sandbox values, one can opt the iframe into being less sandboxed. All values supported by browsers are allowed. E.g. setting `sandbox="allow-scripts"` allows the iframe to run JavaScript, or `sandbox="allow-scripts allow-same-origin"` allows the iframe to run JavaScript, make non-CORS XHRs, and read/write cookies.

If you are iframing a document that was not specifically created with sandboxing in mind, you will most likely need to add `allow-scripts allow-same-origin` to the `sandbox` attribute and you mights need to allow additional capabilities.

Note also, that the sandbox applies to all windows opened from a sandboxed iframe. This includes new windows created by a link with `target=_blank` (Add `allow-popups` to allow this to happen). Adding `allow-popups-to-escape-sandbox` to the `sandbox` attribute, makes those new windows behave like non-sandboxed new windows. This is likely most of the time what you want and expect. Unfortunately, as of this writing, `allow-popups-to-escape-sandbox` is only supported by Chrome.

See the [the docs on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) for further details on the sandbox attribute.

#### Iframe Resizing

An `amp-iframe` must have static layout defined as is the case with any other AMP element. However,
it's possible to resize an `amp-iframe` in runtime. To do so:

1. The `amp-iframe` must be defined with `resizable` attribute;
2. The `amp-iframe` must have `overflow` child element;
3. The IFrame document has to send a `embed-size` request as a window message.

Notice that `resizable` overrides `scrolling` value to `no`.

Example of `amp-iframe` with `overflow` element:
```html
<amp-iframe width=300 height=300
    layout="responsive"
    sandbox="allow-scripts allow-same-origin"
    resizable
    src="https://foo.com/iframe">
  <div overflow tabindex=0 role=button aria-label="Read more">Read more!</div>
</amp-iframe>
```

Example of Iframe resize request:
```javascript
window.parent.postMessage({
  sentinel: 'amp',
  type: 'embed-size',
  height: document.body.scrollHeight
}, '*');
```

Once this message is received the AMP runtime will try to accommodate this request as soon as
possible, but it will take into account where the reader is currently reading, whether the scrolling
is ongoing and any other UX or performance factors. If the runtime cannot satisfy the resize events
the `amp-iframe` will show an `overflow` element. Clicking on the `overflow` element will immediately
resize the `amp-iframe` since it's triggered by a user action.

Here are some factors that affect how fast the resize will be executed:

- Whether the resize is triggered by the user action;
- Whether the resize is requested for a currently active Iframe;
- Whether the resize is requested for an Iframe below the viewport or above the viewport.

#### Iframe with Placeholder
It is possible to have an `amp-iframe` appear on the top of a document when the `amp-iframe` has a `placeholder` element as shown in the example below.

```html
<amp-iframe width=300 height=300
   layout="responsive"
   sandbox="allow-scripts allow-same-origin"
   src="https://foo.com/iframe">
 <amp-img layout="fill" src="https://foo.com/foo.png" placeholder></amp-img>
</amp-iframe>
```
- The `amp-iframe` must contain an element with the `placeholder` attribute, (for instance an `amp-img` element) which would be rendered as a placeholder till the iframe is ready to be displayed.
- Iframe readiness can be known by listening to `onload` of the iframe or an `embed-ready` postMessage which would be sent by the Iframe document, whichever comes first.

Example of Iframe embed-ready request:
```javascript
window.parent.postMessage({
  sentinel: 'amp',
  type: 'embed-ready'
}, '*');
```

#### Iframe viewability

Iframes can send a  `send-intersection` message to its parent to start receiving IntersectionObserver style [change records](http://rawgit.com/slightlyoff/IntersectionObserver/master/index.html#intersectionobserverentry) of the iframe's intersection with the parent viewport.

Example of Iframe `send-intersection` request:
```javascript
window.parent.postMessage({
  sentinel: 'amp',
  type: 'send-intersection'
}, '*');
```

The Iframe can listen to an `intersection` message from the parent window to receive the intersection data.

Example of Iframe `send-intersection` request:
```javascript
window.addEventListener('message', function(event) {
  const listener = function(event) {
    if (event.source != window.parent ||
        event.origin != window.context.location.origin ||
        !event.data ||
        event.data.sentinel != 'amp' ||
        event.data.type != 'intersection') {
      return;
    }
    event.data.changes.forEach(function (change) {
      console.log(change);
    });
});
```

The intersection message would be sent by the parent to the iframe when the iframe moves in or out of the viewport (or is partially visibile), when the iframe is scrolled or resized.

#### Tracking/Analytics iframes

We strongly recommend using [`amp-analytics`](../amp-analytics/amp-analytics.md) for analytics purposes, because it is significantly more robust, complete and efficient solution and can be configured for a wide range of analytics vendors.

AMP only allows a single iframe, that is used for analytics and tracking purposes, per page. To conserve resources these iframes will be removed from the DOM 5 seconds after they loaded, which should be sufficient time to complete whatever work is needed to be done.

Iframes are identified as tracking/analytics iframes if they appear to serve no direct user purpose such as being invisible or small.
