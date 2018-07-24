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

# <a name="`amp-riddle-quiz`"></a> `amp-riddle-quiz`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays any <a href="https://www.riddle.com/">Riddle</a> item content (e.g., quiz, list, poll, etc.)</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-riddle-quiz" src="https://cdn.ampproject.org/v0/amp-riddle-quiz-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>responsive</td>
  </tr>
</table>

This component embeds <a href="https://www.riddle.com/">Riddle</a> content (e.g., quiz, list, poll, etc.).

## Example

```html
<amp-riddle-quiz
    layout="responsive"
    width="600"
    height="400"
    data-riddle-id="25799">
</amp-riddle-quiz>
```

## Attributes


##### data-riddle-id (required)

Specifies the unique ID for the Riddle item.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP component.

## Validation
See [amp-riddle-quiz rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-riddle-quiz/validator-amp-riddle-quiz.protoascii) in the AMP validator specification.
