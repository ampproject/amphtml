# Web Story Player November 2020 Update

<table>
  <tr>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/carousel-cards-entry-point.png?raw=true"></td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/player-in-recipe.png?raw=true"></td>
<td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/lightbox-close-button.png?raw=true"></td>
  </tr>
</table>

## Summary

The player is fully available and the functionalities here (unless otherwise specified) are ready to use. The goal of this issue is to polish documentation, provide more examples of the player, and showcase new functionalities. To learn how to try out the new features (marked in (**Beta**)), refer to the [FAQs](#faqs-please-feel-free-to-reach-out-with-other-questions--thoughts).

This update contains guidance on using the Web Story Player to support:

<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    amp markdown-toc --fix
-->

<!-- {"maxdepth": 1} -->

-   [Summary](#summary)
-   [Player setup](#player-setup)
-   [Navigating between stories](#navigating-between-stories)
-   [Integrating web stories into your website (entrypoints)](#integrating-web-stories-into-your-website-entrypoints)
-   [Programmatically fetching more stories](#programmatically-fetching-more-stories)
-   [Circular Wrapping](#circular-wrapping)
-   [Customizing position & visibility of story UI controls](#customizing-position--visibility-of-story-ui-controls)
-   [Custom Events](#custom-events)
-   [Upcoming API Change: Poster Image](#upcoming-api-change-poster-image)
-   [Additional use case demos](#additional-use-case-demos)
-   [Additional explorations and roadmap](#additional-explorations-and-roadmap)
-   [FAQs (please feel free to reach out with other questions & thoughts)](#faqs-please-feel-free-to-reach-out-with-other-questions--thoughts)

Beyond this, you’ll also find:

-   [Additional use case demos](#Additional-use-case-demos)
-   [Additional explorations and roadmap](#Additional-explorations-and-roadmap)
-   [FAQs](#faqs-please-feel-free-to-reach-out-with-other-questions--thoughts)

## Player setup

If you need a refresher on how to set up the amp-story-player, including what scripts to import and how to add stories, visit the [documentation](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-story-player.md).

## Navigating between stories

Navigating between stories inside of the player works out of the box for mobile. Simply swipe horizontally to go from one story to the other. [Full screen demo](https://web-player-cards-carousel.web.app/examples/amp-story/player-full-screen.html).

To navigate between stories on desktop, there are a couple of options:

<table>
  <tr>
    <td>1. Opt-in to the “skip-to-next button” using the “controls” API (more on that below on the “Customizing position & visibility of story UI controls” section).</td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/skip-next-desktop.png?raw=true"></td>
  </tr>
  <tr>
    <td>2. Use the Javascript APIs to implement your own navigational buttons.  If you want to use the Javascript APIs, you can use the <a href="https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-story-player.md#go">go() method</a> (see documentation for more details) as shown in the following example:</td>
    <td>

```javascript
const player = document.querySelector("amp-story-player");

// Waits for when player API is ready to be used.
player.addEventListener("ready", () => {
  initializeNavigationalButtons();
});

// Synchronous check to avoid race conditions where event was dispatched before // we started listening.
if (player.isReady) {
    initializeNavigationalButtons();
}

function initializeNavigationalButtons() {
  const nextButton = document.body.querySelector(".my-next-button");

  nextButton.addEventListener('click', () => {
    // Advances one story when ".my-next-button" is clicked.
    player.go(1);
  });
}

```

</td>

  </tr>
</table>

## Integrating web stories into your website (entrypoints)

There are many ways in which you can use the player on your own surfaces. Below we provide a few samples of common patterns. We are evaluating putting together more detailed examples and patterns for entry points, let us know if that would be helpful for you.

<table>
<tbody>
  <tr>
    <td><strong>Carousel with circle avatars</strong> <br>In this codepen, we provide an example of how to create a carousel entry point and how to link it to your player. <br> <a href="https://codepen.io/maenrique/pen/wvWjNYr" target="_blank" rel="noopener noreferrer">https://codepen.io/maenrique/pen/wvWjNYr</a><br><br><strong>Demo</strong>  <br>This demo showcases a more complex implementation with a horizontally scrollable carousel and the player being opened in a lightbox. <br><a href="https://web-player-cards-carousel.web.app/examples/amp-story/player-entry-point-circular.html" target="_blank" rel="noopener noreferrer">https://web-player-cards-carousel.web.app/examples/amp-story/player-entry-point-circular.html</a><br></td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/carousel-circuclar-entry-point.png?raw=true"></td>
  </tr>
  <tr>
    <td><strong>Carousel with cards</strong><br>In this codepen, we provide an example of how to create a simple card carousel entry point and how to link it to your player.<br><a href="https://codepen.io/maenrique/pen/MWeGxqY" target="_blank" rel="noopener noreferrer">https://codepen.io/maenrique/pen/MWeGxqY</a><br><br><strong>Demo</strong> <br>This demo showcases a more complex implementation with a horizontally scrollable carousel and the player being opened in a lightbox. <br> <a href="https://web-player-cards-carousel.web.app/examples/amp-story/player-entry-point-cards.html" target="_blank" rel="noopener noreferrer">https://web-player-cards-carousel.web.app/examples/amp-story/player-entry-point-cards.html</a><br><br></td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/carousel-cards-entry-point.png?raw=true"></td>
  </tr>
  <tr>
    <td>Embedding directly into some text<br>The simplest way to use the player is to directly embed the player in your platform.<br><a href="https://web-player-cards-carousel.web.app/examples/amp-story/player-blog.html" target="_blank" rel="noopener noreferrer">Demo</a><br></td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/embed-in-blog.png?raw=true"></td>
  </tr>
</tbody>
</table>

## Programmatically fetching more stories

You can now create an “infinite scroll” experience by fetching more stories as the user navigates through them in your player. Simply use the new JSON configuration to specify an endpoint, and the player will automatically fetch more stories as it gets closer to the last story in the player.

### JSON Configuration

Here’s an example of how the configuration looks:

```html
<amp-story-player>
 <script type="application/json">
   {
     "behavior": {
       "on": "end",
       "action": "fetch",
       "endpoint": "https://example.com/my-endpoint.json?offset=${offset}"
     }
   }
 </script>
 <a href="./story1.html"> ... </a>
 <a href="./story2.html"> ... </a>
  ...
```

</amp-story-player>

The configuration must be a direct child of the <amp-story-player> element, with the `type=”application/json”` attribute.

The `endpoint` property of the url takes in an optional variable `${offset}` that you can add as a parameter, which you can use for pagination.

### Response

The expected response payload coming from the endpoint should be a JSON containing an array of Story objects, the structure is described below.

#### href

The URL where your story is located.

#### title (optional)

The title of your story.

#### posterImage (optional)

The poster image of your story.

Example:

```json
[
  {
    "href": "https://example.com/story3.html",
    "title": "My third cool story", // optional
    "posterImage": "https://example.com/assets/story3.png" // optional
  },
  {
    "href": "https://example.com/story4.html",
    "title": "My fourth cool story", // optional
    "posterImage": "https://example.com/assets/story4.png" // optional
  }
]
```

## Circular Wrapping

You can now create a circular consumption of stories. This enables users to go back to the first story when they finish the last one. To do this, use the JSON configuration with the `circular-wrapping` action.

### JSON Configuration

Here’s an example of how the configuration looks:

```html
<amp-story-player>
 <script type="application/json">
   {
     "behavior": {
       "on": "end",
       "action": "circular-wrapping"
     }
   }
 </script>
 <a href="./story1.html"> ... </a>
 <a href="./story2.html"> ... </a>
  ...
</amp-story-player>
```

The configuration must be a direct child of the <amp-story-player> element, with the `type=”application/json”` attribute.

## Customizing position & visibility of story UI controls

You can now customize controls of the story UI with a variety of options. These include new buttons, changing the position (start or end), among others.

See [examples](#Example-#1---Close-button-on-the-start-position) below to get an idea of what you can do.

<table>
  <tr>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/close-button-left.png?raw=true"></td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/close-and-skip-next.png?raw=true"></td>
<td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/close-button-custom-background.png?raw=true"></td>
  </tr>
</table>

To configure them, specify a JSON configuration with the `type=”application/json”` attribute as a child of the `<amp-story-player>` element.

Inside the configuration, specify an array of “controls”. The “controls” structure is described below.

The configuration will end up looking like the following:

```html
<amp-story-player>

 <script type="application/json">
   {
     "controls": [
       {
         "name": "close",
         "position": "start"
       },
       {
         "name": "skip-to-next"
       }
     ]
   }
 </script>

<a href="./story1.html"> ... </a>
<a href="./story2.html"> ... </a>
</amp-story-player>
```

### Close

Specify a control object with the “close” name to get the close icon.

-   `event`: The close button dispatches the `amp-story-player-close` event.

The “close” control supports the following customizable properties:

-   `position`: “start” or “end”.
    -   Places the icon either on the left or right on LTR languages.
-   `visibility`: “hidden” or “visible” (default).
    -   Toggles the control’s visibility. If omitted, the default is visible.
    -   See [Example #2 - Showing skip-to-next story on desktop.](#Example-#2---Showing-skip-to-next-story-on-desktop)
-   `backgroundImageUrl`: string with url or data string (escaped).
    -   Changes the icon image to the provided url or data string (for inline svgs).

### Skip-to-next

Skips to the next story inside the player (only available on desktop).

The “skip-to-next” control supports the following customizable properties:

-   `position`: “start” or “end”.
    -   Places the icon either on the left or right on LTR languages.
-   `visibility`: “hidden” or “visible” (default).
    -   Toggles the control’s visibility. If omitted, the default is visible.
-   `backgroundImageUrl`: string with url or data string (escaped).
    -   Changes the icon image to the provided url or data string (for inline svgs).

### Custom control

You can add a custom control to the stories inside the player with a custom control. Simply specify a “name” and an “backgroundImageUrl”, and any optional properties:

-   `name` (**required**): a string with the name of the control. e.g. “lightbox”. **The dispatched event will depend on this name.** The custom event will be the name of the control prefixed with `amp-story-player-*`. E.g. `amp-story-player-lightbox`:

```javascript
const player = document.body.querySelector("amp-story-player");

// Listen to when the specified control was clicked.
player.addEventListener("amp-story-player-lightbox", () => {
  // This will trigger when the control with the "lightbox" name is clicked.
  performCustomAction();
});
```

-   `backgroundImageUrl` (**required**): Accepts URLs, as well as svgs and `data` paths (note that strings must be JSON escaped). See [example 3](#Example-#3---Changing-the-icon-of-the-close-button).
    -   Changes the control icon.
-   `position`: “start” or “end”.
    -   Places the icon either on the left or right on LTR languages.
-   `visibility`: “hidden” or “visible” (default).
    -   Toggles the control’s visibility. If omitted, the default is visible.

### Example #1 - Close button on the start position

Since by default the close button will be placed to the end, all we have to do is move the close button to the start.

<table>
  <tr>
    <td>
      <pre lang="html">
<amp-story-player>
 <script type="application/json">
   {
     "controls": [
       {
         "name": "close",
         "position": "start"
       }
     ],
   }
 </script>
 ...
</amp-story-player>
      </pre>
    </td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/lightbox-close-button.png?raw=true"></td>
  </tr>
</table>

### Example #2 - Showing skip-to-next story on desktop

On desktop, you can now display a button that navigates from the current story to the next one. It will also automatically be disabled once the user reaches the end of the stories in the player.

<table>
  <tr>
    <td>
      <pre lang="html">
<amp-story-player>
 <script type="application/json">
   {
     "controls": [
       {
         "name": "skip-to-next"
       }
     ],
   }
 </script>
 ...
</amp-story-player>
      </pre>
    </td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/skip-next-desktop.png?raw=true"></td>
  </tr>
</table>

### Example #3 - Changing the icon of the close button

<table>
  <tr>
    <td>
      <pre lang="html">
<amp-story-player>
 <script type="application/json">
   {
     "controls": [
       {
         "name": "close",
         "backgroundImageUrl": "data:image\/svg+xml;charset=utf-8,<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5.77778 9.33333H4V4H9.33333V5.77778H5.77778V9.33333ZM4 14.6667H5.77778V18.2222H9.33333V20H4V14.6667ZM18.2222 18.2222H14.6667V20H20V14.6667H18.2222V18.2222ZM14.6667 5.77778V4H20V9.33333H18.2222V5.77778H14.6667Z\" fill=\"white\"\/><\/svg>",
         "position": "start"
       }
     ]
   }
 </script>
 ...
</amp-story-player>
      </pre>
    </td>
    <td><img src="https://github.com/ampproject/amphtml/blob/main/src/amp-story-player/img/close-button-custom-background.png?raw=true"></td>
  </tr>
</table>

## Custom Events

We’ve recently introduced some new events that the player will dispatch and that you can listen to. To see the existing events, refer to the documentation of [Custom Events](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-story-player.md#custom-events).

### noNextStory

Dispatched when there is no next story. Note that this will not be dispatched when using [Circular wrapping](#Circular-wrapping).

```javascript
player.addEventListener('noNextStory', (event) => {
  console.log('User is tapping on the last page and there are no more stories.');
});
```

### noPreviousStory

Dispatched when there is no next story. Note that this will not be dispatched when using [Circular wrapping](#Circular-wrapping).

```javascript
player.addEventListener('noPreviousStory', (event) => {
  console.log('User is tapping back on the first page and there are no more stories.');
});
```

### amp-story-close

Dispatched when the “close” button is clicked. Read the “Customize story UI elements (system UI controls)” section for more information

```javascript
player.addEventListener('amp-story-close', (event) => {
  console.log('User clicked the close button of the story.');
});
```

## Upcoming API Change: Poster Image

In the interest of performance and specifically metrics like [Largest Contentful Paint (LPS) & Cumulative Layout Shift (CLS)](https://web.dev/vitals/), the player provides the option to specify a poster image while the player loads.

Before, we recommended using a CSS variable style="--story-player-poster: url('’);” as an inline style of the `<a>` tag to specify the poster image.

This has some drawbacks -- mainly that we have to wait for the player CSS to be applied so that the image is displayed. This costs some precious milliseconds for the performance metrics. It also doesn’t really follow general HTML semantics.

We will now recommend developers to use an `<img loading=”lazy”>` tag under the first `<a>` tag in their player. In doing so, the placeholder poster image will render without needing any CSS and it will render in other contexts like when the HTML is sanitized for email.

Using the `<img>` tag also ensures that we're just using HTML so it should be interpreted correctly by browsers when it comes to computing LCP. Plus it's AMP/non-AMP consistent.

This new API is still a work in progress, and will send more information when it becomes available. Please follow this [Github issue](https://github.com/ampproject/amphtml/issues/30512) for more information.

## Additional use case demos

<a href="https://codepen.io/maenrique/pen/rNLyqXg" target="_blank" rel="noopener noreferrer">Circle entry point + scrolling + lightbox</a>

<a href="https://codepen.io/maenrique/pen/WNxpPqJ" target="_blank" rel="noopener noreferrer">Card entry point + scrolling + lightbox</a>

## Additional explorations and roadmap

Follow feature requests & bugs in the [Github project](https://github.com/ampproject/amphtml/projects/109).

## FAQs (please feel free to reach out with other questions & thoughts)

### The Web Player supports more features on non-AMP pages than on AMP pages currently. What features are missing for AMP-pages?

Good question. While the basic functionality of the player is in the [AMP version](https://amp.dev/documentation/components/amp-story-player/), including embedding multiple stories and swiping through them, we are still working on porting over some of the features from the non-AMP version to the AMP version. These include:

-   Circular wrapping
-   Programmatically fetching more stories from an endpoint
-   Customizable UI controls
-   Custom events

Follow our [roadmap on Github](https://github.com/ampproject/amphtml/projects/109) and the wg-stories updates for the [latest status updates](https://github.com/ampproject/wg-stories/issues).

### Is the player ready to use? When will these features be ready?

Yes! These features have been merged to the main repository, but since there is currently a [release freeze](https://github.com/ampproject/meta-tsc/issues/51) for AMP (October 26 - November 8, 2020), we recommend you to opt-in to the nightly release to try out the latest features. More information on that below.

### I want the bleeding-edge and latest features, how can I get them?

AMP provides some channels that you can opt-in to get the latest changes. To opt-in, visit the [AMP Project Experiments page](https://cdn.ampproject.org/experiments.html) and select a channel. More information about the [AMP Release Channels](https://github.com/ampproject/amphtml/blob/main/docs/release-schedule.md#amp-experimental-and-beta-channels).

### I have found a bug or have questions / comments / issues, how do I contact you?

If you have found a bug or have an issue request, file a [Github issue](https://github.com/ampproject/amphtml/issues?q=is%3Aissue+is%3Aopen+label%3A%22WG%3A+stories%22+) and tag the @ampproject/wg-stories working group.

For questions / disscusion, join the [amp-story slack channel](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md#discussion-channels) and ping us!.
