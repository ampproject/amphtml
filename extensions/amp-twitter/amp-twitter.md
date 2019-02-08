---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Twitter tweet.
---
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

# amp-twitter

Displays a Twitter Tweet or Moment.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-twitter" src="https://cdn.ampproject.org/v0/amp-twitter-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, intrinsic, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-twitter/">Annotated code example for amp-twitter</a></td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-twitter` component allows you to embed a Tweet or Moment for the specified Twitter ID.  

Here's an example of a basic embedded Tweet:

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="164"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/amptwitter.basic.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

## Appearance

Twitter does not currently provide an API that yields fixed aspect ratio for embedded Tweets or Moments. Currently, AMP automatically proportionally scales the Tweet or Moment to fit the provided size, but this may yield less than ideal appearance. You might need to manually tweak the provided width and height. Also, you can use the `media` attribute to select the aspect ratio based on the screen width.

## Placeholders & fallbacks

An element marked with a `placeholder` attribute displays while the content for the Tweet or Moment is loading or initializing.  Placeholders are hidden once the AMP component's content displays. An element marked with a `fallback` attribute displays if `amp-twitter` isn't supported by the browser or if the Tweet or Moment doesn't exist or has been deleted.

Visit the [Placeholders & fallbacks](https://www.ampproject.org/docs/guides/responsive/placeholders) guide to learn more about how placeholders and fallbacks interact for the `amp-twitter` component.

*Example: Specifying a placeholder*
<!--embedded example - displays in ampproject.org -->
<div>
  <amp-iframe height="278"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/amptwitter.placeholder.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

*Example: Specifying a placeholder and a fallback*

<div>
  <amp-iframe height="354"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/amptwitter.placeholder-and-fallback.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (required)</strong></td>
    <td>The ID of the Tweet or Moment, or the source type if a Timeline should be displayed.
    In a URL like https://twitter.com/joemccann/status/640300967154597888,  `640300967154597888` is the tweet id.
    In a URL like https://twitter.com/i/moments/1009149991452135424, `1009149991452135424` is the moment id.
    Valid timeline source types include `profile`, `likes`, `list`, `collection`, `url`, and `widget`.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (optional)</strong></td>
    <td>When displaying a timeline, further arguments need to be provided in addition to `timeline-source-type`. For example, `data-timeline-screen-name="amphtml"` in combination with `data-timeline-source-type="profile"` will display a timeline of the AMP Twitter account.
    For details on the available arguments, see the "Timelines" section in [Twitter's JavaScript Factory Functions Guide](https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions).</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (optional)</strong></td>
    <td>You can specify options for the Tweet, Moment, or Timeline appearance by setting `data-` attributes. For example, `data-cards="hidden"` deactivates Twitter cards.
    For details on the available options, see Twitter's docs [for tweets](https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference), [for moments](https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0) and [for timelines](https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference). </td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-twitter rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-twitter/validator-amp-twitter.protoascii) in the AMP validator specification.
