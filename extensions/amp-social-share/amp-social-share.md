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

# <a name="amp-social-share"></a>`amp-social-share`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Displays a social share button.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>
      Stable
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td>
      <div>
        <code>&lt;script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js">&lt;/script></code>
      </div>
    </td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>container, fill, fixed, fixed-height, flex-item, nodisplay, responsive</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-social-share/">Annotated code example for amp-social-share</a>
    </td>
  </tr>
</table>


## Attributes
**type** (__required__)
Selects pre-configured type. This is required for both pre-configured and external providers.

**data-share-endpoint** (__required__ for non-configured providers)
`amp-social-share` has some pre-configured share endpoints for popular providers, see section about [Pre-configured Providers](#pre-configured-providers). 

**data-param-\***
All `data-param-*` prefixed attributes will be turned into URL parameters and passed to the share endpoint.  

#### The simplest example:
The share button guesses some defaults for you for some already configured providers. It assumes that the current document canonical url is the URL you want to share and the page title is the text you want to share.
```html
<amp-social-share type="twitter"></amp-social-share>
```

#### Simple Examples:
When you want to pass params to the share endpoint, you can specify ```data-param-<attribute>``` that will be appended to the share endpoint.
```html
<amp-social-share type="linkedin" width="60" height="44"
  data-param-text="Hello world"
  data-param-url="https://example.com/">
</amp-social-share>
```

Linkedin is one of the configured providers so no need to provide `data-share-endpoint` attribute.

#### Default Styles:
By default `amp-social-share` comes with few pre-configured popular social share providers. These are styled with the provider official color and logo.
__width__: default 60px
__height__: default 44px

#### Custom Styles:
Sometimes you want to provide your own style. You can simply override the provided styles like the following: 
```css
amp-social-share[type="twitter"] {
  background: red;
  background-image: url(datauri:svg/myownsvgicon);
}
```

### Pre-configured Providers
The element provides [some pre-configured providers](0.1/amp-social-share-config.js) that knows its sharing endpoint as well as some default parameters. 

- twitter
    - url `optional` (defaults: `rel=canonical` URL)
    - text `optional` (defaults: Current page title)
- facebook
    - href `optional` (defaults: `rel=canonical` URL)
    - text `optional` (defaults: none)
    - app_id `required` (defaults: none) Required by [Facebook share dialog](https://developers.facebook.com/docs/sharing/reference/share-dialog).
- pinterest
    - url `optional` (defaults: `rel=canonical` URL)
- linkedin
    - url `optional` (defaults: `rel=canonical` URL)
- gplus
    - url `optional` (defaults: `rel=canonical` URL)
- tumblr
    - url `optional` (defaults: `rel=canonical` URL)
    - name `optional` (defaults: Current page title)
- email
    - subject `optional` (defaults: Crrent page title)
    - body `optional` (defaults: `rel=canonical` URL)

### Un-configured Providers
`amp-social-share` allows you to use any provider you'd like that is not pre-configured. By configuring the element with more attributes.

#### Example
The following example will create a share button through whatsapp, by setting `data-share-endpoint` attribute to the correct endpoint for whatsapp ustom protocol.
```html
<amp-social-share type="whatsapp"
                layout="container"
                data-share-endpoint="whatsapp://send"
                data-param-text="Check out this article: TITLE - CANONICAL_URL">
    Share on Whatsapp
</amp-social-share>
```

##### Var Substitution
You can use the [global AMP variables substitution](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md) in the `<amp-social-share>` element. For exmaple, the above example will substitute `TITLE` with the page title and `CANONICAL_URL` with the document canonical URL.
