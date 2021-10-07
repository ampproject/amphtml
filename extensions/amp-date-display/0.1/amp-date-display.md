---
$category@: presentation
formats:
  - websites
teaser:
  text: The amp-date-display component displays time data that you can render in your AMP page.
---

# amp-date-display

## Usage

The `amp-date-display` component displays time data that you can render in your
AMP page. By providing specific [attributes](#attributes) in the
`amp-date-display` tag, the `amp-date-display` extension returns a list of time
parameters, which you can pass to
[an amp-mustache template](../../amp-mustache/amp-mustache.md)
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

### data-options-\* (optional)

The `data-options-*` supports all the options under [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters)
parameter that specifies the formatting style to use for `localeString` format.
Valid attributes include: `data-options-date-style`, `data-options-time-style`, etc.

Note that if `display-in` attrubute is set to `utc`, the value of
`data-options-time-zone` will automatically be converted to `UTC`.

## Validation

See [amp-date-display rules](../validator-amp-date-display.protoascii) in the AMP validator specification.
