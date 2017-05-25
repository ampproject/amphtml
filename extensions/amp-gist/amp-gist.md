<!--
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

# <a name="`amp-gist`"></a> `amp-gist`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a <a href="https://gist.github.com/">GitHub Gist</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code><script async custom-element="amp-gist" src="https://cdn.ampproject.org/v0/amp-gist-0.1.js"></script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed-height</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-gist/">Annotated code example for amp-gist</a></td>
  </tr>
</table>

## Examples

### Multiple files

```html
<amp-gist
    data-gistid="b9bb35bc68df68259af94430f012425f"
    layout="fixed-height"
    height="225">
</amp-gist>
```

### Single file

```html
<amp-gist
    data-gistid="a19e811dcd7df10c4da0931641538497"
    data-file="hi.c"
    layout="fixed-height"
    height="185">
</amp-gist>
```

## Behavior

This extension creates an iframe and displays the gist from GitHub. **You must find the 
height of the gist by inspecting it with your browser** (e.g. Chrome Developer Tools).

## Attributes

These are the valid attributes for the `amp-gist` component:

**data-gistid** (required)
The ID of the gist to embed.

**layout** (required)
Currently only supports `fixed-height`

**height** (required)
The height of the gist or gist file in pixels.

**data-file** (optional)
`data-file` is used for displaying only one file in a gist.

## Validation
See [amp-gist rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-gist/0.1/validator-amp-gist.protoascii) in the AMP validator specification.
