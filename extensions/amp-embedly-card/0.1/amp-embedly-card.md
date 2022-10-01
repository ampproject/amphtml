---
$category@: media
formats:
  - websites
teaser:
  text: Displays an Embedly card.
---

# amp-embedly-card

## Usage

The `amp-embedly-card` component provides you with responsive and shareable embeds to drive the reach of your websites,
blog posts, and articles from any URL using [Embedly cards](http://docs.embed.ly/docs/cards).

Cards are the easiest way to leverage Embedly. For any media, cards provide a responsive embed with built-in embed analytics.

_Example: Embedding multiple resources_

If you have a paid plan, use the `amp-embedly-key` component to set your api key.
You just need one `amp-embedly-key` per AMP page.

```html
<amp-embedly-key value="12af2e3543ee432ca35ac30a4b4f656a" layout="nodisplay">
</amp-embedly-key>
```

If you are a paid user, setting the `amp-embedly-key` tag removes Embedly's branding from the cards.

Within your AMP page, you can include one or multiple `amp-embedly-card` components:

```html
<amp-embedly-card
  data-url="https://twitter.com/AMPhtml/status/986750295077040128"
  layout="responsive"
  width="150"
  height="80"
  data-card-theme="dark"
  data-card-controls="0"
>
</amp-embedly-card>

<amp-embedly-card
  data-url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
  layout="responsive"
  width="100"
  height="50"
>
</amp-embedly-card>
```

## Attributes

### `data-url`

The URL to retrieve embedding information.

### `data-card-embed`

The URL to a video or rich media. Use with static embeds like articles, instead
of using the static page content in the card, the card will embed the video or
rich media.

### `data-card-image`

The URL to an image. Specifies which image to use in article cards when
`data-url` points to an article. Not all image URLs are supported, if the image
is not loaded, try a different image or domain.

### `data-card-controls`

Enables share icons.

-   `0`: Disable share icons.
-   `1`: Enable share icons

The default is `1`.

### `data-card-align`

Aligns the card. The possible values are `left`, `center` and `right`. The
default value is `center`.

### `data-card-recommend`

When recommendations are supported, it disables embedly recommendations on video
and rich cards. These are recommendations created by embedly.

-   `0`: Disables embedly recommendations.
-   `1`: Enables embedly recommendations.

The default value is `1`.

### `data-card-via` (optional)

Specifies the via content in the card. This is a great way to do attribution.

### `data-card-theme` (optional)

Allows settings the `dark` theme which changes the background color of the main
card container. Use `dark` to set this theme. For dark backgrounds it's better
to specify this. The default is `light`, which sets no background color of the
main card container.

### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Embedly card"`.

### Common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-embedly-card rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-embedly-card/validator-amp-embedly-card.protoascii) in the AMP validator specification.
