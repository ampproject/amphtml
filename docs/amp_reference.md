# AMP HTML Element Reference

There are 2 types of supported AMP components:
built-in and extended.

Built-in components are always available in a AMP document;
extended components must be explicitly included into the document
as custom elements.

# Built-in components

## `amp-ad`

A container to display an ad (see also [amp-ad](../builtins/amp-ad.md)).
AMP documents only support ads served via HTTPS.

### Behavior

No ad network provided JavaScript is allowed to run inside the AMP document.
Instead the AMP runtime loads an iframe from a different origin
(via iframe sandbox) as the AMP document and executes the ad
network’s JS inside that iframe sandbox.

Width and height values and an ad network `type` are required.
All `data-*` attributes are automatically passed as arguments
to the ad network code that eventually renders the ad.
Required `data-` attributes depend on the ad network.

    <amp-ad width=300 height=250
        type="a9"
        data-aax_size="300x250"
        data-aax_pubname="test123"
        data-aax_src="302">
    </amp-ad>

**NOTE:** The specification of `amp-ad` is likely to significantly evolve over time.
The current approach is designed to bootstrap the format to be able to show ads.

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`type`</td>
	  <td data-th="Description">Identifier for the ad network.
	  	This selects the template that is used for the ad tag.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`src`</td>
	  <td data-th="Description">Optional `src` value for a script tag loaded for this ad network.
	  	This can be used with ad network that require exactly a single script tag to be inserted in the page.
	  	The src value must have a prefix that is whitelisted for this ad network.</td>
    </tr>
  </tbody>
</table>

## `amp-img`

Runtime managed replacement for the HTML `img` tag
(see also [amp-img](../builtins/amp-img.md)).

### Behavior

The runtime may choose to delay or prioritize image resource loading based
on the viewport position, system resources, connection bandwidth, or other factors.

The image size (as in width / height) is required in advance,
so that the aspect ratio can be known without fetching the image.
Actual layout behavior is determined by the layout attribute.

    <amp-img
      src="https://placekitten.com/g/500/300"
      width=500
      height=300>
    </amp-img>


### Attributes

Additional image features like captions can be implemented with standard HTML,
for example, using the `figure` and `figcaption` elements.

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`src`</td>
	  <td data-th="Description">Similar to the `src` attribute on the `img` tag.
	  	Value must be a URL that points to a publicly-cacheable image file.
	  	Cache providers may rewrite these URLs when ingesting AMP files
	  	to point to a cached version of the image.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`srcset`</td>
	  <td data-th="Description">Same as `srcset` attribute on the `img` tag.
	  	The behavior will be polyfilled where not natively supported.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`alt`</td>
	  <td data-th="Description">A string of alternate text, similar to the `alt` attribute on `img`.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`attribution`</td>
	  <td data-th="Description">A string that indicates the attribution of the image,
	  	for example, `attribution=“CC courtesy of Cats on Flicker”`.</td>
    </tr>
  </tbody>
</table>

### Styling

`amp-img` can be styled directly via CSS properties.
For example,
if the image resource fails to load, the space will be blank.
Set a placeholder background color or other visual
using CSS selector and style on the element itself:

    <!doctype html>
    <html ⚡>
      <head>
        <style>
          amp-img.grey-placeholder {
            background-color: grey;
          }
        </style>
      </head>

      <body>
        <amp-img
          class="grey-placeholder"
          src="https://placekitten.com/g/500/300"
          width=500
          height=300>
        </amp-img>
      </body>
    </html>

## `amp-pixel`

Used as a typical tracking pixel to count page views
(see also [amp-pixel](../builtins/amp-pixel.md)).

### Behavior

The component behaves like a simple tracking pixel `img`.
It takes a single URL,
but provides variables that can be replaced by the component
in the URL string when making the request.
See the `src` attribute for more information.

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`src`</td>
	  <td data-th="Description">A simple URL to send a GET request to when the tracking pixel is loaded.</td>
    </tr>
  </tbody>
</table>

Use the special string `$RANDOM` to add a random number to the URL if required.

For instance:

    <amp-pixel src=”https://9nl.it/sz1u?$RANDOM”>

may make a request to something like `https://9nl.it/sz1u?8390278471201`
where the $RANDOM value is randomly generated upon each impression.

