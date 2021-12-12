---
$category@: presentation
formats:
  - websites
teaser:
  text: Displays a countdown sequence to a specified date.
experimental: true
bento: true
---

# amp-date-countdown

## Usage

Display a sequence of backward counting to indicate the time remaining before an
event is scheduled to occur.

<amp-img alt="countdown timer example" layout="responsive" src="https://user-images.githubusercontent.com/2099009/28486908-71f03336-6e3c-11e7-9822-3bac6528b148.png" width="816" height="294">
  <noscript>
    <img alt="countdown timer" src="https://user-images.githubusercontent.com/2099009/28486908-71f03336-6e3c-11e7-9822-3bac6528b148.png" width="816" height="294">
  </noscript>
</amp-img>

The `amp-date-countdown` provides countdown time data that you can render in your AMP page. By providing specific [attributes](#attributes) in the `amp-date-countdown` tag, the `amp-date-countdown` extension returns a list of time parameters, which you can pass to an `amp-mustache` template for rendering. Refer to the [ list below for each returned time parameter](#returned-time-parameters).

<amp-img alt="countdown timer example 2" layout="intrinsic" src="https://user-images.githubusercontent.com/2099009/42785881-e161f078-8908-11e8-8f31-435e36a1de95.gif" width="489" height="48">
  <noscript>
    <img alt="countdown timer" src="https://user-images.githubusercontent.com/2099009/42785881-e161f078-8908-11e8-8f31-435e36a1de95.gif" width="489" height="48">
  </noscript>
</amp-img>

```html
<amp-date-countdown
  timestamp-seconds="2147483648"
  layout="fixed-height"
  height="50"
>
  <template type="amp-mustache">
    <p class="p1">
      {{d}} days, {{h}} hours, {{m}} minutes and {{s}} seconds until
      <a href="https://en.wikipedia.org/wiki/Year_2038_problem">Y2K38</a>.
    </p>
  </template>
</amp-date-countdown>
```

### Returned time parameters

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

#### Samples of formatted values

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

### Migrating from 0.1

The experimental `1.0` version of `amp-date-countdown` uses the attribute name `count-up` instead of `data-count-up` as in `0.1` to support the "count up" feature. See the `count-up` section under `Attributes` below for more details.

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `amp-date-countdown`, see [**`bento-date-countdown`**](./1.0/README.md).

## Attributes

You must specify at least one of these required attributes: `end-date`,
`timeleft-ms`, `timestamp-ms`, `timestamp-seconds`.

### end-date

An ISO formatted date to count down to. For example, `2020-06-01T00:00:00+08:00`

### timestamp-ms

A POSIX epoch value in milliseconds; assumed to be UTC timezone. For example,
`timestamp-ms="1521880470000"`.

### timestamp-seconds

A POSIX epoch value in seconds; assumed to be UTC timezone. For example,
`timestamp-seconds="1521880470"`.

### timeleft-ms

A value in milliseconds left to be counting down. For example, 48 hours left
`timeleft-ms="172800000"`.

### offset-seconds (optional)

A positive or negative number that represents the number of seconds to add or
subtract from the `end-date`. For example, `offset-seconds="60"` adds 60 seconds
to the end-date.

### when-ended (optional)

Specifies whether to stop the timer when it reaches 0 seconds. The value can be
set to `stop` (default) to indicate the timer to stop at 0 seconds and will not
pass the final date or `continue` to indicate the timer should continue after
reaching 0 seconds.

### locale (optional)

An internationalization language string for each timer unit. The default value
is `en` (for English).

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

### biggest-unit (optional)

Allows the `amp-date-countdown` component to calculate the time difference based
on the specified `biggest-unit` value. For example, assume there are `50 days 10 hours` left, if the `biggest-unit` is set to `hours`, the result displays
`1210 hours` left.

-   Supported values: `days`, `hours`, `minutes`, `seconds`
-   Default: `days`

### count-up (optional)

Include this attribute to reverse the direction of the countdown to count up instead. This is useful to display the time elapsed since a target date in the past. To continue the countdown when the target date is in the past, be sure to include the `when-ended` attribute with the `continue` value. If the target date is in the future, `amp-date-countdown` will display a decrementing (toward 0) negative value.

[tip type="important"]
Please note that the attribute name is different than `0.1` which uses the `data-count-up` attribute to toggle this feature. The behavior of the feature is otherwise identical to `0.1`.
[/tip]

## Events

The `amp-date-countdown` component exposes the following event that you can use
[AMP on-syntax to trigger](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events):

### Timeout

When the timer times out. For this action to function, `when-ended` **must be**
set to `stop`. You can only run low-trust actions such as `amp-animation` and
`amp-video` actions when the timer times out. This is to enforce AMP's UX
principle of not allowing page content to reflow without explicit user actions.
|

_Example: Demonstrating usage of timeout event_

```html
<h1 id="sample">
  When Timer hits 0, will hide the timer itself and hide this message.
</h1>

<amp-animation id="hide-timeout-event" layout="nodisplay">
  <script type="application/json">
    {
      "duration": "1s",
      "fill": "both",
      "selector": "#ampdate, #sample",
      "keyframes": {"visibility": "hidden"}
    }
  </script>
</amp-animation>
<amp-date-countdown
  id="ampdate"
  end-date="2018-07-17T06:19:40+08:00"
  on="timeout: hide-timeout-event.start"
  height="400"
  width="400"
  when-ended="stop"
  locale="en"
>
  <template type="amp-mustache">
    <h1>Countdown Clock</h1>
    <div>
      {{dd}} : {{hh)) : {{mm}} : {{ss}}
    </div>
  </template>
</amp-date-countdown>
```

Renders as:

<amp-img alt="Animated example the action" layout="intrinsic"
         src="https://user-images.githubusercontent.com/2099009/42786835-9e698228-890c-11e8-8776-f82a6cded829.gif"
         width="359" height="270">
<noscript>
<img alt="countdown timer"
         src="https://user-images.githubusercontent.com/2099009/42786835-9e698228-890c-11e8-8776-f82a6cded829.gif"
         width="359" height="270">
</noscript>
</amp-img>
