# Bento Twitter

Embeds [Twitter](https://twitter.com) content like a Tweet or a Moment.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/twitter
```

```javascript
import {defineElement as defineBentoTwitters} from '@bentoproject/twitter';
defineBentoTwitters();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-twitter-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-twitter-1.0.css" crossorigin="anonymous">
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
      src="https://cdn.ampproject.org/v0/bento-twitter-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-twitter-1.0.css"
    />
    <style>
      bento-twitter {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-twitter id="my-tweet" data-tweetid="885634330868850689"></bento-twitter>
  </body>
</html>
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-twitter-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Container type

The `bento-twitter` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

### Attributes

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (required)</strong></td>
    <td>The ID of the Tweet or Moment, or the source type if a Timeline should be displayed.
In a URL like https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> is the tweet id.
In a URL like https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> is the moment id.
Valid timeline source types include <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code>, and <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (optional)</strong></td>
    <td>When displaying a timeline, further arguments need to be provided in addition to <code>timeline-source-type</code>. For example, <code>data-timeline-screen-name="amphtml"</code> in combination with <code>data-timeline-source-type="profile"</code> will display a timeline of the AMP Twitter account.
For details on the available arguments, see the "Timelines" section in <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Twitter's JavaScript Factory Functions Guide</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (optional)</strong></td>
    <td>You can specify options for the Tweet, Moment, or Timeline appearance by setting <code>data-</code> attributes. For example, <code>data-cards="hidden"</code> deactivates Twitter cards.
For details on the available options, see Twitter's docs <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">for tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">for moments</a> and <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">for timelines</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (optional)</strong></td>
    <td>Define a <code>title</code> attribute for the component. The default is <code>Twitter</code>.</td>
  </tr>
</table>

### Interactivity and API usage

Programmatically changing any of the attribute values will automatically update the element. For example, changing the tweet id via `data-tweetid` will automatically load the new tweet:

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
      src="https://cdn.ampproject.org/v0/bento-twitter-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-twitter-1.0.css"
    />
    <style>
      bento-twitter {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-twitter id="my-tweet" data-tweetid="885634330868850689">
    </bento-twitter>
    <div class="buttons" style="margin-top: 8px">
      <button id="change-tweet">Change tweet</button>
    </div>

    <script>
      (async () => {
        const twitter = document.querySelector('#my-tweet');

        // set up button actions
        document.querySelector('#change-tweet').onclick = () => {
          twitter.setAttribute('data-tweetid', '495719809695621121');
        };
      })();
    </script>
  </body>
</html>
```

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/twitter
```

```javascript
import React from 'react';
import {BentoTwitter} from '@bentoproject/twitter/react';
import '@bentoproject/twitter/styles.css';

function App() {
  return <BentoTwitter tweetid="1356304203044499462"></BentoTwitter>;
}
```

### Layout and style

#### Container type

The `BentoTwitter` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoTwitter
  style={{width: 300, height: 100}}
  tweetid="1356304203044499462"
></BentoTwitter>
```

Or via `className`:

```jsx
<BentoTwitter
  className="custom-styles"
  tweetid="1356304203044499462"
></BentoTwitter>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

## Props

<table>
  <tr>
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (required)</strong></td>
    <td>The ID of the Tweet or Moment, or the source type if a Timeline should be displayed.
In a URL like https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> is the tweet id.
In a URL like https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> is the moment id.
Valid timeline source types include <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code>, and <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (optional)</strong></td>
    <td>When displaying a tweet, further arguments can be provided in addition to <code>tweetid</code>. For example, <code>cards="hidden"</code> in combination with <code>conversation="none"</code> will display a tweet without additional thumbnails or comments.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (optional)</strong></td>
    <td>When displaying a moment, further arguments can be provided in addition to <code>moment</code>. For example, <code>limit="5"</code> will display an embedded moment with up to five cards.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (optional)</strong></td>
    <td>When displaying a timeline, further arguments can be provided in addition to <code>timelineSourceType</code>. For example, <code>timelineScreenName="amphtml"</code> in combination with <code>timelineSourceType="profile"</code> will display a timeline of the AMP Twitter account.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (optional)</strong></td>
    <td>You can specify options for the Tweet, Moment, or Timeline appearance by passing in an object to the <code>options</code> prop.
For details on the available options, see Twitter's docs <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">for tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">for moments</a> and <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">for timelines</a>. Note: When passing in the `options` prop, make sure to optimize or memoize the object:
<pre><code>const TWITTER_OPTIONS = {
  // make sure to define these once globally!
};
function MyComponent() {
  // etc
  return (
    &ltTwitter optionsProps={TWITTER_OPTIONS} /&gt;
  );
}</code></pre></td>

  </tr>
   <tr>
    <td width="40%"><strong>title (optional)</strong></td>
    <td>Define a <code>title</code> for the component iframe. The default is <code>Twitter</code>.</td>
  </tr>
</table>
