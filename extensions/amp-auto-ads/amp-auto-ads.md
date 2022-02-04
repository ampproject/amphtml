---
$category@: ads-analytics
formats:
  - websites
teaser:
  text: Dynamically injects ads into an AMP page by using a remotely-served configuration file.
---

# amp-auto-ads

## Usage

Dynamically injects ads into an AMP page by using a remotely-served configuration file.

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
<amp-auto-ads type="adsense" data-ad-client="ca-pub-5439573510495356">
</amp-auto-ads>
```

### Supported ad networks

-   [AdSense](../../ads/google/adsense.md)
-   [Alright](https://alright.com.br)
-   [Denakop](https://denakop.com)
-   [DoubleClick (experimental)](../../ads/google/doubleclick.md)
-   [FirstImpression.io](https://www.firstimpression.io)
-   [Premium Programmatic](https://premiumads.com.br)
-   [Wunderkind](https://wunderkind.co)

### Configuration Spec

The configuration defines where on the page `<amp-auto-ads>` can place ads. The configuration is fetched from a third-party ad network at the URL defined in `ad-network-config.js`. The configuration should be a serialized JSON object matching the [`ConfigObj`](#configobj) definition described below.

#### Example Configuration

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
          "all": true
        }
      },
      "pos": 4,
      "type": 1,
      "style": {
        "top_m": 5,
        "bot_m": 10
      }
    }
  ]
}
```

#### Object Definitions

##### ConfigObj

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
  <tr>
    <td><code>adConstraints</code></td>
    <td>AdConstraintsObj</td>
    <td>
      An <em>optional</em> field that specifies the constraints that should be used when placing ads on the page. If not specified then
      <code>amp-auto-ads</code> will attempt to use the default constraints specified in [ad-network-config.js](0.1/ad-network-config.js).
    </td>
  </tr>
</table>

##### PlacementObj

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
  <tr>
    <td><code>stickyAdAttributes</code></td>
    <td>Object&lt;string, string&gt;</td>
    <td>An <em>optional</em> field for a  map from attribute name to value for attributes to apply to all <code>&lt;amp-sticky-ad&gt;</code> elements injected using this placement. Only the following attribute names are allowed:
      <ul>
        <li>data-* (i.e. any data attribute)</li>
      </ul>
    </td>
  </tr>
</table>

##### AnchorObj

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

##### PlacementStyleObj

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

##### RelativePositionEnum

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

##### AttributesEnum

The ENUM value indicates attributes from configuration object for different ad formats:

<table>
  <tr>
    <th class="col-fourty">Name</th>
    <th class="col-twenty">Value</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td>BASE_ATTRIBUTES</td>
    <td>attributes</td>
    <td>Indicates the `attributes` field in the configuration object.</td>
  </tr>
  <tr>
    <td>STICKY_AD_ATTRIBUTES</td>
    <td>stickyAdAttributes</td>
    <td>Indicates the `stickyAdAttributes` field in the configuration object.</td>
  </tr>
</table>

##### PlacementTypeEnum

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

##### AdConstraintsObj

The fields to specify in the `adConstraints` configuration object:

<table>
  <tr>
    <th class="col-twenty">Field Name</th>
    <th class="col-twenty">Type</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td><code>initialMinSpacing</code></td>
    <td>string</td>
    <td>
      A <strong>required</strong> field that indicates the minimum distance that an ad should be from any ads already on the page (either manually placed or previously placed by amp-auto-ads) at the time of insertion.
      Values are expressed as a number with a units prefix. E.g. "10px" means 10 pixels, or "0.5vp" means half a viewport height. Negative values are invalid. The supported units are:
      <ul>
        <li>px - pixels</li>
        <li>vp - multiple of viewport height</li>
      </ul>
      This value applies only when the number of ads already on the page is less than any <code>adCount</code> matcher specified in the subsequentMinSpacing field.
    </td>
  </tr>
  <tr>
    <td><code>subsequentMinSpacing</code></td>
    <td>Array&lt;!SubsequentMinSpacingObj&gt;</td>
    <td>
      An <em>optional</em> field that specifies the ad spacings that should apply based on how many ads are already on the page at the time of insertion.
    </td>
  </tr>
  <tr>
    <td><code>maxAdCount</code></td>
    <td>number</td>
    <td>
      A <strong>required</strong> field that specifies the maximum number of ads that <code>amp-auto-ads</code> can cause there to be on a page. Both manually placed ads, as well as those placed by <code>amp-auto-ads</code> count towards this total.
      E.g. if this field were set to 5 and there were 3 manually placed ads on the page, then <code>amp-auto-ads</code> would place a maximum of 2 additional ads.
    </td>
  </tr>
</table>

##### SubsequentMinSpacingObj

The fields to specify in the `subsequentMinSpacing` configuration object. `subsequentMinSpacing` entries
can be used to change the spacing required between any additional ads based on the number of ads already on
the page. As an example, consider the following scenario:

<ul>
  <li>2 existing ads on the page</li>
  <li>subsequentMinSpacing field is:
    <code>
      [
        {adCount: 3, spacing: "500px"},
        {adCount: 5, spacing: "1000px"},
      ]
    </code>
  </li>
</ul>
Initially there are 2 existing ads on the page, so no mapping matches.
The minimum spacing therefore defaults to initialMinSpacing in the `AdConstraints` object.
`amp-auto-ads` will recursively try to place ads until it runs out of placements that
could be used without breaking the `adContraints`.
After `amp-auto-ads` has placed its first ad, there are now 3 ads on the page, since
there is a mapping for 3 (or more) ads in `subsequentMinSpacing`, the min spacing now becomes 500px.
This applies up until the point where there are 5 ads on the page, since
there is a rule for 5 ads. Inserting the 6+th ad would then require
it to be clear of other ads by at least 1000px.

<table>
  <tr>
    <th class="col-twenty">Field Name</th>
    <th class="col-twenty">Type</th>
    <th class="col-fourty" >Description</th>
  </tr>
  <tr>
    <td><code>adCount</code></td>
    <td>number</td>
    <td>
      A <strong>required</strong> field.
      The minimum number of ads already on the page that cause this rule to apply (assuming no other rule is a better match). See description above
      for a more detailed explanation.
    </td>
  </tr>
  <tr>
    <td><code>spacing</code></td>
    <td>string</td>
    <td>
      A <strong>required</strong> field that specifies the minimum ad spacing that applies when this rule is matched based on the <code>adCount</code>.
      Values are expressed as a number with a units prefix. E.g. "10px" means 10 pixels, or "0.5vp" means half a viewport height. Negative values are invalid. The supported units are:
      <ul>
        <li>px - pixels</li>
        <li>vp - multiple of viewport height</li>
      </ul>
    </td>
  </tr>
</table>

## Attributes

### `type` (required)

An identifier for the ad network.

### `data-foo-bar`

Most ad networks require further configuration, which can be passed to the
network by using HTML `data–` attributes. The parameter names are subject to
standard data attribute dash to camel case conversion. For example,
"data-foo-bar" is send to the ad for configuration as "fooBar". See the
documentation for the
[ad network](#supported-ad-networks)
on which attributes can be used.

### common attributes

This element includes [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes)
extended to AMP components.

## Validation

See [amp-auto-ads rules](validator-amp-auto-ads.protoascii) in the AMP validator specification.
