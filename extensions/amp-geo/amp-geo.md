---
$category@: dynamic-content
formats:
  - stories
  - websites
teaser:
  text: Provides an approximate country-level geolocation interface.
---

# amp-geo

## Usage

The `amp-geo` component provides country-level geolocation. The `amp-geo`
component also provides a simple mechanism to group countries, making it easier
to apply attributes to several countries at once.

The `amp-geo` component uses the country from which the request originated in
the form of an
[ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 'ISO 3166-1 alpha-2 ')
country code. The `amp-geo` component determines this code from the client's IP
address. The ISO country code may not be the same as the top-level domain. For
example, the code for the United Kingdom is `gb` not `uk`.

It's possible that an IP address with country information in the WHOIS database
will not have country information in `amp-geo`. If the country cannot be
determined, the value is set to `unknown`. If the grouping feature is used at
least one group must contain `unknown`.

The `amp-geo` component provides CSS,
[`amp-bind`](../amp-bind/amp-bind.md) and variable
substitution interfaces.

### Generated CSS classes

If the `amp-iso-country-XX` class is applied to the `body` element, where `XX`
is replaced by the ISO country code or with the value `unknown`, you can use CSS
to modify the `body` element.

In the following example, we add `<amp-geo>` to determine the user's location so
that we can display the appropriate flag.

```html
<amp-geo layout="nodisplay"></amp-geo>
```

If the user is in Canada, the `amp-geo` component applies the
`amp-iso-country-ca` CSS class to the `body` tag. We can then use CSS to apply
the correct background image for Canada:

```css
/* defaults */
.flag {
  background-image: './starsandstripes.png';
}
/* override */
.amp-iso-country-ca .flag {
  background-image: './mapleleaf.png';
}
```

### Optional configuration for grouping locations

Optionally, you can include a JSON configuration script in the `amp-geo` tag.
The `ISOCountryGroups` key allows selections by groups of country codes.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
    {
      "ISOCountryGroups": {
        "soccer": ["au", "ca", "ie", "nz", "us", "za"],
        "football": ["unknown"]
      }
    }
  </script>
</amp-geo>
```

If country groups are specified, `amp-geo` iterates through the groups. For any
group that contains the current country, a class named `amp-geo-group-` followed
by the group name is added to `<body>`. Group names may only contain a-z, A-Z
and 0-9, and may not start with a digit. If no country group is matched the
class `amp-geo-no-group` is added to `body`.

#### Example: Generated CSS classes

```html
<body class="amp-geo-group-football amp-iso-country-gb …"></body>
```

#### Example: Using CSS classes and country groups to change "soccer" to "football"

In the following example, we determine if the user is in a "soccer" country and
display a "football" message for those users.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
    {
      "ISOCountryGroups": {
        "soccer": ["au", "ca", "ie", "nz", "us", "za"],
        "football": ["unknown"]
      }
    }
  </script>
</amp-geo>
```

If the user is in one of the "soccer" countries, the `amp-geo-group-soccer` CSS
class is applied to the `body` tag.

```css
/* defaults */
.football:after {
  content: 'football';
}
/* override */
.amp-geo-group-soccer .football:after {
  content: 'soccer';
}
```

Then it's trivial to use CSS select the correct word (i.e., football).

```html
<div>The game is called <span class="football"></span>!</div>
```

### Preset Country Groups

In addition to user specified country groups `amp-geo` supports preset country
lists. See [`amp-geo-presets.js`](0.1/amp-geo-presets.js)
for the available preset lists.

[tip type="warning"]

GOOGLE AND AMP ARE PROVIDING THIS INFORMATION AS A COURTESY BUT DO NOT GUARANTEE
THE ACCURACY OR COMPLETENESS OF ANY INFORMATION CONTAINED HEREIN. THIS
INFORMATION IS PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE.

[/tip]

#### U.S. California Detection

The `amp-geo` component provides the
[ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) information when it
determines a request is from California. The `preset-us-ca` value from the
preset list supports this feature.

