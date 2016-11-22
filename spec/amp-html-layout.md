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

# AMP HTML Layout System

## Overview

The main goal of the layout system is to ensure that AMP elements can express their layout
so that the runtime is able to infer sizing of elements before any remote resources, such as
JavaScript and data calls, have been completed. This is important since this significantly
reduces rendering and scrolling jank.

With this in mind the AMP Layout System is designed to support few but flexible layouts
that provide good performance guarantees. This system relies on a set of attributes such
as `layout`, `width`, `height`, `sizes` and `heights` to express the element's layout and
sizing needs.


## Layout Types

AMP provides a set of layouts that AMP elements can use. They are defined using layout
attributes described below. Not every element supports every layout - you have to refer
to the element's documentation to know which layouts you can use.

### `nodisplay`

The element is not displayed. This layout can be applied to every AMP element. It assumes
that the element can display itself on user action, e.g. `amp-lightbox`.

### `fixed`

The element has a fixed width and height with no responsiveness supported.

### `responsive`

The element takes the space available to it and resizes its height automatically to the
aspect ratio given by `width` and `height` attributes. This layout works very well for
most of AMP elements, including `amp-img`, `amp-video`, etc.

The available space depends on the parent element and can also be customized using
`max-width` CSS.

### `fixed-height`

The element takes the space available to it but keeps the height unchanged. This layout
works well for elements such as `amp-carousel` that involves content positioned
horizontally.

### `fill`

The element takes the space available to it - both width and height. In other words
the layout of a `fill` element matches its parent.

### `container`

The element lets its children to define its size, much like a normal HTML `div`.

### `flex-item`
The element and other elements in its parent with layout type `flex-item` take their parent container's remaining space when parent has `display: flex`. 

## Layout Attributes

### `width` and `height`

Depending on the value of the `layout` attribute AMP component elements must have a `width` and
`height` attribute that contains an integer pixel value. Actual layout behavior is determined by the
`layout` attribute as described below.

In a few cases if `width` or `height` are not specified the AMP runtime can default these values
as following:
- `amp-pixel`: Both `width` and `height` are defaulted to 0.
- `amp-audio`: The default `width` and `height` are inferred from browser.

### `layout`

The optional layout attribute allows specifying how the component behaves in the document layout.
Valid values for the layout attribute are:

- Not present: The `layout` will be inferred as following:
  - if `height` is present and `width` is absent or equals to `auto`, `fixed-height` layout is assumed;
  - if `width` and `height` attributes are present along with `sizes` or `heights` attribute, `responsive` layout is assumed;
  - if `width` and `height` attributes are present, `fixed` layout is assumed;
  - if `width` and `height` are not present, `container` layout is assumed
- `fixed`: The `width` and `height` attributes must be present. The only exceptions are `amp-pixel`
and `amp-audio` elements.
- `fixed-height`: The `height` attribute must be present. The `width` attribute must not be present
or must be equal to `auto`.
- `responsive`: The `width` and `height` attributes must be present and are used to determine the
aspect ratio of the component. The component is sized to the width of its container element while
maintaining the height based on the aspect ratio.
- `fill`: Element size will be determined by the parent element.
- `container`: The component is assumed to not have specific layout itself but only act as a
container. Its children are rendered immediately.
- `nodisplay`: The component takes up zero space on the screen as if its display style was `none`.
The `width` and `height` attributes are not required.
- `flex-item`: Element size will be determined by the parent element and the number of other elements inside parent according to `display:flex` CSS layout.

Each element documents which `layout` values it supported. If an element does not support the
specified value it would trigger a runtime error.

### `sizes`

All AMP custom elements that allow `responsive` layout, also support `sizes` attribute.
The value of this attribute is a sizes expression
as described in the [img sizes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img), but
extended to all elements, not just images. In short, `sizes` attribute describes how the width of
the element is calculated depending on the media conditions.

When `sizes` attribute is specified along with `width` and `height`, the `layout` is defaulted to
the `responsive`.

### `heights`

All AMP custom elements that allow `responsive` layout, also support the `heights` attribute.
The value of this attribute is a sizes expression based on media expressions
as similar to the [img sizes attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img),
but with two key differences:
 1. It applies to the height and not width of the element.
 2. Percent values are allowed, e.g. `86%`. If a percent value is used, it indicates the percent
 of the element's width.

When the `heights` attribute is specified along with `width` and `height`, the `layout` is defaulted to `responsive`.

An example:
```
<amp-img src="https://acme.org/image1.png"
    width="320" height="256"
    heights="(min-width:500px) 200px, 80%">
</amp-img>
```

In this example, the height of the element by default will be 80% of the width, but for the viewport
wider than `500px` it will be capped at `200px`.

### `media`

