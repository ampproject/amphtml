---
$category@: presentation
formats:
  - websites
  - stories
teaser:
  text: A single layer of a single page of an AMP story that positions its content in a grid-based layout.
---
<!--
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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


### `amp-story-grid-layer`

The `<amp-story-grid-layer>` component lays its children out into a grid.  Its implementation is based off of the [CSS Grid Spec](https://www.w3.org/TR/css-grid-1/).

<div class="flex-images">
  <amp-img alt="Layer 1" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-1.gif" width="200" height="355">
  <noscript><img width="200" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-1.gif" /></noscript></amp-img>
  <span class="special-char">+</span>
  <amp-img alt="Layer 2" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-2.jpg" width="200" height="355">
  <noscript><img width="200" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-2.jpg" /></noscript></amp-img>
  <span class="special-char">+</span>
  <amp-img alt="Layer 3" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-3.jpg" width="200" height="355">
  <noscript><img width="200" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-3.jpg" /></noscript></amp-img>
  <span class="special-char">=</span>
  <amp-img alt="All layers" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-4.gif" width="200" height="355">
  <noscript><img width="200" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/layers-layer-4.gif" /></noscript></amp-img>
</div>

#### Attributes


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

#### Templates

The following are available templates to specify for the layout of the grid layer.

{% call callout('Tip', type='success') %}
To see the layout templates in use, check out the [layouts demo on AMP By Example](https://amp.dev/documentation/examples/style-layout/amp_story_layouts/).
{% endcall %}

##### fill

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

##### vertical

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

##### horizontal

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

##### thirds

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

#### Children

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
        <li><code>&lt;svg></code></li>
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
        <li><code>&lt;amp-story-cta-layer></code></li>
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
    <td>Links</td>
    <td>
      <ul>
        <li><code>&lt;a></code></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Embedded Components</td>
    <td>
      <ul>
        <li><code>&lt;amp-twitter></code></li>
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

#### Pre templated UI

##### Landscape half-half UI

The landscape half-half pre templated UI will resize the `<amp-story-grid-layer>` element to take half of the screen rather than the full screen, and be positioned either on the half left or half right of the viewport. This attribute only affects landscape viewports, and is ignored on portrait viewports.
This template makes it easier to design full bleed landscape stories: splitting the screen in two halves gives each half a portrait ratio on most devices, allowing re-using the portrait assets, design, and templates already built for portrait stories.

The `position` attribute on the `<amp-story-grid-layer>` element accepts two values: `landscape-half-left` or `landscape-half-right`.

Note: your story needs to enable the `supports-landscape` mode to use this template.

Example:

<amp-img alt="Landscape half-half UI template" layout="fixed" src="https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/img/amp-story-img-video-object-fit-position.png" width="600" height="287">
  <noscript>
    <img alt="Landscape half-half UI template" src="https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/img/amp-story-img-video-object-fit-position.png" />
  </noscript>
</amp-img>

```html
<amp-story-page id="foo">
  <amp-story-grid-layer template="fill" position="landscape-half-left">
    <amp-img src="cat.jpg"></amp-img>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="vertical" position="landscape-half-right">
    <h2>Cat ipsum dolor sit amet...</h2>
  </amp-story-grid-layer>
</amp-story-page>
```

#### Optional customization

##### Crop `amp-img` and `amp-video` assets using `object-position`

The `object-position` attribute can be used on `<amp-img>` and `<amp-video>` elements to specify the alignment of the asset within its container (crop).
By default these assets are centered and, depending on the viewport ratio, have their edges are cropped out of the container. Because the zone of interest of an asset is not always its center, the `object-position` allows specifying what part of the image has to remain visible.
This attribute accepts any value accepted by the `object-position` CSS property.

Example:

<amp-img alt="Custom crop on amp-img and amp-video assets" layout="fixed" src="https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/img/amp-story-object-position.gif" width="600" height="689">
  <noscript>
    <img alt="Custom crop on amp-img and amp-video assets" src="https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/img/amp-story-object-position.gif" />
  </noscript>
</amp-img>

This same image can be used for both mobile portrait and landscape desktop using the `object-position` this way:

```html
<amp-img src="cat.jpg" object-position="75% 40%"></amp-img>
```

##### `data-text-background-color`

The `data-text-background-color` attribute highlights the text of the element with a specified color. To highlight the entire block, add this attribute directly to the text element. To only highlight the text, add the attribute and text to an inner <span>. Note that works anywhere inside an `<amp-story-page>`, not just in `<amp-story-grid-layer>`.

Example:
<amp-img alt="text background color only example" layout="fixed" src="https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/img/text-background-color-ex-1.png" width="145" height="255">
  <noscript>
    <img alt="text background color only example" src="https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/img/text-background-color-ex-1.png" />
  </noscript>
</amp-img>
```html
<amp-story-grid-layer template="vertical">
  <h2>
    <span data-text-background-color="crimson">
      Cat ipsum dolor sit amet, sleeps on my head, but lounge in doorway so if human is on laptop sit on the keyboard
    </span>
  </h2>
</amp-story-grid-layer>
```

Example:
<amp-img alt="text background color full example" layout="fixed" src="https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/img/text-background-color-ex-2.png" width="145" height="255">
  <noscript>
    <img alt="text background color full example" src="https://github.com/ampproject/amphtml/blob/master/extensions/amp-story/img/text-background-color-ex-2.png" />
  </noscript>
</amp-img>
```html
<amp-story-grid-layer template="vertical">
  <h2 data-text-background-color="crimson">
    Cat ipsum dolor sit amet, sleeps on my head, but lounge in doorway so if human is on laptop sit on the keyboard
  </h2>
</amp-story-grid-layer>
```

#### Links in amp-story-grid-layer

We support inline links `<a>` as a descendant of `amp-story-grid-layer`. Whenever a link is tapped a tooltip will be shown - deferring the corresponding action until the user taps again in the tooltip.

#### Interactive components

We support embedding components such as `<amp-twitter>` inside `amp-story-grid-layer`. By default they are not interactive in the story (i.e. tapping on them will not have any effect), but by using the `interactive` attribute, you can make them be fully interactive.

When clicked, the component will be shown in a lightbox-like mode. Here, a user can choose to further interact with the embed, or close the lightbox and go back to the story.

Example:
<figure class="centered-fig">
  <span class="special-char">Example:</span>
  <amp-anim alt="Embedded component example" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/amp-story-tooltip.gif" width="300" height="553">
  <noscript><img width="300" src="https://raw.githubusercontent.com/ampproject/amphtml/master/extensions/amp-story/img/amp-story-tooltip.gif" /></noscript>
  </amp-anim>
</figure>

```html
<amp-twitter width="100"
  height="100"
  layout="responsive"
  data-tweetid="1102562523524579328"
  interactive>
</amp-twitter>
```

#### Customizing tooltip for links or interactive components

You can customize the contents of the tooltip displayed on top of a user interactive element by specifying the following attributes. If they are not specified, a fallback value will be provided automatically.

##### `data-tooltip-icon`

Takes in a `src` where the icon image is located.

##### `data-tooltip-text`

A string that will be shown when the tooltip appears.

Example:

```html
<a href="https://www.google.com" role="link" data-tooltip-icon="./assets/ic_amp_googblue_1x_web_24dp.png" data-tooltip-text="Go to page">
  Click me!
</a>
```
