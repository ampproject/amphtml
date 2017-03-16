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

The <code>amp-timeago</code> component is a wrapper around the <a href="https://github.com/hustcc/timeago.js">Supported Layouts</a> project for use on AMP pages.

## Attributes

**datetime** (required)

An ISO datetime. E.g. 2017-03-10T01:00:00Z.

**locale** (optional)

A locale option can be specified as listed <a href="https://github.com/hustcc/timeago.js/tree/master/locales">here</a>. Defaults to *en*.

## Validation
See [amp-timeago rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-timeago/0.1/validator-amp-timeago.protoascii) in the AMP validator specification.
