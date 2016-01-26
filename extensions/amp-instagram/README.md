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

### <a name="amp-instagram"></a> `amp-instagram`

Displays an instagram embed.

Example:
```html
<amp-instagram
    data-shortcode="fBwFP"
    width="400"
    height="400"
    layout="responsive">
</amp-instagram>
```

The `width` and `height` attributes are special for the instagram embed.
These should be the actual width and height of the instagram image.
The system automatically adds space for the "chrome" that instagram adds around the image.

Many instagrams are square. When you set `layout="responsive"` any value where `width` and `height` are the same will work. If the instagram is not square you will need to enter the actual dimensions of the image.

When using non-responsive layout you will need to account for the extra space added for the "instagram chrome" around the image. This is currently 48px above and below the image and 8px on the sides.

#### Attributes

**data-shortcode**

The instagram data-shortcode found in every instagram photo URL.

E.g. in https://instagram.com/p/fBwFP fBwFP is the data-shortcode.
