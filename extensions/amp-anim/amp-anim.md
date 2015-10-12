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

### <a name="amp-anim"></a> `amp-anim`

A runtime-managed animated image - most typically a GIF.

#### Behavior

The `amp-anim` component is very similar to the `amp-image` element, and provides additional functionality to manage loading and playing of animated images such as GIFs.

The `amp-anim` component can also have an optional placeholder child, to display while the `src` file is loading. The placeholder is specified via the `placeholder` attribute:
```html
<amp-anim width=400 height=300 src="my-gif.gif">
  <amp-img placeholder width=400 height=300 src="my-gif-screencap.jpg">
  </amp-img>
</amp-anim>
```
#### Attributes

**src**

Similar to the `src` attribute on the `img` tag. The value must be a URL that
points to a publicly-cacheable image file. Cache providers may rewrite these
URLs when ingesting AMP files to point to a cached version of the image.

**srcset**

Same as `srcset` attribute on the `img` tag.

**alt**

A string of alternate text, similar to the `alt` attribute on `img`.

**attribution**

A string that indicates the attribution of the image. E.g. `attribution="CC courtesy of Cats on Flicker"`


#### Styling

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:
```css
amp-anim {
  background-color: grey;
}
```
