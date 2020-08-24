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

<figure class="centered-fig">
  <amp-anim alt="amp-story-player example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/spec/img/amp-story-player.gif">
    <noscript>
    <img alt="amp-story-player example" src="https://github.com/ampproject/amphtml/raw/master/spec/img/amp-story-player.gif" />
  </noscript>
  </amp-anim>
</figure>

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Embed and play stories in a non-AMP website.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Scripts</strong></td>
    <td>
    <code>&lt;script async src="https://cdn.ampproject.org/amp-story-player-v0.js">&lt;/script></code>
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
  <amp-story-player style="width: 360px; height: 600px;">
    <a
      href="https://preview.amp.dev/documentation/examples/introduction/stories_in_amp/"
      style="--story-player-poster: url('https://amp.dev/static/samples/img/story_dog2_portrait.jpg')"
    >
      Stories in AMP - Hello World
    </a>
  </amp-story-player>
</body>
```

[/example]

### Attributes

The inline width and height ensures that the player will not cause any jumps in your website while the script is being loaded. Feel free to modify the values, but we recommend maintaining a 3:5 aspect ratio.

#### style [recommended]

Inline CSS properties for the width and height of the player. e.g. `style="width: 360px; height: 600px;"`

#### exit-control

e.g. `<amp-story-player exit-control="close-button">`

Set to `back-button` or `close-button`. The button will dispatch an `amp-story-player-back` or `amp-story-player-close` when clicked. This button will disappear when a page attachment is open and reappear when closed.

#### amp-cache

e.g. `<amp-story-player amp-cache="cdn.ampproject.org">`

If specified, the player will rewrite the URL using the AMP Cache prefix provided. Currently there are two AMP Cache providers:

- `cdn.ampproject.org`
- `www.bing-amp.com`

## Specify embedded stories

The `<amp-story-player>` component contains one or more `<a>` tags. Point the href attribute of each to the story URL.

Place the story's title within the `<a>` tag. This provides a better user experience and allows search engines to crawl embedded stories.

Use a poster image as a placeholder to display to users while the story loads. Add the `--story-player-poster` CSS variable as an inline style of the `<a>` tag and point to the poster image URL.

### Attributes

#### href

URL pointing to the story.

#### style="--story-player-poster: url('...');" [recommended]

CSS variable with the URL pointing to the poster image of the story.

```html
<amp-story-player style="width: 360px; height: 600px;">
  <a
    href="https://www.example.com/story.html"
    style="--story-player-poster: url('https://www.example.com/assets/cover1.html');"
  >
    A title that describes this story.
  </a>
</amp-story-player>
```

## Programmatic Control

Call the player's various methods to programmatically control the player. These methods are exposed on the HTML element, `const playerEl = document.querySelector('amp-story-player')` and on instances of the global class variable,`const player = new AmpStoryPlayer(window, playerEl)`.

### Methods

#### load

Will initialize the player manually. This can be useful when the player is dynamically.

```
const playerEl = document.body.querySelector('amp-story-player');
const player = new AmpStoryPlayer(window, playerEl);
player.load();
```

#### go

**Parameters**

- number: the story in the player to which you want to move, relative to the current story.

If the player is currently on the third story out of five stories:

- `player.go(1)` will go forward one story to the fourth story
- `player.go(-1)` will go backward one story to the second story
- If no value is passed or if delta equals 0, current story will persist and no action will be taken.

#### show

**Parameters**

- string: the URL of the story to show.

Will change the current story being displayed by the player.

```
player.show(url);
```

#### add

**Parameters**

- array of story objects

Each story object contains the following properties:

- href string: story URL
- title string (optional): story title, to be added to the anchor's title
- posterImage string (optional): a URL for the story poster. Used as a placeholder while the story loads.

The player will rewrite the URL using the AMP Cache prefix if provided in the [player level attribute](#amp-cache).

```
player.add([
 {href: '/stories/1', title: 'A great story', posterImage: 'poster1.png'},
 {href: '/stories/2', posterImage: 'poster2.png'},
 {href: '/stories/3'},
]);
```

#### mute/unmute

Will mute/unmute the current story. This will not persist across stories, eg. calling `player.mute()` on the first story will not mute the second story.

Please note that due to browser restrictions on autoplaying media with sound, the default state is muted and the story cannot be unmuted unless the user manually unmuted previously. Only webviews explicitly allowing autoplaying media with sound can use `unmute()` right away.

```
player.mute();
player.unmute();
```

#### play/pause

Will play/pause the current story. This will affect e.g. page auto-advancement or media playing.

```
player.play();
player.pause();
```

#### getStoryState

**Parameters**

- string: the story state, currently only `page-attachment`.

Will cause a custom event to be fired, see `page-attachment-open` and `page-attachment-close`.

```
player.getStoryState('page-attachment');
```

## Custom Events

#### ready

Fired when the player is ready for interaction. There is also a sync property `isReady` that can be used to avoid race conditions.

```
player.addEventListener('ready', () => {
  console.log('Player is ready!!');
})

if (player.isReady) {
   console.log('Player is ready!');
}
```

#### navigation

Fired when the player changes to a new story and provides the `index`, the player's story after changing, and `remaining`, the number of stories left.

```
player.addEventListener('navigation', (event) => {
  console.log('Navigated from story 0 to story 1 of 3');
  console.log('Current story:' event.index); // 1
  console.log('Current story:' event.remaining); // 1
})
```

#### amp-story-player-back

Fired when the exit control back button is clicked.

```
player.addEventListener('amp-story-player-back', () => {
  console.log('Back button clicked');
})
```

#### amp-story-player-close

Fired when the exit control close button is clicked.

```
player.addEventListener('amp-story-player-close', () => {
  console.log('Close button clicked');
})
```

#### page-attachment-open

Fired when a page attachment is opened or `getStoryState('page-attachment')` was called and the story's page attachment is open.

```
player.addEventListener('page-attachment-open', () => {
  console.log('The page attachment is open');
})
```

#### page-attachment-close

Fired when a page attachment is closed or `getStoryState('page-attachment')` was called and the story's page attachment is closed.

```
player.addEventListener('page-attachment-close', () => {
  console.log('The page attachment is closed');
})
```

### Example

This makes use of `page-attachment-close`, `page-attachment-open` and `amp-story-player-back`.

```
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