All AMP custom elements support the `media` attribute. The value of media is a media query. If the query does not match, the element is not rendered at all and its resources and potentially its child resources will not be fetched. If the browser window changes size or orientation the media queries are re-evaluated and elements are hidden and shown based on the new results.

Example: Here we have 2 images with mutually exclusive media queries. Depending on the screen width one or the other will be fetched and rendered. Note that the media attribute is available on all custom elements, so it can be used with non-image elements such as ads.

```html
    <amp-img
        media="(min-width: 650px)"
        src="wide.jpg"
        width=466
        height=355 layout="responsive" ></amp-img>
    <amp-img
        media="(max-width: 649px)"
        src="narrow.jpg"
        width=527
        height=193 layout="responsive" ></amp-img>
```

### `placeholder`

The `placeholder` attribute can be set on any HTML element, not just AMP elements. It indicates that
the element marked with this attribute acts as a placeholder for the parent AMP element. If specified
a placeholder element must be a direct child of the AMP element. By default, the placeholder is
immediately shown for the AMP element, even if the AMP element's resources have not been downloaded
or initialized. Once ready the AMP element typically hides its placeholder and shows the content.
The exact behavior w.r.t. to placeholder is up to the element's implementation.

```html
    <amp-anim src="animated.gif" width=466 height=355 layout="responsive" >
      <amp-img placeholder src="preview.png" layout="fill"></amp-img>
    </amp-anim>
```

### `fallback`

The `fallback` attribute can be set on any HTML element, not just AMP elements. It's a convention that
allows the element to communicate to the reader that the browser does not support it. If specified
a fallback element must be a direct child of the AMP element. The exact behavior w.r.t. to fallback
is up to the element's implementation.

```html
    <amp-anim src="animated.gif" width=466 height=355 layout="responsive" >
      <div fallback>Cannot play animated images on this device.</div>
    </amp-anim>
```

### `noloading`

Whether the "loading indicator" should be turned off for this element. Many AMP elements
are whitelisted to show a "loading indicator", which is a basic animation that shows that
the element has not yet fully loaded. The elements can opt out of this behavior by adding
this attribute.


## Behavior

A non-container (`layout != container`) AMP element starts up in the unresolved/unbuilt mode in which
all of its children are hidden except for a placeholder (see `placeholder` attribute). The JavaScript
and data payload necessary to fully construct the element may still be downloading and initializing,
but the AMP runtime already knows how to size and layout the element only relying on CSS classes and
`layout`, `width`, `height` and `media` attributes. In most cases a `placeholder`, if specified, is
sized and positioned to take all of the element's space.

The `placeholder` is hidden as soon as the element is built and its first layout complete. At this
point the element is expected to have all of its children properly built and positioned and ready
to be displayed and accept a reader's input. This is the default behavior. Each element can override
to, e.g., hide `placeholder` faster or keep it around longer.

The element is sized and displayed based on the `layout`, `width`, `height` and `media` attributes
by the runtime. All of the layout rules are implemented via CSS internally. The element is said to
"define size" if its size is inferrable via CSS styles and does not change based on its children:
available immediately or inserted dynamically. This does not mean that this element's size cannot
change. The layout could be fully responsive as is the case with `responsive`, `fixed-height`, `fill` and
`flex-item` layouts. It simply means that the size does not change without an explicit user action, e.g.
during rendering or scrolling or post download.

If the element has been configured incorrectly it will not be rendered at all in PROD and in DEV mode
the runtime will display the element in the error state. Possible errors include invalid or unsupported
values of `layout`, `width` and `height` attributes.

## (tl;dr) Appendix 1: Layout Table

What follows is the table of layouts, acceptable configuration parameters and CSS classes and styles
used by this layouts. Notice that:
1. Any CSS class marked prefixed with "-amp-" and elements prefixed with "i-amp-" are considered to be
internal to AMP and their use in user stylesheets is not allowed. They are shown here simply for
informational purposes.
2. The only layouts that currently do not "define size" are `container` and `nodisplay`.
3. Even though `width` and `height` are specified in the table as required the default rules may
apply as is the case with `amp-pixel` and `amp-audio`.

| Layout       | Width/Height Required? | Defines Size? | Additional Elements | CSS "display" |
|--------------|------------------------|---------------|---------------------|---------------|
| nodisplay    | no                     | no | no | `none` |
| fixed        | yes                    | yes, specified by `width` and `height` | no | `inline-block` |
| responsive   | yes                    | yes, based on parent container and aspect ratio of `width:height` | yes, `i-amp-sizer` | `block` |
| fixed-height | `height` only. `width` can be `auto` | yes, specified by the parent container and `height` | no | `block` |
| fill         | no                     | yes, parent's size | no | `block` |
| container    | no                     | no            | no | `block` |
| flex-item    | no                     | no            | yes, based on parent container | `block` |
