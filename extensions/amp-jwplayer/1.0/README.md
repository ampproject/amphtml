# Bento Jwplayer

Displays a cloud-hosted JW Player in an iframe.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/jwplayer
```

```javascript
import {defineElement as defineBentoJwplayer} from '@bentoproject/jwplayer';
defineBentoJwplayer();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.css" crossorigin="anonymous">
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
      src="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.css"
    />
  </head>
  <body>
    <bento-jwplayer
      id="jwplayer"
      data-player-id="BjcwyK37"
      data-media-id="CtaIzmFs"
      style="width: 480px; height: 270px"
    ></bento-jwplayer>
  </body>
</html>
```

### Interactivity and API usage

Bento components are highly interactive through their API. The `bento-jwplayer` component API is accessible by including the following script tag in your document:

```javascript
await customElements.whenDefined('bento-jwplayer');
const jwplayerApi = await document.querySelector('bento-jwplayer').getApi();
```

You can use the API to trigger the available actions (`play`, `pause`, `mute`, `unmute`, `requestFullscreen`):

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
      src="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.css"
    />
  </head>
  <body>
    <bento-jwplayer
      id="jwplayer"
      data-player-id="BjcwyK37"
      data-media-id="CtaIzmFs"
      style="width: 480px; height: 270px"
    ></bento-jwplayer>

    <script>
      (async () => {
        const player = document.querySelector('#jwplayer');
        await customElements.whenDefined('bento-jwplayer');

        const api = player.getApi();
        api.play();
        api.pause();
        api.mute();
        api.unmute();
        api.requestFullscreen();
      })();
    </script>
  </body>
</html>
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-jwplayer-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-jwplayer {
    display: block;
    overflow: hidden;
    position: relative;
  }

  /* Pre-upgrade: size-defining element - hide children. */
  bento-jwplayer:not(.i-amphtml-built)
    > :not([placeholder]):not([slot='i-amphtml-svc']) {
    display: none;
    content-visibility: hidden;
  }
</style>
```

### Attributes

