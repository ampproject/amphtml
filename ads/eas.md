<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# CxenseDisplay

## Example

### Basic call

Corresponds to `https://eas4.emediate.eu/eas?cu=12345`

```html
<amp-ad width="320" height="50"
    type="eas"
    data-eas-domain="eas4.emediate.eu"
    data-eas-cu="12345">
</amp-ad>
```

### With targeting parameters

```html
<amp-ad width="320" height="50"
    type="eas"
    data-eas-domain="eas4.emediate.eu"
    data-eas-cu="12345"
    data-eas-EASTsomename="somevalue"
    data-eas-kw1="somekeyword">
</amp-ad>
```

## Configuration

### Required parameters

- `data-eas-domain`: Specify your ad-server domain (e.g., `eas3.emediate.se`); If you're using a custom domain-name (like, `eas.somesite.com`) you should NOT use that one unless you already have an SSL-certificate installed on our ad servers.

### Optional parameters

- `data-eas-[parameter]`: Any ad-request parameter, like 'cu'.






