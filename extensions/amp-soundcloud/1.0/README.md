# Bento Soundcloud

Embeds a [Soundcloud](https://soundcloud.com) clip.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css" crossorigin="anonymous">
```

### Example

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
    />
    <style>
      bento-soundcloud {
        width: 300px;
        height: 300px;
      }
    </style>
  </head>
  <body>
    <bento-soundcloud
      id="my-track"
      data-trackid="89299804"
      data-visual="true"
    ></bento-soundcloud>
  </body>
</html>
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Container type

The `bento-soundcloud` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Attributes

Programmatically changing one of the attributes will result in the player being automatically updated.

<!--% example %-->

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/bento.mjs"
    ></script>
    <script nomodule src="https://cdn.ampproject.org/bento.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
    />
    <style>
      bento-soundcloud {
        width: 300px;
        height: 300px;
      }
    </style>
  </head>
  <body>
    <bento-soundcloud
      id="my-track"
      data-trackid="89299804"
      data-visual="true"
    ></bento-soundcloud>
    <div class="buttons" style="margin-top: 8px">
      <button id="change-track">Change track</button>
    </div>

    <script>
      (async () => {
        const soundcloud = document.querySelector('#my-track');
        await customElements.whenDefined('bento-soundcloud');

        // set up button actions
        document.querySelector('#change-track').onclick = () => {
          soundcloud.setAttribute('data-trackid', '243169232');
          soundcloud.setAttribute('data-color', 'ff5500');
          soundcloud.removeAttribute('data-visual');
        };
      })();
    </script>
  </body>
</html>
```

##### data-track

This attribute is required if <code>data-playlistid</code> is not defined. The value for this attribute is the ID of a track, an integer.

##### data-playlistid

This attribute is required if <code>data-trackid</code> is not defined. The value for this attribute is the ID of a playlist, an integer.

##### data-secret-token (optional)

The secret token of the track, if it is private.

##### data-visual (optional)

If set to <code>true</code>, displays full-width "Visual" mode; otherwise, it displays as "Classic" mode. The default value is <code>false</code>.

##### data-color (optional)

This attribute is a custom color override for the "Classic" mode. The attribute is ignored in "Visual" mode. Specify a hexadecimal color value, without the leading # (e.g., <code>data-color="e540ff"</code>).

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import React from 'react';
import {BentoSoundcloud} from '@bentoproject/soundcloud/react';
import '@bentoproject/soundcloud/styles.css';

function App() {
  return <BentoSoundcloud trackId="243169232" visual={true}></BentoSoundcloud>;
}
```

### Layout and style

#### Container type

The `BentoSoundcloud` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Or via `className`:

```jsx
<BentoSoundcloud
  className="custom-styles"
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Props

##### trackId

This attribute is required if <code>data-playlistid</code> is not defined.
The value for this attribute is the ID of a track, an integer.

##### playlistId

This attribute is required if <code>data-trackid</code> is not defined.
The value for this attribute is the ID of a playlist, an integer.

##### secretToken (optional)

The secret token of the track, if it is private.

##### visual (optional)

If set to <code>true</code>, displays full-width "Visual" mode; otherwise, it displays as "Classic" mode. The default value is <code>false</code>.

##### color (optional)

This attribute is a custom color override for the "Classic" mode. The attribute is ignored in "Visual" mode. Specify a hexadecimal color value, without the leading # (e.g., <code>data-color="e540ff"</code>).
