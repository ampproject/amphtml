<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

### <a name="amp-twitter"></a> `amp-twitter`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a Twitter Tweet.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-twitter" src="https://cdn.ampproject.org/v0/amp-twitter-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/twitter.amp.html">twitter.amp.html</a></td>
  </tr>
</table>

The following lists validation errors specific to the `amp-twitter` tag
(see also `amp-twitter` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/validator/validator.protoascii):

<!---
What does fixed height and fixed width mean for audio layout?
May need to add something to this table based on technical review.
-->

<table>
  <tr>
    <th width="40%"><strong>Validation Error</strong></th>
    <th>Description</th>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">TAG_REQUIRED_BY_MISSING</a></td>
    <td>Error thrown when required <code>amp-twitter</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#mandatory-attribute-missing">MANDATORY_ONEOF_ATTR_MISSING</a></td>
    <td>Error thrown when neither <code>data-tweetid</code> or <code>src</code> is included. One of these attributes is mandatory.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">IMPLIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">SPECIFIED_LAYOUT_INVALID</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="/docs/reference/validation_errors.html#invalid-property-value">INVALID_PROPERTY_VALUE_IN_ATTR_VALUE</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>

#### Behavior

**CAVEAT**

Twitter does not currently provide an API that yields fixed aspect ratio Tweet embeds. We currently automatically proportionally scale the Tweet to fit the provided size, but this may yield less than ideal appearance. Authors may need to manually tweak the provided width and height. You may also use the `media` attribute to select the aspect ratio based on screen width. We are looking for feedback how feasible this approach is in practice.

Example:

```html
<amp-twitter width=486 height=657
    layout="responsive"
    data-tweetid="585110598171631616"
    data-cards="hidden">
</amp-twitter>
```

#### Attributes

**data-tweetid**

The ID of the tweet. In a URL like https://twitter.com/joemccann/status/640300967154597888 `640300967154597888` is the tweetID.

**data-nameofoption**

Options for the Tweet appearance can be set using `data-` attributes. E.g. `data-cards="hidden"` deactivates Twitter cards. For documentation of the available options, see [Twitter's docs](https://dev.twitter.com/web/javascript/creating-widgets#create-tweet).
