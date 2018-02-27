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

# <a name="amp-document-recommendations"></a> `amp-document-recommendations`

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
        &lt;script async custom-element="amp-document-recommendations"
        src="https://cdn.ampproject.org/v0/amp-document-recommendations-0.1.js">&lt;/script>
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

Given a list of recommended documents, `amp-document-recommendations` tries to load them after the current document, provding an infinite-scroll type experience.

The `<amp-document-recommendations>` tag should be placed as the last child of the `<body>`.

The recommendations should be inlined using a JSON format.
```html
<amp-document-recommendations>
  <script type="application/json">
    {
      "recos": ...
    }
  </script>
</amp-document-recommendations>
```

## Attributes

N/A

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Configuration Spec

The configuration defines the documents recommended by `<amp-document-recommendations>` to the user.

### Example Configuration

The following configuration will only recommend one more document for the user to read.

```json
{
  "recommendations": [
    {
      "image": "http://example.com/image1.jpg",
      "title": "This is one another article",
      "ampUrl": "http://example.com/article1.amp.html"      
    }
  ]
}
```

## Validation

See [amp-document-recommendations rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-document-recommendations/validator-amp-document-recommendations.protoascii) in the AMP validator specification.
