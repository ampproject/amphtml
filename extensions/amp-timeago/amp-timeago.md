---
$category@: presentation
formats:
  - websites
  - email
teaser:
  text: Provides fuzzy timestamps by formatting dates as time ago (for example, 3 hours ago).
---

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

# amp-timeago

## Usage

Use the amp-timago component to count up to, or away from, a specified date and time.

The component replaces the text node with a fuzzy timestamp, such as `in 30 years` or `3 hours ago`.

Example:

[example preview="inline" playground="true" imports="amp-timeago"]

```html
<amp-timeago
  layout="fixed"
  width="160"
  height="20"
  datetime="2017-04-11T00:37:33.809Z"
  locale="en"
>
  Saturday 11 April 2017 00.37
</amp-timeago>
```

[/example]

The `amp-timeago` component requires a placeholder in the text node. The calculated timestamp replaces the placeholder once ready. Use the placeholder as a fallback to display to users if `amp-timeago` is unable to process the fuzzy timestamp.

## Attributes

### `datetime`

The required `datetime` attribute sets the date and time. The value must be an [ISO datetime](https://www.w3.org/QA/Tips/iso-date).

- Express time in UTC (Coordinated Universal Time): `2017-03-10T01:00:00Z`
- Express in local time with a time zone offset: `2017-03-09T20:00:00-05:00`

### `locale` (optional)

The local default is `en`. Add the `locale` attribute and specify one of the following values to chance the local.

- `ar` (Arabic)
- `be` (Belarusian)
- `bg` (Bulgarian)
- `ca` (Catalan)
- `da` (Danish)
- `de` (German)
- `el` (Greek)
- `en` (English)
- `enShort` (English - short)
- `es` (Spanish)
- `eu` (Basque)
- `fi` (Finnish)
- `fr` (French)
- `he` (Hebrew)
- `hu` (Hungarian)
- `inBG` (Bangla)
- `inHI` (Hindi)
- `inID` (Malay)
- `it` (Italian)
- `ja` (Japanese)
- `ko` (Korean)
- `ml` (Malayalam)
- `nbNO` (Norwegian Bokmål)
- `nl` (Dutch)
- `nnNO` (Norwegian Nynorsk)
- `pl` (Polish)
- `ptBR` (Portuguese)
- `ro` (Romanian)
- `ru` (Russian)
- `sv` (Swedish)
- `ta` (Tamil)
- `th` (Thai)
- `tr` (Turkish)
- `uk` (Ukrainian)
- `vi` (Vietnamese)
- `zhCN` (Chinese)
- `zhTW` (Taiwanese)

### `cutoff`

Add the `cutoff` attribute to display the date specified in the `datatime` attribute after passing the specified date in seconds.

### Common attributes

The AMP provided set of [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) is available to `<amp-timeago>`.

## Validation

See [amp-timeago rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-timeago/validator-amp-timeago.protoascii) in the AMP validator specification.
