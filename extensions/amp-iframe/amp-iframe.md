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

### <a name=”amp-iframe”></a> `amp-iframe`

Displays an iframe.

`amp-iframe` has several important differences from vanilla iframes that are designed to make it more secure and avoid AMP files that are dominated by a single iframe:

- `amp-iframe` may not appear close to the top of the document. They must be either 600px away from the top or not within the first 75% of the viewport when scrolled to the top – whichever is smaller. NOTE: We are currently looking for feedback as to how well this restriction works in practice.
- They are sandboxed by default. That means that authors needs to be explicit about what should be allowed in the iframe. See the [the docs on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) for details on the sandbox attribute.
- They must only request resources via HTTPS.
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

**src, sandbox, frameborder, allowfullscreen, allowtransparency**

The attributes above should all behave like they do on standard iframes.
