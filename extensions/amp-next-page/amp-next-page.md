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

# <a name="amp-next-page"></a> `amp-next-page`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Dynamically loads more documents recommendended for the user.
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <code>
        &lt;script async custom-element="amp-next-page"
        src="https://cdn.ampproject.org/v0/amp-next-page-0.1.js">&lt;/script>
      </code>
    </td>
  </tr>
  <tr>
    <td class="col-fourty">
      <strong>
        <a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">
          Supported Layouts
        </a>
      </strong>
    </td>
    <td>N/A</td>
  </tr>
</table>

[TOC]

## Behavior

Given a list of pages, `amp-next-page` tries to load them after the current document, providing an infinite-scroll type experience.

The `<amp-next-page>` tag should be placed as the last child of the `<body>`.

The pages should be inlined using a JSON format.
```html
<amp-next-page>
  <script type="application/json">
    {
      "pages": ...
    }
  </script>
</amp-next-page>
```

## Attributes

N/A

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Configuration Spec

The configuration defines the documents recommended by `<amp-next-page>` to the user.

### Example Configuration

The following configuration will only recommend one more document for the user to read.

```json
{
  "pages": [
    {
      "image": "http://example.com/image1.jpg",
      "title": "This is one another article",
      "ampUrl": "http://example.com/article1.amp.html"      
    }
  ]
}
```

## Validation

See [amp-next-page rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-next-page/validator-amp-next-page.protoascii) in the AMP validator specification.
