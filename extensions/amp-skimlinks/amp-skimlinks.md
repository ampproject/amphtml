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

# <a name="amp-skimlinks"></a> `amp-skimlinks`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Run skimlinks inside your AMP page</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-skimlinks" src="https://cdn.ampproject.org/v0/amp-skimlinks-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
</table>

## Overview

Skimlinks allows you to monetise your content through affiliate marketing. It gives you instant access to over 24,000 merchant affiliate programs without the hassle of network sign ups, approvals or creating affiliate links.

`amp-skimlinks` is the AMP version of the traditional Skimlinks scripts which allows you to automatically turn your normal merchant links into monetisable links and gives you access to analytics data about how your content is performing.

## Getting started

**Add the required script**
Inside the `<head>...</head>` section of your AMP page, insert this code before the line `<script async src="https://cdn.ampproject.org/v0.js"></script>`

Code:
```html
    <script async custom-element="amp-skimlinks" src="https://cdn.ampproject.org/v0/amp-skimlinks-0.1.js"></script>
```

**Add the amp-skimlinks extension**
Inside the `<body>...</body>` section of your AMP page, insert this code:

Code:
```html
    <amp-skimlinks
        layout="nodisplay"
        publisher-code="123X456"
    >
    </amp-skimlinks>
```


The final code should like:

```html
<!doctype html>
<html ⚡>
<head>
  ...
  <script async custom-element="amp-skimlinks" src="https://cdn.ampproject.org/v0/amp-skimlinks-0.1.js"></script>
  ...
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
    ...
    <amp-skimlinks
        layout="nodisplay"
        publisher-code="YOUR_SKIMLINKS_CODE"
    ></amp-skimlinks>
    ....
</body>
</html>
```

## Attributes

##### publisher-code (required)

Your skimlinks publisher code (also called "site Id").

If you don't know what's your publisher code, you can find it on the [Skimlinks Hub](https://hub.skimlinks.com/settings/sites) ("Site ID" column.).

Example:
```html
    <amp-skimlinks
        ...
        publisher-code="123X456"
    >
    </amp-skimlinks>
```

##### excluded-domains (optional)

A whitespace separated list of domain names.
All the links belonging to a domain in that list will not be affiliated nor tracked by skimlinks.
By default amp-skimlinks does not exclude any domains.

Example:
```html
    <amp-skimlinks
        ...
        excluded-domains="samsung.com amazon.com"
    >
    </amp-skimlinks>
```

##### link-selector (optional)

`link-selector` allows you to restrict which links amp-skimlinks should affiliate and track. All the links
not matching the provided selector will simply be ignored.
By default, amp-skimlinks affiliate and tracks all the links on the page.

`link-selector` value should be a valid [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)

**WARNING:**
Don't set this option unless you really need it.
When using this option, always double check that your CSS selector is matching your links. When `link-selector` is provided, only the links matching the provided CSS selector would be able to generate revenue, any other links would be ignored.

(e.g: `div.content` would not match any links and therefore not generate any revenue while `div.content a` would)!


Example:
```html
    <amp-skimlinks
        ...
        link-selector="article:not(.no-skimlinks) a"
    >
    </amp-skimlinks>
```

##### custom-tracking-id (optional)

The `custom-tracking-id` (also `called xcust`) is an optional parameter used to pass your own internal tracking id through Skimlinks' monetization system allowing you to segment your commission data in the way you want.

`custom-tracking-id` should be <=50 characters and only contain upper and lowercase characters, numbers, underscores and pipes.


## Validation

See [amp-skimlinks rules](validator-amp-skimlinks.protoascii) in the AMP validator specification.