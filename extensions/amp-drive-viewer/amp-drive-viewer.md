<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-drive-viewer"></a> `amp-drive-viewer`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a document file supported by Google Drive.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-drive-viewer" src="https://cdn.ampproject.org/v0/amp-drive-viewer-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <!-- TODO(cvializ): Make examples -->
</table>

[TOC]

## Behavior

The `amp-drive-viewer` component displays document files like Word documents,
Excel spreadsheets, and PDFs.

Example:
```html
<amp-drive-viewer
    src="https://www.example.com/document.pdf"
    width="800"
    height="600"
    layout="responsive">
</amp-drive-viewer>
```

## Attributes

##### src

The URL of the document.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-drive-viewer rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-drive-viewer/validator-amp-drive-viewer.protoascii) in the AMP validator specification.
