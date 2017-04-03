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
    <td><code>amp-timeago</code> is used to format date with `*** time ago`. eg: '3 hours ago'.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>In development</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-timeago" src="https://cdn.ampproject.org/v0/amp-timeago-0.1.js">&lt;/script></code></td>
  </tr>
</table>

## Behavior

The <code>amp-timeago</code> component is a wrapper around the <a href="https://github.com/hustcc/timeago.js">timeago.js</a> project for use on AMP pages.

## Attributes

**datetime** (required)

An ISO datetime. E.g. 2017-03-10T01:00:00Z.

**locale** (optional)

One of the following locale options can be specified:

<ul>
  <li>ar (Arabic)</li>
  <li>be (Belarusian)</li>
  <li>bg (Bulgarian)</li>
  <li>ca (Catalan)</li>
  <li>da (Danish)</li>
  <li>de (German)</li>
  <li>el (Greek)</li>
  <li>en (English)</li>
  <li>en_short (English - short)</li>
  <li>es (Spanish)</li>
  <li>eu (Basque)</li>
  <li>fi (Finnish)</li>
  <li>fr (French)</li>
  <li>he (Hebrew)</li>
  <li>hu (Hungarian)</li>
  <li>in_BG (Bangla)</li>
  <li>in_HI (Hindi)</li>
  <li>in_ID (Malay)</li>
  <li>it (Italian)</li>
  <li>ja (Japanese)</li>
  <li>ko (Korean)</li>
  <li>ml (Malayalam)</li>
  <li>nb_NO (Norwegian Bokmål)</li>
  <li>nl (Dutch)</li>
  <li>nn_NO (Norwegian Nynorsk)</li>
  <li>pl (Polish)</li>
  <li>pt_BR (Portuguese)</li>
  <li>ro (Romanian)</li>
  <li>ru (Russian)</li>
  <li>sv (Swedish)</li>
  <li>ta (Tamil)</li>
  <li>th (Thai)</li>
  <li>tr (Turkish)</li>
  <li>uk (Ukrainian)</li>
  <li>vi (Vietnames)</li>
  <li>zh_CN (Chinese)</li>
  <li>zh_TW (Taiwanese)</li>
</ul>

Defaults to *en*.
