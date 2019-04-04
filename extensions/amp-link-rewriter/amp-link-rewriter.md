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

# `amp-link-rewriter`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Run link-rewriter inside your AMP page</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-link-rewriter" src="https://cdn.ampproject.org/v0/amp-link-rewriter-0.1.js`>&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong><a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">Supported Layouts</a></strong></td>
    <td>nodisplay</td>
  </tr>
</table>

## Overview

`amp-link-rewriter` allows publishers to rewrite URL based on configurable pattern.

## Getting started


**Add the required script**
Inside the `<head>...</head>` section of your AMP page, insert this code before the line `<script async src="https://cdn.ampproject.org/v0.js"></script>`

Code:
```html
    <script async custom-element="amp-link-rewriter" src="https://cdn.ampproject.org/v0/amp-link-rewriter-0.1.js`"></script>
```

**Add the amp-link-rewriter extension**
Inside the `<body>...</body>` section of your AMP page, insert code as shown below the example (it has to be customized for every vendor use case):

Code:
```html
    <amp-link-rewriter
        layout="nodisplay">

        <script type="application/json">
                {
                    "output": "https://visit.foo.net?pid=110&url=${href}&cid=${customerId}",
                    "section": [
                        "#product-listing-1",
                        "#product-listing-2",
                    ],
                    "attribute": {
                        "href": "((?!(https:\/\/skip\.com)).)*",
                        "id": "comments",
                        "class": "sidebar",
                        "rel": "(?!(skip))*",
                    },
                    "vars": {
                        "customerId": "12345"
                    }
                }
         </script>

    </amp-link-rewriter>
```


The final code should look like:

```html
<!doctype html>
<html ⚡>
<head>
  ...
  <script async custom-element="amp-link-rewriter" src="https://cdn.ampproject.org/v0/amp-link-rewriter-0.1.js"></script>
  ...
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
    ...
    <amp-link-rewriter
        layout="nodisplay">

        <script type="application/json">
                {
                    "output": "https://visit.foo.net?pid=110&url=${href}&cid=${customerId}",
                    "section": [
                        "#product-listing-1",
                        "#product-listing-2",
                    ],
                    "attribute": {
                        "href": "`((?!(https:\/\/skip\.com)).)*`",
                        "id": "comments",
                        "class": "sidebar",
                        "rel": "(?!(skip))*",
                    },
                    "vars": {
                        "customerId": "12345"
                    }
                }
         </script>

    </amp-link-rewriter>
    ....
</body>
</html>
```

## JSON configuration

##### output (required)

The "output" property has to be a string value with the redirection url plus a query string of placeholders that will be shifted with values defined in the config JSON 'vars' property, or in the anchor itself as a data attribute.

Example:
```html
    <amp-link-rewriter
        layout="nodisplay">

        <script type="application/json">
                {
                    "output": "https://visit.foo.net?pid=110&cid=${customerId}`",
                    "vars": {
                        "customerId": "12345"
                    }
                }
         </script>

    </amp-link-rewriter>
```

We can also define data values in the anchor data attribute as the following example:
```html
    <a href="https://www.amazon.de/s?i=computers&rh=n%3A340843031&ref=sn_gfs_co_computervs_AM_5" data-vars-event-id="231">
```

The config could be something like:

```json
    {
      "output": "https://visit.foo.net?eid=${eventId}&cid=${customerId}"

    }
```
The resulting, rewritten URL would be:
```url
`https://visit.foo.net?eid=231&cid=12345`
```

Apart from vars defined in the *vars* property of the JSON configuration, or as a data attribute, there are other pre-defined *vars* which are AMP URL MACROs plus anchor attributes id and href that could be used for replacing values in the output pattern. The AMP URL MACROs available are DOCUMENT_REFERRER and SOURCE_URL. The following table shows the relationship between defined data and placeholders.

| value          | source     |       example                                         |    placeholder       
| -------------- | ---------- |-------------------------------------------------------|----------------------
| data-vars-*    | anchor     |    `<a href="..." data-vars-merchant-id="123" />`     |  `${merchantId}`
| href           | anchor     |    `<a href="https://retailer.com" />`                  |  `${href}`            
| id             | anchor     |    `<a href="..." id="link" />`                       |  `${id}`              
| location       | page       |    `https://www.partnerweb.com/`                          |  `SOURCE_URL`        
| random         | page       |    `Math.random().toString(32).substr(2)`             |  `${random}`
| referrer       | page       |    `https://google.de/`                               |  `DOCUMENT_REFERRER`        
| rel            | anchor     |    `<a href="..." rel="pass" />`                      |  `${rel}`             
| rev            | anchor     |    `<a href="..." rev="author" />`                    |  `${rev}`             
| vars.*         | config     |    `{ "vars": { "publisherId": "123" } }`             |  `${publisherId}`


##### section (optional)

The "section" property defines an array of css selector expressions that filter areas where the url rewriting should operate.

Example:
```json
     {
        "output": "https://visit.foo.net?pid=110&url=${href}&cid=${customerId}",
        "section": [
            "#product-listing-1",
            "#product-listing-2"
        ]
    }
```

In the previous example, the html sections defined with attribute ID equal to "product-listing-1" and "product-listing-2" will be considered for url rewriting.

##### attribute (optional)

The "attribute" property defines a list of rules to match the anchor elements retrieved from the filtered sections. These rules are built from regular expressions associated with html element attributes as "id", "href", "class" or "rel".

Example:

```json
     {
      "section": [
                 "#product-listing-1"
             ],
      "attribute": {
                        "href": "((?!(https:\/\/skip\.com)).)*",
                        "class": "comments"
                   }
    }
```

The anchors within the html area with id 'product-listing-1' will have to match the regex expression defined for the attribute href and class. The regex expression will be wrapped with ^ and $ for a full match.
In this example, it means that all the anchors with `youtube.com` and 'mobile.vodafone.de' will be excluded. Also, the included anchors need to have a class attribute with the value 'comments'


## Validation

See [amp-link-rewriter rules](validator-amp-link-rewriter.protoascii) in the AMP validator specification.
