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
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-twitter" src="https://cdn.ampproject.org/v0/amp-twitter-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-twitter/">Annotated code example for amp-twitter</a></td>
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

**data-tweetid** (required)

The ID of the tweet. In a URL like https://twitter.com/joemccann/status/640300967154597888,  `640300967154597888` is the tweetID.

**data-*** (optional)

You can specify options for the Tweet appearance by setting `data-` attributes. For example, `data-cards="hidden"` deactivates Twitter cards. For details on the available options, see [Twitter's docs](https://dev.twitter.com/web/javascript/creating-widgets#create-tweet).

**common attributes**

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-twitter rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-twitter/validator-amp-twitter.protoascii) in the AMP validator specification.
