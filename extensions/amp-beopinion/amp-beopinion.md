---
$category@: social
formats:
  - websites
teaser:
  text: Embeds BeOpinion content.
---
<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# amp-beopinion

Embeds <a href="https://beopinion.com/">BeOpinion</a> content.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-beopinion" src="https://cdn.ampproject.org/v0/amp-beopinion-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
</table>

[TOC]

## Behavior

The `amp-beopinion` component allows you to embed [BeOpinion](https://beopinion.com/) content in your AMP page for a given BeOpinion account. BeOpinion is a tool for content creators to add interactive blocks such as polls and quizzes to their pages. BeOpinion mostly works with journalists of major media groups in Europe.

### Integration examples

### As a 3rd party
```html
<amp-beopinion width=375 height=472
      layout="responsive"
      data-account="589446dd42ee0d6fdd9c3dfd"
      data-content="5a703a2f46e0fb00016d51b3"
      data-name="content-slot">
</amp-beopinion>
```

### As an ad provider

```html
<amp-ad width="300" height="220"
      type="beopinion"
      layout="responsive"
      data-account="589446dd42ee0d6fdd9c3dfd"
      data-name="slot_0"
      data-my-content="0">
</amp-ad>
```

## Appearance

BeOpinion does not currently provide an API that yields fixed aspect ratio for embedded contents. Currently, AMP automatically proportionally scales the content to fit the provided size, but this may yield less than ideal appearance. You might need to manually tweak the provided width and height. Also, you can use the `media` attribute to select the aspect ratio based on the screen width.

## Placeholders & fallbacks

An element marked with a `placeholder` attribute displays while the content for the content is loading or initializing.  Placeholders are hidden once the AMP component's content displays. An element marked with a `fallback` attribute displays if `amp-beopinion` isn't supported by the browser or if the content doesn't exist or has been deleted.

Visit the [Placeholders & fallbacks](https://www.ampproject.org/docs/guides/responsive/placeholders) guide to learn more about how placeholders and fallbacks interact for the `amp-beopinion` component.

## Attributes
<table>
  <tr>
    <td width="40%"><strong>data-account (required)</strong></td>
    <td>The ID of the BeOpinion account (page owner).</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-content (optional)</strong></td>
    <td>The ID of the BeOpinion content to be displayed on the page.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-name (optional)</strong></td>
    <td>The name of the BeOpinion slot on the page.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-my-content (optional - <code>amp-ad</code> only !)</strong></td>
    <td>For <code>amp-ad</code> elements of type <code>beopinion</code>, the value can be set to <code>"0"</code> (default value).
Warning: the <code>amp-beopinion</code> element overrides this value to <code>"1"</code>, to prevent the serving of ads outside of an <code>amp-ad</code> element.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://www.ampproject.org/docs/reference/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>


## Validation

See [amp-beopinion rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-beopinion/validator-amp-beopinion.protoascii) in the AMP validator specification.
