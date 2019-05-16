---
$category@: layout
formats:
  - websites
teaser:
  text: Displays multiple similar pieces of content along a horizontal axis or vertical axis.
---
<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# amp-base-carousel

A generic carousel for displaying multiple similar pieces of content along a horizontal or vertical axis.

<table>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental">Experimental</a>; You must turn on the `amp-base-carousel` experiment to use this component.</div></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-base-carousel" src="https://cdn.ampproject.org/v0/amp-base-carousel-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>
      fill, fixed, fixed-height, flex-item, intrinsic, nodisplay, and responsive.
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <a href="https://ampbyexample.com/components/amp-base-carousel/">amp-carousel example</a>
    </td>
  </tr>
</table>

## Behavior

Each of the `amp-base-carousel` component’s immediate children is considered an item in the carousel. Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items, as well as optional navigational arrows to go forward or backwards a single item.

The carousel advances between items if the user swipes or uses the customizable arrow buttons.

## Attributes
### Using Media Queries

The attributes for `<amp-base-carousel>` can be configured to use different options based on a media query. You can also use a value without any media queries. The format looks like:

```html
<amp-base-carousel attr-name="(min-width: 1000px) valueOne, (min-width: 600px) valueTwo, defaultValue"></amp-base-carousel>
```

The media queries are evaluated from left to right, with the first matching media query being used. A default value (without a media query) is required. In this case, if the page has a screen width of 1000px or more, `valueOne` is used. If the width is between 999px and 600px, `valueTwo` is used. When it is 599px or smaller, `defaultValue` is used.

### Configuration Options

#### Number of Visible Slides

<table>
  <tr>
    <td width="40%"><strong><code>mixed-length</code></strong></td>
    <td>Either <code>true</code> or <code>false</code>, defaults to <code>false</code>. When true, uses the existing width (or height when horizontal) for each of the slides. This allows for a carousel with slides of different widths to be used.
  </tr>
  <tr>
    <td width="40%"><strong><code>visible-count</code></strong></td>
    <td>A number, defaults to <code>1</code>. Determines how many slides should be shown at a given time. Fractional values can be used to make part of a(n) additional slide(s) visible. This option is ignored when <code>mixed-length</code> is <code>true</code>.
  </tr>
  <tr>
    <td width="40%"><strong><code>advance-count</code></strong></td>
    <td>A number, defaults to <code>1</code>. Determines how many slides the carousel will advance when advancing using the previous or next arrows. This is useful when specifying the <code>visible-count</code> attribute.
  </tr>
</table>

#### Auto Advance

<table>
  <tr>
    <td width="40%"><strong><code>auto-advance</code></strong></td>
    <td>Either <code>true</code> or <code>false</code>, defaults to <code>false</code>. Automatically advances the carousel to the next slide based on a delay. If the user manually changes slides, then the auto advance is stopped. Note that if <code>loop</code> is not enabled, when reaching the last item, the auto advance will move backwards to the first item.
  </tr>
  <tr>
    <td width="40%"><strong><code>auto-advance-count</code></strong></td>
    <td>A number, defaults to <code>1</code>. Determines how many slides the carousel will advance when automatically advancing. This is useful when specifying the <code>visible-count</code> attribute.
  </tr>
  <tr>
    <td width="40%"><strong><code>auto-advance-interval</code></strong></td>
    <td>A number, defaults to <code>1000</code>. Specifies the amount of time, in milliseconds, between subsequent automatic advances of the carousel.
  </tr>
  <tr>
    <td width="40%"><strong><code>auto-advance-loops</code></strong></td>
    <td>A number, defaults to <code>∞</code>. The number of times the carousel should advance through the slides before stopping.
  </tr>
</table>

#### Snapping

<table>
  <tr>
    <td width="40%"><strong><code>snap</code></strong></td>
    <td>Either <code>true</code> or <code>false</code>, defaults to <code>true</code>. Determines whether or not the carousel should snap on slides when scrolling.
  </tr>
  <tr>
    <td width="40%"><strong><code>snap-align</code></strong></td>
    <td>Either <code>start</code> or <code>center</code>. When start aligning, the start of a slide (e.g. the left edge, when horizontal aligning) is aligned with the start of a carousel. When center aligning, the center of a slide is aligned with the center of a carousel.
  </tr>
  <tr>
    <td width="40%"><strong><code>snap-by</code></strong></td>
    <td>A number, defaults to <code>1</code>. This determines the granularity of snapping and is useful when using
    <code>visible-count</code>. This 
  </tr>
