# Bento Timeago

Counts up to, or away from, a specified date and time. It replaces the text node with a timestamp in natural language, such as `in 30 years` or `3 hours ago`.

## Web Component

You must include each Bento component's required CSS library before adding custom styles in order to guarantee proper loading. Or use the lightweight pre-uprgrade styles available inline. See [Layout and Style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/timeago
```

```javascript
import {defineElement as defineBentoTimeago} from '@bentoproject/timeago';
defineBentoTimeago();
```

### Include via `<script>`

```html
<script
  type="module"
  async
  src="https://cdn.ampproject.org/bento.mjs"
></script>
<script nomodule src="https://cdn.ampproject.org/bento.js"></script>
<script
  type="module"
  async
  src="https://cdn.ampproject.org/v0/bento-timeago-1.0.mjs"
></script>
<script
  nomodule
  async
  src="https://cdn.ampproject.org/v0/bento-timeago-1.0.js"
></script>
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-timeago-1.0.css"
/>
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
      src="https://cdn.ampproject.org/v0/bento-timeago-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-timeago-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-timeago-1.0.css"
    />
  </head>
  <body>
    <bento-timeago
      id="my-timeago"
      datetime="2017-04-11T00:37:33.809Z"
      locale="en"
      style="height: 30px"
    >
      Saturday 11 April 2017 00.37
    </bento-timeago>
    <div class="buttons" style="margin-top: 8px">
      <button id="ar-button">Change locale to Arabic</button>
      <button id="en-button">Change locale to English</button>
      <button id="now-button">Change time to now</button>
    </div>

    <script>
      (async () => {
        const timeago = document.querySelector('#my-timeago');
        await customElements.whenDefined('bento-timeago');

        // set up button actions
        document.querySelector('#ar-button').onclick = () =>
          timeago.setAttribute('locale', 'ar');
        document.querySelector('#en-button').onclick = () =>
          timeago.setAttribute('locale', 'en');
        document.querySelector('#now-button').onclick = () =>
          timeago.setAttribute('datetime', 'now');
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
  href="https://cdn.ampproject.org/v0/bento-timeago-1.0.css"
/>
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style>
  bento-timeago {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attributes

#### `datetime`

The required `datetime` attribute sets the date and time. The value must be an [ISO datetime](https://www.w3.org/QA/Tips/iso-date).

-   Express time in UTC (Coordinated Universal Time): `2017-03-10T01:00:00Z`
-   Express in local time with a time zone offset: `2017-03-09T20:00:00-05:00`

#### `locale` (optional)

Add the `locale` attribute to specify one of the following values to change the locale. The default value is `en`.

-   `ar` (Arabic)
-   `be` (Belarusian)
-   `bg` (Bulgarian)
-   `bn-IN` (Bangla)
-   `ca` (Catalan)
-   `cs` (Czech)
-   `da` (Danish)
-   `de` (German)
-   `el` (Greek)
-   `en` (English)
-   `en-short` (English - short)
-   `es` (Spanish)
-   `eu` (Basque)
-   `fa` (Persian - Farsi)
-   `fi` (Finnish)
-   `fr` (French)
-   `gl` (Galician)
-   `he` (Hebrew)
-   `hi-IN` (Hindi)
-   `hu` (Hungarian)
-   `id-ID` (Malay)
-   `it` (Italian)
-   `ja` (Japanese)
-   `ka` (Georgian)
-   `ko` (Korean)
-   `ml` (Malayalam)
-   `my` (Burmese - Myanmar)
-   `nb-NO` (Norwegian Bokmål)
-   `nl` (Dutch)
-   `nn-NO` (Norwegian Nynorsk)
-   `pl` (Polish)
-   `pt-BR` (Portuguese)
-   `ro` (Romanian)
-   `ru` (Russian)
-   `sq` (Albanian)
-   `sr` (Serbian)
-   `sv` (Swedish)
-   `ta` (Tamil)
-   `th` (Thai)
-   `tr` (Turkish)
-   `uk` (Ukrainian)
-   `vi` (Vietnamese)
-   `zh-CN` (Chinese)
-   `zh-TW` (Taiwanese)

#### `cutoff`

Add the `cutoff` attribute to display the date specified in the `datatime` attribute after passing the specified date in seconds.

#### API Example

By programmatically changing attribute values, you can dynamically change the text or locale:

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
      src="https://cdn.ampproject.org/v0/bento-timeago-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-timeago-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-timeago-1.0.css"
    />
  </head>
  <body>
    <bento-timeago
      id="my-timeago"
      datetime="2017-04-11T00:37:33.809Z"
      locale="en"
      style="height: 30px"
    >
      Saturday 11 April 2017 00.37
    </bento-timeago>
    <div class="buttons" style="margin-top: 8px">
      <button id="ar-button">Change locale to Arabic</button>
      <button id="en-button">Change locale to English</button>
      <button id="now-button">Change time to now</button>
    </div>

    <script>
      (async () => {
        const timeago = document.querySelector('#my-timeago');

        // set up button actions
        document.querySelector('#ar-button').onclick = () =>
          timeago.setAttribute('locale', 'ar');
        document.querySelector('#en-button').onclick = () =>
          timeago.setAttribute('locale', 'en');
        document.querySelector('#now-button').onclick = () =>
          timeago.setAttribute('datetime', 'now');
      })();
    </script>
  </body>
</html>
```

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/timeago
```

```javascript
import React from 'react';
import {BentoTimeago} from '@bentoproject/timeago/react';
import '@bentoproject/timeago/styles.css';

function App() {
  return (
    <BentoTimeago
      datetime={dateTime}
      locale={locale}
      cutoff={cutoff}
      placeholder={placeholder}
    />
  );
}
```

### Layout and style

The Bento Date Display Preact/React component allows consumers to render their own templates. These templates may use inline styles, `<style>` tags, Preact/React components that import their own stylesheets.

### Props

#### `datetime`

The required `datetime` prop sets the date and time. The value must be an [ISO datetime](https://www.w3.org/QA/Tips/iso-date).

-   Express time in UTC (Coordinated Universal Time): `2017-03-10T01:00:00Z`
-   Express in local time with a time zone offset: `2017-03-09T20:00:00-05:00`

#### `locale` (optional)

Add the `locale` prop to one of the following values to change the locale. The default value is `en`.

-   `ar` (Arabic)
-   `be` (Belarusian)
-   `bg` (Bulgarian)
-   `bn-IN` (Bangla)
-   `ca` (Catalan)
-   `cs` (Czech)
-   `da` (Danish)
-   `de` (German)
-   `el` (Greek)
-   `en` (English)
-   `en-short` (English - short)
-   `es` (Spanish)
-   `eu` (Basque)
-   `fa` (Persian - Farsi)
-   `fi` (Finnish)
-   `fr` (French)
-   `gl` (Galician)
-   `he` (Hebrew)
-   `hi-IN` (Hindi)
-   `hu` (Hungarian)
-   `id-ID` (Malay)
-   `it` (Italian)
-   `ja` (Japanese)
-   `ka` (Georgian)
-   `ko` (Korean)
-   `ml` (Malayalam)
-   `my` (Burmese - Myanmar)
-   `nb-NO` (Norwegian Bokmål)
-   `nl` (Dutch)
-   `nn-NO` (Norwegian Nynorsk)
-   `pl` (Polish)
-   `pt-BR` (Portuguese)
-   `ro` (Romanian)
-   `ru` (Russian)
-   `sq` (Albanian)
-   `sr` (Serbian)
-   `sv` (Swedish)
-   `ta` (Tamil)
-   `th` (Thai)
-   `tr` (Turkish)
-   `uk` (Ukrainian)
-   `vi` (Vietnamese)
-   `zh-CN` (Chinese)
-   `zh-TW` (Taiwanese)

#### `cutoff`

Add the `cutoff` prop to display the date specified in the `datetime` prop after passing the specified date in seconds.

#### `placeholder`

Add the `placeholder` props to display the fallback text. The calculated timestamp will replace the placeholder text once ready.
