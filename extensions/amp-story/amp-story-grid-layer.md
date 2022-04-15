---
$category@: presentation
formats:
  - stories
teaser:
  text: A single layer of a single page of an AMP story that positions its content in a grid-based layout.
---

# amp-story-grid-layer

## Usage

The `<amp-story-grid-layer>` component lays its children out into a grid. Its implementation is based off of the [CSS Grid Spec](https://www.w3.org/TR/css-grid-1/).

<div class="flex-images">
  <amp-img alt="Layer 1 - background" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-layer-1.gif" width="200" height="355">
  <noscript><img width="200" alt="Layer 1 - background" src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-layer-1.gif" /></noscript></amp-img>
  <span class="special-char">+</span>
  <amp-img alt="Layer 2 - page content (with equal margin from the screen edge)" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-layer-2.jpg" alt="Layer 2" width="200" height="355">
  <noscript><img width="200" alt="Layer 2 - page content (with equal margin from the screen edge)" src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-layer-2.jpg" /></noscript></amp-img>
  <span class="special-char">+</span>
  <amp-img alt="Layer 3 - logo, positioned in the bottom-right of the screen" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-layer-3.jpg" width="200" height="355">
  <noscript><img width="200" alt="Layer 3 - logo, positioned in the bottom-right of the screen" src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-layer-3.jpg" /></noscript></amp-img>
  <span class="special-char">=</span>
  <amp-img alt="All layers shown together" layout="flex-item" src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-layer-4.gif" width="200" height="355">
  <noscript><img width="200" alt="All layers shown together" src="https://raw.githubusercontent.com/ampproject/amphtml/main/extensions/amp-story/img/layers-layer-4.gif" /></noscript></amp-img>
</div>

## Valid children

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

## Attributes

### template [required]

The `template` attribute determines the layout of the grid layer. Available templates are described in the [Templates](#templates) section below.

### grid-area [optional]

This attribute is specified on children of `<amp-story-grid-layer>`. `grid-area` specifies the named area (from using a `template` that defines them) in which the element containing this attribute should appear.

Example:

```html
<amp-story-grid-layer template="thirds">
  <p grid-area="middle-third">Element 1</p>
  <p grid-area="lower-third">Element 2</p>
  <p grid-area="upper-third">Element 3</p>
</amp-story-grid-layer>
```

### aspect-ratio [optional]

The value specifies an aspect ratio in the "horizontal:vertical" format, where both "horizontal" and "vertical" are integer numbers. If this attribute is specified, the layout of the grid layer is set to conform to the specified proportions. The font size, in this case, is automatically set to the 1/10th of the resulting height to enable proportional content scaling.

Example:

```html
<amp-story-grid-layer aspect-ratio="9:16" template="vertical">
  <div style="width: 10%; height: 10%; font-size: 2em;">
    This block will be in 9:16 aspect ratio and font size will be set at the 20%
    of the layer's height.
  </div>
</amp-story-grid-layer>
```

### preset [optional]

Specifies a responsiveness preset that configures the layer with an aspect-ratio and scaling-factor.

The presets are:

-   **2021-background**: An aspect-ratio layer scaled up to cover letterboxed margins. May only contain the background asset (image or video).
-   **2021-foreground**: An aspect-ratio layer containing all the foreground assets.

Values are:

<table>
  <tr>
    <th>Preset</th>
    <th>Aspect ratio</th>
    <th>Scaling factor</th>
  </tr>
  <tr>
    <td>2021-background</td>
    <td>69:116</td>
    <td>1.142</td>
  </tr>
  <tr>
    <td>2021-foreground</td>
    <td>69:116</td>
    <td>1</td>
  </tr>
</table>

{% call callout('Tip', type='success') %}
These presets are optimized for mobile screens in 2021. Keep an eye out for new presets as technology evolves and follow the [Web Stories roadmap](https://amp.dev/community/roadmap/?category=stories#status-updates).
{% endcall %}

### anchor [optional]

Aligns aspect-ratio layers (including presets) to the border or corner specified. Use this attribute to maintain scaling across layers when position elements relative to borders or corners.
Options: `top`, `left`, `bottom`, `right`, `top-left`, `top-right`, `bottom-left`, `bottom-right`.

## Styling

### Templates

The following are available templates to specify for the layout of the grid layer.

{% call callout('Tip', type='success') %}
To see the layout templates in use, check out the [layouts demo on AMP By Example](https://amp.dev/documentation/examples/style-layout/amp_story_layouts/).
{% endcall %}

#### fill

The `fill` template shows its first child full bleed. All other children are not shown.

Names Areas: (none)

Example:

<amp-img alt="Fill template example: a cat.jpg image, sized to fill the entire screen" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/template-fill.png" width="145" height="255">
  <noscript>
    <img  alt="Fill template example: a cat.jpg image, sized to fill the entire screen" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/template-fill.png" />
  </noscript>
</amp-img>

```html
<amp-story-grid-layer template="fill">
  <amp-img src="cat.jpg" alt="..."></amp-img>
</amp-story-grid-layer>
```

#### vertical

The `vertical` template lays its elements out along the y-axis. By default, its elements are aligned to the top, and can take up the entirety of the screen along the x-axis.

Names Areas: (none)

<amp-img alt="Illustration: element1, element2 and element3, stacked vertically" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/template-vertical.png" width="145" height="255">
  <noscript>
    <img alt="Illustration: element1, element2 and element3, stacked vertically" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/template-vertical.png" />
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

The `horizontal` template lays its elements out along the x-axis. By default, its elements are aligned to the start of the line and can take up the entirety of the screen along the y-axis.

Names Areas: (none)

<amp-img alt="Illustration: element1, element2 and element3, stacked horizontally in columns" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/template-horizontal.png" width="145" height="255">
  <noscript>
    <img alt="Illustration: element1, element2 and element3, stacked horizontally in columns" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/template-horizontal.png" />
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

-   `upper-third`
-   `middle-third`
-   `lower-third`

<amp-img alt="Illustration: the screen split into three horizontal stacked areas - upper-third, middle-third, lower-third; element 3 is in the upper-third; element 2 is in the lower-third; element 1 is in the middle third" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/template-thirds.png" width="145" height="255">
  <noscript>
    <img alt="Illustration: the screen split into three horizontal stacked areas - upper-third, middle-third, lower-third; element 3 is in the upper-third; element 2 is in the lower-third; element 1 is in the middle third" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/template-thirds.png" />
  </noscript>
</amp-img>

```html
<amp-story-grid-layer template="thirds">
  <p grid-area="middle-third">Element 1</p>
  <p grid-area="lower-third">Element 2</p>
  <p grid-area="upper-third">Element 3</p>
</amp-story-grid-layer>
```

{% call callout('Note', type='note') %}
While these templates allow you to visually arrange content on the screen, the content will still be announced by screen readers / assistive technologies in the order in which it appears in the underlying markup. Make sure that the content order in your document's markup is logical, regardless of how it will be presented visually.
{% endcall %}

### Pre templated UI

#### Landscape half-half UI

The landscape half-half pre templated UI will resize the `<amp-story-grid-layer>` element to take half of the screen rather than the full screen, and be positioned either on the half left or half right of the viewport. This attribute only affects landscape viewports, and is ignored on portrait viewports.
This template makes it easier to design full bleed landscape stories: splitting the screen in two halves gives each half a portrait ratio on most devices, allowing re-using the portrait assets, design, and templates already built for portrait stories.

The `position` attribute on the `<amp-story-grid-layer>` element accepts two values: `landscape-half-left` or `landscape-half-right`.

Note: your story needs to enable the `supports-landscape` mode to use this template.

Example:

<amp-img alt="Landscape half-half UI template - in small screen/smartphone, the image is behind the content; on large screen/tablet, the image is on the left, while the content is on the right" layout="fixed" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-img-video-object-fit-position.png" width="600" height="287">
  <noscript>
    <img alt="Landscape half-half UI template - in small screen/smartphone, the image is behind the content; on large screen/tablet, the image is on the left, while the content is on the right" src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/amp-story-img-video-object-fit-position.png" />
  </noscript>
</amp-img>

```html
<amp-story-page id="foo">
  <amp-story-grid-layer template="fill" position="landscape-half-left">
    <amp-img src="cat.jpg" alt="..."></amp-img>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="vertical" position="landscape-half-right">
    <h2>Cat ipsum dolor sit amet...</h2>
  </amp-story-grid-layer>
</amp-story-page>
```

#### Modern aspect-ratio

Responsive presets on grid-layers maximize usable screen space for foreground elements and scale assets consistently.

```html
<amp-story-grid-layer preset="2021-background" template="fill">
    <amp-img src="cat.jpg" layout="fill" alt="...">
</amp-story-grid-layer>
<amp-story-grid-layer preset="2021-foreground">
    <h1>This will stay consistent with the bg</h1>
</amp-story-grid-layer>
<amp-story-grid-layer preset="2021-foreground" anchor="bottom-left">
    <!-- Position the icon close to the corner on all screens -->
    <amp-img src="icon.jpg" alt="..." style="bottom: 1em; left: 1em">
</amp-story-grid-layer>
```

{% call callout('Tip', type='success') %}
The background preset is mostly useful for designing layouts with both background and foreground elements. If a page only contains an image or video in the background, consider using regular grid-layers for that scenario.
{% endcall %}

##### Foreground

Use the `2021-foreground` preset for foreground elements. This layer will always be fully visible and expand to the borders either horizontally or vertically, maximizing the size without cropping. The attribute `anchor` can be used to pin foreground layers to the page corners or borders, such that elements can be positioned relative to those borders or corners (which is useful for logos or footnotes).

##### Background

Use the `2021-background` preset for the background layer. This preset covers the entire screen on most mobile phones with the background asset. It does so without letterboxing, and keeps positioning consistent with the foreground elements.
While this technique provides the most consistent user experience, it may crop up to 7% of one or all borders of your background. Keep this in mind when designing and picking your assets.

[tip type="warning"]
This preset may show letterboxing on devices that don't have conventional phone screen sizes, such as tablets or foldable phones. You may change the background color of your pages to match the background for the best visual outcome.
[/tip]

<amp-layout layout="container" width="3" height="2">
  <div style="width:33%;display:inline-block">
    <amp-img src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/preset_story_scaled.gif" layout="responsive" alt="Animation showing how a perfectly scaled with a 7.2% bleed-area adapts to different screen aspect ratios, always keeping content visible" width="200" height="350"/>
  </div>
  <div style="width:66%;display:inline-block">
    <amp-img src="https://github.com/ampproject/amphtml/raw/main/extensions/amp-story/img/preset_story_anchor.gif" layout="responsive" alt="Animation showing a background that remains anchored to the bottom of the viewport, regardless of screen aspect ratio/height" width="500" height="400"/>
  </div>
</amp-layout>
