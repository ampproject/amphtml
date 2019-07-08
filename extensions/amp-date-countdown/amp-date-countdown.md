---
$category@: presentation
formats:
  - websites
teaser:
  text: Displays GL Transmission Format (gITF) 3D models.
---
<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# amp-date-countdown
Display a sequence of backward counting to indicate the time remaining before an event is scheduled to occur.

<table>
  <tr>
    <td><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-date-countdown" src="https://cdn.ampproject.org/v0/amp-date-countdown-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-date-countdown/">amp-date-countdown example</a>.</td>
  </tr>
</table>

[TOC]

## Behavior

<amp-img alt="countdown timer example" layout="responsive" src="https://user-images.githubusercontent.com/2099009/28486908-71f03336-6e3c-11e7-9822-3bac6528b148.png" width="816" height="294">
  <noscript>
    <img alt="countdown timer" src="https://user-images.githubusercontent.com/2099009/28486908-71f03336-6e3c-11e7-9822-3bac6528b148.png" width="816" height="294">
  </noscript>
</amp-img>

The `amp-date-countdown` provides countdown time data that you can render in your AMP page. By providing specific [attributes](#attributes) in the  `amp-date-countdown` tag, the `amp-date-countdown` extension returns a list of time parameters, which you can pass to an `amp-mustache` template for rendering.  Refer to the [ list below for each returned time parameter](#returned-time-parameters).

### Example

<amp-img alt="countdown timer example 2" layout="intrinsic" src="https://user-images.githubusercontent.com/2099009/42785881-e161f078-8908-11e8-8f31-435e36a1de95.gif" width="489" height="48">
  <noscript>
    <img alt="countdown timer" src="https://user-images.githubusercontent.com/2099009/42785881-e161f078-8908-11e8-8f31-435e36a1de95.gif" width="489" height="48">
  </noscript>
</amp-img>


```html
<amp-date-countdown timestamp-seconds="2147483648"
  layout="fixed-height"
  height="50">
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

Format | Meaning
-- | --
d | day - 0, 1, 2,...12, 13..Infinity
dd | day - 00, 01, 02, 03..Infinity
h | hour - 0, 1, 2,...12, 13..Infinity
hh | hour - 01, 02, 03..Infinity
m | minute - 0, 1, 2,...12, 13..Infinity
mm | minute - 01, 01, 02, 03..Infinity
s | second - 0, 1, 2,...12, 13..Infinity
ss | second - 00, 01, 02, 03..Infinity
days | internationalization string for day or days
hours | internationalization string for hour or hours
minutes | internationalization string for minute or minutes
seconds | internationalization string for second or seconds

#### Samples of formatted values

This table provides examples of formatted values specified in a Mustache template, and a sample of what the output:

Format | Sample Output | Remarks
-- | -- | -
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} and {m} {minutes} and {s} {seconds} | 4 hours and 1 minutes and 45 seconds | -
{d} {days} {h}:{mm} | 1 day 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 days 5 hours 10 minutes | -
{d} {days} {h} {hours} {m} {minutes} | 20 days 5 hours 10 minutes | -
{h} {hours} {m} {minutes} | 240 hours 10 minutes | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`


## Attributes

You must specify at least one of these required attributes: `end-date`, `timeleft-ms`, `timestamp-ms`, `timestamp-seconds`.

##### end-date

An ISO formatted date to count down to. For example, `2020-06-01T00:00:00+08:00`

##### timestamp-ms

A POSIX epoch value in milliseconds; assumed to be UTC timezone. For example, `timestamp-ms="1521880470000"`.

##### timestamp-seconds

A POSIX epoch value in seconds; assumed to be UTC timezone. For example, `timestamp-seconds="1521880470"`.

##### timeleft-ms

A value in milliseconds left to be counting down. For example, 48 hours left `timeleft-ms="172800000"`.

##### offset-seconds (optional)

A positive or negative number that represents the number of seconds to add or subtract from the `end-date`. For example, `offset-seconds="60"` adds 60 seconds to the end-date.

##### when-ended (optional)

Specifies whether to stop the timer when it reaches 0 seconds. The value can be set to `stop` (default) to indicate the timer to stop at 0 seconds and will not pass the final date or `continue` to indicate the timer should continue after reaching 0 seconds.

##### locale (optional)

An internationalization language string for each timer unit. The default value is `en` (for English).
Supported values:

Code | Language
-- | --
de | German
en | English
es | Spanish
fr | French
id | Indonesian
it | Italian
ja | Japanese
ko | Korean
nl | Dutch
pt | Portuguese
ru | Russian
th | Thai
tr | Turkish
vi | Vietnamese
zh-cn | Chinese Simplified
zh-tw | Chinese Traditional

##### biggest-unit (optional)

Allows the `amp-date-countdown` component to calculate the time difference based on the specified `biggest-unit` value. For example, assume there are `50 days 10 hours` left, if the `biggest-unit` is set to `hours`, the result displays `1210 hours` left.

* Supported values: `days`, `hours`, `minutes`, `seconds`
* Default: `days`

## Events

The `amp-date-countdown` component exposes the following event that you can use [AMP on-syntax to trigger](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events):

Event | Description
-- | --
`timeout` |  When the timer times out. For this action to function, `when-ended` **must be** set to `stop`. You can only run low-trust actions such as `amp-animation` and `amp-video` actions when the timer times out. This is to enforce AMP's UX principle of not allowing page content to reflow without explicit user actions.

*Example: Demonstrating usage of timeout event*

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
        "keyframes": { "visibility": "hidden"}
    }
</script>
</amp-animation>
<amp-date-countdown id="ampdate" end-date="2018-07-17T06:19:40+08:00" on="timeout: hide-timeout-event.start" height="400" width="400" when-ended="stop" locale='en'>
  <template type="amp-mustache">
    <h1>Countdown Clock</h1>
    <div>
      {{dd}} : {{hh}} : {{mm}} : {{ss}}
    </div>
  </template>
</amp-date-countdown>
```

Renders as:

<amp-img alt="Animated example the action" layout="intrinsic" src="https://user-images.githubusercontent.com/2099009/42786835-9e698228-890c-11e8-8776-f82a6cded829.gif" width="359" height="270">
  <noscript>
    <img alt="countdown timer" src="https://user-images.githubusercontent.com/2099009/42786835-9e698228-890c-11e8-8776-f82a6cded829.gif" width="359" height="270">
  </noscript>
</amp-img>

## Validation
See [amp-date-countdown rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-date-countdown/validator-amp-date-countdown.protoascii) in the AMP validator specification.
