# Bento Reddit

Embeds a [Reddit](https://reddit.com) post or a comment on a Reddit post.

## Web Component

You must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/reddit
```

```javascript
import {defineElement as defineBentoReddit} from '@bentoproject/reddit';
defineBentoReddit();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-reddit-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-reddit-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-reddit-1.0.css" crossorigin="anonymous">
```

#### Example

##### Embed a Reddit Post

<!--% example %-->

```html
<!DOCTYPE html>
<html>
    <head>
      <script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
      <script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
      <script type="module" src="https://cdn.ampproject.org/v0/bento-reddit-1.0.mjs" crossorigin="anonymous"></script>
      <script nomodule src="https://cdn.ampproject.org/v0/bento-reddit-1.0.js" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-reddit-1.0.css" crossorigin="anonymous">
      <style>
          bento-reddit {
              width: 300px;
              height: 400px;
          }
      </style>
    </head>
    <body>
      <bento-reddit
        style="width: 300; height: 400;"
        data-embed-type="post"
        data-src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
      >
      </bento-reddit>
    </body>
</html>
```

##### Embed a Reddit Comment

<!--% example %-->

```html
<!DOCTYPE html>
<html>
    <head>
      <script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
      <script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
      <script type="module" src="https://cdn.ampproject.org/v0/bento-reddit-1.0.mjs" crossorigin="anonymous"></script>
      <script nomodule src="https://cdn.ampproject.org/v0/bento-reddit-1.0.js" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-reddit-1.0.css" crossorigin="anonymous">
      <style>
          bento-reddit {
              width: 300px;
              height: 400px;
          }
      </style>
    </head>
    <body>
      <bento-reddit
        style="width: 300; height: 400;"
        data-embed-type="comment"
        data-src="https://www.reddit.com/r/sports/comments/54loj1/50_cents_awful_1st_pitch_given_a_historical/d8306kw"
        data-uuid="b1246282-bd7b-4778-8c5b-5b08ac0e175e"
        data-embed-created="2016-09-26T21:26:17.823Z"
        data-embed-parent="true"
        data-embed-live="true"
      >
      </bento-reddit>
    </body>
</html>
```

### Layout and Style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-reddit-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-reddit{
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attributes

#### `data-embedtype`

The type of the embed, either `post` or `comment`.

#### `data-src`

The permalink uri for the post or comment.

#### `data-uuid`(optional)

The provided UUID for the comment embed.
Supported when `data-embedtype` is `comment`.

#### `data-embedcreated` (optional)

The datetime string for the comment embed.
Supported when `data-embedtype` is `comment`.

#### `data-embedparent` (optional)

Indicates whether the parent comment for the embedded comment should be displayed.
Supported when `data-embedtype` is `comment`.

#### `data-embedlive` (optional)

Indicates whether the embedded comment should update if the original comment is updated.
Supported when `data-embedtype` is `comment`.

#### title (optional)

Define a `title` attribute for the component. The default is `Reddit`.

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/reddit
```

```javascript
import React from 'react';
import {BentoReddit} from '@bentoproject/reddit/react';
import '@bentoproject/reddit/styles.css';

function App() {
  return (
      <BentoReddit
        style={{width: 300, height: 200, border: '8px solid red'}}
        embedType="post"
        src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
      ></BentoReddit>
  );
}
```

### Props

#### `embedType`

The type of the embed, either `post` or `comment`.

#### `src`

The permalink uri for the post or comment.

#### `uuid`(optional)

The provided UUID for the comment embed.
Supported when `data-embedtype` is `comment`.

#### `embedCreated` (optional)

The datetime string for the comment embed.
Supported when `data-embedtype` is `comment`.

#### `embedParent` (optional)

Indicates whether the parent comment for the embedded comment should be displayed.
Supported when `data-embedtype` is `comment`.

#### `embedLive` (optional)

Indicates whether the embedded comment should update if the original comment is updated.
Supported when `data-embedtype` is `comment`.

#### title (optional)

Define a `title` attribute for the component. The default is `"Reddit"`.
