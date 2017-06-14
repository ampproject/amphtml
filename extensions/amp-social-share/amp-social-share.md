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

[TOC]

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Displays a social share button.</td>
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
    <td>See AMP By Example's <a href="https://ampbyexample.com/components/amp-social-share/">amp-social-share example</a>.</td>
  </tr>
</table>

## Overview

The `amp-social-share` component displays a social share button for various social platform providers.

## Examples

**Example: Basic social share button**

The share button guesses some defaults for you for some pre-configured providers. It assumes that the current document canonical url is the URL you want to share and the page title is the text you want to share.

```html
<amp-social-share type="twitter"></amp-social-share>
```

**Example: Passing parameters**

When you want to pass parameters to the share endpoint, you can specify `data-param-<attribute>` that will be appended to the share endpoint.
```html
<amp-social-share type="linkedin" width="60" height="44"
  data-param-text="Hello world"
  data-param-url="https://example.com/">
</amp-social-share>
```

Linkedin is one of the pre-configured providers, so you do not need to provide the `data-share-endpoint` attribute.

## Attributes

**type** (__required__)

Selects a provider type. This is required for both pre-configured and non-configured providers.

**data-share-endpoint** (__required__ for non-configured providers)

Some popular providers have pre-configured share endpoints. For details, see the [Pre-configured Providers](#pre-configured-providers) section.  For non-configured providers, you'll need to specify the share endpoint.

**data-param-***

All `data-param-*` prefixed attributes are turned into URL parameters and passed to the share endpoint.


## Pre-configured Providers
The `amp-social-share` component provides [some pre-configured providers](0.1/amp-social-share-config.js) that know their sharing endpoints as well as some default parameters.

<table>
  <tr>
    <th class="col-twenty">Provider</th>
    <th>Parameters</th>
  </tr>
  <tr>
    <td>Email</td>
    <td>
      <ul>
        <li><code>data-param-subject</code>: optional, defaults to: Current page title</li>
        <li><code>data-param-body</code>: optional, defaults to: <code>rel=canonical</code> URL</li></ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td>
      <ul>
        <li><code>data-param-app_id</code>: <strong>required</strong>, defaults to: none. This parameter is required for the <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook Share dialog</a>.</li>
        <li><code>data-param-href</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-quote</code>: optional. Can be used to share a quote or text.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
      </ul>
    </td>
  </tr>
  </tr>
  <tr>
    <td>Pinterest</td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-description</code>: optional, defaults to: Current page title</li>
      </ul>
    </td>
  </tr>
  </tr>
  <tr>
    <td>G+</td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Tumblr</td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-text</code>: optional, defaults to: Current page title</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-text</code>: optional, defaults to: Current page title</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td>
      <ul>
        <li><code>data-param-text</code>: optional, defaults to: "Current page title - current page URL"</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (available in Chrome as an <a href="https://github.com/jpchase/OriginTrials/blob/gh-pages/developer-guide.md">origin trial</a>)</td>
    <td>
      <ul>
        <li><code>data-param-text</code>: optional, defaults to: "Current page title"</li>
        <li><code>data-mode</code>: optional, if set to <code>replace</code>, all other share options are removed.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td>
      <ul>
        <li><code>data-param-body</code>: optional, defaults to: <code>rel=title - rel=canonical</code> URL</li></ul>
    </td>
  </tr>
</table>


### Non-configured Providers

In addition to pre-configured providers, you can use non-configured providers by specifying additional attributes in the `amp-social-share` component.

**Example: Creating a share button for a non-configured provider**

The following example creates a share button through WhatsApp by setting the `data-share-endpoint` attribute to the correct endpoint for the WhatsApp custom protocol.

```html
<amp-social-share type="whatsapp"
    layout="container"
    data-share-endpoint="whatsapp://send"
    data-param-text="Check out this article: TITLE - CANONICAL_URL">
    Share on Whatsapp
</amp-social-share>
```

## Styles

### Default Styles

By default, `amp-social-share` includes some popular pre-configured providers. Buttons for these providers are styled with the provider's official color and logo. The default width is 60px, and the default height is 44px.

### Custom Styles

Sometimes you want to provide your own style. You can simply override the provided styles like the following:
```css
amp-social-share[type="twitter"] {
  background: red;
  background-image: url(datauri:svg/myownsvgicon);
}
```

## Variable Substitution
You can use [global AMP variables substitution](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md) in the `<amp-social-share>` element. In the example below, `TITLE` is substituted with the page title and `CANONICAL_URL` with the document's canonical URL.

```html
<amp-social-share type="whatsapp"
    layout="container"
    data-share-endpoint="whatsapp://send"
    data-param-text="Check out this article: TITLE - CANONICAL_URL">
    Share on Whatsapp
</amp-social-share>
```


## Validation

See [amp-social-share rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-social-share/validator-amp-social-share.protoascii) in the AMP validator specification.
