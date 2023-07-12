# Bento Date Display

Displays time data that you can render in your page. By providing specific [attributes](#attributes) in the Bento Date Display tag, the Bento Date Display extension returns a list of time parameters, which you can pass to [an amp-mustache template](../../amp-mustache/amp-mustache.md) for rendering. Refer to the [list below for each returned time parameter](#returned-time-parameters).

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Example: Import via npm

Install via npm:

```sh
npm install @bentoproject/bento-date-display
```

```javascript
import {defineElement as defineBentoDateDisplay} from '@bentoproject/bento-date-display';
defineBentoDateDisplay();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<!-- Include bento-mustache.js to use mustache templates with this component -->
<script async src="https://cdn.ampproject.org/v0/bento-mustache.js"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-date-display-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-date-display-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-date-display-1.0.css" crossorigin="anonymous">
```

### Example

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
    <script async src="https://cdn.ampproject.org/v0/bento-mustache.js"></script>
    <script
      type="module"
      async
      src="https://cdn.ampproject.org/v0/bento-date-display-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-date-display-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-date-display-1.0.css"
    />
  </head>
  <body>
    <bento-date-display
      datetime="2021-09-09T16:02:08.494Z"
      displayIn="utc"
      locale="en-GB"
    >
      <template>
        <div>ISO: {{iso}}; locale: {{localeString}}</div>
      </template>
    </bento-date-display>
  </body>
</html>
```

### Interactivity and API usage

The Bento Date Display component does not have an imperative API. However, the Bento Date Display Web Component will render a mustache-template, provided by the consumer in a `<template>` tag with `type="amp-mustache"`. This template may interpolate date-related parameters. See the [Returned Time Parameters section](#returned-time-parameters) for a full list of all the available parameters.

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/bento-date-display-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  bento-date-display {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attributes

#### `datetime`

The `datetime` attribute specifies the date and time in a standard ISO 8601 date
string (e.g. 2017-08-02T15:05:05.000Z) or the string `now`. If set to `now`,
`bento-date-display` will use the time the page loaded to render its template.

#### `timestamp-ms`

The `timestamp-ms` attribute specifies the date and time using the number of
milliseconds since 1970-01-01T0:00:00.000Z

#### `timestamp-seconds`

The `timestamp-seconds` attribute specifies the date and time using the number
of seconds since 1970-01-01T0:00:00.000Z

#### `locale` (optional)

An internationalization language string for each timer unit. The default value
is `en` (for English). This attribute supports all values that are supported by
the user's browser.

#### `display-in` (optional)

If set to the value `utc`, the `display-in` attribute will convert the given
date to UTC.

#### `offset-seconds` (optional)

The `offset-seconds` attribute specifies an integer number of seconds to shift
the given date.

#### `data-options-\*` (optional)

The `data-options-*` supports all the options under [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters)
parameter that specifies the formatting style to use for `localeString` format.
Valid attributes include: `data-options-date-style`, `data-options-time-style`, etc.

Note that if `display-in` attrubute is set to `utc`, the value of
`data-options-time-zone` will automatically be converted to `UTC`.

### Styling

You may use the `bento-date-display` element selector to style the Bento Date Display component freely.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/date-display
```

```javascript
import React from 'react';
import {BentoDateDisplay} from '@bentoproject/date-display/react';
import '@bentoproject/date-display/styles.css';

function App() {
  return (
    <BentoDateDisplay
      datetime={dateTime}
      displayIn={displayIn}
      locale={locale}
      render={(date) => (
        <div>{`ISO: ${date.iso}; locale: ${date.localeString}`}</div>
      )}
    />
  );
}
```

### Interactivity and API usage

The Bento Date Display component does not have an imperative API. However, the Bento Date Display Preact/React component does accept a `render` prop that renders the consumer's template. This `render` prop should be a function which the Bento Date Display Preact/React component can use to render its template. The `render` callback will be provided a variety of date-related parameters for consumers to interpolate in the rendered template. See the [`render` prop section](#render) for more information.

### Layout and style

The Bento Date Display Preact/React component allows consumers to render their own templates. These templates may use inline styles, `<style>` tags, Preact/React components that import their own stylesheets.

### Props

#### `datetime`

Required prop. Denotes the date and time as a Date, String, or Number. If String, must be a standard ISO 8601 date string (e.g. 2017-08-02T15:05:05.000Z) or the string `now`. If set to `now`, it will use the time the page loaded to render its template. If Number, must be a POSIX epoch value in milliseconds.

#### `displayIn`

Optional prop that can be either `"utc"` or `"local"` and defaults to `"local"`. This prop indicates what timezone to display the date in. If set to the value `"utc"`, the component will convert the given date to UTC.

#### `locale`

An internationalization language string for each timer unit. The default value is `en` (for English). This prop supports all values that are supported by the user's browser.

#### `localeOptions`

The `localeOptions` object supports all the options under [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) parameter that specifies the formatting style to use for `localeString` format.

Note that if the `displayIn` prop is set to `utc`, the value of `localeOptions.timeZone` will automatically be converted to `UTC`.

#### `render`

Optional callback that should render a template. The callback will be provided an object with properties/values related to the date expressed in `datetime`.

By default, the Bento Date Display component will display the [`localeString` form of the Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) for the given locale and localeOption. See the [Returned Time Parameters section](#returned-time-parameters) for more details on how each property will be displayed.

```typescript
(dateParams: DateParams) => JSXInternal.Element
interface DateParams {
  day: number;
  dayName: string;
  dayNameShort: string;
  dayPeriod: string;
  dayTwoDigit: string;
  hour: number;
  hour12: number;
  hour12TwoDigit: string;
  hourTwoDigit: string;
  iso: string;
  localeString: string;
  minute: number;
  minuteTwoDigit: string;
  month: number;
  monthName: string;
  monthNameShort: string;
  monthTwoDigit: string;
  second: number;
  secondTwoDigit: string;
  timeZoneName: string;
  timeZoneNameShort: string;
  year: number;
  yearTwoDi: string;
}
```

### Returned Time Parameters

This table lists the format you can specify in your Mustache template:

| Format            | Meaning                                                       |
| ----------------- | ------------------------------------------------------------- |
| day               | 1, 2, ...12, 13, etc.                                         |
| dayName           | string,                                                       |
| dayNameShort      | string,                                                       |
| dayPeriod         | string,                                                       |
| dayTwoDigit       | 01, 02, 03, ..., 12, 13, etc.                                 |
| hour              | 0, 1, 2, 3, ..., 12, 13, ..., 22, 23                          |
| hour12            | 1, 2, 3, ..., 12, 1, 2, ..., 11, 12                           |
| hour12TwoDigit    | 01, 02, ..., 12, 01, 02, ..., 11, 12                          |
| hourTwoDigit      | 00, 01, 02, ..., 12, 13, ..., 22, 23                          |
| iso               | A standard ISO8601 date string e.g. 2019-01-23T15:31:21.213Z, |
| localeString      | A string with a language sensitive representation.            |
| minute            | 0, 1, 2, ..., 58, 59                                          |
| minuteTwoDigit    | 00, 01, 02, ..., 58, 59                                       |
| month             | 1, 2, 3, ..., 12                                              |
| monthName         | Internationalized month name string.                          |
| monthNameShort    | Internationalized abbreviated month name string.,             |
| monthTwoDigit     | 01, 02, ..., 11, 12                                           |
| second            | 0, 1, 2, ..., 58, 59                                          |
| secondTwoDigit    | 00, 01, 02, ..., 58, 59                                       |
| timeZoneName      | Internationalized timezone, like `Pacific Daylight Time`      |
| timeZoneNameShort | Internationalized timezone, abbreviated, like `PST`           |
| year              | 0, 1, 2, ..., 1999, 2000, 2001, etc.                          |
| yearTwoDigit      | 00, 01, 02, ..., 17, 18, 19, ..., 98, 99                      |
