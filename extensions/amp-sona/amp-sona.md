---
$category@: media
formats:
  - websites
teaser:
  text: Displays a Soundcloud clip.
---

<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# amp-sona



## Examples

The `width` and `height` from the example should yield correct layouts for 1:1 aspect ratio embeds:

```html
<amp-sona
  width="480"
  height="480"
  layout="fixed"
  data-client-id="4a2f2764-0ca3-11ea-bd94-0242ac130008"
  data-resource="image"
  data-variant="120x600">
</amp-sona>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-client-id</strong></td>
    <td>This attribute is required if <code>data-client-id</code> is not defined.<br />
The value for this attribute is the ID of a client, an string in the uuid format.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-resource</strong></td>
    <td>This attribute is required if <code>data-resource</code> is not defined.
The value for this attribute is the type of a resource, an string. Eg. "image" or "video"</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-variant</strong></td>
       <td>This attribute is required if <code>data-resource</code> is not defined.
    The value for this attribute is the type of a resource, an string. Eg. "image" or "video"</td>
  </tr>
</table>

## Validation

See [amp-sona rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-sona/validator-amp-sona.protoascii) in the AMP validator specification.
