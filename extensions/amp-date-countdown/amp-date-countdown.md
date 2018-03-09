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

# <a name="`amp-date-countdown`"></a> `amp-date-countdown`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Display a sequence of backward counting to indicate the time remaining before an event is scheduled to occur.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Work in Progress</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-date-countdown-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

## Behavior

The `amp-date-countdown` provides countdown time data that you can render in your AMP page. By providing specific [attributes](#attributes) in the  `amp-date-countdown` tag, the `amp-date-countdown` extension returns a list of time parameters, which you can pass to an `amp-mustache` template for rendering.  Refer to the [ list below for each returned time parameter](#returned-time-parameters).

![count-down](https://user-images.githubusercontent.com/2099009/28486908-71f03336-6e3c-11e7-9822-3bac6528b148.png)

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
days | i18n string for day or days
hours | i18n string for hour or hours
minutes | i18n string for minute or minutes
seconds | i18n string for second or seconds

### Examples

This table provides examples of formatted values specified in a Mustache template, and a sample of what the output:

Format | Sample Output | Remarks
-- | -- | -
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} and {m} {minutes} and {s} {seconds} | 4 hours and 1 minutes and 45 seconds | -
{d} {days} {h}:{mm} | 1 day 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 days 5 hours 10 minutes | -
{d} {days} {h} {hours} {m} {minutes} | 20 days 5 hours 10 minutes | -
{h} {hours} {m} {minutes} | 240 hours 10 minutes | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-CN'`


## Attributes

You must specify at least one of these required attributes: `end-date`, `timestamp-ms`, `timestamp-seconds`.

##### end-date
An ISO formatted date to count down to. For example, `2020-06-01T00:00:00+08:00`

##### timestamp-ms
A POSIX epoch value in milliseconds; assumed to be UTC timezone. For example, `timestamp-ms="1521880470000"`.

##### timestamp-seconds
A POSIX epoch value in seconds; assumed to be UTC timezone. For example, `timestamp-seconds="1521880470"`.

##### offset-seconds (optional)
A positive or negative number that represents the number of seconds to add or subtract from the `end-date`. For example, `offset-seconds="60"` adds 60 seconds to the end-date.

##### when-ended (optional)
Specifies whether to stop or continue the timer when it reaches 0 seconds. The value can be set to `stop` (default) or `continue`. If `stop`, the timer stops at 0 seconds and will not pass the final date.

##### locale (optional)
An i18n language string for each timer unit. The default value is `en` (for English).
Supported values:

Code | Language
-- | --
zh-CN | Chinese Simplified
zh-TW | Chinese Traditional
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

##### biggest-unit (optional)
Allows the `amp-date-countdown` component to calculate the time difference based on the specified `biggest-unit` value. For example, assume there are `50 days 10 hours` left, if the `biggest-unit` is set to `hours`, the result displays `1210 hours` left.

* Supported values: `days`, `hours`, `minutes`, `seconds`
* Default: `days`

## Actions
The `amp-date-countdown` exposes the following actions you can use [AMP on-syntax to trigger](https://www.ampproject.org/docs/reference/amp-actions-and-events):

Action | Description
-- | --
`timeout` |  When the timer times out. For this action to function, `when-ended` **must be** set to `stop`. You can  define any actions when the timer times out. ![ezgif com-video-to-gif 2](https://user-images.githubusercontent.com/4065175/36954871-c05f8b0e-205f-11e8-944a-cbfff96fcb29.gif)

## Validation
See [amp-date-countdown rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-date-countdown/validator-amp-date-countdown.protoascii) in the AMP validator specification.
