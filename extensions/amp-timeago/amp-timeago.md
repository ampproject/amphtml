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

# <a name="`amp-timeago`"></a> `amp-timeago`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides fuzzy timestamps by formatting dates as `*** time ago` (for example, 3 hours ago).</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-timeago" src="https://cdn.ampproject.org/v0/amp-timeago-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fixed, fixed-height, responsive</td>
  </tr>
</table>

[TOC]

## Behavior

Provides fuzzy timestamps that you can use on your AMP pages. This component is based on <a href="https://github.com/hustcc/timeago.js">timeago.js</a>.

Example:

```html
<amp-timeago layout="fixed" width="160"
    height="20"
    datetime="2017-04-11T00:37:33.809Z"
    locale="en">Saturday 11 April 2017 00.37</amp-timeago>
```

## Attributes

##### datetime (required)

An ISO datetime. E.g. 2017-03-10T01:00:00Z (UTC) *or* 2017-03-09T20:00:00-05:00 (specifying timezone offset).

##### locale (optional)

By default, the local is set to <code>en</code>; however, you can specify one of the following locales:

<ul>
  <li>ar (Arabic)</li>
  <li>be (Belarusian)</li>
  <li>bg (Bulgarian)</li>
  <li>ca (Catalan)</li>
  <li>da (Danish)</li>
  <li>de (German)</li>
  <li>el (Greek)</li>
  <li>en (English)</li>
  <li>enShort (English - short)</li>
  <li>es (Spanish)</li>
  <li>eu (Basque)</li>
  <li>fi (Finnish)</li>
  <li>fr (French)</li>
  <li>he (Hebrew)</li>
  <li>hu (Hungarian)</li>
  <li>inBG (Bangla)</li>
  <li>inHI (Hindi)</li>
  <li>inID (Malay)</li>
  <li>it (Italian)</li>
  <li>ja (Japanese)</li>
  <li>ko (Korean)</li>
  <li>ml (Malayalam)</li>
  <li>nbNO (Norwegian Bokmål)</li>
  <li>nl (Dutch)</li>
  <li>nnNO (Norwegian Nynorsk)</li>
  <li>pl (Polish)</li>
  <li>ptBR (Portuguese)</li>
  <li>ro (Romanian)</li>
  <li>ru (Russian)</li>
  <li>sv (Swedish)</li>
  <li>ta (Tamil)</li>
  <li>th (Thai)</li>
  <li>tr (Turkish)</li>
  <li>uk (Ukrainian)</li>
  <li>vi (Vietnamese)</li>
  <li>zhCN (Chinese)</li>
  <li>zhTW (Taiwanese)</li>
</ul>

##### cutoff (optional)

Display the original date if time distance is older than cutoff (seconds).

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-timeago rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-timeago/validator-amp-timeago.protoascii) in the AMP validator specification.
