<!---
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

# <a name="amp-auto-ads"></a> `amp-auto-ads`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Dynamically injects ads into an AMP page by
      using a remotely-served configuration file.
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Experimental</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <code>
        &lt;script async custom-element="amp-auto-ads"
        src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js">&lt;/script>
      </code>
    </td>
  </tr>
  <tr>
    <td class="col-fourty">
      <strong>
        <a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">
          Supported Layouts
        </a>
      </strong>
    </td>
    <td>N/A</td>
  </tr>
</table>

[TOC]

## Behavior
Given a sufficient number of valid placements (supplied in the configuration),
`amp-auto-ads` tries to insert additional ads while adhering to a set of
constraints specified by the ad network. These constraints will limit:
<ul>
  <li>The total number of ads that can be inserted</li>
  <li>The minimum distance that there should be between any adjacent ads</li>
</ul>
In addition to this, ads will only be inserted in locations on the page that do
not cause an unacceptable re-flow (as determined by attemptChangeSize).

The `<amp-auto-ads>` tag should be placed as the first child of the `<body>`.

The ad network type and any additional information (required by the ad network)
should be specified on the tag.
```html
<amp-auto-ads
    type="adsense"
    data-ad-client="ca-pub-5439573510495356">
</amp-auto-ads>
```

## Supported ad networks
- [AdSense](../../ads/google/adsense.md)

## Attributes

##### type (required)

An identifier for the ad network.

##### data-foo-bar

