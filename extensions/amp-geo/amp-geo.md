<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-geo"></a> `amp-geo`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Provides an approximate country-level geolocation interface.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-geo" src="https://cdn.ampproject.org/v0/amp-geo-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
</table>

[TOC]

## Usage

The `amp-geo` component provides country-level geolocation. The `amp-geo` component also provides a simple mechanism to group countries, making it easier to apply attributes to several countries at once.

##### Example: Changing background based on country location

In the following example, we add `<amp-geo>` to determine the user's location so that we can display the appropriate flag.

```html
<amp-geo layout="nodisplay"></amp-geo>
```

If the user is in Canada, the `amp-geo` component applies the `amp-iso-country-ca` CSS class  to the `body` tag.  We can then use CSS to apply the correct background image for Canada:

```css
/* defaults */
.flag { background-image: "./starsandstripes.png"; }
/* override */
.amp-iso-country-ca .flag { background-image: "./mapleleaf.png"; }
```

## Operation

The `amp-geo` component uses the country from which the request originated in the form of an [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 "ISO 3166-1 alpha-2 ") country code. The `amp-geo` component determines this code from the client's IP address. 

If the country cannot be determined, the value is set to 'unknown'.  If the grouping feature is used at least one group must contain 'unknown'.

Note: It's possible that an IP address with country information in the WHOIS database will not have country information in amp-geo. 

The `amp-geo` component provides CSS, `amp-bind` and variable substitution interfaces. 

### Generated CSS classes
If the `amp-iso-country-XX` class is applied to the `body` element, where 'XX' is replaced by the ISO country code or with the value 'unknown'.

### Optional configuration for grouping locations

Optionally, you can include a JSON configuration script in the `amp-geo` tag.
The `ISOCountryGroups` key allows selections by groups of country codes.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
  {
    "ISOCountryGroups": {
      "soccer": [ "au", "ca", "ie", "nz", "us", "za" ],
      "football": [ "unknown" ]
    }
  }
  </script>
</amp-geo>
```

If country groups are specified, `amp-geo` iterates through the groups. For any group that contains the current country, a class named `amp-geo-group-` followed by the group name is added to `<body>`. Group names may only contain a-z, A-Z and 0-9, and may not start with a digit.

##### Example: Generated CSS classes

```html
<body class="amp-geo-group-football amp-iso-country-gb …" >
```

##### Example: Using CSS classes and country groups to change "soccer" to "football" 

In the following example, we determine if the user is in a "soccer" country and display a "football" message for those users.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
  {
    "ISOCountryGroups": {
      "soccer": [ "au", "ca", "ie", "nz", "us", "za" ],
      "football": [ "unknown" ]
    }
  }
  </script>
</amp-geo>
```

If the user is in one of the "soccer" countries, the `amp-geo-group-soccer` CSS class is applied to the `body` tag.  

```css
/* defaults */
.football:after { content: 'football';}
/* override */
.amp-geo-group-soccer .football:after { content: 'soccer' }
```

Then it's trivial to use CSS select the correct word (i.e., football).

```html
<div>
The game is called <span class='football'></span>!
</div>
```

### Integration with amp-bind

If the `AMPBind` key is present in the configuration, `amp-geo` inserts an `amp-state` tag containing the current country and group information.  Using the football example above, set the  `AMPBind` flag to true to enable `amp-bind` integration.

```html
<amp-geo layout="nodisplay">
  <script type="application/json">
  {
    "AMPBind": true,
    "ISOCountryGroups": {
      "soccer": [ "au", "ca", "ie", "nz", "us", "za" ],
      "football": [ "unknown" ]
    }
  }
  </script>
</amp-geo>
```

If the user were in Canada, the inserted `amp-state` would be as follows:

```html
<amp-state id="ampGeo">
  <script type="application/json">{
	"ISOCountry": "ca",
   	 "soccer": true
   }
   </script>
</amp-state>
```

### <a name="variable-substitution"></a>Variable substitution

The country code is also available via AMP variable substitution:

`AMP_GEO` or `${ampGeo}` returns the list of matched groups (comma delimited).
`AMP_GEO(ISOCountry)` or `${ampGeo(ISOCountry)}` returns the country code (or "unknown").

### Pre-rendering

The `amp-geo` component supports pre-rendering.  If the document is served from the publisher origin and it already contains a class matching `amp-iso-country-*` `amp-geo` respects that value and will not perform any further action, that is, it won't scan country groups or insert `amp-state`.)

However, if the document is served via one of the AMP caches, `amp-geo` removes and replaces any supplied geolocation classes and `amp-state`. This allows publishers to use their own geolocation code when the document is served directly from their origin.

### Caching

The `amp-geo` JavaScript file is served with a 30 minute cache lifetime ( `Cache-control: private, max-age=1800`) to prevent use of stale geolocation data and ensure that the geolocation is accurate when a user moves location.

### Debugging

Adding `#amp-geo=XX` to the document url forces the country to appear as the country `XX`. This allows you to test without having to VPN to a country. For security reasons, to prevent sharing of geo-spoofing urls, this feature is only available to users who have enabled the [Dev Channel](https://www.ampproject.org/docs/reference/experimental) or who are testing locally (i.e., the hostname is `localhost`).

