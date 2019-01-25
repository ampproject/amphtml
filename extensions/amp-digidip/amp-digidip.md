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

# `amp-digidip`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Run digidip inside your AMP page</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-digidip" src="https://cdn.ampproject.org/v0/amp-digidip-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
</table>

## Overview


Digidip allows you to monetise your content through affiliate marketing. It gives you instant access to over 40,000 merchant affiliate programs without the hassle of network sign ups, approvals or creating affiliate links.

`amp-digidip` is the AMP version of the traditional Digidip scripts which allows you to automatically turn your normal merchant links into monetizable links and gives you access to analytics data about how your content is performing.


## Getting started

A digidip account is required in order to use [amp-digidip](https://digidip.net/)

**Add the required script**
Inside the `<head>...</head>` section of your AMP page, insert this code before the line `<script async src="https://cdn.ampproject.org/v0.js"></script>`

Code:
```html
    <script async custom-element="amp-digidip" src="https://cdn.ampproject.org/v0/amp-digidip-0.1.js"></script>
```

**Add the amp-digidip extension**
Inside the `<body>...</body>` section of your AMP page, insert this code:

Code:
```html
    <amp-digidip
        layout="nodisplay"
        publisher-id="<<publisher id>>"
        hosts-ignore="<<host domains list>>"
        element-clickhandler-attribute="<<html attribute>>"
        element-clickhandler="<<html attribute value>>"
        element-ignore-attribute="<<html element to be ignored when it has a specific value>>"
        element-ignore-pattern="<<html element value to be ignored >>"
    >
    </amp-digidip>
```


The final code should like:

```html
<!doctype html>
<html ⚡>
<head>
  ...
  <script async custom-element="amp-digidip" src="https://cdn.ampproject.org/v0/amp-digidip-0.1.js"></script>
  ...
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
    ...
    <amp-digidip
        layout="nodisplay"
        publisher-id="<<publisher id>>"
        hosts-ignore="<<host domains list>>"
        element-clickhandler-attribute="<<html attribute>>"
        element-clickhandler="<<html attribute value>>"
        element-ignore-attribute="<<html element to be ignored when it has a specific value>>"
        element-ignore-pattern="<<html element value to be ignored >>"
    >
    </amp-digidip>
    ....
</body>
</html>
```

## Attributes

##### publisher-id (required)

The publisher id.

Example:
```html
    <amp-digidip
        ...
        publisher-id="publisher-id-example"
    >
    </amp-digidip>
```

##### hosts-ignore (optional)

A pipe (vertical bar) separated list of domain names.
All the links belonging to a domain in that list will not be affiliated nor tracked by digidip.
By default amp-digidip does not exclude any domains.

Example:
```html
    <amp-digidip
        ...
        hosts-ignore="samsung.com | amazon.com"
    >
    </amp-digidip>
```

##### element-clickhandler-attribute (optional)

The `element-clickhandler-attribute` allows you to restrict which links amp-digidip
should affiliate and track. Only the links
within the area defined by the provided selector and value will considered.
By default, amp-digidip affiliate and tracks all the links on the page.

The `element-clickhandler-attribute` value should be an `id` or `class` html element attribute.

**WARNING:**
Don't set this option unless you really need it. When using this option, always double check that your attribute and value is
matching your links section.
If you set the `element-clickhandler-attribute` you have to set the value defined by `element-clickhandle`.

Examples:
```html
    <amp-digidip
        ...
        element-clickhandler-attribute="id"
    >
    </amp-digidip>
```

```html
    <amp-digidip
        ...
        element-clickhandler-attribute="class"
    >
    </amp-digidip>
```


##### element-ignore-attribute (optional)

The `element-ignore-attribute` allows you to restrict which links should be ignored. It
The `element-ignore-attribute` value is a html element attribute included the following group: `id`, `class`, `rev`, `rel`

**WARNING:**
If you set the `element-ignore-attribute` you have to set the value defined by `element-ignore-pattern`.


Example:

```html
    <amp-digidip
        ...
        element-ignore-attribute="rel"
        element-ignore-pattern="bypass"
    >
    </amp-digidip>
```

##### element-ignore-pattern (optional)

The `element-ignore-pattern` allows you to define the value for `element-ignore-attribute`.

**WARNING:**
If you set the `element-ignore-pattern` you have to set the value defined by `element-ignore-attribute`.


Example:

```html
    <amp-digidip
        ...
        element-ignore-attribute="rel"
        element-ignore-pattern="bypass"
    >
    </amp-digidip>
```


## Validation

See [amp-digidip rules](validator-amp-digidip.protoascii) in the AMP validator specification.