<table>
  <tr>
    <td width="40%"><strong>data-player-id</strong></td>
    <td>JW Platform player id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/players">Players</a> section in your JW Player Dashboard. (<strong>Required</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-media-id</strong></td>
    <td>The JW Platform media id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content">Content</a> section in your JW Player Dashboard. (<strong>Required if <code>data-playlist-id</code> is not defined.</strong>). Note: <code>outstream</code> is also a valid value.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlist-id</strong></td>
    <td>The JW Platform playlist id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content/playlists">Playlists</a> section in your JW Player Dashboard. If both <code>data-playlist-id</code> and <code>data-media-id</code> are specified, <code>data-playlist-id</code> takes precedence. (<strong>Required if <code>data-media-id</code> is not defined.</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-search</strong></td>
    <td>Denotes the type of the playlist. If contextual article matching is desired, use the value <code>`__CONTEXTUAL__`</code>. If a search playlist is desired, input a keyword or phrase used to generate the search playlist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content-backfill</strong></td>
    <td>Ensures that a search or contextual playlist always returns a result. If there are no relevant results for the given query, this parameter ensures that a list of trending videos are served instead. (Boolean with default: <code>true</code>)</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-player-querystring</strong></td>
    <td>A querystring of parameters that will be added to the player iframe src. This can be used for things like token signing.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-player-param-*</strong></td>
    <td>An attribute that will be added as a query parameter to the player iframe src.
    <br />
    <br />
    Keys and values will be URI encoded. Keys will be camel cased.
    <ul>
      <li><code>data-player-param-token="abc"</code> becomes <code>&token=abc</code></li>
      <li><code>data-player-param-custom-data="key:value;key2:value2"</code> becomes <code>&customData=key%3Avalue%3Bkey2%3Avalue2</code></li>
    </ul>
    An alternative to using <code>data-player-querystring</code>.
    </td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-ad-cust-params</strong></td>
    <td>A JSON string of custom parameters to add to ad tags.
    <pre><code>data-ad-cust-params='{
      "key1": "value"
    }'
    </code></pre>
    </td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-ad-macro-*</strong></td>
    <td>An attribute used to override the default value of macros in ad tags. Supported macros include:
    <ul>
      <li>domain</li>
      <li>referrer</li>
      <li>page-url</li>
      <li>item-{custparam}</li>
      <li>item-{custparam}-list</li>
    </ul>
    <code>data-ad-macro-domain="jwplayer.com"</code> would instead substitute "jwplayer.com" in for the <code>__domain__</code> macro.
    <br />
    <br />
    See JW Player's <a href="https://support.jwplayer.com/articles/ad-tag-targeting-macro-reference">Ad Tag Targeting Macros</a> for more information.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-config-plugin-url</strong></td>
    <td>A url string used to pass external JS plugins to the player.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-config-skin-url</strong></td>
    <td>A url string used to pass external CSS skins to the player. See JW Player's <a href="https://developer.jwplayer.com/jwplayer/docs/jw8-css-skin-reference">CSS Skin Reference</a> for more information.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>data-config-json</strong></td>
    <td>A JSON string of a player config. This can be used to set specific configuration properties on the player.
    <pre><code>data-config-json='{"playbackRateControls":true,"displaytitle":false}'
    </code></pre>
    Advertising configurations can also be specified using this.
    <pre><code>data-config-json='{
      "advertising": {
        "client": "vast",
        "schedule": [
          {
            "tag": "http://adserver.com/vastTag.xml",
            "offset": "pre"
          }
        ]
      }
    }'
    </code></pre>
    <strong>Media and Float on Scroll properties cannot be configured with this attribute</strong>. Update media properties in your JW Player Dashboard. See JW Player's <a href="https://developer.jwplayer.com/jwplayer/docs/jw8-player-configuration-reference">Player Configuration Reference</a> for more information.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically played as soon as it becomes visible. There are some conditions that the component needs to meet to be played, <a href="https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    <br />
    For more details, see <a href="https://amp.dev/documentation/components/amp-video-docking">documentation on the docking extension itself.</a></td>
  </tr>
</table>

### Styling

You may use the `bento-jwplayer` element selector to style the accordion freely.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/jwplayer
```

```javascript
import React from 'react';
import {BentoMathml} from '@bentoproject/jwplayer/react';
import '@bentoproject/jwplayer/styles.css';

function App() {
  return (
    <BentoJwplayer
      playerId={'uoIbMPm3'}
      mediaId={'BZ6tc0gy'}
      style={{width: 480, height: 270}}
      {...args}
    ></BentoJwplayer>
  );
}
```

### Layout and style

#### Container type

The `BentoMathml` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoMathml style={{width: 300, height: 100}}>...</BentoMathml>
```

Or via `className`:

```jsx
<BentoMathml className="custom-styles">...</BentoMathml>
```

```css
.custom-styles {
  background-color: red;
  width: '300px';
  height: '100px';
}
```

### Props

