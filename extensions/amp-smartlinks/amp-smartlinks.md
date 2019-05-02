<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# <a name="amp-smartlinks"></a> `amp-smartlinks`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Run Narrativ's Linkmate process inside your AMP page</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-smartlinks" src="https://cdn.ampproject.org/v0/amp-smartlinks-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
</table>

## Overview

 At [Narrativ](https://narrativ.com/), we transform static commerce links into dynamic, multimerchant nodes. With a library of millions of products matched to expert reviews from top commerce publishers, we lift publisher revenue through real-time bidding and data solutions.

This AMP extension is our Linkmate service in AMP. See the full documentation for Linkmate [here](http://docs.narrativ.com/en/stable/linkmate.html).

## Getting started

Your account must be a member of our Linkmate program to use this feature. For more information about this program, feel free to contact your account manager or [hello@narrativ.com](mailto:hello@narrativ.com).

NOTE: If you plan to use `amp-smartlinks` alongside other affiliate partners you will need to specify the meta tag shown below. The tag will specify the order in which the affiliate tags fire.

In your AMP page you will have to add the following snippets:

```html
<!doctype html>
<html ⚡>
<head>
  ...
  <meta name="amp-link-rewriter-priorities" content="amp-smartlinks amp-other-affiliate">
  <script async custom-element="amp-smartlinks" src="https://cdn.ampproject.org/v0/amp-smartlinks-0.1.js"></script>
  ...
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
    ...
    <amp-smartlinks
        layout="nodisplay"
        nrtv-account-name="supercoolpublisher"
        linkmate>
    </amp-smartlinks>
    ...
</body>
</html>
```

## Attributes

<table>
  <tr>
    <td class="col-fourty"><strong>nrtv-account-name</strong></td>
    <td><strong>Required</strong></td>
    <td>Your Narrativ account name given to you by your account manager. Need to know your Narrativ account name? Log into <a href="https://dashboard.narrativ.com/#/login">dashboard.narrativ.com</a> and go to <a href="https://dashboard.narrativ.com/#/publisher/account/setup">setup</a> to see your account name in the snippet, or reach out to your account manager for support as needed.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>linkmate</strong></td>
    <td><strong>Optional</strong></td>
    <td>Flag to run our Linkmate service on an article. Inserting the attribute <code>linkmate</code> in the <code>amp-smartlinks</code> element will run our linkmate service.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>exclusive-links</strong></td>
    <td><strong>Optional</strong></td>
    <td>Flag to mark links as exclusive. Inserting the attribute <code>exclusive-links</code> in the <code>amp-smartlinks</code> element will generate exclusive links for the article.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>link-attribute</strong></td>
    <td><strong>Optional</strong></td>
    <td>If you store the "plain" url for a link in a different element attribute than <code>href</code> you can specify so here. Default value: <code>href</code>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>link-selector</strong></td>
    <td><strong>Optional</strong></td>
    <td>A CSS selector to get all links you want monetized from an article. Default value: <code>a</code>.</td>
  </tr>
</table>

## Validation

See [amp-smartlinks rules](validator-amp-smartlinks.protoascii) in the AMP validator specification.
