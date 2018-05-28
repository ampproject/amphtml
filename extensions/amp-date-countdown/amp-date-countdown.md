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
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-date-countdown" src="https://cdn.ampproject.org/v0/amp-date-countdown-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed_height, flex_item, nodisplay, responsive</td>
  </tr>
</table>

## Behavior

The `amp-date-countdown` provides countdown time data that you can render in your AMP page. By providing specific [attributes](#attributes) in the  `amp-date-countdown` tag, the `amp-date-countdown` extension returns a list of time parameters, which you can pass to an `amp-mustache` template for rendering.  Refer to the [ list below for each returned time parameter](#returned-time-parameters).

### Example


![count-down](https://user-images.githubusercontent.com/2099009/28486908-71f03336-6e3c-11e7-9822-3bac6528b148.png)


```html
<amp-date-countdown id="ampdate"
    end-date="2020-06-20T00:00:00+08:00"
    when-ended="stop"
    locale="en"
    height="235" width="500">
  <template type="amp-mustache">
    <h1>Countdown Clock</h1>
    <div id="clockdiv">
      {{#d}}
        <div>
          <span class="d">{{d}}</span>
          <div class="smalltext">{{days}}</div>
        </div>
      {{/d}}
      {{#h}}
        <div>
          <span class="h">{{h}}</span>
          <div class="smalltext">{{hours}}</div>
        </div>
      {{/h}}
      <div>
        <span class="m">{{m}}</span>
        <div class="smalltext">{{minutes}}</div>
      </div>
      <div>
        <span class="s">{{s}}</span>
        <div class="smalltext">{{seconds}}</div>
      </div>
    </div>
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
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`


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
Specifies whether to stop the timer when it reaches 0 seconds. The value can be set to `stop` (default) to indicate the timer to stop at 0 secondsand will not pass the final date.

##### locale (optional)
An i18n language string for each timer unit. The default value is `en` (for English).
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

## Actions
The `amp-date-countdown` exposes the following actions you can use [AMP on-syntax to trigger](https://www.ampproject.org/docs/reference/amp-actions-and-events):

Action | Description
-- | --
`timeout` |  When the timer times out. For this action to function, `when-ended` **must be** set to `stop`. You can  define any actions when the timer times out.

### Examples of action

#### Code
```html
<h1 id="sample">
  When Timer hits 0, will hide the timer itself and hide this message.
</h1>
<h1 id="sample2" hidden>
  When Timer hits 0, will hide the timer itself and display this message.
</h1>
<amp-date-countdown id="ampdate" end-date="2018-03-12T10:59:00+08:00" on="timeout: ampdate.hide, sample.hide, sample2.show;" height="235" width="500" when-ended="stop" locale='en'>
  <template type="amp-mustache">
    <h1>Countdown Clock</h1>
    <div id="clockdiv">
      {{#d}}
        <div>
          <span class="d">{{d}}</span>
          <div class="smalltext">{{days}}</div>
        </div>
      {{/d}}
      {{#h}}
        <div>
          <span class="h">{{h}}</span>
          <div class="smalltext">{{hours}}</div>
        </div>
      {{/h}}
      <div>
        <span class="m">{{m}}</span>
        <div class="smalltext">{{minutes}}</div>
      </div>
      <div>
        <span class="s">{{s}}</span>
        <div class="smalltext">{{seconds}}</div>
      </div>
    </div>
  </template>
</amp-date-countdown>
```

#### Output
![ezgif com-video-to-gif 3](https://user-images.githubusercontent.com/4065175/37264448-60503fae-25e8-11e8-8b94-de804cce65ae.gif)

## Validation
See [amp-date-countdown rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-date-countdown/validator-amp-date-countdown.protoascii) in the AMP validator specification.
