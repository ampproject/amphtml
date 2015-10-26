### <a name="amp-ad"></a> `amp-ad`

NOTE: The specification of `amp-ad` is likely to significantly evolve over time. The current approach is designed to bootstrap the format to be able to show ads.

A container to display an ad.

Ads are loaded like all other resources in AMP documents, with a special
custom element called `<amp-ad>`. No ad network provided JavaScript is allowed to run inside the AMP document. Instead the AMP runtime loads an iframe from a
different origin (via iframe sandbox) as the AMP document and executes the ad
network’s JS inside that iframe sandbox.
<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

AMP documents only support ads served via HTTPS.

#### Behavior

The `<amp-ad>` requires width and height values to be specified like all
resources in AMP. It requires a `type` argument that select what ad network is displayed. All `data-*` attributes on the tag are automatically passed as arguments to the code that eventually renders the ad. What `data-` attributes are required for a given type of network depends and must be documented with the ad network.
```html
<amp-ad width=300 height=250
    type="a9"
    data-aax_size="300x250"
    data-aax_pubname="test123"
    data-aax_src="302">
</amp-ad>
```

#### Styling

`<amp-ad>` elements may not themselves have or be placed in containers that have CSS `position: fixed` set (with the exception of `amp-lightbox`).
This is due to the UX implications of full page overlay ads. It may be considered to allow similar ad formats in the future inside of AMP controlled containers that maintain certain UX invariants.

#### Attributes

**type**

Identifier for the ad network. This selects the template that is used for the ad tag.

**src**

Optional src value for a script tag loaded for this ad network. This can be used with ad networks that require exactly a single script tag to be inserted in the page. The src value must have a prefix that is whitelisted for this ad network.

**data-foo-bar**

Most ad networks require further configuration. This can be passed to the network using HTML `data-` attributes. The parameter names are subject to standard data attribute dash to camel case conversion. E.g. "data-foo-bar" is send to the ad for configuration as "fooBar".

**json**

Optional attribute to pass configuration to the ad as an arbitrarily complex JSON object. The object is passed to the ad as-is with no mangling done on the names.

#### Placeholder

Optionally `amp-ad` supports a child element with the `placeholder` attribute. If supported by the ad network, this element is shown if no ad is available for this slot.
```html
<amp-ad width=300 height=250
    type="foo">
  <div placeholder>Have a great day!</div>
</amp-ad>
```
#### Supported ad networks

- [A9](../ads/a9.md)
- [AdReactor](../ads/adreactor.md)
- [AdSense](../ads/adsense.md)
- [AdTech](../ads/adtech.md)
- [Doubleclick](../ads/doubleclick.md)


#### Running ads from a custom domain

AMP supports loading the bootstrap iframe that is used to load ads from a custom domain such as your own domain.

To enable this, copy the file [remote.html](../3p/remote.html) to your web server. Next up add the following meta tag to your AMP file(s):

```html
<meta name="amp-3p-iframe-src" content="https://assets.your-domain.com/path/to/remote.html">
```

The `content` attribute of the meta tag is the absolute URL to your copy of the remote.html file on your web server. This URL must use a "https" schema. It is not allowed to reside on the same origin as your AMP files. E.g. if you host AMP files on "www.example.com", this URL must not be on "www.example.com" but e.g. "something-else.example.com" is OK.