Use the special string `$CANONICAL_URL` to add the canonical URL of the current document to the URL

For instance:

    <amp-pixel src="https://foo.com/pixel?href=$CANONICAL_URL">

may make a request to something like `https://foo.com/pixel?href=https%3A%2F%2Fpinterest.com%2F`.

### Styling

`amp-pixel` should not be styled.

## `amp-video`

Replacement for the HTML5 `video` tag (see also [amp-video](../builtins/amp-video.md)).
Only to be used for direct HTML5 video file embeds.

### Behavior

The `amp-video` component loads the video resource specified by its `src` attribute lazily,
at a time determined by the runtime and only when the `amp-video` element is in or near the viewport.
It can be controlled much the same way as a standard HTML5 `video` tag.

The `amp-video` component HTML accepts up to three unique types of HTML nodes as children:
`source` tags, a placeholder for before the video starts,
and a fallback if the browser doesn’t support HTML5 video.

`source` tag children can be used in the same way as the standard `video` tag, to specify different source files to play.

One or zero immediate child nodes can have the `placeholder` attribute.
If present, this node and its children form a placeholder that will display instead of the video.
A click or tap anywhere inside of the `amp-video` container will replace the placeholder with the video itself. 

One or zero immediate child nodes can have the `fallback` attribute.
If present, this node and its children form the content that will be displayed
if HTML5 video is not supported on the user’s browser.

For example:

    <amp-video width=400 height=300 src=”https://yourhost.com/videos/myvideo.mp4”>
	
        <amp-img placeholder width=400 height=300 src=”myvideo-poster.jpg”></amp-img>
	    <div fallback>
		    <p>Your browser doesn’t support HTML5 video</p>
	    </div>
    </amp-video>

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`src`</td>
	  <td data-th="Description">Required if no children are present. Must be HTTPS.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`autoplay`</td>
	  <td data-th="Description">Allows the author to specify when, if ever, the animated image autoplays.
	  	The presence of the attribute alone implies that the animated image always autoplays.
	  	It is possible to limit autoplay by device;
	  	allowable values are `desktop`, `tablet`, or `mobile`, with multiple values separated by a space.
	  	The runtime makes a best-guess approximation to the device type to apply this value.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`controls`</td>
	  <td data-th="Description">Similar to the `video` tag, `controls` attribute.
	  	If present, the browser offers the user controls for video playback.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`loop`</td>
	  <td data-th="Description">If present, video automatically loops back to the start upon reaching the end.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`muted`</td>
	  <td data-th="Description">If present, audio muted by default.</td>
    </tr>
  </tbody>
</table>

# Extended components

## `amp-anim`

