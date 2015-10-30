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

Displays an iframe.

`amp-iframe` has several important differences from vanilla iframes that are designed to make it more secure and avoid AMP files that are dominated by a single iframe:

- `amp-iframe` may not appear close to the top of the document. They must be either 600px away from the top or not within the first 75% of the viewport when scrolled to the top – whichever is smaller. NOTE: We are currently looking for feedback as to how well this restriction works in practice.
- They are sandboxed by default. That means that authors needs to be explicit about what should be allowed in the iframe. See the [the docs on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) for details on the sandbox attribute.
- They must only request resources via HTTPS or from a data-URI or via the srcdoc attribute.
- They must not be in the same origin as the container unless they do not allow `allow-same-origin` in the sandbox attribute.

Example:
```html
<amp-iframe width=300 height=300
    sandbox="allow-scripts"
    layout="responsive"
    frameborder="0"
    src="https://foo.com/iframe">
</amp-iframe>
```

#### Attributes

**src, srcdoc, sandbox, frameborder, allowfullscreen, allowtransparency**

The attributes above should all behave like they do on standard iframes.


#### IFrame Resizing

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
    sandbox="allow-scripts"
    resizable
    src="https://foo.com/iframe">
  <div overflow tabindex=0 role=button aria-label="Read more">Read more!</div>
</amp-iframe>
```

Example of IFrame resize request:
```javascript
window.parent./*OK*/postMessage({
  sentinel: 'amp',
  type: 'embed-size',
  height: document.body./*OK*/scrollHeight
}, '*');
```

Once this message is received the AMP runtime will try to accommodate this request as soon as
possible, but it will take into account where the reader is currently reading, whether the scrolling
is ongoing and any other UX or performance factors. If the runtime cannot satisfy the resize events
the `amp-iframe` will show an `overflow` element. Clicking on the `overflow` element will immediately
resize the `amp-iframe` since it's triggered by a user action.

Here are some factors that affect how fast the resize will be executed:

- Whether the resize is triggered by the user action;
- Whether the resize is requested for a currently active IFrame;
- Whether the resize is requested for an IFrame below the viewport or above the viewport.
