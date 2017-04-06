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
    <td>
      <code>amp-auto-ads</code> dynamically injects ads into an AMP page by
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

## Behavior
Given a sufficient number of valid placements (supplied in the configuration),
`amp-auto-ads` will try to insert additional ads within the following
constraints:
<ul>
  <li>No more than 3 ads on the page (including any existing ads)</li>
  <li>No injected ad within 500px (measured vertically) of another ad</li>
  <li>
    An injected ad does not cause any unacceptable re-flow (as determined by
    attemptChangeSize).
  </li>
</ul>

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

**type**

An identifier for the ad network.

## Validation

See [amp-auto-ads rules](0.1/validator-amp-auto-ads.protoascii) in the AMP validator specification.

## Configuration Spec
The configuration defines where on the page amp-auto-ads can place ads. It is
fetched from a 3rd party ad network at the URL defined in
`ad-network-config.js`. It should be a serialized JSON object matching the
`ConfigObj` definition below.

### Object Definitions

#### ConfigObj
<table>
  <tr>
    <th>Field Name</th>
    <th>Required</th>
    <th>Type</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>placements</td>
    <td>Yes</td>
    <td>Array&lt;!PlacementObj&gt;</td>
    <td></td>
    <td>The potential places where ads can be inserted on the page.</td>
  </tr>
  <tr>
    <td>attributes</td>
    <td>No</td>
    <td>Object&lt;string, string&gt;</td>
    <td>{}</td>
    <td>
      A map from attribute name to value for attributes to apply to all
      <code>&lt;amp-ad&gt;</code> elements injected using this configuration.
      Only the following attribute names are allowed:
      <ul>
        <li>type</li>
        <li>layout</li>
        <li>data-* (i.e. any data attribute)</li>
      </ul>
    </td>
  </tr>
</table>

#### PlacementObj
<table>
  <tr>
    <th>Field Name</th>
    <th>Required</th>
    <th>Type</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>anchor</td>
    <td>Yes</td>
    <td>AnchorObj</td>
    <td></td>
    <td>
      Information used to look up the element(s) on the page that the
      placement position is anchored to.
    </td>
  </tr>
  <tr>
    <td>pos</td>
    <td>Yes</td>
    <td>RelativePositionEnum</td>
    <td></td>
    <td>The position of the placement relative to its anchor element.</td>
  </tr>
  <tr>
    <td>type</td>
    <td>Yes</td>
    <td>PlacementTypeEnum</td>
    <td></td>
    <td>The type of placement.</td>
  </tr>
  <tr>
    <td>style</td>
    <td>No</td>
    <td>PlacementStyleObj</td>
    <td>{}</td>
    <td>
      Any styling that should be applied to an ad inserted in this placement
      position.
    </td>
  </tr>
  <tr>
    <td>attributes</td>
    <td>No</td>
    <td>Object&lt;string, string&gt;</td>
    <td>{}</td>
    <td>
      A map from attribute name to value for attributes to apply to all
      <code>&lt;amp-ad&gt;</code> elements injected using this placement. An
      attribute specified here overrides any with the same name that is also
      specified on the parent <code>ConfigObj</code>. Only the following
      attribute names are allowed:
      <ul>
        <li>type</li>
        <li>layout</li>
        <li>data-* (i.e. any data attribute)</li>
      </ul>
    </td>
  </tr>
</table>

#### AnchorObj
<table>
  <tr>
    <th>Field Name</th>
    <th>Required</th>
    <th>Type</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>selector</td>
    <td>Yes</td>
    <td>string</td>
    <td></td>
    <td>
      A CSS selector to select the element(s) at this level of the anchor
      definition.
    </td>
  </tr>
  <tr>
    <td>index</td>
    <td>No</td>
    <td>number</td>
    <td>0 (if the <code>all</code> field not set to true)</td>
    <td>
      The index of the elements selected by the selector that this level of the
      anchor definition should be limited to.
    </td>
  </tr>
  <tr>
    <td>all</td>
    <td>No</td>
    <td>boolean</td>
    <td>false</td>
    <td>
      Ignored if index field set. If true then indicates that all elements
      selected by the selector should be included.
    </td>
  </tr>
  <tr>
    <td>min_c</td>
    <td>No</td>
    <td>number</td>
    <td>0</td>
    <td>
      The minimum length of an element's textContent property for it to be
      included.
    </td>
  </tr>
  <tr>
    <td>sub</td>
    <td>No</td>
    <td>AnchorObj</td>
    <td></td>
    <td>
      A recursive <code>AnchorObj</code> that will select elements within any elements
      selected at this level of anchor definition.
    </td>
  </tr>
</table>

#### PlacementStyleObj
<table>
  <tr>
    <th>Field Name</th>
    <th>Required</th>
    <th>Type</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>top_m</td>
    <td>No</td>
    <td>number</td>
    <td>0</td>
    <td>
      The top margin in pixels that an ad inserted in this position should have.
    </td>
  </tr>
  <tr>
    <td>bot_m</td>
    <td>No</td>
    <td>number</td>
    <td>0</td>
    <td>
      The bottom margin in pixels that an ad inserted in this position should
      have.
    </td>
  </tr>
</table>

#### RelativePositionEnum
<table>
  <tr>
    <th>Name</th>
    <th>Value</th>
    <th>Description</th>
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
<table>
  <tr>
    <th>Name</th>
    <th>Value</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>BANNER</td>
    <td>1</td>
    <td>Placement describes a banner ad position.</td>
  </tr>
</table>

### Example Configuration

The following example specifies that the ad should be positioned immediately
positions immediately after all `<P class='paragraph'>` elements that are within
the 3rd `<DIV id='domId'>` on the page. An ad placed in any of these positions
should be of type BANNER and have a top margin of 4px and a bottom margin of
10px.
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
