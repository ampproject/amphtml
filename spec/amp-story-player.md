---
$category@: presentation
formats:
  - stories
teaser:
  text: A player for embedding and playing your favorite stories in your own website.
---

<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# <a name="`amp-story-player`"></a> `amp-story-player`

<table>
  <tr>
    <td><img src="https://github.com/ampproject/amphtml/blob/master/src/amp-story-player/img/carousel-cards-entry-point.png?raw=true"></td>
    <td><img src="https://github.com/ampproject/amphtml/blob/master/src/amp-story-player/img/player-in-recipe.png?raw=true"></td>
<td><img src="https://github.com/ampproject/amphtml/raw/master/spec/img/amp-story-player.gif?raw=true"></td>
  </tr>
</table>

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embed and play stories in a non-AMP website.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Scripts</strong></td>
    <td>
    <code>&lt;script async src="https://cdn.ampproject.org/amp-story-player-v0.js">&lt;/script></code>
    <br> <br>
    <code>&lt;link href="https://cdn.ampproject.org/amp-story-player-v0.css" rel='stylesheet' type='text/css'></code>
    </td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>
      <li>See <a href="https://github.com/ampproject/amphtml/blob/master/examples/amp-story/player.html">code snippet</a>.</li>
    </td>
  </tr>
</table>

[TOC]

## Usage

Use `amp-story-player` to embed and play stories within a webpage.

### Embed in a non-AMP page

The code snippet below demonstrates an embed of `<amp-story-player>` in a non-AMP webpage.

[example preview="top-frame" playground="true"]

```html
<head>
  <script
    async
    src="https://cdn.ampproject.org/amp-story-player-v0.js"
  ></script>
  <link
    href="https://cdn.ampproject.org/amp-story-player-v0.css"
    rel="stylesheet"
    type="text/css"
  />
</head>
<body>
  <amp-story-player style="width: 360px; height: 600px;" amp-cache="cdn.ampproject.org">
    <a
      href="https://preview.amp.dev/documentation/examples/introduction/stories_in_amp/"
    >
      <img src="https://amp.dev/static/samples/img/story_dog2_portrait.jpg" width="360" height="600" loading="lazy" amp-story-player-poster-img>
    </a>
  </amp-story-player>
</body>
```

[/example]

### Attributes

The inline width and height ensures that the player will not cause any jumps in your website while the script is being loaded. Feel free to modify the values, but we recommend maintaining a 3:5 aspect ratio.

#### style [recommended]

Inline CSS properties for the width and height of the player. e.g. `style="width: 360px; height: 600px;"`

#### amp-cache

e.g. `<amp-story-player amp-cache="cdn.ampproject.org">`

If specified, the player will rewrite the URL using the AMP Cache prefix provided. Currently there are two AMP Cache providers:

-   `cdn.ampproject.org`
-   `www.bing-amp.com`

## Specify embedded stories

The `<amp-story-player>` component contains one or more `<a>` tags. Point the href attribute of each to the story URL.

Place the story's title within the `<a>` tag. This provides a better user experience and allows search engines to crawl embedded stories.

Use a poster image as a placeholder to display to users while the story loads. To do this, add an image tag as a child of the `<a>` tag with the following configuration: `<img src= "" loading="lazy" width="360" height="600" data-amp-story-player-poster-img></img>`.

### Attributes

#### href

URL pointing to the story.

## Programmatic Control

Call the player's various methods to programmatically control the player. These methods are exposed on the HTML element, `const playerEl = document.querySelector('amp-story-player')` and on instances of the global class variable, `const player = new AmpStoryPlayer(window, playerEl)`.

### Methods

#### load

Will initialize the player manually. This can be useful when the player is dynamically.

Note that the element must be connected to the DOM before calling `load()`.

```javascript
const playerEl = document.body.querySelector('amp-story-player');
const player = new AmpStoryPlayer(window, playerEl);
player.load();
```

#### go

**Parameters**

-   number: the story in the player to which you want to move, relative to the current story.
-   number (optional): the page of the story to which you want to move, relative to the current page.

If the player is currently on the third story out of five stories:

-   `player.go(1)` will go forward one story to the fourth story
-   `player.go(-1)` will go backward one story to the second story
-   `player.go(-1, 1)` will go backward one story and navigate one page backwards
-   `player.go(0, 5)` will stay in the current story and navigate 5 pages forward

#### show

**Parameters**

-   string or null: the URL of the story to show.
-   string (optional): the ID attribute of the page element.

Will change the current story being displayed by the player.

```javascript
player.show('cool-story.html'); // Will display cool-story.html
player.show('cool-story.html', 'page-4'); // Will display cool-story.html and switch to page-4
player.show(null, 'page-4'); // Stay on current story and switch to page-4
```

#### add

**Parameters**

-   array of story objects

Each story object contains the following properties:

-   href string: story URL
-   title string (optional): story title, to be added to the anchor's title
-   posterImage string (optional): a URL for the story poster. Used as a placeholder while the story loads.