Most ad networks require further configuration, which can be passed to the network by using HTML `data-` attributes. The parameter names are subject to standard data attribute dash to camel case conversion. For example, "data-foo-bar" is send to the ad for configuration as "fooBar".  See the documentation for the [ad network](#supported-ad-networks) on which attributes can be used.

##### common attributes

This element includes [common attributes](https://www.ampproject.org/docs/reference/common_attributes) extended to AMP components.

## Configuration Spec

The configuration defines where on the page `<amp-auto-ads>` can place ads. The configuration is fetched from a third-party ad network at the URL defined in `ad-network-config.js`. The configuration should be a serialized JSON object matching the [`ConfigObj`](#configobj) definition described below.

### Example Configuration

The following example specifies that the ad should be positioned immediately
positions immediately after all `<P class='paragraph'>` elements that are within the third `<DIV id='domId'>` on the page. An ad placed in any of these positions should be of type BANNER and have a top margin of 4px and a bottom margin of 10px.

```json
{
  "placements": [
    {
      "anchor": {
        "selector": "DIV#domId",
        "index": 2,
        "sub": {
          "selector": "P.paragraph",
          "all": true,
        },
      },
      "pos": 4,
      "type": 1,
      "style": {
        "top_m": 5,
        "bot_m": 10,
      },
    },
  ]
}
```
### Object Definitions

#### ConfigObj

The fields to specify in the configuration object: 

<table>
  <tr>
    <th class="col-thirty">Field Name</th>
    <th class="col-thirty">Type</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td><code>placements</code></td>
    <td>Array&lt;!PlacementObj&gt;</td>
    <td>A <strong>required</strong> field that indicates the potential places where ads can be inserted on the page.</td>
  </tr>
  <tr>
    <td><code>attributes</code></td>
    <td>Object&lt;string, string&gt;</td>
    <td>An <em>optional</em> field that specifies a mapping from the attribute name to attribute values to apply to all <code>&lt;amp-ad&gt;</code> elements injected using this configuration. Only the following attribute names are allowed:
      <ul>
        <li>type</li>
        <li>layout</li>
        <li>data-* (i.e. any data attribute)</li>
      </ul>
    </td>
  </tr>
</table>

#### PlacementObj

The fields to specify in the `placements` configuration object: 

<table>
  <tr>
    <th class="col-thirty">Field Name</th>
    <th class="col-thirty">Type</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td><code>anchor</code></td>
    <td><a href="#anchorobj">AnchorObj</a></td>
    <td>A <strong>required</strong> field that provides information used to look up the element(s) on the page that the placement position is anchored to.
    </td>
  </tr>
  <tr>
    <td><code>pos</code></td>
    <td><a href="#relativepositionenum">RelativePositionEnum</a></td>
    <td>A <strong>required</strong> field that indicates the position of the placement relative to its anchor element.</td>
  </tr>
  <tr>
    <td><code>type</code></td>
    <td><a href="#placementtypeenum">PlacementTypeEnum</a></td>
    <td>A <strong>required</strong> field that indicates the type of placement.</td>
  </tr>
  <tr>
    <td><code>style</code></td>
    <td><a href="#placementstyleobj">PlacementStyleObj</a></td>
    <td>An <em>optional</em> field that indicates any styling that should be applied to an ad inserted in this placement position.
    </td>
  </tr>
  <tr>
    <td><code>attributes</code></td>
    <td>Object&lt;string, string&gt;</td>
    <td>An <em>optional</em> field for a  map from attribute name to value for attributes to apply to all <code>&lt;amp-ad&gt;</code> elements injected using this placement. An attribute specified here overrides any with the same name that is also specified on the parent <code>ConfigObj</code>. Only the following attribute names are allowed:
      <ul>
        <li>type</li>
        <li>layout</li>
        <li>data-* (i.e. any data attribute)</li>
      </ul>
    </td>
  </tr>
</table>

#### AnchorObj

The fields to specify in the `anchor` configuration object: 

<table>
  <tr>
    <th class="col-thirty">Field Name</th>
    <th class="col-thirty">Type</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td><code>selector</code></td>
    <td>string</td>
    <td>A <strong>required</strong> field that defines a CSS selector to select the element(s) at this level of the anchor definition.
    </td>
  </tr>
  <tr>
    <td><code>index</code></td>
    <td>number</td>
    <td>An <em>optional</em> field to specify the index of the elements selected by the selector that this level of the anchor definition should be limited to. By default, the value is set to 0 (if the <code>all</code> field is false).</td>
  </tr>
  <tr>
    <td><code>all</code></td>
    <td>boolean</td>
    <td>Ignored if the <code>index</code> field was specified. If set to <code>true</code>indicates that all elements selected by the selector should be included; otherwise set to <code>false</code>.
    </td>
  </tr>
  <tr>
    <td><code>min_c</code></td>
    <td>number</td>
    <td>An <em>optional</em> field that specifies the minimum length of an element's textContent property for it to be included. The default value is 0.</td>
  </tr>
  <tr>
    <td><code>sub</code></td>
    <td>AnchorObj</td>
    <td>An <em>optional</em> field that specifies a recursive <code>AnchorObj</code> that will select elements within any elements selected at this level of anchor definition.
    </td>
  </tr>
</table>

#### PlacementStyleObj

The fields to specify in the `style` configuration object: 

<table>
  <tr>
    <th class="col-twenty">Field Name</th>
    <th class="col-twenty">Type</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td><code>top_m</code></td>
    <td>number</td>
    <td>An <em>optional</em> field that indicates the top margin in pixels that an ad inserted in this position should have. Default value: 0.
    </td>
  </tr>
  <tr>
    <td><code>bot_m</code></td>
    <td>number</td>
    <td>An <em>optional</em> field that indicates the bottom margin in pixels that an ad inserted in this position should have. Default value: 0.
    </td>
  </tr>
</table>

#### RelativePositionEnum

The ENUM values for the `pos` field in the `placements` configuration object: 

<table>
  <tr>
    <th class="col-fourty">Name</th>
    <th class="col-twenty">Value</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td>BEFORE</td>
    <td>1</td>
    <td>Ad should be inserted as sibling immediately before the anchor.</td>
  </tr>
  <tr>
    <td>FIRST_CHILD</td>
    <td>2</td>
    <td>Ad should be inserted as the first child of the anchor.</td>
  </tr>
  <tr>
    <td>LAST_CHILD</td>
    <td>3</td>
    <td>Ad should be inserted as the last child of the anchor.</td>
  </tr>
  <tr>
    <td>AFTER</td>
    <td>4</td>
    <td>Ad should be inserted as sibling immediately after the anchor.</td>
  </tr>
</table>

#### PlacementTypeEnum

The ENUM values for the `type` field in the `placements` configuration object: 

<table>
  <tr>
    <th class="col-fourty">Name</th>
    <th class="col-twenty">Value</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td>BANNER</td>
    <td>1</td>
    <td>Placement describes a banner ad position.</td>
  </tr>
</table>

## Validation

See [amp-auto-ads rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-auto-ads/validator-amp-auto-ads.protoascii) in the AMP validator specification.
