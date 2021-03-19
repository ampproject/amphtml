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

### Behavior

## Avoiding Layout shift

The `width` and `height` attributes determine the initial laid out height of the Tiktok embedded in the page.

However, we set the width of the Tiktok iframe player to be 325px wide. This results in a height of roughly 575px for the video player, however the full height of the player depends on the length and content of the Tiktok caption. (These values represent current behavior and subject to change).

In order to show the entire height of the video, this component will resize its height to include the full player height. Therefore in order to avoid layout shift it is best to match the `width` and `height` attributes to those values.

[example preview="inline" playground="true" imports="amp-tiktok"]

```html
<amp-tiktok width="325" height="731" data-src="6718335390845095173"></amp-tiktok>
```

[/example]

If you choose to set the width to a value which is greater than 325px, the `iframe` will remain 325px and will be horizontally centered in that space. The surrounding space will be empty.

If you choose to set the height of to a value which is which is greater than the height the height will remain the height of the `iframe`.

## Attributes

### `data-src`

The `data-src` attribute can contain one of two values: a **video id** or a **full URL** to a Tiktok detail page.

Example with video-id

[example preview="inline" playground="true" imports="amp-tiktok"]

```html
<amp-tiktok width="325" height="575" data-src="6718335390845095173"></amp-tiktok>
```

[\example]

Example with source url:

[example preview="inline" playground="true" imports="amp-tiktok"]

```html
<amp-tiktok
  width="325 "
  height="575"
  data-src="https://www.tiktok.com/@scout2015/video/6718335390845095173"
></amp-tiktok>
```

[\example]

In liu of the `data-src` attribute, `amp-tiktok` also allows the use of the TikTok generated embed code to display.

To use this method copy the blockquote from the TikTok Embed code:

1. Refer to the (TikTok embed documentation)[https://developers.tiktok.com/doc/Embed] to find the embed code for your TikTok.
2. Copy the embed code and add it as a child element of the `amp-tiktok` element.
3. Add the `placeholder` attribute to the `blockquote`.
4. Remove the `style` attribute from the `blockquote`.

[example preview="inline" playground="true" imports="amp-tiktok"]

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

[\example]

## Accessibility

If the user provides an `aria-label` then that label will be propogated to the `iframe`.
Otherwise the `aria-label` will default to 'TikTok'.

## Validation

See [amp-tiktok rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-tiktok/validator-amp-tiktok.protoascii) in the AMP validator specification.
