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

# <a name="amp-beopinion"></a> `amp-beopinion`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a BeOpinion content.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-beopinion" src="https://cdn.ampproject.org/v0/amp-beopinion-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-beopinion` component allows you to embed a BeOpinion content given a BeOpinion account.  

Here's an example of a basic embedded BeOpinion content:

<!--embedded example - displays in ampproject.org -->
<div>
<amp-iframe height="164"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampbeopinion.basic.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

## Appearance

Twitter does not currently provide an API that yields fixed aspect ratio for embedded Tweets. Currently, AMP automatically proportionally scales the Tweet to fit the provided size, but this may yield less than ideal appearance. You might need to manually tweak the provided width and height. Also, you can use the `media` attribute to select the aspect ratio based on the screen width.

## Placeholders & fallbacks

An element marked with a `placeholder` attribute displays while the content for the Tweet is loading or initializing.  Placeholders are hidden once the AMP component's content displays. An element marked with a `fallback` attribute displays if `amp-beopinion` isn't supported by the browser or if the Tweet doesn't exist or has been deleted.

Visit the [Placeholders & fallbacks](https://www.ampproject.org/docs/guides/responsive/placeholders) guide to learn more about how placeholders and fallbacks interact for the `amp-beopinion` component.

*Example: Specifying a placeholder*
<!--embedded example - displays in ampproject.org -->
<div>
  <amp-iframe height="278"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampbeopinion.placeholder.embed.html">
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
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampbeopinion.placeholder-and-fallback.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

## Attributes

##### data-account (required)

The ID of the BeOpinion account (page owner).

##### data-content (optional)

The ID of the BeOpinion content to be displayed on the page.

##### data-name (optional)
The name of the BeOpinion slot on the page.

##### data-my-content (optional - `amp-ad` only !)

For `amp-ad` elements of type `beopinion`, the value can be set to `"0"` (default value).
Warning: the `amp-beopinion` element overrides this value to `"1"`, to prevent the serving of ads outside of an `amp-ad` element.

<div>
<amp-iframe height="202"
            layout="fixed-height"
            sandbox="allow-scripts allow-forms allow-same-origin"
            resizable
            src="https://ampproject-b5f4c.firebaseapp.com/examples/ampbeopinion.options.embed.html">
  <div overflow tabindex="0" role="button" aria-label="Show more">Show full code</div>
  <div placeholder></div>
</amp-iframe>
</div>

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-beopinion rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-beopinion/validator-amp-beopinion.protoascii) in the AMP validator specification.
