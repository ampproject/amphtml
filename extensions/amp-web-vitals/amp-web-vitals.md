---
$category@: monitoring
formats:
  - websites
teaser:
  text: Allows publishers to capture Real User Metrics.
---
<!--
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

# amp-web-vitals

<!--
  If the component is relevant for more than one format and operates differently between these
  formats, include and filter multiple content blocks and code samples.
-->

## Usage

Allows publishers to capture Real User Metrics.

### Required element structure

#### Add the required `script`

Inside the `<head>...</head>` section of your AMP page, insert the following
code before the line
`<script async src="https://cdn.ampproject.org/v0.js"></script>`.

```html
<script
  async
  custom-element="amp-web-vitals"
  src="https://cdn.ampproject.org/v0/amp-web-vitals-0.1.js`"
></script>
```

#### Add the `amp-link-rewriter` component

Inside the `<body>...</body>` section of your AMP page, insert code as shown
below the example (it has to be customized for every vendor use case):

```html
<amp-web-vitals layout="nodisplay">
    <script type="application/json">
      {
        "type": "local",
        "url": "http://www.example.com",
      }
    </script>
  </amp-web-vitals>
```

#### Full example

The final code should look like:

```html
<!DOCTYPE html>
<html ⚡>
  <head>
    ...
    <script
      async
      custom-element="amp-web-vitals"
      src="https://cdn.ampproject.org/v0/amp-web-vitals-0.1.js`"
    ></script>
    ...
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>
    ...
    <amp-web-vitals layout="nodisplay">
        <script type="application/json">
          {
            "type": "local",
            "url": "http://www.example.com",
          }
        </script>
      </amp-web-vitals>
    ....
  </body>
</html>
```

### JSON configuration

The `type` property (required) has to be a string value and can either be 'local' or 'remote'. 
'local' means that the Web Vitals metrics will get output onto the Browser console. 
'remote' means that the Web Vitals metrics will be sent to a remote endpoint for logging. 

The 'url' property (required) has to be a string value, and should be the url of the currently displayed web page.

The 'remote_service_url' property (required if `type` is `remote`) has to be a string value and should be
the url of a remote endpoint capable of logging the eb vitals metrics sent to it in a POST request parameter.

The 'tags' property (optional) has to be an array of strings. These strings can be any data you want to pass
along the Web Vitals metric to the remote endpoint.

Full example:

```html
<amp-web-vitals>
  <script type="application/json">
        {
          "type": "remote",
          "url": "http://www.example.com",
          "remote_service_url": "http://remote-service.com/endpoint",
          "tags": ["tag1", "tag2"]
        }
      </script>
</amp-web-vitals>
```

See [amp-web-vitals rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-web-vitals/validator-amp-web-vitals.protoascii) in the AMP validator specification.