Additional countries may be included with the preset list as in the `myList`
example below.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
    {
      "ISOCountryGroups": {
        "eea": ["preset-eea"],
        "usca": ["preset-us-ca"],
        "myList": ["preset-eea", "preset-us-ca", "ca", "au", "nz"]
      }
    }
  </script>
</amp-geo>
```

#### U.S. Subdivisions Detection

The `amp-geo` component provides the
[ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) information when it
determines a request is from US State or from the District of Columbia
(Washington DC). The values are in a `${country}-${subdivision}` format and
the following codes are supported.

  - `us-al` - Alabama
  - `us-ak` - Alaska
  - `us-az` - Arizona
  - `us-ar` - Arkansas
  - `us-ca` - California
  - `us-co` - Colorado
  - `us-ct` - Connecticut
  - `us-de` - Delaware
  - `us-dc` - District of Columbia
  - `us-fl` - Florida
  - `us-ga` - Georgia
  - `us-hi` - Hawaii
  - `us-id` - Idaho
  - `us-il` - Illinois
  - `us-in` - Indiana
  - `us-ia` - Iowa
  - `us-ks` - Kansas
  - `us-ky` - Kentucky
  - `us-la` - Louisiana
  - `us-me` - Maine
  - `us-md` - Maryland
  - `us-ma` - Massachusetts
  - `us-mi` - Michigan
  - `us-mn` - Minnesota
  - `us-ms` - Mississippi
  - `us-mo` - Missouri
  - `us-mt` - Montana
  - `us-ne` - Nebraska
  - `us-nv` - Nevada
  - `us-nh` - New Hampshire
  - `us-nj` - New Jersey
  - `us-nm` - New Mexico
  - `us-ny` - New York
  - `us-nc` - North Carolina
  - `us-nd` - North Dakota
  - `us-oh` - Ohio
  - `us-ok` - Oklahoma
  - `us-or` - Oregon
  - `us-pa` - Pennsylvania
  - `us-ri` - Rhode Island
  - `us-sc` - South Carolina
  - `us-sd` - South Dakota
  - `us-tn` - Tennessee
  - `us-tx` - Texas
  - `us-ut` - Utah
  - `us-vt` - Vermont
  - `us-va` - Virginia
  - `us-wa` - Washington
  - `us-wv` - West Virginia
  - `us-wi` - Wisconsin
  - `us-wy` - Wyoming

Additional countries/subdivision may be included with the preset list as in the `usWithSubdivisions`
example below.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
    {
      "ISOCountryGroups": {
        "usca": ["preset-us-ca"],
        "usco":["us-co"],
        "usct":["us-ct"],
        "usva":["us-va"],
        "usWithSubdivisions": ["us-ca", "us-co", "us-ct", "us-va"]
      }
    }
  </script>
</amp-geo>
```

### Render Blocking

By default, the `amp-geo` component is not render blocking. That is, the page
will load and elements will render even if `amp-geo` has not yet loaded and
executed. If it's important that certain elements are never rendered in a
specific geography, use the `amp-geo-pending` class to provide selective render
blocking. This is implemented by the publisher by adding `amp-geo-pending` to
the `<body>` element. When the `amp-geo` script loads, it removes the
`amp-geo-pending` class at the same time as it adds the `amp-iso-country...` and
`amp-geo-group-...` classes.

_Example_: To always suppress an element that has the `foo` class in the United
States, set `<body class="amp-geo-pending">`, and in the CSS include the
following:

```css
.amp-geo-pending .foo,
.amp-iso-country-us .foo {
  display: none;
}
```

This CSS hides the element that has the `foo` class until `amp-geo` has loaded
and continues to hide it if the country is `us`.

[tip type="note"]

Elements such as `amp-ad` and `amp-iframe` do not make external network requests
when set to `display: none`.

[/tip]

[filter formats="websites"]

### Integration with amp-bind

