# Bento Date Countdown

Displays a countdown sequence to a specified date. Refer to the [returned time parameters section](#returned-time-parameters) for information on the available time parameters.

## Web Component

You must include each Bento component's required CSS library to guarantee proper loading and before adding custom styles. Or use the light-weight pre-upgrade styles available inline. See [Layout and style](#layout-and-style).

### Import via npm

```sh
npm install @bentoproject/bento-date-countdown
```

```javascript
import {defineElement as defineBentoDateCountdown} from '@bentoproject/bento-date-countdown';
defineBentoDateCountdown();
```

### Include via `<script>`

```html
<script type="module" src="https://cdn.ampproject.org/bento.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/bento.js" crossorigin="anonymous"></script>
<!-- Include bento-mustache.js to use mustache templates with this component -->
<script async src="https://cdn.ampproject.org/v0/bento-mustache.js"></script>
<script type="module" src="https://cdn.ampproject.org/v0/bento-date-countdown-1.0.mjs" crossorigin="anonymous"></script>
<script nomodule src="https://cdn.ampproject.org/v0/bento-date-countdown-1.0.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-date-countdown-1.0.css" crossorigin="anonymous">
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
      src="https://cdn.ampproject.org/v0/bento-date-countdown-1.0.mjs"
    ></script>
    <script
      nomodule
      async
      src="https://cdn.ampproject.org/v0/bento-date-countdown-1.0.js"
    ></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.ampproject.org/v0/bento-date-countdown-1.0.css"
    />
  </head>
  <body>
    <bento-date-countdown timeleft-ms="200000000" biggest-unit="HOURS">
      <template>
        <div>
          <span>{{days}} {{dd}} {{d}}</span>
          <br>
          <span>{{hours}} {{hh}} {{h}}</span>
          <br>
          <span>{{minutes}} {{mm}} {{m}}</span>
          <br>
          <span>{{seconds}} {{ss}} {{s}}</span>
        </div>
      </template>
    </bento-date-countdown>
  </body>
</html>
```

### Interactivity and API usage

The Bento Date Countdown component does not have an imperative API. However, the Bento Date Countdown Web Component will render a mustache-template, provided by the consumer in a `<template>` tag with `type="amp-mustache"`. This template may interpolate date-related parameters. See the [Returned Time Parameters section](#returned-time-parameters) for a full list of all the available parameters.

### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/bento-date-countdown-1.0.css">
```

Alternatively, you may also make the light-weight pre-upgrade styles available inline:

```html
<style data-bento-boilerplate>
  bento-date-countdown {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Attributes

To provide the datetime to countdown to, you must specify at least one of these required attributes: `end-date`,
`timeleft-ms`, `timestamp-ms`, `timestamp-seconds`.

#### `end-date`

An ISO formatted date to count down to. For example, `2020-06-01T00:00:00+08:00`.

Used to determine the datetime to countdown to.

#### `timestamp-ms`

A POSIX epoch value in milliseconds; assumed to be UTC timezone. For example, `timestamp-ms="1521880470000"`.

Used to determine the datetime to countdown to.

#### `timestamp-seconds`

A POSIX epoch value in seconds; assumed to be UTC timezone. For example, `timestamp-seconds="1521880470"`.

Used to determine the datetime to countdown to.

#### `timeleft-ms`

A value in milliseconds left to be counting down. For example, 48 hours left `timeleft-ms="172800000"`.

Used to determine the datetime to countdown to.

#### `offset-seconds` (optional)

A positive or negative number that represents the number of seconds to add or subtract from the `end-date`. For example, `offset-seconds="60"` adds 60 seconds to the end-date.

#### `when-ended` (optional)

Specifies whether to stop the timer when it reaches 0 seconds. The value can be set to `stop` (default) to indicate the timer to stop at 0 seconds and will not pass the final date or `continue` to indicate the timer should continue after reaching 0 seconds.

#### `locale` (optional)

An internationalization language string for each timer unit. The default value is `en` (for English).

Supported values:

| Code  | Language            |
| ----- | ------------------- |
| de    | German              |
| en    | English             |
| es    | Spanish             |
| fr    | French              |
| id    | Indonesian          |
| it    | Italian             |
| ja    | Japanese            |
| ko    | Korean              |
| nl    | Dutch               |
| pt    | Portuguese          |
| ru    | Russian             |
| th    | Thai                |
| tr    | Turkish             |
| vi    | Vietnamese          |
| zh-cn | Chinese Simplified  |
| zh-tw | Chinese Traditional |

#### `biggest-unit` (optional)

Allows the `bento-date-countdown` component to calculate the time difference based
on the specified `biggest-unit` value. For example, assume there are `50 days 10 hours` left, if the `biggest-unit` is set to `hours`, the result displays
`1210 hours` left.

-   Supported values: `days`, `hours`, `minutes`, `seconds`
-   Default: `days`

#### `count-up` (optional)

Include this attribute to reverse the direction of the countdown to count up instead. This is useful to display the time elapsed since a target date in the past. To continue the countdown when the target date is in the past, be sure to include the `when-ended` attribute with the `continue` value. If the target date is in the future, `bento-date-countdown` will display a decrementing (toward 0) negative value.

### Styling

You may use the `bento-date-countdown` element selector to style the Bento Date Countdown component freely.

---

## Preact/React Component

### Import via npm

```sh
npm install @bentoproject/date-countdown
```

```javascript
import React from 'react';
import {BentoDateCountdown} from '@bentoproject/date-countdown/react';
import '@bentoproject/date-countdown/styles.css';

function App() {
  return (
    <BentoDateCountdown
      datetime={200000000}
      biggestUnit={'HOURS'}
      render={(data) => (
        <div>
          <span>{`${data.days} ${data.dd} ${data.d}`}</span>
          <br>
          <span>{`${data.hours} ${data.hh} ${data.h}`}</span>
          <br>
          <span>{`${data.minutes} ${data.mm} ${data.m}`}</span>
          <br>
          <span>{`${data.seconds} ${data.ss} ${data.s}`}</span>
        </div>
      )}
    />
  );
}
```

### Interactivity and API usage

The Bento Date Countdown component does not have an imperative API. However, the Bento Date Countdown Preact/React component does accept a `render` prop that renders the consumer's template. This `render` prop should be a function which the Bento Date Countdown Preact/React component can use to render its template. The `render` callback will be provided a variety of date-related parameters for consumers to interpolate in the rendered template. See the [`render` prop section](#render) for more information.

### Layout and style

The Bento Date Countdown Preact/React component allows consumers to render their own templates. These templates may use inline styles, `<style>` tags, Preact/React components that import their own stylesheets.

### Props

#### `datetime`

Required prop. Denotes the date and time as a Date, String, or Nuumber. If String, must be a standard ISO 8601 date string (e.g. 2017-08-02T15:05:05.000Z) or the string `now`. If set to `now`, it will use the time the page loaded to render its template. If Number, must be a POSIX epoch value in milliseconds.

#### `locale`

An internationalization language string for each timer unit. The default value is `en` (for English). This prop supports all values that are supported by the user's browser.

#### `whenEnded`

Specifies whether to stop the timer when it reaches 0 seconds. The value can be set to `stop` (default) to indicate the timer to stop at 0 seconds and will not pass the final date or `continue` to indicate the timer should continue after reaching 0 seconds.

#### `biggestUnit`

Allows the `bento-date-countdown` component to calculate the time difference based on the specified `biggest-unit` value. For example, assume there are `50 days 10 hours` left, if the `biggest-unit` is set to `hours`, the result displays `1210 hours` left.

-   Supported values: `days`, `hours`, `minutes`, `seconds`
-   Default: `days`

#### `countUp`

Include this prop to reverse the direction of the countdown to count up instead. This is useful to display the time elapsed since a target date in the past. To continue the countdown when the target date is in the past, be sure to include the `when-ended` prop with the `continue` value. If the target date is in the future, `bento-date-countdown` will display a decrementing (toward 0) negative value.

#### `render`

Optional callback that should render a template. The callback will be provided an object with properties/values related to the date expressed in `datetime`.

By default, the Bento Date Countdown component will display the [`localeString` form of the Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) for the given locale and localeOption. See the [Returned Time Parameters section](#returned-time-parameters) for more details on how each property will be displayed.

```typescript
function render(dateParams: DateParams): JSXInternal.Element;

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

## Returned Time Parameters

This table lists the format you can specify in your Mustache template:

| Format  | Meaning                                           |
| ------- | ------------------------------------------------- |
| d       | day - 0, 1, 2,...12, 13..Infinity                 |
| dd      | day - 00, 01, 02, 03..Infinity                    |
| h       | hour - 0, 1, 2,...12, 13..Infinity                |
| hh      | hour - 01, 02, 03..Infinity                       |
| m       | minute - 0, 1, 2,...12, 13..Infinity              |
| mm      | minute - 01, 01, 02, 03..Infinity                 |
| s       | second - 0, 1, 2,...12, 13..Infinity              |
| ss      | second - 00, 01, 02, 03..Infinity                 |
| days    | internationalization string for day or days       |
| hours   | internationalization string for hour or hours     |
| minutes | internationalization string for minute or minutes |
| seconds | internationalization string for second or seconds |

### Samples of formatted values

This table provides examples of formatted values specified in a Mustache template, and a sample of what the output:

| Format                                          | Sample Output                        | Remarks                |
| ----------------------------------------------- | ------------------------------------ | ---------------------- |
| {hh}:{mm}:{ss}                                  | 04:24:06                             | -                      |
| {h} {hours} and {m} {minutes} and {s} {seconds} | 4 hours and 1 minutes and 45 seconds | -                      |
| {d} {days} {h}:{mm}                             | 1 day 5:03                           | -                      |
| {d} {days} {h} {hours} {m} {minutes}            | 50 days 5 hours 10 minutes           | -                      |
| {d} {days} {h} {hours} {m} {minutes}            | 20 days 5 hours 10 minutes           | -                      |
| {h} {hours} {m} {minutes}                       | 240 hours 10 minutes                 | `biggest-unit='hours'` |
| {d} {days} {h} {hours} {m} {minutes}            | 50 天 5 小时 10 分钟                 | `locale='zh-cn'`       |
