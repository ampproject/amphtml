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

# amp-gist

Displays a <a href="https://gist.github.com/">GitHub Gist</a>.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-gist" src="https://cdn.ampproject.org/v0/amp-gist-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fixed-height</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-gist/">Annotated code example for amp-gist</a></td>
  </tr>
</table>

[TOC]

## Behavior

This extension creates an iframe and displays a [gist from GitHub](https://help.github.com/articles/about-gists/).

#### Example: Embedding multiple files

```html
<amp-gist
    data-gistid="b9bb35bc68df68259af94430f012425f"
    layout="fixed-height"
    height="225">
</amp-gist>
```

#### Example: Embedding a single file

```html
<amp-gist
    data-gistid="a19e811dcd7df10c4da0931641538497"
    data-file="hi.c"
    layout="fixed-height"
    height="185">
</amp-gist>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-gistid (required)</strong></td>
    <td>The ID of the gist to embed.</td>
  </tr>
  <tr>
    <td width="40%"><strong>layout (required)</strong></td>
    <td>Currently only supports <code>fixed-height</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>height (required)</strong></td>
    <td>The initial height of the gist or gist file in pixels.
<br><br>
<strong>Note</strong>: You should obtain the height of the gist by inspecting it with your browser (e.g., Chrome Developer Tools). Once the Gist loads the contained iframe will resize to fit so that its contents will fit.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-file (optional)</strong></td>
    <td>If specified, display only one file in a gist.</td>
  </tr>
</table>


## Validation
See [amp-gist rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-gist/validator-amp-gist.protoascii) in the AMP validator specification.
