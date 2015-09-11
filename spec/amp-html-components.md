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

Changelog:

0.5
Added amp-iframe
Added amp-twitter

0.4
Renamed CAT to AMP
Provisionally removed amp-on spec - subject to be update to “on” attribute.
Added amp-instagram, amp-youtube

0.3
Changed `amp-carousel` styling custom properties; from left and right arrow to next and previous

# AMP HTML Components

## Overview

The AMP runtime defines a small set of custom elements that can be used in any
AMP file. These custom elements serve two primary purposes:

* Enable the AMP runtime to manage the loading of external resources, which may
slow down the initial render or cause jank.
* Allow AMP authors to include functionality above and beyond standard HTML,
while maintaining the security- and performance-minded requirement that no author-written JavaScript is executed.

The initial set of elements included in the AMP spec is purposefully minimal,
to keep payload small. The AMP runtime also allows dynamic loading of additional
ancillary components that have been contributed to the project.

The goal of the AMP components is to provide the correct set of primitives to
AMP authors, such that a wide variety of experiences can be produced using only
declarative HTML and CSS. AMP components are meant to be composed together to
create more advanced and customized UI.

### Styling/Theming

Styling and theming of AMP-provided components is all done via CSS. See the [AMP Spec](amp-html-spec.md) for more detail.

AMP HTML component style can be specified in two particular ways. Simple
elements such as `amp-img` can be styled with class or element selectors in an
author-defined, inlined stylesheet, using most common CSS properties. For
example:

    <!doctype html ⚡>
    <head>
      <style>
        amp-img {
          border: 5px solid black;
        }

        amp-img.grey-placeholder {
          background-color: grey;
        }
      </style>
    </head>

    <body>
      <amp-img src="https://placekitten.com/g/200/300" width=200 height=300>
      </amp-img>

      <amp-img
        class="grey-placeholder"
        src="https://placekitten.com/g/500/300"
        width=500
        height=300>
      </amp-img>
    </body>

AMP HTML components that are more complex and nested, such as `amp-carousel`,
may be styled with an explicitly defined set of CSS Custom Properties. These
are propagated to any children elements that are dynamically created by the
runtime, to achieve the desired style. This way the AMP author does not need to
know the internals of the component, only its styleable properties. For example:

    <!doctype html ⚡>
    <head>
      <style>
        amp-carousel {
          --arrow-color: green;
          --dots: {
            opacity: 50%;
            color: blue;
          }
        }
      </style>
    </head>

    <body>
      <amp-carousel width=500 height=500>
        <div>
          <amp-img width=500 height=500 src="https://placekitten.com/g/500/500">
          </amp-img>
        </div>
        <div>
          <amp-img width=500 height=500 src="https://placekitten.com/g/500/500">
          </amp-img>
        </div>
      </amp-carousel>
    </body>

Inline `style` attributes are not allowed, as per the AMP spec.

### Width, Height, and Layout

All externally-loaded resources must have a known height at the time the page is loaded, so that as the resources load in the page doesn’t jump and reflow. Components are provided by the AMP runtime to enable loading these external resources, like `amp-img`, `amp-video`, etc. These components all share the following attributes:

**width**

The width of the component. `width` and `height` attributes imply the aspect ratio of the image, which can then scale with the container.

**height**

The height of the image. `width` and `height` attributes imply the aspect ratio of the image, which can then scale with the container.

**layout**

Defines the way the container is laid out. `layout=”responsive”` will let the container scale with the width of the parent container. `layout=”nodisplay”` indicates that the component should not be initially displayed by the runtime - for example, for an image that will appear in a lightbox when a trigger is tapped.



### Extended Components

The AMP runtime itself will only build-in the most commonly-used components - additional components must be explicitly included into a AMP document.

The collection of official AMP components is open-source and open to contributions. To be considered for inclusion into the official AMP components, a contributed component must:

