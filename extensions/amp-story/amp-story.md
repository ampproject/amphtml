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

The `amp-story` extension provides a new format for displaying visual content that you can assembled into a story-telling experience. With an AMP Story, you can provide users with bite-sized, visually rich information and content.

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

AMP HTML documents with `amp-story` MUST:

| RULE | DESCRIPTION |
| --- | --- |
| Start with the `<!doctype html>` doctype. | Standard for HTML. |
| Contain a top-level `<html ⚡>` tag (`<html amp>` is accepted as well). | Identifies the page as AMP content. |
| Contain `<head>` and `<body>` tags. | Optional in HTML but not in AMP. |
| Contain a `<meta charset="utf-8">` tag as the first child of their `<head>` tag. | Identifies the encoding for the page. |
| Contain a `<script async src="https://cdn.ampproject.org/v0.js"></script>` tag as the second child of their `<head>` tag. | Includes and loads the AMP JS library.  This is a forked version specific to amp-story; when the feature is generally available, the normal v0.js hosted from cdn.ampproject.org must be used. |
| Contain a `<script async src="https://cdn.ampproject.org/v0/amp-story-0.1.js" custom-element="amp-story"></script>` tag as the third child of their `<head>` tag. | Includes and loads the amp-story JS library. |
| Contain a `<link rel="canonical" href="$STORY_URL" />` tag inside their `<head>`. | Points to itself. Learn more in [Make Your Page Discoverable](https://www.ampproject.org/docs/guides/discovery.html). |
| Contain a `<meta name="viewport" content="width=device-width,minimum-scale=1">` tag inside their `<head>` tag. It's also recommended to include `initial-scale=1`. | Specifies a responsive viewport. Learn more in [Create Responsive AMP Pages](https://www.ampproject.org/docs/guides/responsive/responsive_design.html). |
| Contain the [AMP boilerplate code](https://www.ampproject.org/docs/reference/spec/amp-boilerplate.html) in their `<head>` tag. | CSS boilerplate to initially hide the content until AMP JS is loaded. |
| Contain an `<amp-story standalone>` tag in the body of the document. | Identifies that the document is a story. |

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
<amp-story standalone related-articles="./related.json" background-audio="my.mp3">
  <amp-story-page>[...]</amp-story-page>
  <amp-story-page>[...]</amp-story-page>
  <amp-story-page>[...]</amp-story-page>
</amp-story>
```

### Attributes

##### standalone [required]

Identifies that the AMP document is a story.

##### related-articles [optional]

A URL endpoint that accepts GET requests and returns a JSON response with links to related and trending stories, to be shown on a screen at the end of the story.  If omitted, the amp-story component renders a default UI for the end screen.  See the [related-articles endpoint](#related-articles-json-endpoint) section below for the JSON response format.

##### background-audio [optional]

A URI to an audio file that plays throughout the story.

### Children (of amp-story)

The `<amp-story>` component contains one or more [`<amp-story-page>`](#pages:-amp-story-page) components, containing each of the individual screens of the story.  The first page specified in the document order is the first page shown in the story.

### Related articles JSON endpoint

The `related-articles` value is a URL endpoint that returns data for the end screen of the story, containing related links, etc.  The system is responsible for fetching the data necessary to render related and trending articles.  This can be served from a static JSON file, or dynamically-generated (e.g., to calculate what is currently trending).

<figure class="centered-fig">
  <amp-anim alt="related article example" width="300" height="533" layout="fixed" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/related-articles.gif">
    <noscript>
    <img alt="related article example" src="https://github.com/ampproject/amphtml/raw/master/extensions/amp-story/img/related-articles.gif" />
  </noscript>
  </amp-anim>
</figure>

The end screen displays related articles in sections. The heading for the section is obtained from the provided string key name (e.g., "More to Read"); the array of articles for that key are displayed for that section. The domain and favicon of each linked article are automatically parsed and fetched from the specified URL for each piece of content.

#### Example JSON response

```json
{
  "More to Read": [
    {
      title: "My friends, this is India [...]",
      url: "http://a-publisher.com/india"
      image: "./media/b1.jpg"
    },
    {
      title: "A wonderful weekend with Tenturi",
      url: "http://a-publisher.com/tenturi"
      image: "./media/b2.jpg"
    },
    ...
  ],
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
    <amp-video src="background.mp4"></amp-video>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="vertical">
    <h1>These are the Top 5 World's Most...</h1>
    <p>Jon Bersch</p>
    <p>May 18</p>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="vertical" 
      align-content="end" justify-content="end">
    <amp-img src="a-logo.svg"></amp-img>
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


##### template [optional]

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

## Validation

See [amp-story rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/validator-amp-story.protoascii) in the AMP validator specification.
