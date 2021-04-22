---
$category@: presentation
formats:
  - websites
teaser:
  text: The amp-date-display component displays time data that you can render in your AMP page.
experiental: true
bento: true
---

<!--
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# amp-date-display

## Usage

The `amp-date-display` component displays time data that you can render in your
AMP page. By providing specific [attributes](#attributes) in the
`amp-date-display` tag, the `amp-date-display` extension returns a list of time
parameters, which you can pass to
[an amp-mustache template](../amp-mustache/amp-mustache.md)
for rendering. Refer to the
[list below for each returned time parameter](#returned-time-parameters).

```html
<!-- Displays "Wednesday 2 August 2017, 15:05:05" -->
<amp-date-display
  datetime="2017-08-02T15:05:05.000"
  layout="fixed"
  width="360"
  height="20"
>
  <template type="amp-mustache">
    <div>
      {{dayName}} {{day}} {{monthName}} {{year}}
      {{hourTwoDigit}}:{{minuteTwoDigit}}:{{secondTwoDigit}}
    </div>
  </template>
</amp-date-display>
```

### Returned time parameters

This table lists the format you can specify in your Mustache template:

| Format         | Meaning                                                       |
| -------------- | ------------------------------------------------------------- |
| day            | 1, 2, ...12, 13, etc.                                         |
| dayName        | string,                                                       |
| dayNameShort   | string,                                                       |
| dayPeriod      | string,                                                       |
| dayTwoDigit    | 01, 02, 03, ..., 12, 13, etc.                                 |
| hour           | 0, 1, 2, 3, ..., 12, 13, ..., 22, 23                          |
| hour12         | 1, 2, 3, ..., 12, 1, 2, ..., 11, 12                           |
| hour12TwoDigit | 01, 02, ..., 12, 01, 02, ..., 11, 12                          |
| hourTwoDigit   | 00, 01, 02, ..., 12, 13, ..., 22, 23                          |
| iso            | A standard ISO8601 date string e.g. 2019-01-23T15:31:21.213Z, |
| minute         | 0, 1, 2, ..., 58, 59                                          |
| minuteTwoDigit | 00, 01, 02, ..., 58, 59                                       |
| month          | 1, 2, 3, ..., 12                                              |
| monthName      | Internationalized month name string.                          |
| monthNameShort | Internationalized abbreviated month name string.,             |
| monthTwoDigit  | 01, 02, ..., 11, 12                                           |
| second         | 0, 1, 2, ..., 58, 59                                          |
| secondTwoDigit | 00, 01, 02, ..., 58, 59                                       |
| year           | 0, 1, 2, ..., 1999, 2000, 2001, etc.                          |
| yearTwoDigit   | 00, 01, 02, ..., 17, 18, 19, ..., 98, 99                      |

### Standalone use outside valid AMP documents

Bento AMP allows you to use AMP components in non-AMP pages without needing to commit to fully valid AMP. You can take these components and place them in implementations with frameworks and CMSs that don't support AMP. Read more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

#### Example

The example below demonstrates `amp-date-display` component in standalone use.

[example preview="top-frame" playground="false"]

```
<head>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-date-display-1.0.css">
  <script async custom-element="amp-date-display" src="https://cdn.ampproject.org/v0/amp-date-display-1.0.js"></script>
   <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-latest.js"></script>
  <style>
    amp-date-display {
      display: block;
      height: 20px;
    }
  </style>
</head>
<amp-date-display
  id="my-date-display"
  datetime="2017-08-02T15:05:05.000"
  locale="en"
>
  <template type="amp-mustache">
    <div>
      {{dayName}} {{day}} {{monthName}} {{year}}
      {{hourTwoDigit}}:{{minuteTwoDigit}}:{{secondTwoDigit}}
    </div>
  </template>
</amp-date-display>
<div class="buttons" style="margin-top: 8px;">
  <button id="ar-button">Change locale to Arabic</button>
  <button id="en-button">Change locale to English</button>
  <button id="now-button">Change time to now</button>
</div>

<script>
  (async () => {
    const dateDisplay = document.querySelector('#my-date-display');
    await customElements.whenDefined('amp-date-display');

    // set up button actions
    document.querySelector('#ar-button').onclick = () => dateDisplay.setAttribute('locale', 'ar');
    document.querySelector('#en-button').onclick = () => dateDisplay.setAttribute('locale', 'en');
    document.querySelector('#now-button').onclick = () => dateDisplay.setAttribute('datetime', 'now');
  })();
</script>
```

[/example]

#### Layout and style

Each Bento component has a small CSS library you must include to guarantee proper loading without [content shifts](https://web.dev/cls/). Because of order-based specificity, you must manually ensure that stylesheets are included before any custom styles.

```
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-date-display-1.0.css">
```

Fully valid AMP pages use the AMP layout system to infer sizing of elements to create a page structure before downloading any remote resources. However, Bento use imports components into less controlled environments and AMP's layout system is inaccessible.

**Container type**

The `amp-date-display` component has a defined layout size type. To ensure the component renders correctly, apply the following styles:

```css
amp-date-display {
  display: block;
  height: 20px;
}
```

## Attributes

You must specify at least one of these required attributes: `datetime`,
`timestamp-ms`, or `timestamp-seconds`.

### datetime

The `datetime` attribute specifies the date and time in a standard ISO 8601 date
string (e.g. 2017-08-02T15:05:05.000Z) or the string `now`. If set to `now`,
`amp-date-display` will use the time the page loaded to render its template.

### timestamp-ms

The `timestamp-ms` attribute specifies the date and time using the number of
milliseconds since 1970-01-01T0:00:00.000Z

### timestamp-seconds

The `timestamp-seconds` attribute specifies the date and time using the number
of seconds since 1970-01-01T0:00:00.000Z

### locale (optional)

An internationalization language string for each timer unit. The default value
is `en` (for English). This attribute supports all values that are supported by
the user's browser.

### display-in (optional)

If set to the value `utc`, the `display-in` attribute will convert the given
date to UTC.

### offset-seconds (optional)

The `offset-seconds` attribute specifies an integer number of seconds to shift
the given date.
