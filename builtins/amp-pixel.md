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

# <a name="amp-pixel"></a> `amp-pixel`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>The <code>amp-pixel</code> element is meant to be used as a typical tracking pixel - to count page views.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, nodisplay</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/everything.amp.html">everything.amp.html</a></td>
  </tr>
</table>

## Behavior

The `amp-pixel` component behaves like a simple tracking pixel `img`. It takes a single URL, but provides variables that can be replaced by the component in the URL string when making the request. See the `src` attribute for more information.

## Attributes

**src** (required)
The value is the URL of a remote endpoint.

**referrerpolicy** (optional)
Similar as the `referrerpolicy` on `<img>`, however `no-referrer` is the only accepted value. If `referrerpolicy=no-referrer` is provided, the `referrer` header in the HTTP request will be removed.

A simple URL to send a GET request to when the tracking pixel is loaded.

## Substitutions

The `amp-pixel` allows all standard URL variable substitutions.
See [Substitutions Guide](../spec/amp-var-substitutions.md) for more info.

For instance:
```html
<amp-pixel src="https://foo.com/pixel?RANDOM"></amp-pixel>
```
may make a request to something like `https://foo.com/pixel?0.8390278471201` where the RANDOM value is randomly generated upon each impression.

## Styling

`amp-pixel` should not be styled.

## Validation

See [amp-pixel rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.
