---
$category@: social
formats:
  - websites
teaser:
  text: Displays a TikTok video embed.
experimental: true
---

# amp-tiktok

## Usage

The `amp-tiktok` component embeds a [TikTok](https://www.tiktok.com/about) video on your page.

```html
<amp-tiktok
  width="325"
  height="575"
  data-src="6718335390845095173"
></amp-tiktok>
```

### Behavior

The `amp-tiktok` component displays the TikTok video in an iframe. You may specify the `width`, `height` and `data-src` attributes. `amp-tiktok` does not support autoplay and requires user interaction to play videos.

## Avoiding Layout shift

Prevent layout shift by matching the `width` and `height` attributes on the `amp-tiktok` element to the size of the video player.

By default, the width of the `amp-tiktok` iframe is 325px, resulting in a hight of roughly 575px. The default height of the embedded TikTok video player depends on the length and content of the TikTok caption. To show the entire video, the `amp-tiktok` component resizes to match the player height. You can avoid this by defining the width and height to match the video player.

[example preview="inline" playground="true" imports="amp-tiktok"]

```html
<amp-tiktok
  width="325"
  height="731"
  data-src="6718335390845095173"
></amp-tiktok>
```

[/example]

If you choose to set the width to a value which is greater than 325px, the `iframe` will remain 325px and will be horizontally centered in that space. The surrounding space will be empty.

If you choose to set the height of to a value which is which is greater than the height the height will remain the height of the `iframe`.

## Placeholder

There are two ways to set a placeholder image:

-   Pointing the `data-src` attribute to the image URL
-   Pointing the TikTok provided `cite` attribute, made available through `blockquote`, to the image URL.

## Attributes

### `data-src`

The `data-src` attribute can contain one of two values: a **video id** or a **full URL** to a TikTok detail page.

Example with video-id

[example preview="inline" playground="true" imports="amp-tiktok"]

```html
<amp-tiktok
  width="325"
  height="575"
  data-src="6948210747285441798"
></amp-tiktok>
```

[/example]

Example with source url:

[example preview="inline" playground="true" imports="amp-tiktok"]

```html
<amp-tiktok
  width="325"
  height="575"
  data-src="https://www.tiktok.com/@scout2015/video/6948210747285441798"
></amp-tiktok>
```

[/example]

In lieu of the `data-src` attribute, `amp-tiktok` also allows the use of the TikTok generated embed code to display.

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
  cite="https://www.tiktok.com/@countingprimes/video/6948210747285441798"
  data-video-id="6948210747285441798"
>
  <section>
    <a
      target="_blank"
      title="@countingprimes"
      href="https://www.tiktok.com/@countingprimes"
      >@countingprimes</a
    >
    <p>
      VIM is great.... right up until you start typing the commands into every
      single text editor you see. I’d like to apologize for all my unneeded
      “:wq”’s
    </p>
    <a
      target="_blank"
      title="♬ original sound - countingprimes"
      href="https://www.tiktok.com/music/original-sound-6948210588145175302"
      >♬ original sound - countingprimes</a
    >
  </section>
</blockquote>
</amp-tiktok>
```

[/example]

## Accessibility

If the user provides an `aria-label` then that label will be propogated to the `iframe`.
If the user proides an oEmbed source URL as the `data-src` then the TikTok's caption will be used as the `aria-label` with the format 'Tiktok: "Caption"'. Otherwise the `aria-label` will default to 'TikTok'.
