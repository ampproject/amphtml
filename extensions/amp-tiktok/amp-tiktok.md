---
$category@: social
formats:
  - websites
teaser:
  text: Displays a TikTok embed.  
experimental: true
---

<!--
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-tiktok

<!--
  If the component is relevant for more than one format and operates differently between these
  formats, include and filter multiple content blocks and code samples.
-->

## Usage

The simplest usage of the `amp-tiktok` component has the `width`, `height` and `data-src` attributes. This will display the Tiktok embed inside of an iframe on the page.

```html
 <amp-tiktok width="325" height="575" data-src="6718335390845095173">
```

`amp-tiktok` does not support autoplay and requires user interaction to play videos.

### Behavior users should be aware of (optional)

## Avoiding Layout shift

The `width` and `height` attributes determine the initial laid out height of the Tiktok embedded in the page.

However, the Tiktok player has a width of 325px and a height of 575px.
In order to show the entire height of the video, this component will resize its height to include the full player height. Therefore in order to avoid layout shift it is best to match the `width` and `height` attributes to those values.

```html
 <amp-tiktok width="325" height="575" data-src="6718335390845095173">
```

If you choose to set the width and height to values greater than those which are reccomended, the TikTok player will still remain at those dimensions, and the surrounding space will be empty.

## Attributes

### `width`

The `width` attribute represents the width of the `amp-tiktok` element.
However the `iframe` child element will be set to '325px'.

### `height`

The `height` refers to the size of the `amp-tiktok` element. However the Tiktok player is '575px' tall. If the `height` that is set is less than '575px' then the element will resize to fit that new height. This will cause layout shift.

In order to prevent layout shifting, the `height` should set to be at least '575px'.

### `data-src`

The `data-src` attribute can contain one of two values. Either it can contain the video-id or the full source url for the TikTok.

Example with video-id

```html
 <amp-tiktok width="325" height="575" data-src="6718335390845095173">
```

Example with source url:

```html
    <amp-tiktok
      width="325 "
      height="575"
      data-src="https://www.tiktok.com/@scout2015/video/6718335390845095173"
    >
```

In liu of the `data-src` attribute, `amp-tiktok` also allows the use of the TikTok generated embed code to display.

To use this method copy the blockquote from the TikTok Embed code:

1. Go to the desktop page of the TikTok you wish to embed
2. Click the embed link icon (`</>`)
3. Copy the embed code and add it as a child element of the `amp-tiktok` element.
4. Add the `placeholder` attribute to the `blockquote`.
5. Remove the `style` attribute from the `blockquote`.

```html
<amp-tiktok width="300" height="800">
      <blockquote
        placeholder
        class="tiktok-embed"
        cite="https://www.tiktok.com/@scout2015/video/6718335390845095173"
        data-video-id="6718335390845095173"
        style="max-width: 605px; min-width: 325px"
      >
        <section>
          <a
            target="_blank"
            title="@scout2015"
            href="https://www.tiktok.com/@scout2015"
            >@scout2015</a
          >
          <p>
            Scramble up ur name & I’ll try to guess it😍❤️
            <a
              title="foryoupage"
              target="_blank"
              href="https://www.tiktok.com/tag/foryoupage"
              >#foryoupage</a
            >
            <a
              title="petsoftiktok"
              target="_blank"
              href="https://www.tiktok.com/tag/petsoftiktok"
              >#petsoftiktok</a
            >
            <a
              title="aesthetic"
              target="_blank"
              href="https://www.tiktok.com/tag/aesthetic"
              >#aesthetic</a
            >
          </p>
          <a
            target="_blank"
            title="♬ original sound - tiff"
            href="https://www.tiktok.com/music/original-sound-6689804660171082501"
            >♬ original sound - tiff</a
          >
        </section>
      </blockquote>
    </amp-tiktok>
```

## Accessibility (optional)

The `aria-title` will be set to 'TikTok'.

## Validation

See [amp-tiktok rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-tiktok/validator-amp-tiktok.protoascii) in the AMP validator specification.

```

```