The player will rewrite the URL using the AMP Cache prefix if provided in the [player level attribute](#amp-cache).

```javascript
player.add([
 {href: '/stories/1', title: 'A great story', posterImage: 'poster1.png'},
 {href: '/stories/2', posterImage: 'poster2.png'},
 {href: '/stories/3'},
]);
```

#### mute/unmute

Will mute/unmute the current story. This will not persist across stories, eg. calling `player.mute()` on the first story will not mute the second story.

Please note that due to browser restrictions on autoplaying media with sound, the default state is muted and the story cannot be unmuted unless the user manually unmuted previously. Only webviews explicitly allowing autoplaying media with sound can use `unmute()` right away.

```javascript
player.mute();
player.unmute();
```

#### play/pause

Will play/pause the current story. This will affect e.g. page auto-advancement or media playing.

```javascript
player.play();
player.pause();
```

#### getStoryState

**Parameters**

-   string: the story state, currently only `page-attachment`.

Will cause a custom event to be fired, see `page-attachment-open` and `page-attachment-close`.

```javascript
player.getStoryState('page-attachment');
```

## Autoplay

By default, the first story in the player will automatically start playing when the player becomes visible in the user's viewport.

You can opt-out of the default behavior by using the configuration below. This will prevent the first story in the player to start playing until you call [play()](#play/pause) on the player.

### JSON Configuration

Here's the JSON configuration for opting out of autoplay:

```html
<amp-story-player>
  <script type="application/json">
  {
    "behavior": {
      "autoplay": false
    }
  }
</script>
 <a href="./story1.html"> ... </a>
 <a href="./story2.html"> ... </a>
  ...
```

## Programmatically fetching more stories

You can create an “infinite scroll” experience by fetching more stories as the user navigates through them in your player. Simply use the new JSON configuration to specify an endpoint, and the player will automatically fetch more stories as it gets closer to the last story in the player.

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

Circular wrapping enables users to go back to the first story when they finish the last one. To do this, use the JSON configuration with the `circular-wrapping` action.

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
    <td><img src="https://github.com/ampproject/amphtml/blob/master/src/amp-story-player/img/close-button-left.png?raw=true"></td>
    <td><img src="https://github.com/ampproject/amphtml/blob/master/src/amp-story-player/img/close-and-skip-next.png?raw=true"></td>
<td><img src="https://github.com/ampproject/amphtml/blob/master/src/amp-story-player/img/close-button-custom-background.png?raw=true"></td>
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
         "name": "skip-next"
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

### Skip-next

Skips to the next story inside the player (only available on desktop).

The “skip-next” control supports the following customizable properties:

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
    <td><img src="https://github.com/ampproject/amphtml/blob/master/src/amp-story-player/img/lightbox-close-button.png?raw=true"></td>
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
         "name": "skip-next"
       }
     ],
   }
 </script>
 ...
</amp-story-player>
      </pre>
    </td>
    <td><img src="https://github.com/ampproject/amphtml/blob/master/src/amp-story-player/img/skip-next-desktop.png?raw=true"></td>
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
    <td><img src="https://github.com/ampproject/amphtml/blob/master/src/amp-story-player/img/close-button-custom-background.png?raw=true"></td>
  </tr>
</table>

## Custom Events

#### ready

Fired when the player is ready for interaction. There is also a sync property `isReady` that can be used to avoid race conditions.

```javascript
player.addEventListener('ready', () => {
  console.log('Player is ready!!');
})

if (player.isReady) {
   console.log('Player is ready!');
}
```

#### navigation

Fired when the player changes to a new story and provides the `index`, the player's story after changing, and `remaining`, the number of stories left.

```javascript
player.addEventListener('navigation', (event) => {
  console.log('Navigated from story 0 to story 1 of 3');
  console.log('Current story:' event.index); // 1
  console.log('Current story:' event.remaining); // 1
})
```

#### storyNavigation

Fired when the story inside the player changes to a new page. It provides the `pageId` and `progress` of the story. The progress is the completion percentage of the story represented as a number between 0 and 1.

```javascript
player.addEventListener('storyNavigation', (event) => {
  console.log('User navigated from one page to the other.');
  console.log('Current page id:' event.pageId); // page-2
  console.log('Story progress:' event.progress); // Number from 0 to 1.
})
```

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

#### amp-story-player-close

Fired when the exit control close button is clicked.

```javascript
player.addEventListener('amp-story-player-close', () => {
  console.log('Close button clicked');
})
```

#### page-attachment-open

Fired when a page attachment is opened or `getStoryState('page-attachment')` was called and the story's page attachment is open.

```javascript
player.addEventListener('page-attachment-open', () => {
  console.log('The page attachment is open');
})
```

#### page-attachment-close

Fired when a page attachment is closed or `getStoryState('page-attachment')` was called and the story's page attachment is closed.

```javascript
player.addEventListener('page-attachment-close', () => {
  console.log('The page attachment is closed');
})
```

### Example

This makes use of `page-attachment-close`, `page-attachment-open` and `amp-story-player-back`.

```javascript
player.addEventListener('page-attachment-close', () => {
  textEl.style.backgroundColor = 'blue';
})
player.addEventListener('page-attachment-open', () => {
  textEl.style.backgroundColor = 'red';
})
player.addEventListener('amp-story-back', () => {
  textEl.style.backgroundColor = 'green';
})
```

![Example featuring exit control](img/amp-story-player-toggle-exit.gif)
