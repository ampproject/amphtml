---
$category: social
formats:
  - websites
teaser:
  text: A container to display a chatbot and live chat widget.
---

<!--
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

# `amp-quicktext`

Displays a <a href="https://www.quicktext.im/">Quicktext</a> live chat widget.

<table>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-quicktext" src="https://cdn.ampproject.org/v0/amp-quicktext-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td>FILL THIS IN</td>
  </tr>
</table>

## Behavior

This extension will allow you to integrate and show the <a href="https://www.quicktext.im/">Quicktext</a> live chat widget to your AMP website and take advantages of its services along side with other powerful AMP features.

## Examples

Basic example, since `license` and `layout` are the only mandatory attributes, you can just use:

Basic:

```html
  <amp-quicktext
    license="XXXXX-XXXX"
    layout="nodisplay"
  ></amp-quicktext>
```

If you want to choose display language or to customise any other setting you want, you can add the related attribute, so the code became something like:

Custom:

```html
  <amp-quicktext
    license="XXXXX-XXXX"
    lang="fr"
    url="http://cdn.qt.im/1.4.30/qt.min.js"
    tags="home,group-1"
    layout="nodisplay"
  ></amp-quicktext>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>license</strong></td>
    <td>This attribute is required, Its value is your unique <strong>identifier and authorisation</strong> to use Quicktext services. If you don't have a license, please <a href="https://www.quicktext.im/contact/">contact the service provider</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>lang (optional)</strong></td>
    <td>This attribute is optional, It let you choose the language that you want the widget to display with. If you don't specify one, The widget will take the browser's language as default language.<br/>You can use <strong>ISO 639-1</strong> (eg: pt, en) or <strong>IETF language tag code</strong> (eg: pt-BR, en-US) as value. The widget supports 11 languages Czech, Dutch, English, Spanish, French, Italian, German, Portuguese, Brazilian Portuguese, Russian and Simplified Chinese.</td>
  </tr>
  <tr>
    <td width="40%"><strong>url (optional)</strong></td>
    <td>This attribute is optional, It let you specify which version of widget you want to integrate in your website. The value of this attribute is the resource link of the widget source code. If you don't specify one, the latest stable version will take place.</td>
  </tr>
  <tr>
    <td width="40%"><strong>tags (optional)</strong></td>
    <td>This attribute is optional, It defines a tag or tags list that would help you to determine (as example) in which page/website your customer is using the widget. this attribute will be very useful in case you integrate the widget with the same license in many websites. you can add many tags separated with commas</td>
  </tr>
</table>

## Validation

See [amp-quicktext rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-quicktext/validator-amp-quicktext.protoascii) in the AMP validator specification.