Runtime-managed animated image, most typically a GIF
(see also [amp-anim](../extensions/amp-anim.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

    <script custom-element="amp-anim" src="../dist/v0/amp-anim-0.1.max.js" async></script>

### Behavior

`amp-anim` is very similar to the `amp-image` element, and provides additional functionality
to manage loading and playing of animated images such as GIFs.

Include optional placeholder child to display while the `src` file is loading.
The placeholder is specified via the `placeholder` attribute:

    <amp-anim width=400 height=300 src=”my-gif.gif”>
      <amp-img placeholder width=400 height=300 src=”my-gif-screencap.jpg”>
      </amp-img>
    </amp-anim>

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`src`</td>
	  <td data-th="Description">Similar to the `src` attribute on the `img` tag.
	  	Must be a URL that points to a publicly-cacheable image file.
	  	Cache providers may rewrite these URLs when ingesting AMP files
	  	to point to a cached version of the image.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`srcset`</td>
	  <td data-th="Description">Same as `srcset` attribute on the `img` tag.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`alt`</td>
	  <td data-th="Description">String of alternate text, similar to the `alt` attribute on `img`.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`attribution`</td>
	  <td data-th="Description">String that indicates the attribution of the image, for example,
	  	`attribution=“CC courtesy of Cats on Flicker”`.</td>
    </tr>
  </tbody>
</table>

### Styling

Style directly via CSS properties.
For example,
set a grey background placeholder:

    amp-anim {
      background-color: grey;
    }

## `amp-audio`

Replacement for the HTML5 `audio` tag;
only to be used for direct HTML5 audio file embeds
(see also [amp-audio](../extensions/amp-audio.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

    <script custom-element="amp-audio" src="../dist/v0/amp-audio-0.1.max.js" async></script>

#### Behavior

The `amp-audio` component loads the audio resource specified by its `src` attribute lazily,
at a time determined by the runtime and only when it's in or near the viewport.
It can be controlled much the same way as a standard HTML5 `audio` tag.

The `amp-audio` component HTML accepts up to three unique types of HTML nodes as children:
`source` tags, a placeholder for before the audio starts, and a fallback if the browser doesn’t support HTML5 audio.

`source` tag children can be used in the same way as the standard `audio` tag,
to specify different source files to play.

One or zero immediate child nodes can have the `placeholder` attribute.
If present, this node and its children form a placeholder that displays instead of the audio.
A click or tap anywhere inside of the `amp-audio` container replaces the placeholder with the audio itself.

One or zero immediate child nodes can have the `fallback` attribute.
If present, this node and its children form the content displayed
if HTML5 audio is not supported on the user’s browser.

For example:

    <amp-audio width=400 height=300 src=”https://yourhost.com/audios/myaudio.mp3”>
      <div fallback>
        <p>Your browser doesn’t support HTML5 audio</p>
      </div>
      <source type="audio/mpeg" src="foo.mp3">
      <source type="audio/ogg" src="foo.ogg">
    </amp-audio>

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`autoplay`</td>
	  <td data-th="Description">Allows the author to specify when, if ever, the audio autoplays.
	  	The presence of the attribute alone implies that the audio always autoplays.
	  	It is possible to limit autoplay by device;
	  	allowable values are `desktop`, `tablet`, or `mobile`, with multiple values separated by a space.
	  	The runtime makes a best-guess approximation to the device type to apply this value.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`loop`</td>
	  <td data-th="Description">If present, audio automatically loops back to the start upon reaching the end.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`muted`</td>
	  <td data-th="Description">If present, audio muted by default.</td>
    </tr>
  </tbody>
</table>

## `amp-carousel`

Generic carousel for displaying multiple similar pieces of content along a horizontal axis;
meant to be highly flexible and performant
(see also [amp-carousel](../extensions/amp-carousel.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

    <script custom-element="amp-carousel" src="../dist/v0/amp-carousel-0.1.max.js" async></script>

### Behavior

Each of the `amp-carousel` component’s immediate children is considered an item in the carousel.
Each of these nodes may also have arbitrary HTML children.

The carousel consists of an arbitrary number of items,
as well as optional navigational arrows to go forward or backwards a single item,
and optional navigational “dots” which indicate
where the currently viewed item is in the list of items.

The carousel advances between items if the user swipes, uses arrow keys,
clicks an optional navigation arrow, or clicks an option “dot.”

    <amp-carousel width=300 height=400>
      <amp-img src=”my-img1.png” width=300 height=400></amp-img>
      <amp-img src=”my-img2.png” width=300 height=400></amp-img>
      <amp-img src=”my-img3.png” width=300 height=400></amp-img>
    </amp-carousel>

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`controls`</td>
	  <td data-th="Description">If present, displays left and right arrows for the user to use in navigation on mobile.
	  	Visibility of arrows can also be controlled via styling, and a media query can be used
	  	to only display arrows at certain screen widths.
	  	On desktop, arrows will always be displayed unless only a single child is present.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`type`</td>
	  <td data-th="Description">If `carousel` (default), all slides are shown and are scrollable horizontally.
	  	Be aware that `type=carousel` does not currently support `layout=responsive`.
	  	If `slides`, a single slide gets shown at a time.</td>
    </tr>
  </tbody>
</table>

## Styling

Use `amp-carousel` element selector to style freely.
By default, the `.amp-carousel-button` uses an inlined svg
as the background-image of the buttons.
Override this with your own svg or image like so:

  **default**

  ```css
  .amp-carousel-button-prev {
    left: 16px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z"/></svg>');
  }
  ```

  **override**
  ```css
  .amp-carousel-button-prev {
    left: 5%;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M11.56 5.56L10.5 4.5 6 9l4.5 4.5 1.06-1.06L8.12 9z"/></svg>');
  }
  ```
Also by default, a disabled `amp-carousel` button is hidden.
Override this by:

  ```css
  .amp-carousel-button.amp-disabled {
    /* make sure we make it visible */
    visibility: visible;
    /* choose our own styling */
    opacity: .7;
    background-color: red;
  }
  ```

## `amp-fit-text`

Expand or shrink font size to fit the content within the space given
(see also [amp-fit-text](../extensions/amp-fit-text.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

    <script custom-element="amp-fit-text" src="../dist/v0/amp-fit-text-0.1.max.js" async></script>

### Behavior

The `amp-fit-text` component expects its content to be text or other inline content,
but it can also contain non-inline content.
The component tries to find the best font size to fit
all of the content within the available space.

If the content overflows the available space with the minimum font size,
the overflowing content is cut off and hidden.
The WebKit and Blink-based browsers show ellipsis in this case.

The `amp-fit-text` accepts one of the following `layout` values:
`fixed`, `responsive` or `fill`.

For example:

    <amp-fit-text width="300" height="200" layout="responsive"
        max-font-size="52">
      Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
      inermis reprehendunt.
    </amp-fit-text>

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`min-font-size`</td>
	  <td data-th="Description">Minimum font size as an integer that the `amp-fit-text` can use.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`max-font-size`</td>
	  <td data-th="Description">Maximum font size as an integer that the `amp-fit-text` can use.</td>
    </tr>
  </tbody>
</table>

### Styling

Style with standard CSS.

## `amp-iframe`

Displays an iframe
(see also [amp-iframe](../extensions/amp-iframe.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

    <script custom-element="amp-iframe" src="../dist/v0/amp-iframe-0.1.max.js" async></script>

### Behavior

`amp-iframe` has several important differences from vanilla iframes
designed to make it more secure and avoid AMP files that are dominated by a single iframe:

- May not appear close to the top of the document.
They must be either 600px away from the top or
not within the first 75% of the viewport when scrolled to the top, whichever is smaller.
- Sandboxed by default. Authors need to be explicit about what should be allowed in the iframe.
See the [the docs on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) for details on the sandbox attribute.
- Must only request resources via HTTPS.
- Must not be in the same origin as the container unless they do not allow `allow-same-origin` in the sandbox attribute.

Example:
    
    <amp-iframe width=300 height=300
        sandbox="allow-scripts"
        layout="responsive"
        frameborder="0"
        src="https://foo.com/iframe">
    </amp-iframe>

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">src</td>
	  <td data-th="Description">Same as [iframe src](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).</td>
    </tr>
    <tr>
      <td data-th="Attribute">`sandbox`</td>
	  <td data-th="Description">Same as [iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).</td>
    </tr>
    <tr>
      <td data-th="Attribute">`frameborder`</td>
	  <td data-th="Description">Same as [iframe frameborder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).</td>
    </tr>
    <tr>
      <td data-th="Attribute">`allowfullscreen`</td>
	  <td data-th="Description">Same as [iframe allowfullscreen](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).</td>
    </tr>
    <tr>
      <td data-th="Attribute">`allowtransparency`</td>
	  <td data-th="Description">Same as [iframe allowtransparency](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).</td>
    </tr>
  </tbody>
</table>

## `amp-image-lightbox`

Allows for a “image lightbox” or similar experience.
Upon user interaction (zooming, panning, showing/hiding, and more),
an image expands to fill the viewport,
until it is closed again by the user
(see also [amp-image-lightbox](../extensions/amp-image-lightbox.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

    <script custom-element="amp-image-lightbox" src="../dist/v0/amp-image-lightbox-0.1.max.js" async></script>

### Behavior

Activate lightbox using `on` action on the `amp-img` element
by referencing the lightbox element's ID.
When activated, the image appears in the center of the full-viewport lightbox.
Any number of images in the article can use the same `amp-image-lightbox`.

The `amp-image-lightbox`
element itself must be empty and have `layout=nodisplay` set.

    <amp-img
        on="tap:lightbox1"
        role="button"
        tabindex="0"
        src="image1" width=200 height=100></amp-img>

    <amp-image-lightbox id="lightbox1" layout="nodisplay"></amp-image-lightbox>

The `amp-image-lightbox` also can optionally display a caption
for the image at the bottom of the viewport.
The caption is discovered as following:
1. The contents of the `<figcaption>` element when image is in the `figure` tag.
2. The contents of the element whose ID is specified by the image's
  `aria-describedby` attribute.

### Styling

Style with standard CSS.
Style the caption section using the `amp-image-lightbox-caption` class.

## `amp-instagram`

Displays an instagram embed.

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

     <script custom-element="amp-instagram" src="../dist/v0/amp-instagram-0.1.max.js" async></script>

### Behavior

Due to instagram using a fixed aspect ratio when using responsive layout,
the value for width and height in the example should be universal:

Example:

    <amp-instagram
      shortcode="fBwFP"
      width="320"
      height="392"
      layout="responsive">
    </amp-instagram>

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`shortcode`</td>
	  <td data-th="Description">The instagram shortcode found in every instagram photo URL.
	  	For example, in https://instagram.com/p/fBwFP, fBwFP is the shortcode.</td>
    </tr>
  </tbody>
</table>

## `amp-lightbox`

Allows for a “lightbox” or similar experience.
Upon user interaction,
a component expands to fill the viewport until it is closed again by the user
(see also [amp-lightbox](../extensions/amp-lightbox.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

     <script custom-element="amp-lightbox" src="../dist/v0/amp-lightbox-0.1.max.js" async></script>

### Behavior

The `amp-lightbox` component defines the child elements displayed in a full-viewport overlay.
It is triggered to take up the viewport when the user taps or clicks on an element with `on` attribute
that targets `amp-lightbox` element’s `id`.

One or more elements within the lightbox can be optionally given a `close` attribute,
which when tapped or clicked closes the lightbox.
If no element is given a `close` attribute,
a tap or click anywhere on the screen will close it.

For example:

    <button on=”tap:my-lightbox”>Open lightbox</button>

    <amp-lightbox id=”my-lightbox” layout=”nodisplay”>
     	<div class=”lightbox”>
        <amp-img src=”my-full-image.jpg” width=300 height=800>
        <div close>Close</div>
      </div>
    </amp-lightbox>

#### Styling

Style with standard CSS.

## `amp-twitter`

Displays a Twitter Tweet
(see also [amp-twitter](../extensions/amp-twitter.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

     <script custom-element="amp-twitter" src="../dist/v0/amp-twitter-0.1.max.js" async></script>

## Behavior

Currently Twitter does not provide an API that yields fixed aspect ratio Tweet embeds.
The runtime currently scales the Tweet to fit the provided size,
but this may yield less than ideal appearance.
Authors may need to manually tweak the provided width and height,
or use the `media` attribute to select the aspect ratio based on screen width.

Example:
    
    <amp-twitter width=486 height=657
        layout="responsive"
        data-tweetid="585110598171631616"
        data-cards="hidden">

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`data-tweetid`</td>
	  <td data-th="Description">The ID of the tweet.
	  	In a URL like https://twitter.com/joemccann/status/640300967154597888,
	  	`640300967154597888` is the tweetID.</td>
    </tr>
    <tr>
      <td data-th="Attribute">`data-nameofoption`</td>
	  <td data-th="Description">Options for the Tweet appearance can be set using `data-` attributes.
	  	For example, `data-cards="hidden"` deactivates Twitter cards (see [Twitter's docs](https://dev.twitter.com/web/javascript/creating-widgets#create-tweet)).</td>
    </tr>
  </tbody>
</table>

## `amp-youtube`

Displays a Youtube video
(see also [amp-youtube](../extensions/amp-youtube.md)).

Explicitly include this as a custom element in the document head,
linking to the runtime `src`.

For example:

     <script custom-element="amp-youtube" src="../dist/v0/amp-youtube-0.1.max.js" async></script>

### Behavior

Using responsive layout, the width and heigh yield correct layouts
for 16:9 aspect ration videos.

Example:

    <amp-youtube
        video-id="mGENRKrdoGY"
        layout="responsive"
        width="480" height="270">
    </amp-youtube>

### Attributes

<table>
  <thead>
      <th>Attribute</th>
      <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td data-th="Attribute">`video-id`</td>
	  <td data-th="Description">Youtube video ID found in every Youtube video page URL.
	  	For example, in https://www.youtube.com/watch?v=Z1q71gFeRqM, Z1q71gFeRqM is the video ID.</td>
    </tr>
  </tbody>
</table>
