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

[TOC]

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Can be used as a typical tracking pixel to count pageviews.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, nodisplay</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-pixel/">amp-pixel example</a>.</td>
  </tr>
</table>

## Behavior

The `amp-pixel` component behaves like a simple tracking pixel `img`. It takes a single URL, but provides variables that can be replaced by the component in the URL string when making the request. See the [substitutions](#substitutions) section for further details.

In this basic example, the `amp-pixel` issues a simple GET request to the given URL and ignores the result.

```html
<amp-pixel src="https://foo.com/tracker/foo"
    layout="nodisplay"></amp-pixel>
```

## Attributes

##### src (required)

A simple URL to a remote endpoint that must be `https` protocol.

##### referrerpolicy (optional)

This attribute is similar to the `referrerpolicy` attribute on `<img>`, however `no-referrer` is the only accepted value. If `referrerpolicy=no-referrer` is specified, the `referrer` header is removed from the HTTP request.

```html
<amp-pixel src="https://foo.com/tracker/foo"
    layout="nodisplay"
    referrerpolicy="no-referrer"></amp-pixel>
```
##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Substitutions

The `amp-pixel` allows all standard URL variable substitutions.
See the [Substitutions Guide](../spec/amp-var-substitutions.md) for more information.

In the following example, a request might be made to something like `https://foo.com/pixel?0.8390278471201` where the RANDOM value is randomly generated upon each impression.

```html
<amp-pixel src="https://foo.com/pixel?RANDOM"
    layout="nodisplay"></amp-pixel>
```

## Styling

`amp-pixel` should not be styled.

## Validation

See [amp-pixel rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.
