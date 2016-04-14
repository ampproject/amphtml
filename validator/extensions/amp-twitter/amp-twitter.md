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

# <a name="amp-twitter"></a> `amp-twitter`

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
    <td><a href="https://ampbyexample.com/components/amp-twitter">amp-twitter.html</a><br /><a href="https://github.com/ampproject/amphtml/blob/master/examples/twitter.amp.html">twitter.amp.html</a></td>
  </tr>
</table>

## Behavior

**CAVEAT**

Twitter does not currently provide an API that yields fixed aspect ratio Tweet embeds. We currently automatically proportionally scale the Tweet to fit the provided size, but this may yield less than ideal appearance. Authors may need to manually tweak the provided width and height. You may also use the `media` attribute to select the aspect ratio based on screen width. We are looking for feedback how feasible this approach is in practice.

Example:

```html
<amp-twitter width=486 height=657
    layout="responsive"
    data-tweetid="585110598171631616"
    data-cards="hidden">
    <blockquote placeholder class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">The story how I became what some people would call a frontend engineer and an exploration into what that even means<a href="https://t.co/HrVz4cGMWG">https://t.co/HrVz4cGMWG</a></p>&mdash; Malte Ubl (@cramforce) <a href="https://twitter.com/cramforce/status/585110598171631616">April 6, 2015</a></blockquote>
</amp-twitter>
```

Copy the placeholder from Twitter's embed dialog, but remove the `script`. Then add the `placeholder` attribute to the `blockquote` tag.

## Attributes

**data-tweetid**

The ID of the tweet. In a URL like https://twitter.com/joemccann/status/640300967154597888 `640300967154597888` is the tweetID.

**data-nameofoption**

Options for the Tweet appearance can be set using `data-` attributes. E.g. `data-cards="hidden"` deactivates Twitter cards. For documentation of the available options, see [Twitter's docs](https://dev.twitter.com/web/javascript/creating-widgets#create-tweet).

## Validation errors

The following lists validation errors specific to the `amp-twitter` tag
(see also `amp-twitter` in the [AMP validator specification](https://github.com/ampproject/amphtml/blob/master/extensions/amp-twitter/0.1/validator-amp-twitter.protoascii)):

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
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#tag-required-by-another-tag-is-missing">The 'example1' tag is missing or incorrect, but required by 'example2'.</a></td>
    <td>Error thrown when required <code>amp-twitter</code> extension <code>.js</code> script tag is missing or incorrect.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#mandatory-attribute-missing">The tag 'example1' is missing a mandatory attribute - pick one of example2.</a></td>
    <td>Error thrown when neither <code>data-tweetid</code> or <code>src</code> is included. One of these attributes is mandatory.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#missing-url">Missing URL for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>data-tweetid</code> or <code>src</code> is missing its URL.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url">Malformed URL 'example3' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown when <code>data-tweetid</code> or <code>src</code> URL is invalid.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-url-protocol">Invalid URL protocol 'example3:' for attribute 'example1' in tag 'example2'.</a></td>
    <td>Error thrown <code>data-tweetid</code> or <code>src</code> URL is <code>http</code>; <code>https</code> protocol required.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#implied-layout-isnt-supported-by-amp-tag">The implied layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when implied layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#specified-layout-isnt-supported-by-amp-tag">The specified layout 'example1' is not supported by tag 'example2'.</a></td>
    <td>Error thrown when specified layout is set to <code>CONTAINER</code>; this layout type isn't supported.</td>
  </tr>
  <tr>
    <td width="40%"><a href="https://www.ampproject.org/docs/reference/validation_errors.html#invalid-property-value">The property 'example1' in attribute 'example2' in tag 'example3' is set to 'example4', which is invalid.</a></td>
    <td>Error thrown when invalid value is given for attributes <code>height</code> or <code>width</code>. For example, <code>height=auto</code> triggers this error for all supported layout types, with the exception of <code>NODISPLAY</code>.</td>
  </tr>
</table>
