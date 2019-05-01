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

# amp-access-iframe-api

The access iframe is an implementation of access protocol that
supports both amp-access and amp-subscriptions.

The npm package is available: https://www.npmjs.com/package/amp-access-iframe-api.

The `AmpAccessIframeApi` is the entry point for access iframe implementation. As its main parameter it requires an instance of `AccessController`, which simply implements all methods of access protocol such as `authorize` and `pingback`.

The document's access configuration would use the "iframe" type. For example when used with `amp-access`:

```
<script id="amp-access" type="application/json">
  {
    "type": "iframe",
    "iframeSrc": "https://example.org/access-controller-iframe",
    "iframeVars": [
      "READER_ID",
      "CANONICAL_URL",
      "AMPDOC_URL",
      "SOURCE_URL",
      "DOCUMENT_REFERRER"
    ],
    "defaultResponse": {...}
  }
</script>
```

and with `amp-subscriptions`:

```
<script type="application/json" id="amp-subscriptions">
{
  "services": [
    {
      "type": "iframe",
      "iframeSrc": "https://example.org/access-controller-iframe",
      "iframeVars": [
        "READER_ID",
        "CANONICAL_URL",
        "AMPDOC_URL",
        "SOURCE_URL",
        "DOCUMENT_REFERRER"
      ],
      "actions":{
        "login": "https://...",
        "subscribe": "https://..."
      }
    },
    ...
  ]
}
</script>
```

The instrumentation would normally look like this:

```
/** Implements AccessController interface */
class Controller {
  connect(origin, protocol, config) {
    // Initialize the controller.
    // Important! Ensure that the "origin" is an acceptable value.
  }

  authorize() {
    // Return a promise that will yield the authorization response.
  }

  pingback() {
    // Handle the "impression" event.
  }
}

var iframeApi = new AmpAccessIframeApi(new Controller());
iframeApi.connect();
```

## Connect method

The `connect` method should perform two main tasks:

1. Ensure that the parent document is the right document by checking the origin.
2. Initialize the iframe.

The `protocol` argument in the connect method wil lbe one of
`amp-access` or `amp-subscriptions`.

The `config` argument in the `connect` method will contain the original document config with `iframeVars` replace with the map of resolved AMP variables. See [Access URL Variables](../../amp-access.md#access-url-variables) for more details. For instance, for the example above the `config` value could look like this:

```
{
  "type": "iframe",
  "iframeSrc": "https://example.org/access-controller-iframe",
  "iframeVars": {
    "READER_ID": "1234abd456",
    "CANONICAL_URL": "https://example.org/doc1",
    "AMPDOC_URL": "https://example-org.cdn.ampproject.org/doc1.amp",
    "SOURCE_URL": "https://example.org/doc1.amp",
    "DOCUMENT_REFERRER": "https://other.com"
  }
}
```

When used with `amp-subscriptions` the `pageProtocol` is set
to `amp-subscriptions` and a `pageConfig` object is included.

```
{
  "type": "iframe",
  "pageConfig": {
    "productId": "...",
    "publicationId": "..."
  },
  // Remainder as per `amp-access`
}
```

The `publicationId` and `productId` are extracted from the
parent document [structured data](../../../amp-subscriptions/amp-subscriptions.md#json-ld-markup).  


## Authorize method

The `authorize` method checks whether the user should be able to access this document. It's expected to be an open-ended JSON structure that can be used for access expressions.

Strong timeout and one-behind semantics are observed for authorization call. If the `authorize()` method does not return within a 3s timeout, the previously returned authorization response is used. If no previous response is available or it's too old, the `defaultResponse` value from the configuration is used. However, even in case of timeout, the iframe authorization will continue until fully complete and will be made available for the next authorization attempt.

In the case of `amp-subscriptions` the authorization response must
conform to the `local` service [authorization response struture](../../../amp-subscriptions/amp-subscriptions.md#authorization-endpoint-and-entitlements).


## Pingback method

The `pingback` method is optional. If specified, it can implement impression event. The main purpose of this method is metering implementation.

In `amp-subscriptions` the `Entitlement` object, if one is preset, is passed to the pingback.