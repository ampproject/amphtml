# Bento Embedly Card

Provides responsive and shareable embeds using [Embedly cards](http://docs.embed.ly/docs/cards)

Cards are the easiest way to leverage Embedly. For any media, cards provide a responsive embed with built-in embed analytics.

If you have a paid plan, use the `<bento-embedly-key>` or `<BentoEmbedlyContext.Provider>` component to set your API key. You just need one Bento Embedly key per page to remove Embedly's branding from the cards. Within your page, you can include one or multiple Bento Embedly Card instances.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {defineElement as defineBentoEmbedlyCard} from '@bentoproject/embedly-card';
defineBentoEmbedlyCard();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css" crossorigin="anonymous">
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
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.js"
    ></script>
    <style>
      bento-embedly-card {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-embedly-key value="12af2e3543ee432ca35ac30a4b4f656a">
    </bento-embedly-key>

    <bento-embedly-card
      data-url="https://twitter.com/AMPhtml/status/986750295077040128"
      data-card-theme="dark"
      data-card-controls="0"
    >
    </bento-embedly-card>

    <bento-embedly-card
      id="my-url"
      data-url="https://www.youtube.com/watch?v=LZcKdHinUhE"
    >
    </bento-embedly-card>
  </body>
</html>
```

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-embedly-card {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Container type

The `bento-embedly-card` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties):

```css
bento-embedly-card {
  height: 100px;
  width: 100%;
}
```

### Attributes

#### `data-url`

The URL to retrieve embedding information.

#### `data-card-embed`

The URL to a video or rich media. Use with static embeds like articles, instead of using the static page content in the card, the card will embed the video or rich media.

#### `data-card-image`

The URL to an image. Specifies which image to use in article cards when `data-url` points to an article. Not all image URLs are supported, if the image is not loaded, try a different image or domain.

#### `data-card-controls`

Enables share icons.

-   `0`: Disable share icons.
-   `1`: Enable share icons

The default is `1`.

#### `data-card-align`

Aligns the card. The possible values are `left`, `center` and `right`. The default value is `center`.

#### `data-card-recommend`

When recommendations are supported, it disables embedly recommendations on video and rich cards. These are recommendations created by embedly.

-   `0`: Disables embedly recommendations.
-   `1`: Enables embedly recommendations.

The default value is `1`.

#### `data-card-via` (optional)

Specifies the via content in the card. This is a great way to do attribution.

#### `data-card-theme` (optional)

Allows settings the `dark` theme which changes the background color of the main card container. Use `dark` to set this theme. For dark backgrounds it's better to specify this. The default is `light`, which sets no background color of the main card container.

#### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Embedly card"`.

#### API Example

Programmatically changing any of the attribute values, will automatically update the element. For example, by changing the `data-url` value, you can switch to a different embed:

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
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
    />
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.js"
    ></script>
    <style>
      bento-embedly-card {
        width: 375px;
        height: 472px;
      }
    </style>
  </head>
  <body>
    <bento-embedly-key value="12af2e3543ee432ca35ac30a4b4f656a">
    </bento-embedly-key>

    <bento-embedly-card
      data-url="https://twitter.com/AMPhtml/status/986750295077040128"
      data-card-theme="dark"
      data-card-controls="0"
    >
    </bento-embedly-card>

    <bento-embedly-card
      id="my-url"
      data-url="https://www.youtube.com/watch?v=LZcKdHinUhE"
    >
    </bento-embedly-card>

    <div class="buttons" style="margin-top: 8px">
      <button id="change-url">Change embed</button>
    </div>

    <script>
      (async () => {
        const embedlyCard = document.querySelector('#my-url');
        await customElements.whenDefined('bento-embedly-card');

        // set up button actions
        document.querySelector('#change-url').onclick = () => {
          embedlyCard.setAttribute(
            'data-url',
            'https://www.youtube.com/watch?v=wcJSHR0US80'
          );
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
npm install @bentoproject/embedly-card
```

```javascript
import {BentoEmbedlyCard} from '@bentoproject/embedly-card/react';
import '@bentoproject/embedly-card/styles.css';

function App() {
  return (
    <BentoEmbedlyContext.Provider
      value={{apiKey: '12af2e3543ee432ca35ac30a4b4f656a'}}
    >
      <BentoEmbedlyCard url="https://www.youtube.com/watch?v=LZcKdHinUhE"></BentoEmbedlyCard>
    </BentoEmbedlyContext.Provider>
  );
}
```

### Layout and style

#### Container type

The `BentoEmbedlyCard` component has a defined layout size type. To ensure the component renders correctly, be sure to apply a size to the component and its immediate children (slides) via a desired CSS layout (such as one defined with `height`, `width`, `aspect-ratio`, or other such properties). These can be applied inline:

```jsx
<BentoEmbedlyCard
  style={{width: 300, height: 100}}
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

Or via `className`:

```jsx
<BentoEmbedlyCard
  className="custom-styles"
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Props

#### `url`

The URL to retrieve embedding information.

#### `cardEmbed`

The URL to a video or rich media. Use with static embeds like articles, instead of using the static page content in the card, the card will embed the video or rich media.

#### `cardImage`

The URL to an image. Specifies which image to use in article cards when `data-url` points to an article. Not all image URLs are supported, if the image is not loaded, try a different image or domain.

#### `cardControls`

Enables share icons.

-   `0`: Disable share icons.
-   `1`: Enable share icons

The default is `1`.

#### `cardAlign`

Aligns the card. The possible values are `left`, `center` and `right`. The default value is `center`.

#### `cardRecommend`

When recommendations are supported, it disables embedly recommendations on video and rich cards. These are recommendations created by embedly.

-   `0`: Disables embedly recommendations.
-   `1`: Enables embedly recommendations.

The default value is `1`.

#### `cardVia` (optional)

Specifies the via content in the card. This is a great way to do attribution.

#### `cardTheme` (optional)

Allows settings the `dark` theme which changes the background color of the main card container. Use `dark` to set this theme. For dark backgrounds it's better to specify this. The default is `light`, which sets no background color of the main card container.

#### title (optional)

Define a `title` attribute for the component to propagate to the underlying `<iframe>` element. The default value is `"Embedly card"`.
