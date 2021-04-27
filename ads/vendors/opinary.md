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

# Opinary

## Example

### AMS / Automated Matching System

The automated matching system is an algorithm developed by Opinary which matches polls to articles.

```html
<amp-embed
  width="500"
  height="500"
  type="opinary"
  layout="intrinsic"
  data-client="test-success"
>
</amp-embed>
```

### Embed / Manual Integration

If you want to show a specific poll, you need to include the poll parameter, as shown in the example below.

```html
<amp-embed
  width="500"
  height="500"
  type="opinary"
  layout="intrinsic"
  data-client="test-success"
  data-poll="freuen-sie-sich-ber-schnee_production-at-bKwLEv"
>
</amp-embed>
```

## Configuration

For details on the configuration semantics, please contact the Opinary account manager or refer to their documentation.

### Required parameters

-   `data-client` - the customer name

### Optional parameters

-   `data-poll` - the ID of the poll you want to show
