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

# <a name="amp-img"></a> `amp-img`

<table>
   <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>A runtime-managed replacement for the HTML <code>img</code> tag.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-img/">amp-img example</a>.</td>
  </tr>
</table>

[TOC]

## Behavior

The runtime may choose to delay or prioritize resource loading based on the viewport position, system resources, connection bandwidth, or other factors. The `amp-img` components allows the runtime to effectively manage image resources this way.

`amp-img` components, like all externally fetched AMP resources, must be given an
explicit size (as in `width` / `height`) in advance, so that the aspect ratio can be known without fetching the image. Actual layout behavior is determined by the `layout` attribute.

{% call callout('Read on', type='read') %}
Learn more about layouts in the [AMP HTML Layout System](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md) spec and [Supported Layouts](https://www.ampproject.org/docs/guides/responsive/control_layout.html#the-layout-attribute).
{% endcall %}

#### Example: Displaying a responsive image
In the following example, we display an image that responds to the size of the viewport by setting `layout=responsive`.  The image stretches and shrinks according to the aspect ratio specified by the `width` and `height`.

<div>
<amp-iframe height="193"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampimg.basic.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div> 
</amp-iframe>
</div>

{% call callout('Read on', type='read') %}
Learn about responsive AMP pages in the [Create Responsive AMP Pages](https://www.ampproject.org/docs/guides/responsive/responsive_design.html) guide.
{% endcall %}

If the resource requested by the `amp-img` component fails to load, the space will be blank unless a [`fallback`](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md#fallback) child is provided. A fallback is only executed on the initial layout and subsequent src changes after the fact (through resize + srcset for example) will not have a fallback for performance implications.

#### Example: Specifying a fallback image
In the following example, if the browser doesn't support WebP, the fallback JPG image displays:

<div>
<amp-iframe height="271"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampimg.fallback.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div> 
</amp-iframe>
</div>

A placeholder background color or other visual can be set using CSS selector and style on the element itself.

Additional image features like captions can be implemented with standard HTML (for example, `figure` and `figcaption`).

{% call callout('Read on', type='read') %}
Learn more about using `amp-img` from these resources:

- [Placeholders & fallbacks](https://www.ampproject.org/docs/guides/responsive/placeholders)
- [Include Images & Video](https://www.ampproject.org/docs/guides/amp_replacements)
{% endcall %}

## Attributes

**src**

This attribute is similar to the `src` attribute on the `img` tag. The value must be a URL that points to a publicly-cacheable image file. Cache providers may rewrite these URLs when ingesting AMP files to point to a cached version of the image.

**srcset**

Same as `srcset` attribute on the `img` tag. The behavior will be polyfilled where not natively supported.

**sizes**

Same as `sizes` attribute on the `img` tag. 

{% call callout('Read on', type='read') %}
See [Responsive images with srcset, sizes & heights](https://www.ampproject.org/docs/guides/responsive/art_direction) for usage of `sizes` and `srcset`.
{% endcall %}

**alt**

A string of alternate text, similar to the `alt` attribute on `img`.

**attribution**

A string that indicates the attribution of the image. For example, `attribution="CC courtesy of Cats on Flicker"`

**height** and **width**

An explicit size of the image, which is used by the AMP runtime to determine the aspect ratio without fetching the image.

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.


## Styling

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:

```css
amp-img {
  background-color: grey;
}
```

## Tips & Tricks

#### Scaling an image up to a maximum width

If you want your image to scale as the window is resized but up to a maximum width (so the image doesn't stretch beyond its width):

1. Set `layout=responsive` for `<amp-img>`.
2. On the container of the image, specify the `max-width:<max width to display image>` CSS attribute.

#### Setting a fixed sized image

If you want your image to display at a fixed size:

1. Set `layout=fixed` for `<amp-img>`.
2. Specify the `width` and `height`.

{% call callout('Read on', type='read') %}
Learn about the [inferred layout](https://www.ampproject.org/docs/guides/responsive/control_layout#what-if-the-layout-attribute-isn’t-specified?) if you don't specify the `layout` attribute.
{% endcall %}


#### Setting the aspect ratio

For responsive images, the `width` and `height` do not need to match the exact width and height of the `amp-img`; those values just need to result in the same aspect-ratio.

For example, instead of specifying `width="900"` and `height="675"`, you can just specify `width="1.33"` and `height="1"`.

<div>
<amp-iframe height="193"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampimg.aspectratio.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div> 
</amp-iframe>
</div>

#### Maintaining the aspect ratio for images with unknown dimensions

The AMP layout system requires the aspect ratio of an image in advance before fetching the image; however, in some cases you might not know the image's dimensions. To display images with unknown dimensions and maintain the aspect ratios, combine AMP's [`fill`](https://www.ampproject.org/docs/guides/responsive/control_layout#the-layout-attribute) layout with the [`object-fit`](https://css-tricks.com/almanac/properties/o/object-fit/) CSS property. For more information, see AMP By Example's [How to support images with unknown dimensions](https://ampbyexample.com/advanced/how_to_support_images_with_unknown_dimensions).

## Validation

See [amp-img rules](https://github.com/ampproject/amphtml/blob/master/validator/validator-main.protoascii) in the AMP validator specification.
