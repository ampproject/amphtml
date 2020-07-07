---
$category@: ads-analytics
formats:
  - websites
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

# amp-social-share

Displays a social share button.

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
<amp-social-share
  type="linkedin"
  width="60"
  height="44"
  data-param-text="Hello world"
  data-param-url="https://example.com/"
>
</amp-social-share>
```

Linkedin is one of the pre-configured providers, so you do not need to provide the `data-share-endpoint` attribute.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>type (required)</strong></td>
    <td>Selects a provider type. This is required for both pre-configured and non-configured providers.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-target</strong></td>
    <td><p>Specifies the target in which to open the target. The default is <code>_blank</code> for all cases other than email/SMS on iOS, in which case the target is set to <code>_top</code>.</p>
<p>Please note that we only suggest using this override for email.</p></td>
  </tr>
  <tr>
    <td width="40%"><strong>data-share-endpoint</strong></td>
    <td>This attribute is <strong>required for non-configured providers</strong>.
<br>
Some popular providers have pre-configured share endpoints. For details, see the <a href="#pre-configured-providers">Pre-configured Providers</a> section. For non-configured providers, you'll need to specify the share endpoint.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-param-*</strong></td>
    <td>All <code>data-param-*</code> prefixed attributes are turned into URL parameters and passed to the share endpoint.</td>
  </tr>
</table>

## Pre-configured providers

The `amp-social-share` component provides [some pre-configured providers](0.1/amp-social-share-config.js) that know their sharing endpoints as well as some default parameters.

<table>
  <tr>
    <th class="col-twenty">Provider</th>
    <th class="col-twenty">Type</th>
    <th>Parameters</th>
  </tr>
  <tr>
    <td><a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a> (triggers OS share dialog)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li><code>data-param-text</code>: optional, defaults to: "Current page title"</li>
        <li><code>data-mode</code>: optional, if set to <code>replace</code>, all other share options are removed.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Email</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li><code>data-param-subject</code>: optional, defaults to: Current page title</li>
        <li><code>data-param-body</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-recipient</code>: optional, defaults to: '' (empty string)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li><code>data-param-app_id</code>: <strong>required</strong>, defaults to: none. This parameter is the Facebook <code>app_id</code> that's required for the <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook Share dialog</a>.</li>
        <li><code>data-param-href</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-quote</code>: optional. Can be used to share a quote or text.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
      </ul>
    </td>
  </tr>
  </tr>
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li><code>data-param-media</code>: optional (but highly recommended to be set), defaults to: none. Url for the media to be shared on Pinterest. If not set, the end user will be requested to upload a media by Pinterest.</li>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-description</code>: optional, defaults to: Current page title</li>
      </ul>
    </td>
  </tr>
  </tr>
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-text</code>: optional, defaults to: Current page title</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-text</code>: optional, defaults to: Current page title</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li><code>data-param-text</code>: optional, defaults to: "Current page title - current page URL"</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li><code>data-param-url</code>: optional, defaults to: <code>rel=canonical</code> URL</li>
        <li><code>data-param-text</code>: optional, defaults to: Current page title</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li><code>data-param-body</code>: optional, defaults to: <code>rel=title - rel=canonical</code> URL</li></ul>
    </td>
  </tr>
</table>

## Non-configured providers

In addition to pre-configured providers, you can use non-configured providers by specifying additional attributes in the `amp-social-share` component.

**Example: Creating a share button for a non-configured provider**

The following example creates a share button through Facebook Messenger by setting the `data-share-endpoint` attribute to the correct endpoint for the Facebook Messenger custom protocol.

```html
<amp-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
>
</amp-social-share>
```

As these providers are not pre-configured, you'll need to create the appropriate button image and styles for the provider.

## Styles

### Default Styles

By default, `amp-social-share` includes some popular pre-configured providers. Buttons for these providers are styled with the provider's official color and logo. The default width is 60px, and the default height is 44px.

{% call callout('Tip', type='success') %}
Visit [AMP Start](https://ampstart.com/components#links-and-sharing) for responsive, pre-styled share links that you can use in your AMP pages.
{% endcall %}

### Custom Styles

Sometimes you want to provide your own style. You can simply override the provided styles like the following:

```css
amp-social-share[type='twitter'] {
  background: red;
  background-image: url(datauri:svg/myownsvgicon);
}
```

## Variable Substitution

You can use [global AMP variables substitution](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md) in the `<amp-social-share>` element. In the example below, `TITLE` is substituted with the page title and `CANONICAL_URL` with the document's canonical URL.

```html
<amp-social-share
  type="whatsapp"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
>
</amp-social-share>
```

## Validation

See [amp-social-share rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-social-share/validator-amp-social-share.protoascii) in the AMP validator specification.
