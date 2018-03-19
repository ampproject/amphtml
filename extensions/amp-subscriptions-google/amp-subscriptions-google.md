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

# <a name="amp-subscriptions-google"></a> `amp-subscriptions-google`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Implements subscription-style access protocol for Subscribe with Google.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Experimental. Only in Canary.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td>
      <code>
        &lt;script async custom-element="amp-subscriptions-google"
        src="https://cdn.ampproject.org/v0/amp-subscriptions-google-0.1.js">&lt;/script>
      </code>
    </td>
  </tr>
  <tr>
    <td class="col-fourty">
      <strong>
        <a href="https://www.ampproject.org/docs/guides/responsive/control_layout.html">
          Supported Layouts
        </a>
      </strong>
    </td>
    <td>N/A</td>
  </tr>
</table>

[TOC]

## Introduction

The `amp-subscriptions-google` is the extension that enables Subscribe with Google in an AMP page.

See [amp-subscriptions](../amp-subscriptions/amp-subscriptions.md) for more details on AMP Subscriptions.


## Configuration

The `amp-subscriptions-google` is configured as part of `amp-subscriptions` configuration.

```
<head>
  ...
  <script async custom-element="amp-subscriptions"
  src="https://cdn.ampproject.org/v0/amp-subscriptions-0.1.js"></script>
  <script async custom-element="amp-subscriptions-google"
  src="https://cdn.ampproject.org/v0/amp-subscriptions-google-0.1.js"></script>
  <script type="application/json" id="amp-subscriptions">
  {
    "services": [
      {
        // Local service configuration
      },
      {
        "serviceId": "subscribe.google.com"
      }
    ]
  }
  </script>
</head>
```

