---
$category@: presentation
formats:
  - stories
teaser:
  text: A CTA button for opening external links with one tap in AMP story pages.
$title: amp-story-page-outlink
version: '0.1'
versions:
  - '0.1'
latest_version: '0.1'
is_current: true
$path: /documentation/components/amp-story-page-outlink.html
$localization:
  path: '/{locale}/documentation/components/amp-story-page-outlink.html'
layouts:
  - nodisplay
---

# amp-story-page-outlink

## Usage

`amp-story-page-outlink` provide a UI for a one-tap outlink experience. The outlink can be opened by users through a "swipe up" gesture, or a tap on the call to action element.
A UI button prompting the viewer to open the attachment will appear at the bottom of every page with a `amp-story-page-outlink` element.
It must have the `layout="nodisplay"` attribute.

`amp-story-page-outlink` requires a single `a` element child.

<amp-img alt="AMP Story page attachment" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink.gif" width="240" height="480">
  <noscript>
    <img alt="AMP Story page attachment" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink.gif" />
  </noscript>
</amp-img>

```html
<amp-story-page id="page-outlink-example">
  <amp-story-grid-layer template="fill">
    <amp-img src="https://example.ampproject.org/helloworld/bg1.jpg" width="900" height="1600">
  </amp-story-grid-layer>
  <amp-story-page-outlink layout="nodisplay">
    <a href="https://www.google.com" title="Link Description"></a>
  </amp-story-page-outlink>
</amp-story-page>
```

## Placement

The `<amp-story-page-outlink>` element must be the last child of `<amp-story-page>`, and must have the `layout="nodisplay"` attribute.

[tip type="important"]
Both [`amp-story-page-outlink`](amp-story-page-outlink.md) and [`amp-story-page-attachment`](amp-story-page-attachment.md) must be the last child tag of an [`amp-story-page`](https://amp.dev/documentation/components/amp-story-page?format=stories). Because of this, you may include neither or one, but not both.
[/tip]

## `Custom Text` (optional)

Text within the child anchor element will display in the CTA. The default is "Swipe up".

![amp-story-page-outlink-cta-text](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink-cta-text.jpg)

```html
<amp-story-page-outlink layout="nodisplay">
    <a href="https://www.google.com">Call To Action</a>
</amp-story-page-outlink>
```

## Attributes

When no attributes are set, the default UI will render:

![amp-story-page-outlink-default](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink-default.jpg)

```html
<amp-story-page-outlink layout="nodisplay">
    <a href="https://www.google.com"></a>
</amp-story-page-outlink>
```

```html
<amp-story-page-outlink
  layout="nodisplay"
  cta-text="Read More">
  ...
</amp-story-page-outlink>
```

### `theme` (optional)

String representing the color theme, default is light. Accepts values `light`, `dark`, and `custom`.

`theme="custom"` requires two additional attributes:

<ul>
  <li>`cta-accent-color`: String that represents the custom theme’s color.</li>
  <li>`cta-accent-element`: String that represents the element to apply the custom theme to. Accepts values `text` and `background`.</li>
</ul>

Contrast protection is automatically applied to ensure readability and a11y compliance. For example, when the accent element is “background”, the higher contrast color (black or white) is applied to the text.

![amp-story-page-outlink-dark-theme](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink-dark-theme.jpg)

```html
<amp-story-page-outlink
  layout="nodisplay"
  theme="dark">
    <a href="https://www.google.com"></a>
</amp-story-page-outlink>
```

![amp-story-page-outlink-custom-theme](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink-custom-theme-background.jpg)

```html
<amp-story-page-outlink
  layout="nodisplay"
  theme="custom"
  cta-accent-element="background"
  cta-accent-color="#0047FF">
    <a href="https://www.google.com">Call To Action</a>
</amp-story-page-outlink>
```

![amp-story-page-outlink-custom-theme](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink-custom-theme-text.jpg)

```html
<amp-story-page-outlink
  layout="nodisplay"
  theme="custom"
  cta-accent-element="text"
  cta-accent-color="#247C3C">
    <a href="https://www.google.com">Call To Action</a>
</amp-story-page-outlink>
```

### `cta-image` (optional)

String representing a URL pointing to an image. Optimize performance and avoid distortion by using a 32x32px image. A link icon will be displayed by default.

![amp-story-page-outlink-cta-image](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink-cta-image.jpg)

```html
<amp-story-page-outlink
  layout="nodisplay"
  cta-image="/static/images/32x32icon.jpg">
    <a href="https://www.google.com">Call To Action</a>
</amp-story-page-outlink>
```

Specifying `cta-image=none` will remove the default link icon.

![amp-story-page-outlink-cta-image-none](https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-page-outlink-cta-image-none.jpg)

```html
<amp-story-page-outlink
  layout="nodisplay"
  cta-image="none">
    <a href="https://www.google.com">Call To Action</a>
</amp-story-page-outlink>
```

[tip type="note"]
The functionality of `amp-story-page-outlink` used to be supported by [`amp-story-page-attachment`](amp-story-page-attachment.md). Please use `amp-story-page-outlink` for one-tap outlinking UI.
[/tip]
