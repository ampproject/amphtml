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
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-date-countdown/">amp-date-countdown example</a>.</td>
  </tr>
</table>

## Behavior

![count-down](https://user-images.githubusercontent.com/2099009/28486908-71f03336-6e3c-11e7-9822-3bac6528b148.png)

- The `amp-date-countdown` will return list of parameters as result and pass to `amp-mustache` template for rendering, please refer to the legend list below for each returned params elaboration.

##### Legends - Details

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

##### Examples :

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

##### on:timeout (events)
- `amp-date-countdown` supports `timeout` actions and `when-ended` **must be** set to `stop` in order for this actions to be functioned. User can define any actions when the timer timeout.

##### end-date
- An ISO formatted date to count down to. e.g. `2020-06-01T00:00:00+08:00`

Note: One of `end-date`, `timestamp-ms`, `timestamp-seconds` is required.

##### timestamp-ms
- POSIX epoch value in milliseconds - will be assumed to be UTC timezone.

Note: One of `end-date`, `timestamp-ms`, `timestamp-seconds` is required.

##### timestamp-seconds
- POSIX epoch value in seconds - will be assumed to be UTC timezone.

Note: One of `end-date`, `timestamp-ms`, `timestamp-seconds` is required.

##### offset-seconds (optional)
- Negative or positive number of seconds to add/substract from end-date.

##### when-ended (optional)
- `stop` will set the timer to stop at 0 seconds and will not pass the final date.
- default is `stop`

##### locale (optional)
- the i18n language string for each timer unit.
* Supported value up-to-date:

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

* Default: `en`, which stands for **English**

##### biggest-unit (optional)
- this will allow `amp-date-countdown` component to calculate the time difference based on biggest-unit set.
  - Example: assume there are `50 days 10 hours` left, if the `biggest-unit` is set as `hours`, it will display `1210 hours` left.
* Supported values: `days`, `hours`, `minutes`, `seconds`
* Default: `days`


## Validation
See [amp-date-countdown rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-date-countdown/validator-amp-date-countdown.protoascii) in the AMP validator specification.