If the `AmpBind` key is present in the configuration, `amp-geo` inserts an
`amp-state` tag containing the current country and group information. Using the
football example above, set the `AmpBind` flag to true to enable `amp-bind`
integration.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
    {
      "AmpBind": true,
      "ISOCountryGroups": {
        "soccer": ["au", "ca", "ie", "nz", "us", "za"],
        "football": ["unknown"]
      }
    }
  </script>
</amp-geo>
```

If the user were in Canada, the inserted `amp-state` would be as follows:

```html
<amp-state id="ampGeo">
  <script type="application/json">
    {
      "ISOCountry": "ca",
      "soccer": true
    }
  </script>
</amp-state>
```

[/filter]<!-- formats="websites" -->

### <a name="variable-substitution"></a>Variable substitution

The country code is also available via AMP variable substitution:

`AMP_GEO` or `${ampGeo}` returns the list of matched groups (comma delimited).
`AMP_GEO(ISOCountry)` or `${ampGeo(ISOCountry)}` returns the country code (or
`unknown`).

The subdivision code is also available via AMP variable substitution:

`AMP_GEO` or `${ampGeo}` returns the list of matched groups (comma delimited).
`AMP_GEO(ISOSubdivision)` or `${ampGeo(ISOSubdivision)}` returns the country
subdivision (or `unknown`).

### Caching

The `amp-geo` JavaScript file is served with a 30-minute cache lifetime
(`Cache-control: private, max-age=1800`) to prevent use of stale geolocation
data and to ensure that the geolocation is accurate when a user moves location.

### Pre-rendering

The `amp-geo` component supports pre-rendering. If the document is served from
the publisher origin and it already contains a class matching
`amp-iso-country-*` `amp-geo` respects that value. `amp-geo` will use the
supplied country and configuration to supply data to cooperating AMP extensions
(e.g., `amp-consent`). If a pre-rendered country code is detected, the document
will not be modified by `amp-geo` to add classes for country group or
`amp-state`.

However, if the document is served via one of the
[AMP caches](../../build-system/global-configs/caches.json),
`amp-geo` removes and replaces any supplied geolocation classes and, if the
`amp-bind` configuration key is true, updates `<amp-state id="ampGeo">`
accordingly. This allows publishers to use their own geolocation code when the
document is served directly from their origin while retaining dynamic
configuration when served from a cache.

Caches that wish to pre-render `amp-geo` should
[open an issue](https://github.com/ampproject/amphtml/issues/new/choose)
requesting to be removed from the pre-render override.

### Self Hosting

Publishers and caches that re-host AMP JavaScript files must implement
server-side patching of the `amp-geo-0.1.js` file or pre-rendering (see above).

The file served from `cdn.ampproject.org` should not be used as a base for
patching because it will have already been patched when downloaded. Instead the
base `./dist/v0/amp-geo-0.1.js` file should be used.

The string `{{AMP_ISO_COUNTRY_HOTPATCH}}` must be replaced at serving time with
the lowercase 2 letter
[ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 'ISO 3166-1 alpha-2 ')
country code corresponding to the requesting IP address. This value should be
padded to match the original length to avoid breaking the
`amp-geo-0.1.max.js.map` file. If the country cannot be determined "unknown"
country can be indicated by either leaving the file un-patched or patching with
a string of spaces of equal length.

### Debugging

Adding `#amp-geo=XX` to the document url forces the country to appear as the
country `XX`. This allows you to test without having to VPN to a country. For
security reasons, to prevent sharing of geo-spoofing urls, this feature is only
available to users who have enabled the
[Experimental Channel](https://amp.dev/documentation/guides-and-tutorials/learn/experimental)
or who are testing locally (i.e., `amp-geo.js` is served in development mode via
[`amp serve`](https://github.com/ampproject/amphtml/blob/main/docs/developing.md)).

[tip type="note"]

Debugging in DevChannel may not work in Safari due to
[ITP](https://webkit.org/blog/8311/intelligent-tracking-prevention-2-0/).

[/tip]

## Validation

See [`amp-geo` rules](validator-amp-geo.protoascii)
in the AMP validator specification.
