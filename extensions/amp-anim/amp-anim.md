---
$category@: media
formats:
  - websites
  - ads
  - email
teaser:
  text: Manages an animated image, typically a GIF.
---

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

# amp-anim

## Usage

The `amp-anim` component displays a GIF animation with optimized CPU management.

The `amp-anim` component lets the AMP framework reduce the resources it spends
on the animation when it's off-screen. Otherwise, the behavior of `amp-anim` is
identical to [`amp-img`](https://amp.dev/documentation/components/amp-img/). You
can implement a [placeholder](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/placeholders/)
element to further optimize `amp-anim`.

```html
<amp-anim width="400" height="300" src="my-gif.gif">
  <amp-img placeholder width="400" height="300" src="my-gif-screencap.jpg">
  </amp-img>
</amp-anim>
```

## Attributes

### `src`

Specifies the URL for a GIF image.

[filter formats="email"]
In an AMP email, the `src`must point to an absolute URL. Use of `amp-anim` in
email doesn't allow the following attributes:

- `srcset`
- `object-fit`
- `object-position`

[/filter]

[filter formats="websites, ads"]

### `srcset`

Specifies the image URL to use in different circumstances. Operates the same as
the [`srcset` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset)
on the `img` tag.

[/filter]

### `alt`

Provides a string of alternate text for accessibility purposes. Operates the
same as the [`alt` attribute](https://www.w3schools.com/tags/att_img_alt.asp) on
the `img` tag.

### `attribution`

Indicates the attribution of the image. For example, `attribution="CC courtesy of Cats on Flicker"`.

### `width` and `height`

Provides the explicit size of the image.

### Common attributes

`amp-anim` includes the
[common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Styling

You can directly style `amp-img` with CSS properties. The following example sets
a grey background placeholder:

```html
<style amp-custom>
      .amp-anim {
          background-color: grey;
       }
</amp style-custom>
```

## Validation

See [`amp-anim` rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-anim/validator-amp-anim.protoascii)
in the AMP validator specification.
