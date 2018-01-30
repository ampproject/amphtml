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

# <a name="`amp-story`"></a> `amp-story`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>A rich, visual storytelling format.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><div><a href="https://www.ampproject.org/docs/reference/experimental.html">Experimental</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>none</td>
  </tr>
</table>

{% call callout('Important', type='caution') %}
This component is experimental and under active development. For any issues, please [file a GitHub issue](https://github.com/ampproject/amphtml/issues/new).
{% endcall %}

[TOC]

## Overview

The `amp-story` extension provides a new format for displaying visual content that you can assemble into a story-telling experience. With an AMP Story, you can provide users with bite-sized, visually rich information and content.

<figure class="centered-fig">
  <amp-anim width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story.gif">
    <noscript>
    <img alt="AMP Story Example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story.gif" />
  </noscript>
  </amp-anim>
</figure>

## AMP Story format

An [AMP Story](#story:-amp-story) is a complete AMP HTML document that is comprised of [pages](#pages:-amp-story-page), within the pages are [layers](#layers:-amp-story-grid-layer), within the layers are AMP & HTML elements, like media, analytics, text, and so on.

<amp-img alt="AMP Story tag hierarchy" layout="fixed" src="https://github.com/ampproject/docs/raw/master/assets/img/docs/amp-story-tag-hierarchy.png" width="591" height="358">
  <noscript>
    <img alt="AMP Story tag hierarchy" src="https://github.com/ampproject/docs/raw/master/assets/img/docs/amp-story-tag-hierarchy.png" />
  </noscript>
</amp-img>


### Boilerplate

The following markup is a decent starting point or boilerplate. Copy this and save it to a file with a `.html` extension.

```html
<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story"
        src="https://cdn.ampproject.org/v0/amp-story-0.1.js"></script>
    <title>Hello, amp-story</title>
    <link rel="canonical" href="http://example.ampproject.org/my-story.html" />
    <meta name="viewport"
        content="width=device-width,minimum-scale=1,initial-scale=1">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  </head>
  <body>
    <amp-story standalone>
      <amp-story-page id="my-first-page">
        <amp-story-grid-layer template="fill">
          <amp-img src="https://example.ampproject.org/helloworld/bg1.jpg"
              width="900" height="1600">
          </amp-img>
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical">
          <h1>Hello, amp-story!</h1>
        </amp-story-grid-layer>
      </amp-story-page>
      <amp-story-page id="my-second-page">
        <amp-story-grid-layer template="fill">
          <amp-img src="https://example.ampproject.org/helloworld/bg2.gif"
              width="900" height="1600">
          </amp-img>
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical">
          <h1>The End</h1>
        </amp-story-grid-layer>
      </amp-story-page>
    </amp-story>
  </body>
</html>
```

The content in the body creates a story with two pages.  Each page has a full bleed background image, with a simple string of text on top of it.

### Required markup for amp-story

The AMP Story HTML format follows the [same markup requirements as a valid AMP HTML document](https://www.ampproject.org/docs/reference/spec#required-markup), along with the following additional requirements:


| RULE | DESCRIPTION |
| ---- | --- |
| The `<amp-story standalone>` element is the only child element of `<body>`. | Identifies that the document is an AMP Story. |
| Contain a `<script async src="https://cdn.ampproject.org/v0/amp-story-0.1.js" custom-element="amp-story"></script>` tag as the third child of their `<head>` tag. | Includes and loads the amp-story JS library. |

## Story: `amp-story`

The `amp-story` component represents an entire story.  The component itself  implements the UI shell, including handling gestures and navigation, and inserting the application shell UI (controls, progress bar, etc).

<figure class="centered-fig">
  <amp-anim alt="amp-story example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story.gif">
    <noscript>
    <img alt="amp-story example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/amp-story.gif" />
  </noscript>
  </amp-anim>
</figure>

### Example

```html
<amp-story standalone bookend-config-src="./related.json" background-audio="my.mp3">
  <amp-story-page>[...]</amp-story-page>
  <amp-story-page>[...]</amp-story-page>
  <amp-story-page>[...]</amp-story-page>
</amp-story>
```

### Attributes

##### standalone [required]

Identifies that the AMP document is a story.

##### bookend-config-src [optional]

A URL endpoint that accepts GET requests and returns a JSON response with links to related and trending stories, to be shown on a screen at the end of the story.  If omitted, the amp-story component renders a default UI for the end screen.  See the [bookend endpoint](#bookend-json-endpoint) section below for the JSON response format.

##### background-audio [optional]

A URI to an audio file that plays throughout the story.

### Children (of amp-story)

The `<amp-story>` component contains one or more [`<amp-story-page>`](#pages:-amp-story-page) components, containing each of the individual screens of the story.  The first page specified in the document order is the first page shown in the story.

### Bookend JSON endpoint

The `bookend-config-src` value is a URL endpoint that returns data for the end screen of the story, containing related links, etc.  The system is responsible for fetching the data necessary to render related and trending articles.  This can be served from a static JSON file, or dynamically-generated (e.g., to calculate what is currently trending).

<figure class="centered-fig">
  <amp-anim alt="related article example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/related-articles.gif">
    <noscript>
    <img alt="related article example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/related-articles.gif" />
  </noscript>
  </amp-anim>
</figure>

#### Related articles

The end screen displays related articles in sections. The heading for the section is obtained from the provided string key name (e.g., "More to Read"); the array of articles for that key are displayed for that section. The domain and favicon of each linked article are automatically parsed and fetched from the specified URL for each piece of content.

These are configured in the `related-articles` field of the response object.

#### Social sharing

The configuration for social sharing is defined in the `share-providers` field of the response object (optional).

This field should contain an object with key-value pairs. Each key represents a share provider's name (e.g. `facebook`). The value should be set to a non-empty configuration object for the provider or `true` (when no parameters are required).

The list of available providers is the same as in the [amp-social-share](https://www.ampproject.org/docs/reference/components/amp-social-share) component.

Each of these providers has a different set of available parameters ([see `data-param-*`](https://www.ampproject.org/docs/reference/components/amp-social-share#data-param-*)). The configuration object takes these parameters without the `data-param-` preffix (for example, the `data-param-app_id` would appear in the configuration object as `app_id`).

#### Example JSON response

```json
{
  "share-providers": {
    "email": true,
    "twitter": true,
    "tumblr": true,
    "facebook": {
      // Facebook requires an `app_id` param
      "app_id": "MY_FACEBOOK_APP_ID"
    }
  },
  "related-articles": {
    "More to Read": [
      {
        "title": "My friends, this is India [...]",
        "url": "http://a-publisher.com/india",
        "image": "./media/b1.jpg"
      },
      {
        "title": "A wonderful weekend with Tenturi",
        "url": "http://a-publisher.com/tenturi",
        "image": "./media/b2.jpg"
      },
      ...
    ]
  }
}
```

## Pages: `amp-story-page`

The `<amp-story-page>` component represents the content to display on a single page of a story.

<figure class="centered-fig">
  <amp-anim alt="Page 1 example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/pages-page-1.gif">
  <noscript>
    <img alt="Page 1 example" width="200" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/pages-page-1.gif" />
  </noscript>
  </amp-anim>
</figure>
<figure class="centered-fig">
  <amp-anim alt="Page 2 example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/pages-page-2.gif">
  <noscript>
    <img alt="Page 2 example" width="200" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/pages-page-2.gif" />
  </noscript>
  </amp-anim>
</figure>

### Example

```html
<amp-story-page id="cover">
  <amp-story-grid-layer template="fill">
    <amp-video layout="fill" src="background.mp4" poster="background.png" muted autoplay></amp-video>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="vertical">
    <h1>These are the Top 5 World's Most...</h1>
    <p>Jon Bersch</p>
    <p>May 18</p>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="thirds">
    <amp-img grid-area="bottom-third" src="a-logo.svg" width="64" height="64"></amp-img>
  </amp-story-grid-layer>
</amp-story-page>
```

### Attributes

##### id [required]

A unique identifier for the page. Can be used for styling the page and its descendants in CSS, and is also used to uniquely identify the page in the URL fragment.

##### auto-advance-after [optional]

Specifies when to auto-advance to the next page.  If omitted, the page will not automatically advance. The value for `auto-advance-after` must be either:

  * A positive amount of [time](https://developer.mozilla.org/en-US/docs/Web/CSS/time) to wait before automatically advancing to the next page
  * An ID of an [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) or video-interface video whose completion will trigger the auto-advance

For example:

```html
<amp-story-page id="tokyo" auto-advance-after="1s">
```

##### background-audio [optional]

A URI to an audio file that plays while this page is in view.

For example:

```html
<amp-story-page id="zurich" background-audio="./media/switzerland.mp3">
```

### Children (of amp-story-page)

The `<amp-story-page>` component contains one or more [layers](#layers).  Layers are stacked bottom-up (the first layer specified in the DOM is at the bottom; the last layer specified in the DOM is at the top).

## Layers: `amp-story-grid-layer`

Layers are stacked on top of one another to create the desired visual effect. The `<amp-story-grid-layer>` component lays its children out into a grid.  Its implementation is based off of the [CSS Grid Spec](https://www.w3.org/TR/css-grid-1/).

<div class="flex-images">
  <amp-img alt="Layer 1" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-1.gif" width="200" height="355">
  <noscript><img width="200" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-1.gif" /></noscript>
  </amp-img>
  <span class="special-char">+</span>
  <amp-img alt="Layer 2" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-2.jpg" width="200" height="355">
  <noscript><img width="200" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-2.jpg" /></noscript></amp-img>
  <span class="special-char">+</span>
  <amp-img alt="Layer 3" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-3.jpg" width="200" height="355">
  <noscript><img width="200" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-3.jpg" /></noscript></amp-img></amp-img>
  <span class="special-char">=</span>
  <amp-img alt="All layers" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-4.gif" width="200" height="355">
  <noscript><img width="200" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-4.gif" /></noscript></amp-img></amp-im</amp-img>
</div>

### Attributes


##### template [required]

The `template` attribute determines the layout of the grid layer. Available templates are described in the [Templates](#templates) section below.


##### grid-area [optional]

This attribute is specified on children of `<amp-story-grid-layer>`.  `grid-area` specifies the named area (from using a `template` that defines them) in which the element containing this attribute should appear.

Example:

```html
<amp-story-grid-layer template="thirds">
  <p grid-area="middle-third">Element 1</p>
  <p grid-area="lower-third">Element 2</p>
  <p grid-area="upper-third">Element 3</p>
</amp-story-grid-layer>
```

### Templates

The following are available templates to specify for the layout of the grid layer.

#### fill

The `fill` template shows its first child full bleed. All other children are not shown.

Names Areas: (none)

Example:

<amp-img alt="Fill template example" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/template-fill.png" width="145" height="255">
  <noscript>
    <img alt="Horizontal template example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/template-fill.png" />
  </noscript>
</amp-img>

```html
<amp-story-grid-layer template="fill">
  <amp-img src="cat.jpg"></amp-img>
</amp-story-grid-layer>
```

#### vertical

The `vertical` template lays its elements out along the y-axis.  By default, its elements are aligned to the top, and can take up the entirety of the screen along the x-axis.

Names Areas: (none)

<amp-img alt="Vertical template example" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/template-vertical.png" width="145" height="255">
  <noscript>
    <img alt="Horizontal template example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/template-vertical.png" />
  </noscript>
</amp-img>


```html
<amp-story-grid-layer template="vertical">
  <p>Element 1</p>
  <p>Element 2</p>
  <p>Element 3</p>
</amp-story-grid-layer>
```

#### horizontal

The `horizontal` template lays its elements out along the x-axis.  By default, its elements are aligned to the start of the line and can take up the entirety of the screen along the y-axis.

Names Areas: (none)

<amp-img alt="Horizontal template example" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/template-horizontal.png" width="145" height="255">
  <noscript>
    <img alt="Horizontal template example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/template-horizontal.png" />
  </noscript>
</amp-img>

```html
<amp-story-grid-layer template="horizontal">
  <p>Element 1</p>
  <p>Element 2</p>
  <p>Element 3</p>
</amp-story-grid-layer>
```

#### thirds

The `thirds` template divides the screen into three equally-sized rows, and allows you to slot content into each area.

Named Areas:

  * `upper-third`
  * `middle-third`
  * `lower-third`

<amp-img alt="Horizontal template example" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/template-thirds.png" width="145" height="255">
  <noscript>
    <img alt="Thirds template example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/template-thirds.png" />
  </noscript>
</amp-img>

```html
<amp-story-grid-layer template="thirds">
  <p grid-area="middle-third">Element 1</p>
  <p grid-area="lower-third">Element 2</p>
  <p grid-area="upper-third">Element 3</p>
</amp-story-grid-layer>
```

### Children (of amp-story-grid-layer)

An `amp-story-grid-layer` can contain any of the following elements:

**Note**: This list will be expanded over time.

<table>
  <tr>
    <th width="40%">Area</td>
    <th>Allowable tags </th>
  </tr>
  <tr>
    <td>Media</td>
    <td>
      <ul>
        <li><code>&lt;amp-audio></code></li>
        <li><code>&lt;amp-gfycat></code></li>
        <li><code>&lt;amp-google-vrview-image></code></li>
        <li><code>&lt;amp-img></code></li>
        <li><code>&lt;amp-video></code></li>
        <li><code>&lt;source></code></li>
        <li><code>&lt;track></code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Analytics & Measurement</td>
    <td>
      <ul>
        <li><code>&lt;amp-analytics></code></li>
        <li><code>&lt;amp-experiment></code></li>
        <li><code>&lt;amp-pixel></code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Sectioning</td>
    <td>
      <ul>
        <li><code>&lt;address></code></li>
        <li><code>&lt;article></code></li>
        <li><code>&lt;aside></code></li>
        <li><code>&lt;footer></code></li>
        <li><code>&lt;h1>-&lt;h6></code></li>
        <li><code>&lt;header></code></li>
        <li><code>&lt;hgroup></code></li>
        <li><code>&lt;nav></code></li>
        <li><code>&lt;section></code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Text</td>
    <td>
      <ul>
        <li><code>&lt;abbr></code></li>
        <li><code>&lt;amp-fit-text></code></li>
        <li><code>&lt;amp-font></code></li>
        <li><code>&lt;amp-gist></code></li>
        <li><code>&lt;b></code></li>
        <li><code>&lt;bdi></code></li>
        <li><code>&lt;bdo></code></li>
        <li><code>&lt;blockquote></code></li>
        <li><code>&lt;br></code></li>
        <li><code>&lt;cite></code></li>
        <li><code>&lt;code></code></li>
        <li><code>&lt;data></code></li>
        <li><code>&lt;del></code></li>
        <li><code>&lt;dfn></code></li>
        <li><code>&lt;div></code></li>
        <li><code>&lt;em></code></li>
        <li><code>&lt;figcaption></code></li>
        <li><code>&lt;figure></code></li>
        <li><code>&lt;hr></code></li>
        <li><code>&lt;i></code></li>
        <li><code>&lt;ins></code></li>
        <li><code>&lt;kbd></code></li>
        <li><code>&lt;main></code></li>
        <li><code>&lt;mark></code></li>
        <li><code>&lt;p></code></li>
        <li><code>&lt;pre></code></li>
        <li><code>&lt;q></code></li>
        <li><code>&lt;rp></code></li>
        <li><code>&lt;rt></code></li>
        <li><code>&lt;rtc></code></li>
        <li><code>&lt;ruby></code></li>
        <li><code>&lt;s></code></li>
        <li><code>&lt;samp></code></li>
        <li><code>&lt;small></code></li>
        <li><code>&lt;span></code></li>
        <li><code>&lt;strong></code></li>
        <li><code>&lt;sub></code></li>
        <li><code>&lt;sup></code></li>
        <li><code>&lt;time></code></li>
        <li><code>&lt;u></code></li>
        <li><code>&lt;var></code></li>
        <li><code>&lt;wbr></code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Lists</td>
    <td>
      <ul>
        <li><code>&lt;amp-list></code></li>
        <li><code>&lt;amp-live-list></code></li>
        <li><code>&lt;dd></code></li>
        <li><code>&lt;dl></code></li>
        <li><code>&lt;dt></code></li>
        <li><code>&lt;li></code></li>
        <li><code>&lt;ol></code></li>
        <li><code>&lt;ul></code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Tables</td>
    <td>
      <ul>
        <li><code>&lt;caption></code></li>
        <li><code>&lt;col></code></li>
        <li><code>&lt;colgroup></code></li>
        <li><code>&lt;table></code></li>
        <li><code>&lt;tbody></code></li>
        <li><code>&lt;td></code></li>
        <li><code>&lt;tfoot></code></li>
        <li><code>&lt;th></code></li>
        <li><code>&lt;thead></code></li>
        <li><code>&lt;tr></code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Other</td>
    <td>
      <ul>
        <li><code>&lt;amp-install-serviceworker></code></li>
        <li><code>&lt;noscript></code></li>
      </ul>
    </td>
  </tr>
</table>

## Animations

Every element inside an `<amp-story-page>` can have an entrance animation.

You can configure animations by specifying a set of [animation attributes](#animation-attributes) on the element; no additional AMP extensions or configuration is needed.

### Animation effects

The following animation effects are available as presets for AMP stories:


| Preset name       | Default duration (ms) | Default delay (ms) |
| ----------------- | --------------------- | ------------------ |
| `drop`            | 1600                  | 0 |
| `fade-in`         | 500                   | 0 |
| `fly-in-bottom`   | 500                   | 0 |
| `fly-in-left`     | 500                   | 0 |
| `fly-in-right`    | 500                   | 0 |
| `fly-in-top`      | 500                   | 0 |
| `pulse`           | 500                   | 0 |
| `rotate-in-left`  | 700                   | 0 |
| `rotate-in-right` | 700                   | 0 |
| `twirl-in`        | 1000                  | 0 |
| `whoosh-in-left`  | 500                   | 0 |
| `whoosh-in-right` | 500                   | 0 |

### Animation attributes

#####  animate-in (required)

Use this attribute to specify the name of the entrance [animation preset](#animation-presets).

*Example*: A heading flies in from left of the page.

```html
<h2 animate-in="fly-in-left">
Fly from left!
</h2>
```

##### animate-in-duration (optional)

Use this attribute to specify the duration of the entrance animation, in seconds or milliseconds (e.g., 0.2s or 200ms). The default duration depends on the animation preset you specified.

*Example*: A heading flies in from left of the page and the animation finishes within half a second.

```html
<h2 animate-in="fly-in-left" animate-in-duration="0.5s" >
Fly from left!
</h2>
```

##### animate-in-delay (optional)

Use this attribute to specify the delay before starting the animation. The value must be greater than or equal to 0, in seconds or milliseconds (for example, 0.2s or 200ms). The default delay depends on the animation preset you specified.

*Example*: After 0.4 seconds, a heading flies in from the left of the page and completes its entrance within 0.5 seconds.

```html
<h2 animate-in="fly-in-left"
    animate-in-duration="0.5s"
    animate-in-delay="0.4s">
Fly from left!
</h2>
```

**Note**: The animation delay is not guaranteed to be exact. Additional delays can be caused by loading the `amp-animation` extension in the background when the first animated element has been scanned. The attribute contract is defined as *delay this animation for at least N milliseconds*. This applies to all elements including those with a delay of 0 seconds.

##### animate-in-after (optional)

Use this attribute to chain or sequence animations (for example, animation2 starts after animation1 is complete). Specify the ID of the animated element that this element's animation will follow. The element must be present on the same `<amp-story-page>`. The delay is applied after the previous element's animation has finished. For further details, see the [Sequencing animations](#sequencing-animations) section below.

For example, in the following code, `object2` animates in after `object1` completes their entrance:

```html
<amp-story-page id="page1">
  <amp-story-grid-layer template="vertical">
    <div id="object1"
        animate-in="rotate-in-left">
        1
    </div>
    <div id="object2"
        animate-in="fly-in-right"
        animate-in-after="object1">
        2 <!-- will start after object1 has finished -->
    </div>
  </amp-story-grid-layer>
</amp-story-page>
```

### Sequencing animations

To chain animations in sequence, use the `animate-in-after` attribute. All elements in a given chain must be present in the same `<amp-story-page>`. Elements without the `animate-in-after` attribute do not belong to a sequence chain, and will start independently on page entrance.

```html
<amp-story-page id="my-sequencing-page">
  <amp-story-grid-layer template="vertical">
    <div class="circle"
        animate-in="drop-in"
        animate-in-duration="1.8s">
      1 <!-- will start independently -->
    </div>
    <div id="rotate-in-left-obj"
        class="square"
        animate-in="rotate-in-left"
        animate-in-after="fade-in-obj"
        animate-in-delay="0.2s">
      2 <!-- will start after fade-in-obj has finished -->
    </div>
    <div class="square"
        animate-in-after="rotate-in-left-obj"
        animate-in="whoosh-in-right"
        animate-in-delay="0.2s">
      3 <!-- will start after rotate-in-left-obj has finished -->
    </div>
    <div id="fade-in-obj"
        class="circle"
        animate-in="fade-in"
        animate-in-duration="2.2s">
      1 <!-- will start independently -->
    </div>
  </amp-story-grid-layer>
</amp-story-page>
```
### Combining multiple animations

You can apply multiple entrance animations on one element (for example, an element flies into the page and fades in at the same time). It's not possible to assign more than one animation preset to a single element; however, elements with different entrance animations can be nested to combine them into one.

```html
<div animate-in="fly-in-left">
   <div animate-in="fade-in">
     I will fly-in and fade-in!
   </div>
</div>
```

**Note**: If a composed animation is supposed to start after the end of a separate element's animation, make sure that all nested elements that compose the animation have the attribute `animate-in-after` set to the same `id`.


## Validation

See [amp-story rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/validator-amp-story.protoascii) in the AMP validator specification.
