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

### <a name="amp-img"></a> `amp-img`

A runtime-managed replacement for the HTML `img` tag.

#### Behavior

The runtime may choose to delay or prioritize resource loading based on the viewport position, system resources, connection bandwidth, or other factors. The `amp-img` components allows the runtime to effectively manage image resources this way.

`amp-img` components, like all externally fetched AMP resources, must be given an
explicit size (as in width / height) in advance, so that the aspect ratio can be known without fetching the image. Actual layout behavior is determined by the layout attribute. If the resource requested by the `amp-img` component fails to load, the space will be blank. A placeholder background color or other visual can be set using CSS selector and style on the element itself.

The `amp-img` includes attributes for denoting attribution via the attribution attribute.

Additional image features like captions can be implemented with standard HTML - using the `figure` and `figcaption` elements, for example.

By default `amp-img` has a placeholder animation that will be visible until the
image has finished downloading. You may override the properties in the default
placeholders classes (see example below in Styling section).
You may also fully override the default placeholder by adding a child element
under `amp-img` and adding a `placeholder` attribute on that element and styling that element
(and its children) as you see fit.  An `active` class is set on the
element with the `placeholder` attribute if the image has not finished
loading and this class is subsequently removed when the image has finished
loading and a `hidden` class will be added to the element.

If you just want to turn off the default placeholder animation add the following to your css:
```css
.amp-autoplaceholder.active .amp-loader-dot {
  visibility: hidden;
  animation-name: none;
}
```

#### Attributes

**src**

Similar to the `src` attribute on the `img` tag. The value must be a URL that
points to a publicly-cacheable image file. Cache providers may rewrite these
URLs when ingesting AMP files to point to a cached version of the image.

**srcset**

Same as `srcset` attribute on the `img` tag. The behavior will be polyfilled where not natively supported.

**alt**

A string of alternate text, similar to the `alt` attribute on `img`.

**attribution**

A string that indicates the attribution of the image. E.g. `attribution=“CC courtesy of Cats on Flicker”`


#### Styling

- `amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:

    amp-img {
      background-color: grey;
    }

- styling the default auto-placeholder

  ```html
  <style>
    .amp-loader-dot {
      /* lets zero out the border-radius to turn it into a square */
      border-radius: 0;
    }

    .amp-autoplaceholder.active .amp-loader-dot {
      /* replace the animation with ours by replacing the name and switching the timing */
      animation: my-awesome-animation 1s infinite;
    }

    /* lets change the delay of the individual dots, the first one stats at 0 delay */
    .amp-loader .amp-loader-dot:nth-child(2) {
      animation-delay: .3s;
    }

    .amp-loader .amp-loader-dot:nth-child(3) {
      animation-delay: .6s;
    }

    /* our new animation just alternates from blue and orange */
    @keyframes my-awesome-animation {
      0%, 100% {
        background-color: blue;
      }

      50% {
        background-color: orange;
      }
    }
  </style>
  <amp-img
      src="../../examples/img/sample.jpg"
      layout="responsive" width="360"
      alt="abc"
      height="216">
  </amp-img>
  ```