</table>

#### Miscellaneous

<table>
  <tr>
    <td width="40%"><strong><code>slide</code></strong></td>
    <td>A number, defaults to <code>0</code>. This determines the initial slide shown in the carousel. This may be used with <code>amp-bind</code> to control which slide is currently showing.
  </tr>
  <tr>
    <td width="40%"><strong><code>loop</code></strong></td>
    <td>Either <code>true</code> or <code>false</code>, defaults to <code>true</code>. When true, the carousel will allow the user to move from the first item back to the last item and visa versa. There must be at least three slides present for looping to occur.
  </tr>
  <tr>
    <td width="40%"><strong><code>horizontal</code></strong></td>
    <td>Either <code>true</code> or <code>false</code>, defaults to <code>false</code>. When true the carousel will lay out horizontally, with the user being able to swipe left and right. When false, the carousel lays out vertically, with the user being able to swipe up and down.
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Events
<table>
  <tr>
    <td width="40%"><strong><code>slideChange</code></strong></td>
    <td>This event is triggered when the index displayed by the carousel has changed. The new index is available via <code>event.index</code>.</td>
  </tr>
</table>

## Actions
<table>
  <tr>
    <td width="40%"><strong><code>next</code></strong></td>
    <td>Moves the carousel forwards by <code>advance-count</code> slides.</td>
  </tr>
  <tr>
    <td width="40%"><strong><code>prev</code></strong></td>
    <td>Moves the carousel backwards by <code>advance-count</code> slides.</td>
  </tr>
  <tr>
    <td width="40%"><strong><code>goToSlide</code></strong></td>
    <td>Moves the carousel to the slide specified by the  <code>index</code> argument.</td>
  </tr>
</table>

## Styling
- You may use the `amp-base-carousel` element selector to style the carousel freely.

### Customizing Arrow Buttons
Arrow buttons can be customized by passing in your own custom markup. For example, you can recreate the default styling with the following HTML and CSS:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<amp-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button slot="prev-arrow" class="carousel-prev" aria-label="Previous"></button>
</amp-base-carousel>
```

If you want more customization for the arrow buttons, you can use the `next` and `prev` actions. For example, if you want to place buttons under the carousel and use the words "Previous" and "Next" instead of having them in the default location, you can use the following HTML:

```html
  <amp-base-carousel id="carousel-1" …>
    …
    <div slot="next-arrow"></div>
    <div slot="prev-arrow"></div>
  </amp-carousel>
  <button on="tap:carousel-1.prev()">Previous</button>
  <button on="tap:carousel-1.next()">Next</button>
```

## Usage Notes

### Slide layout

Slides are automatically sized by the carousel when **not** specifying `mixed-lengths`. You should give the slides `layout="flex-item"`:

```html
<amp-base-carousel …>
  <amp-img layout="flex-item" src="…"></amp-img>
</amp-base-carousel>
```

The slides have a default height of `100%` when the carousel is laid out horizontally. This can easily be changed with CSS or by using `layout="fixed-height"`. When specifying the height, the slide will be vertically centered within the carousel.

If you want to horizontally center your slide content, you will want to create a wrapping element, and use that to center the content.

### Number of Visible Slides

When changing the number of visible slides using `visible-slides`, in response to a media query, you will likely want to change the aspect ratio of the carousel itself to match the new number of visible slides. For example, if you want to show three slides at a time with a one by one aspect ratio, you would want an aspect ratio of three by one for the carousel itself. Similiarly, with four slides at a time you would want an aspect ratio of four by one. In addition, when changing `visible-slides`, you likely want to change `advance-count`.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<amp-base-carousel
    layout="responsive" width="3" height="1"
    heights="(min-width: 600px) calc(100% * 4 * 3 / 2), calc(100% * 3 * 3 / 2)"
    visible-count="(min-width: 600px) 4, 3"
    advance-count="(min-width: 600px) 4, 3">
  <amp-img layout="flex-item" src="…"></amp-img>
  …
</amp-base-carousel>

```

## Validation

See [amp-carousel rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-base-carousel/validator-amp-base-carousel.protoascii) in the AMP validator specification.