Use only the API surface area publicly specified by the AMP runtime to work.
Be open-sourceable with an Apache 2 license and not minified or obfuscated.
Have its behavior completely controllable by the runtime - e.g. not attempt to load resources outside of a timeframe allowed by the AMP runtime.
Have a fixed, known aspect ratio at initial page load, except if placed at the bottom of the page.
Not attempt to access or manipulate objects outside of the component’s immediate ownership - e.g. elements that are not specified by or children of the component.
Not cause a AMP file to become invalid as per the AMP specification
The author of the component must sign the [Google Individual CLA](https://cla.developers.google.com/about/google-individual), or if contributing on behalf of a corporation, the [Corporate CLA](https://cla.developers.google.com/about/google-corporate?csw=1). Like most open-source projects, the CLA protects Google, the contributor, and users from issues of intellectual property rights.

In the near-term, implementation will focus on the core components, before prioritizing extensibility. The long-term goal of the runtime though is to support this extensibility.

#### Contributing Components

The creators of the AMP component project - Google and a core group of collaborators, and potentially representatives from other collaborators as the project grows in usage - will have ultimate discretion as to the inclusion of contributed components, though with the goal of including every high-quality contribution that meets the above guidelines, and resolving or providing feedback on proposed contributions in a timely manner.

While in active development, the initial creators of the project - Google and a core group of collaborators - will work together onaround adding additional owners as well as approving contributions for inclusion.

Contributions with the following characteristics will be prioritized:
- Generalized components that solve problems in a non-service-specific way - e.g. a “Related Content” widget that makes a request to a generic JSON endpoint for lazy-loading in additional content.
- Components that are modular, and useful for various types of contained content - e.g. a carousel that takes HTML as well as images.


#### Service-specific Components

A number of AMP components supporting features like ads, analytics, and embeds, may rely on third-party JavaScript provided by a specific service. For example: an analytics component from Google Analytics might need to run logic specific to the GA service, or a Twitter embed may need to run Twitter-specific code.  There are three ways these service-specific components can work:

**Arbitrary 3rd Party JavaScript loaded at runtime**

AMP-conforming content may not have any JavaScript. Some components, like embedded ads, may require JavaScript to execute - these may only be used through AMP-provided components like `amp-ad`. The use of AMP-provided components ensures that any arbitrary 3rd-party JavaScript, in an embedded ad for example, must run in a sandboxed iframe.

**Service-specific JavaScript built-in to a component**

Specific services may contribute their own components to the expanded set of AMP components, which can then be loaded by a AMP file at runtime. These components may execute JavaScript in the context of the main page. They must conform to the specification provided in the “Third-Party Components” section in order to be included.

These types of components will be prioritized behind components that are more generalized, to work with a variety of services and endpoints.

**Dynamic components from JSON endpoints**

The AMP component set may provide components that can load data from an arbitrary endpoint at runtime and use that data to effect the layout and appearance of the component. For example, a “related articles” component may fetch JSON from a author-provided URL and use the data to populate a UI component.

In these cases, services may set up endpoints that produce data that conforms to how the component expects data to be returned. That component may then reference the endpoint with a `url` parameter for example, and the service will be effectively incorporated into the page.


## Components

### <a name="amp-img"></a> `amp-img`

A runtime-managed replacement for the HTML `img` tag.

#### Behavior

The runtime may choose to delay or prioritize resource loading based on the viewport position, system resources, connection bandwidth, or other factors. The `amp-img` components allows the runtime to effectively manage image resources this way.

`amp-img` components, like all externally fetched AMP resources, must be given an
explicit size (as in width / height) in advance, so that the aspect ratio can be known without fetching the image. Actual layout behavior is determined by the layout attribute. If the resource requested by the `amp-img` component fails to load, the space will be blank. A placeholder background color or other visual can be set using CSS selector and style on the element itself.

The `amp-img` includes attributes for denoting attribution via the attribution attribute.

Additional image features like captions can be implemented with standard HTML - using the `figure` and `figcaption` elements, for example.

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

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:

    amp-img {
      background-color: grey;
    }




### <a name="amp-anim"></a> `amp-anim`

A runtime-managed animated image - most typically a GIF.

#### Behavior

The `amp-anim` component is very similar to the `amp-image` element, and provides additional functionality to manage loading and playing of animated images such as GIFs.

The `amp-anim` component can also have an optional placeholder child, to display while the `src` file is loading. The placeholder is specified via the `placeholder` attribute:

    <amp-anim width=400 height=300 src=”my-gif.gif”>
      <amp-img placeholder width=400 height=300 src=”my-gif-screencap.jpg”>
      </amp-img>
    </amp-anim>

#### Attributes

**src**

Similar to the `src` attribute on the `img` tag. The value must be a URL that
points to a publicly-cacheable image file. Cache providers may rewrite these
URLs when ingesting AMP files to point to a cached version of the image.

**srcset**

Same as `srcset` attribute on the `img` tag.

**alt**

A string of alternate text, similar to the `alt` attribute on `img`.

**attribution**

A string that indicates the attribution of the image. E.g. `attribution=“CC courtesy of Cats on Flicker”`


#### Styling

`amp-img` can be styled directly via CSS properties. Setting a grey background
placeholder for example could be achieved via:

    amp-anim {
      background-color: grey;
    }


### <a name=”amp-ad”></a> `amp-ad`

NOTE: The specification of `amp-ad` is likely to significantly evolve over time. The current approach is designed to bootstrap the format to be able to show ads.

A container to display an ad.

Ads are loaded like all other resources in AMP documents, with a special
custom element called `<amp-ad>`. No ad network provided JavaScript is allowed to run inside the AMP document. Instead the AMP runtime loads an iframe from a
different origin (via iframe sandbox) as the AMP document and executes the ad
network’s JS inside that iframe sandbox.

AMP documents only support ads served via HTTPS.

#### Behavior

The `<amp-ad>` requires width and height values to be specified like all
resources in AMP. It requires a `type` argument that select what ad network is displayed. All `data-*` attributes on the tag are automatically passed as arguments to the code that eventually renders the ad. What `data-` attributes are required for a given type of network depends and must be documented with the ad network.

    <amp-ad width=300 height=250
        type="a9"
        data-aax_size="300x250"
        data-aax_pubname="test123"
        data-aax_src="302">
    </amp-ad>

#### Attributes

**type**

Identifier for the ad network. This selects the template that is used for the ad tag.

**src**

Optional src value for a script tag loaded for this ad network. This can be used with ad network that require exactly a single script tag to be inserted in the page. The src value must have a prefix that is whitelisted for this ad network.



### <a name=”amp-pixel”></a> `amp-pixel`

The `amp-pixel` element is meant to be used as a typical tracking pixel - to count page views.

#### Behavior

The `amp-pixel` component behaves like a simple tracking pixel `img`. It takes a single URL, but provides variables that can be replaced by the component in the URL string when making the request. See the `src` and `src-format` attributes for more information.

#### Attributes

**src**

A simple URL to send a GET request to when the tracking pixel is loaded.

Use the special string `$RANDOM` to add a random number to the URL if required.

For instance:

    <amp-pixel src=”https://9nl.it/sz1u?$RANDOM”>

may make a request to something like `https://9nl.it/sz1u?8390278471201` where the $RANDOM value is randomly generated upon each impression.

#### Styling

`amp-pixel` should not be styled.



### <a name=”amp-video”></a> `amp-video`

A replacement for the HTML5 `video` tag. Like all embedded external resources in a AMP file, the video is lazily loaded only when the `amp-video` element is in or near the viewport.

The `amp-video` component is only to be used for direct HTML5 video file embeds.

#### Behavior

The `amp-video` component loads the video resource specified by its `src` attribute lazily, at a time determined by the runtime. It can be controlled much the same way as a standard HTML5 `video` tag.

The `amp-video` component HTML accepts up to three unique types of HTML nodes as children - `source` tags, a placeholder for before the video starts, and a fallback if the browser doesn’t support HTML5 video.

`source` tag children can be used in the same way as the standard `video` tag, to specify different source files to play.

One or zero immediate child nodes can have the `placeholder` attribute. If present, this node and its children form a placeholder that will display instead of the video. A click or tap anywhere inside of the `amp-video` container will replace the placeholder with the video itself.

One or zero immediate child nodes can have the `fallback` attribute. If present, this node and its children form the content that will be displayed if HTML5 video is not supported on the user’s browser.

For example:

    <amp-video width=400 height=300 src=”https://yourhost.com/videos/myvideo.mp4”>

<amp-img placeholder width=400 height=300 src=”myvideo-poster.jpg”></amp-img>
  <div fallback>
    <p>Your browser doesn’t support HTML5 video</p>
  </div>
    </amp-video>

#### Attributes

**autoplay**

The `autoplay` attribute allows the author to specify when - if ever - the animated image will autoplay.

The presence of the attribute alone implies that the animated image will always autoplay. The author may specify values to limit when the animations will autoplay. Allowable values are `desktop`, `tablet`, or `mobile`, with multiple values separated by a space. The runtime makes a best-guess approximation to the device type to apply this value.

**controls**

Similar to the `video` tag `controls` attribute - if present, the browser offers controls to allow the user to control video playback.

**loop**

If present, will automatically loop the video back to the start upon reaching the end.

**muted**

If present, will mute the audio by default.

#### Styling


### <a name=”amp-carousel”></a> `amp-carousel`

A generic carousel for displaying multiple similar pieces of content along a horizontal axis. It is meant to be highly flexible and performant.

#### Behavior

Each of the `amp-carousel` component’s immediate children is considered an item in the carousel. Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items, as well as optional navigational arrows to go forward or backwards a single item, and optional navigational “dots” which indicate where the currently viewed item is in the list of items.

The carousel advances between items if the user swipes, uses arrow keys, clicks an optional navigation arrow, or clicks an option “dot.”

    <amp-carousel width=300 height=400>
      <amp-img src=”my-img1.png” width=300 height=400></amp-img>
      <amp-img src=”my-img2.png” width=300 height=400></amp-img>
      <amp-img src=”my-img3.png” width=300 height=400></amp-img>
    </amp-carousel>

Note, that while the example shows a carousel of images `amp-carousel` support arbitrary children.

#### Attributes

**loop**

If present, the user may advance past the final item, which is followed by the first item again in the carousel.

**dots**

If present, the carousel includes navigational dots that indicate where the user is in the carousel.

**arrows**

If present, displays left and right arrows for the user to use in navigation on mobile. Visibility of arrows can also be controlled via styling, and a media query can be used to only display arrows at certain screen widths. On desktop, arrows will always be displayed.


#### Styling

TBD


### <a name=”amp-lightbox”></a> `amp-lightbox`

The `amp-lightbox` component allows for a “lightbox” or similar experience - where upon user interaction a component expands to fill the viewport, until it is closed again by the user.

#### Behavior

The `amp-lightbox` component defines the child elements that will be displayed in a full-viewport overlay. It is triggered to take up the viewport when the user taps or clicks on an element with `on` attribute that targets `amp-lightbox` element’s `id`.

One or more elements within the lightbox can be optionally given a `close` attribute, which when tapped or clicked will close the lightbox. If no element is given a `close` attribute, a tap or click anywhere on the screen will close it.

For example:

    <button on=”tap:my-lightbox”>Open lightbox</button>

    <amp-lightbox id=”my-lightbox” layout=”nodisplay”>
      <div class=”lightbox”>
        <amp-img src=”my-full-image.jpg” width=300 height=800>
        <div close>Close</div>
      </div>
    </amp-lightbox>

#### Styling

The `amp-lightbox` component can be styled with standard CSS.


### <a name=”amp-iframe”></a> `amp-iframe`

Displays an iframe.

`amp-iframe` has several important differences from vanilla iframes that are designed to make it more secure and avoid AMP files that are dominated by a single iframe:

- `amp-iframe` may not appear close to the top of the document. They must be either 600px away from the top or not within the first 75% of the viewport when scrolled to the top – whichever is smaller. NOTE: We are currently looking for feedback as to how well this restriction works in practice.
- They are sandboxed by default. That means that authors needs to be explicit about what should be allowed in the iframe. See the [the docs on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) for details on the sandbox attribute.
- They must only request resources via HTTPS.
- They must not be in the same origin as the container unless they do not allow `allow-same-origin` in the sandbox attribute.

Example:
    <amp-iframe width=300 height=300
        sandbox="allow-scripts"
        layout="responsive"
        frameborder="0"
        src="https://foo.com/iframe">
    </amp-iframe>

#### Attributes

**src, sandbox, frameborder, allowfullscreen, allowtransparency**

The attributes above should all behave like they do on standard iframes.


### <a name=”amp-instagram”></a> `amp-instagram`

Displays an instagram embed.

Example:
    <amp-instagram
      shortcode="fBwFP"
      width="320"
      height="392"
      layout="responsive">
    </amp-instagram>

The width/height given in the example should be correct for responsive layouts with square (instagram's default) pictures. Other aspect ratios will require different values.

#### Attributes

**shortcode**

The instagram shortcode found in every instagram photo URL.

E.g. in https://instagram.com/p/fBwFP fBwFP is the shortcode.



### <a name=”amp-twitter”></a> `amp-twitter`

Displays a Twitter Tweet.

Example:
    <amp-twitter width=486 height=657
        layout="responsive"
        data-tweetID="585110598171631616"
        data-cards="hidden">

**CAVEATS**

Twitter does not currently provide an API that yields fixed aspect ratio Tweet embeds. We currently automatically proportionally scale the Tweet to fit the provided size, but this may yield less than ideal appearance. Authors may need to manually tweak the provided width and height. You may also use the `media` attribute to select the aspect ratio based on screen width. We are looking for feedback how feasible this approach is in practice.

#### Attributes

**data-tweetID**

The ID of the tweet. In a URL like https://twitter.com/joemccann/status/640300967154597888 `640300967154597888` is the tweetID.

**data-nameOfOption**

Options for the Tweet appearance can be set using `data-` attributes. E.g. `data-cards="hidden"` deactivates Twitter cards. For documentation of the available options, see [Twitter's docs](https://dev.twitter.com/web/javascript/creating-widgets#create-tweet).


### <a name=”amp-youtube”></a> `amp-youtube`

Displays a Youtube video.

Example:
    <amp-youtube
        video-id="mGENRKrdoGY"
        layout="responsive"
        width="480" height="270"></amp-youtube>


With responsive layout the width and height from the example should yield correct layouts for 16:9 aspect ratio videos

#### Attributes

**video-id**

The Youtube video id found in every Youtube video page URL

E.g. in https://www.youtube.com/watch?v=Z1q71gFeRqM Z1q71gFeRqM is the video id.

### <a name=”on-attribute”></a> `on` attribute

TODO: describe `on` attribute
