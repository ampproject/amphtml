---
$category@: layout
formats:
  - websites
  - ads
teaser:
  text: Provides a "lightbox” experience. Upon user interaction, a UI component expands to fill the viewport until it is closed by the user.
---
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

# amp-lightbox-gallery

Provides a "lightbox” experience. Upon user interaction, a UI component expands to fill the viewport until it is closed by the user.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-lightbox-gallery" src="https://cdn.ampproject.org/v0/amp-lightbox-gallery-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-lightbox-gallery/">amp-lightbox-gallery</a> sample.</td>
  </tr>
</table>

## Overview

The `amp-lightbox-gallery` component provides a "lightbox” experience for AMP components (e.g., `amp-img`, `amp-carousel`). When the user interacts with the AMP element, a UI component expands to fill the viewport until it is closed by the user. Currently, only images are supported.

## Usage

To use `amp-lightbox-gallery`, ensure the required script is included in your `<head>` section, then add the `lightbox` attribute on an `<amp-img>` or `<amp-carousel>` element. A typical usage looks like this:

### Lightbox with `<amp-img>`

```html
<amp-img src="cat.jpg" width="100" height="100" lightbox></amp-img>
<amp-img src="dog.jpg" width="100" height="100" lightbox></amp-img>
<amp-img src="bird.jpg" width="100" height="100" lightbox></amp-img>
```

Tapping on any `<amp-img>` opens the image in a lightbox gallery. The lightbox gallery does image-handling (e.g., zoom and pan), enables swiping to navigate between images, and offers a thumbnail gallery view for browsing all picture thumbnails in a grid.

### Lightbox with `<amp-carousel>`

```html
<amp-carousel lightbox width="1600" height="900" layout="responsive" type="slides">
  <amp-img src="image1" width="200" height="100"></amp-img>
  <amp-img src="image1" width="200" height="100"></amp-img>
  <amp-img src="image1" width="200" height="100"></amp-img>
</amp-carousel>
```

You can add the `lightbox` attribute on an `<amp-carousel>` to lightbox all of its children. Currently, the `<amp-lightbox-gallery>` component only supports carousels containing `<amp-img>` as children. As you navigate through the carousel items in the lightbox, the original carousel slides are synchronized so that when the lightbox is closed, the user ends up on the same slide as the were originally on. Currently, only the `type='slides'` carousel is supported.

### Captions

Optionally, you can specify a caption for each element in the lightbox. These fields are automatically read and displayed by the `<amp-lightbox-gallery>` in the following order of priority:

- `figcaption` (if the lightboxed element is the child of a figure)
- `aria-describedby`
- `alt`
- `aria-label`
- `aria-labelledby`

#### Example 1: Using figcaption for description

In this example, `<amp-lightbox-gallery>` displays the `figcaption` value as its description, showing "Toront's CN tower was ....".

```html
<figure>
  <amp-img id="hero-img" lightbox="toronto" src="https://picsum.photos/1600/900?image=1075" layout="responsive" width="1600"
    height="900" alt="Picture of CN tower.">
  </amp-img>
  <figcaption class="image">
    Toronto's CN tower was built in 1976 and was the tallest free-standing structure until 2007.
  </figcaption>
</figure>
```

#### Example 2: Using alt for description

In this example, `<amp-lightbox-gallery>` displays the `alt` value as its description, showing "Picture of CN tower".
```html
<amp-img
  id="hero-img"
  lightbox="toronto"
  src="https://picsum.photos/1600/900?image=1075"
  layout="responsive"
  width="1600"
  height="900"
  alt="Picture of CN tower">
</amp-img>
```

## Thumbnail API
Lightboxed items have a thumbnail gallery view. You can optionally specify a thumbnail item for your lightboxed element via the attribute `lightbox-thumbnail-id` that references the `id` of an `<amp-img>` element with `layout="nodisplay"`.

#### Example: using `lightbox-thumbnail-id` to specify a thumbnail

```html
<amp-youtube width="480"
  height="270"
  layout="responsive"
  data-videoid="lBTCB7yLs8Y"
  lightbox-thumbnail-id="my-thumbnail-img">
</amp-youtube>

<amp-img id="my-thumbnail-img"
  width="200"
  height="200"
  layout="nodisplay"
  src="https://picsum.photos/200/200?image=1074">
</amp-img>
```

If no thumbnail is specified, `<amp-img>` elements will be cropped per `object-fit: cover`, `<amp-video>` will use the image src specified in its `poster` attribute, and placeholder images will be used for lightboxed elements that have one.

## Analytics events

To track usage of `amp-lightbox-gallery`, please use one of the following analytics events:

### `lightboxOpened`

This event tracks when the lightbox is opened when the user clicks on a lightboxed `<amp-img>`.

You can track this event using the following code snippet:

```html
  <amp-analytics>
      <script type="application/json">
      {
        "requests": {
          "open": "https://foo.com/open",
        },
        "triggers": {
          "trackLightboxOpened": {
            "on": "lightboxOpened",
            "request": "open"
          }
        }
      }
      </script>
      </amp-analytics>
```

### `thumbnailsViewToggled`

This event tracks when the thumbnails view is triggered by clicking on the trigger when the user is in the lightbox view.

You can track this event using the following code snippet:

```html
  <amp-analytics>
      <script type="application/json">
      {
        "requests": {
          "thumb": "https://foo.com/thumb",
        },
        "triggers": {
          "trackThumbnailsViewToggled": {
            "on": "thumbnailsViewToggled",
            "request": "thumb"
          }
        }
      }
      </script>
      </amp-analytics>
```

### `descriptionOverflowToggled`

This event tracks when the user toggles the description by clicking on the description to expand/collapse it, tracking engagement with the description for the lightboxed image.

You can track this event using the following code snippet:

```html
  <amp-analytics>
      <script type="application/json">
      {
        "requests": {
          "descOverflow": "https://foo.com/descOverflow"
        },
        "triggers": {
          "trackDescriptionOverflowed": {
            "on": "descriptionOverflowToggled",
            "request": "descOverflow"
          }
        }
      }
      </script>
      </amp-analytics>
```
