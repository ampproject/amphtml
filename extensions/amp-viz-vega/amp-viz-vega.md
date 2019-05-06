---
$category@: presentation
formats:
  - websites
teaser:
  text: Displays visualizations created by using Vega visualization grammar.
---
<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# amp-viz-vega

Displays visualizations created using <a href="https://vega.github.io/vega/">Vega</a> visualization grammar.

<table>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td><a href="https://amp.dev/documentation/guides-and-tutorials/learn/experimental">Experimental</a></td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-viz-vega" src="https://cdn.ampproject.org/v0/amp-viz-vega-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="https://github.com/ampproject/amphtml/blob/master/examples/viz-vega.amp.html">viz-vega.amp.html</a></td>
  </tr>
</table>

[TOC]

## What is Vega?
Vega is a visualization grammar, a declarative format for creating and saving
interactive visualization designs. Vega's runtime uses [D3](https://github.com/d3/d3)
behind the scene to draw.

Please visit [Vega's website](https://vega.github.io/vega/)
to learn more and play with samples.

## Example

```html
<amp-viz-vega
    src="https://raw.githubusercontent.com/vega/vega/master/examples/bar.json"
    layout="responsive"
    width="400" height="200"></amp-viz-vega>
```

```html
 <amp-viz-vega width="400" height="400" layout="responsive">
    <!-- https://github.com/vega/vega/blob/master/examples/arc.json -->
    <script type="application/json">
      {
        "width": 400,
        "height": 400,
        "data": [
          {
            "name": "table",
            "values": [12, 23, 47, 6, 52, 19],
            "transform": [{"type": "pie", "field": "data"}]
          }
        ],
        "scales": [
          {
            "name": "r",
            "type": "sqrt",
            "domain": {"data": "table", "field": "data"},
            "range": [20, 100]
          }
        ],
        "marks": [
          {
            "type": "arc",
            "from": {"data": "table"},
            "properties": {
              "enter": {
                "x": {"field": {"group": "width"}, "mult": 0.5},
                "y": {"field": {"group": "height"}, "mult": 0.5},
                "startAngle": {"field": "layout_start"},
                "endAngle": {"field": "layout_end"},
                "innerRadius": {"value": 20},
                "outerRadius": {"scale": "r", "field": "data"},
                "stroke": {"value": "#fff"}
              },
              "update": {
                "fill": {"value": "#ccc"}
              },
              "hover": {
                "fill": {"value": "pink"}
              }
            }
          },
          {
            "type": "text",
            "from": {"data": "table"},
            "properties": {
              "enter": {
                "x": {"field": {"group": "width"}, "mult": 0.5},
                "y": {"field": {"group": "height"}, "mult": 0.5},
                "radius": {"scale": "r", "field": "data", "offset": 8},
                "theta": {"field": "layout_mid"},
                "fill": {"value": "#000"},
                "align": {"value": "center"},
                "baseline": {"value": "middle"},
                "text": {"field": "data"}
              }
            }
          }
        ]
      }
      </script>
  </amp-viz-vega>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>src</strong></td>
    <td><p>This attribute can be used to load a Vega specification data file
  from a specified remote URL. The URL must use https scheme.</p>
<p>Alternatively specification data can be included in <code>&lt;script type="application/json"&gt;</code>
  as the only child of <code>&lt;amp-viz-vega&gt;</code>.<br></p>
<p>Only either <code>src</code> or <code>&lt;script&gt;</code> should be specified. Using both will result in error.</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>use-data-width and use-data-height</strong></td>
    <td><p>To support responsive visualization, by default <code>&lt;amp-viz-vega&gt;</code> overrides <code>width</code>
  and <code>height</code> values defined in the Vega specification data with the actual width
  and height of the <code>&lt;amp-viz-vega&gt;</code> element and re-renders when the size of the
  element changes (e.g. going to landscape from portrait on phones).</p>
<p><code>use-data-width</code> and <code>use-data-height</code> attribute can be set to instruct <code>&lt;amp-viz-vega&gt;</code>
  not to override the data-defined width and height values. It is recommended to avoid
  using these attributes as they may result in visualizations that require vertical
  and/or horizontal scrolling to be fully viewable. But they can be used in certain
  cases where it may not be possible for the visualization to scale to fit the given
  width and height. For example, the <em>World Map</em> visualization in the
  <a href="https://github.com/ampproject/amphtml/blob/master/examples/viz-vega.amp.html">examples</a>
  can not realistically scale to the given width and still be usable so it <code>use-data-width</code>
  and allows user to scroll horizontally.</p></td>
  </tr>
</table>
