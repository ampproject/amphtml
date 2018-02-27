<!--
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

FILL THIS IN. What does this extension do?

## Attributes

##### datetime
- An ISO formatted date to count down to. e.g. `2020-06-01T00:00:00+08:00`

Note: One of `datetime`, `timestamp-ms`, `timestamp-seconds` is required.

##### timestamp-ms
- POSIX epoch value in milliseconds - will be assumed to be UTC timezone.

Note: One of `datetime`, `timestamp-ms`, `timestamp-seconds` is required.

##### timestamp-seconds
- POSIX epoch value in seconds - will be assumed to be UTC timezone.

Note: One of `datetime`, `timestamp-ms`, `timestamp-seconds` is required.

##### offset-seconds (optional)
- Negative or positive number of seconds to add/substract from datetime.

##### when-ended (optional)
- `stop` will set the timer to stop at 0 seconds and will not pass the final date.
- default is `stop`

##### locale (optional)
- the language for each datetime unit.
* Supported value:

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
- this will allow `amp-date-countdown` component to set for biggest-unit and automatically folds the remaining time unit.
  - Example: assume there are `50 days 10 hours` left, if the `biggest-unit` is set as `hour`, it will display `1210` hours.
* Supported values: `day`, `hour`, `minute`, `second`
* Default: `day`


## Validation
See [amp-date-countdown rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-date-countdown/validator-amp-date-countdown.protoascii) in the AMP validator specification.
