---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Facebook post or video.
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

# amp-facebook

Displays a Facebook post, video or comment.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-facebook" src="https://cdn.ampproject.org/v0/amp-facebook-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-facebook/">annotated amp-facebook</a> example.</td>
  </tr>
</table>

## Overview

You can use the `amp-facebook` component to embed a Facebook post, a Facebook video or a comment on a Facebook post.

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

#### Example: Embedding a comment on a post

Code:
```html
<amp-facebook width="552" height="500"
    layout="responsive"
    data-embed-type="comment"
    data-href="https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185">
</amp-facebook>

```
Renders as:
<amp-facebook width="552" height="500"
    layout="responsive"
    data-embed-type="comment"
    data-href="https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185">
</amp-facebook>


## Attributes
<table>
  <tr>
    <td width="40%"><strong>data-href (required)</strong></td>
    <td>The URL of the Facebook post/video/comment. For example, a post or video will look like <code>https://www.facebook.com/zuck/posts/10102593740125791</code>. A comment or comment reply will look like <code>https://www.facebook.com/zuck/posts/10102735452532991?comment_id=1070233703036185</code>. For comments, see the Facebook documentation on <a href="https://developers.facebook.com/docs/plugins/embedded-comments#how-to-get-a-comments-url">how to get a comment's URL</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-embed-as</strong></td>
    <td>The value is either <code>post</code>, <code>video</code> or <code>comment</code>. The default is <code>post</code>.
<br><br>
Both posts and videos can be embedded as a post. Setting <code>data-embed-as="video"</code> for Facebook videos embeds the player of the video, and adds the accompanying post card with it. Setting <code>data-embed-as="post"</code> ignores the caption card. This is done to make sure we are zooming in on videos correctly.
<br><br>
The <code>comment</code> value embeds a single comment (or reply to a comment) on a post. This is not to be confused with <a href="https://ampbyexample.com/components/amp-facebook-comments/">amp-facebook-comments</a>.
<br><br>
Check out the documentation for differences between <a href="https://developers.facebook.com/docs/plugins/embedded-posts">post embeds</a>, <a href="https://developers.facebook.com/docs/plugins/embedded-video-player">video embeds</a>, and <a href="https://developers.facebook.com/docs/plugins/embedded-comments">comment embeds</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-include-comment-parent</strong></td>
    <td>The value is either <code>true</code> or <code>false</code>. The default is <code>false</code>.
<br><br>
When you are embedding a comment reply, you can optionally also include the parent comment of the reply.</td>
  </tr>
  <tr>
     <td width="40%"><strong>data-align-center</strong></td>
     <td>The value is either <code>true</code> or <code>false</code>. The default is <code>false</code>.
<br><br>
For posts and videos, having this attribute set to true would align the post/video container to center.</td>
   </tr>
   <tr>
      <td width="40%"><strong>data-locale (optional)</strong></td>
      <td>By default, the locale is set to user's system language; however, you can specify a locale as well.
<br><br>
For details on strings accepted here please visit the <a href="https://developers.facebook.com/docs/internationalization">Facebook API Localization page</a></td>
    </tr>
    <tr>
       <td width="40%"><strong>common attributes</strong></td>
       <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
     </tr>
</table>

## Validation

See [amp-facebook rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-facebook/validator-amp-facebook.protoascii) in the AMP validator specification.