<table>
  <tr>
    <td width="40%"><strong>playerId</strong></td>
    <td>JW Platform player id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/players">Players</a> section in your JW Player Dashboard. (<strong>Required</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>mediaId</strong></td>
    <td>The JW Platform media id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content">Content</a> section in your JW Player Dashboard. (<strong>Required if <code>playlistId</code> is not defined.</strong>). Note: <code>outstream</code> is also a valid value.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>The JW Platform playlist id. This is an 8-digit alphanumeric sequence that can be found in the <a href="https://dashboard.jwplayer.com/#/content/playlists">Playlists</a> section in your JW Player Dashboard. If both <code>playlistId</code> and <code>mediaId</code> are specified, <code>playlist-id</code> takes precedence. (<strong>Required if <code>media-id</code> is not defined.</strong>)</td>
  </tr>
  <tr>
    <td width="40%"><strong>contentSearch</strong></td>
    <td>Denotes the type of the playlist. If a search playlist is desired, input a keyword or phrase used to generate the search playlist.</td>
  </tr>
  <tr>
    <td width="40%"><strong>contentBackfill</strong></td>
    <td>Ensures that a search or contextual playlist always returns a result. If there are no relevant results for the given query, this parameter ensures that a list of trending videos are served instead. (Boolean with default: <code>true</code>)</td>
  </tr>
  <tr>
    <td  width="40%"><strong>queryParams</strong></td>
    <td>A object of keys and values that should be appended to the player iframe src. This can be used for things like token signing. Keys and values will be URI encoded. Keys will be camel cased.
      <ul>
        <li><code>player-param-token="abc"</code> becomes <code>&token=abc</code></li>
        <li><code>player-param-custom-data="key:value;key2:value2"</code> becomes <code>&customData=key%3Avalue%3Bkey2%3Avalue2</code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td  width="40%"><strong>adCustParams</strong></td>
    <td>A JSON string of custom parameters to add to ad tags.
    <pre><code>adCustParams={JSON.stringify({key1: "value"})}</code></pre>
    </td>
  </tr>
  <tr>
    <td  width="40%"><strong>adMacros</strong></td>
    <td>A property used to override the default value of macros in ad tags. Supported macros include:
    <ul>
      <li>domain</li>
      <li>referrer</li>
      <li>page-url</li>
      <li>item-{custparam}</li>
      <li>item-{custparam}-list</li>
    </ul>
    <code>ad-macro-domain="jwplayer.com"</code> would instead substitute "jwplayer.com" in for the <code>__domain__</code> macro.
    <br />
    <br />
    See JW Player's <a href="https://support.jwplayer.com/articles/ad-tag-targeting-macro-reference">Ad Tag Targeting Macros</a> for more information.</td>
  </tr>
  <tr>
    <td  width="40%"><strong>config</strong></td>
    <td>An object to pass through various bits of configuration.
    Accepts A <code>skinUrl</code> string used to pass external CSS skins to the player. See JW Player's <a href="https://developer.jwplayer.com/jwplayer/docs/jw8-css-skin-reference">CSS Skin Reference</a> for more information.
    Accepts a <code>pluginUrl</code> string used to pass external JS plugins to the player.
    Accepts a json property with a JSON string of a player config. This can be used to set specific configuration properties on the player. Advertising configurations can also be specified using this.
     ```javascript
     config={{
       skinUrl: 'https://playertest.longtailvideo.com/skins/ethan.css',
       pluginUrl: 'https://playertest.longtailvideo.com/plugins/newsticker.js',
       json: {
         playbackRateControls: true,
         displaytitle: false,
         advertising: {
           client: "vast",
           schedule: [
             {
               tag: "http://adserver.com/vastTag.xml",
               offset: "pre"
             }
           ]
         }
       }
    }}
    ```
    <strong>Media and Float on Scroll properties cannot be configured with this attribute</strong>. Update media properties in your JW Player Dashboard. See JW Player's <a href="https://developer.jwplayer.com/jwplayer/docs/jw8-player-configuration-reference">Player Configuration Reference</a> for more information.</td>
  </tr>
  <tr>
    <td width="40%"><strong>autoplay</strong></td>
    <td>If this attribute is present, and the browser supports autoplay, the video will be automatically played as soon as it becomes visible. There are some conditions that the component needs to meet to be played, <a href="https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-video-interface.md#autoplay">which are outlined in the Video in AMP spec</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>dock</strong></td>
    <td><strong>Requires <code>amp-video-docking</code> extension.</strong> If this attribute is present and the video is playing manually, the video will be "minimized" and fixed to a corner or an element when the user scrolls out of the video component's visual area.
    <br />
    For more details, see <a href="https://amp.dev/documentation/components/amp-video-docking">documentation on the docking extension itself.</a></td>
  </tr>
</table>
