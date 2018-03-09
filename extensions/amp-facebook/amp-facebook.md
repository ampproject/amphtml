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

# <a name="amp-facebook"></a> `amp-facebook`

[TOC]

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Displays a Facebook post or video. </td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-facebook" src="https://cdn.ampproject.org/v0/amp-facebook-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>fill, fixed, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-facebook/">annotated amp-facebook</a> example.</td>
  </tr>
</table>

## Overview 

You can use the `amp-facebook` component to embed a Facebook post or a Facebook video.

### Layout Behavior
Due to the [instagram API](https://developers.facebook.com/docs/plugins/embedded-posts) not accepting a `height`, `layout="responsive"` will size the `<amp-facebook>` component to the width of its container. This means that if the container aspect ratio has a shorter relative height than the actual facebook post component, `<amp-facebook>` will overflow its container. This is worth noting in context of embedding `<amp-facebook>` in landscape components like `<amp-carousel>`. 

#### Example: Embedding a post

Code:
```html
<amp-facebook width="552" height="310"
    layout="responsive"
    data-href="https://www.facebook.com/ParksCanada/posts/1712989015384373">
</amp-facebook>
```
Renders as:
<amp-facebook width="552" height="310"
    layout="responsive"
    data-href="https://www.facebook.com/ParksCanada/posts/1712989015384373">
</amp-facebook>

#### Example: Embedding a video

Code:
```html
<amp-facebook width="476" height="316"
    layout="responsive"
    data-embed-as="video"
    data-href="https://www.facebook.com/nasaearth/videos/10155187938052139">
</amp-facebook>
```
Renders as:
<amp-facebook width="476" height="316"
    layout="responsive"
    data-embed-as="video"
    data-href="https://www.facebook.com/nasaearth/videos/10155187938052139">
</amp-facebook>


## Attributes

##### data-href (required)

The URL of the Facebook post/video. For example, `https://www.facebook.com/zuck/posts/10102593740125791`.

##### data-embed-as

The value is either `post` or `video`.  The default is `post`.

Both posts and videos can be embedded as a post. Setting `data-embed-as="video"` for Facebook videos only embeds the player of the video, and ignores the accompanying post card with it. This is recommended if you'd like a better aspect ratio management for the video to be responsive.  

Check out the documentation for differences between [post embeds](https://developers.facebook.com/docs/plugins/embedded-posts) and [video embeds](https://developers.facebook.com/docs/plugins/embedded-video-player).

##### data-align-center

The value is either `true` or `false`.  The default is `false`.

Having this attribute set to true would align the post/video container to center.

##### data-locale (optional)

By default, the locale is set to user's system language; however, you can specify a locale as well. 

For details on strings accepted here please visit the [Facebook API Localization page](https://developers.facebook.com/docs/internationalization)

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Validation

See [amp-facebook rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-facebook/validator-amp-facebook.protoascii) in the AMP validator specification.
