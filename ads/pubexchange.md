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

# PubExchange

## Example

### Basic

```html
<amp-embed
  width="640"
  height="320"
  heights="(max-width:480px) 400%, (max-width:650px) 100%, 75%"
  layout="responsive"
  type="pubexchange"
  data-publication="test_publication"
  data-module-id="below_content"
  data-module-num="2626"
  data-test="true"
>
</amp-embed>
```

## Configuration

For semantics of configuration, please see [PubExchange's documentation](https://www.pubexchange.com/dashboard/developer/update_modules).

### Required parameters

- `data-publication`: Shortcode identifying publication provided by PubExchange account manager
- `data-module-id`: Shortcode identifying module provided by PubExchange account manager
- `data-module-num`: ID identifying module provided by PubExchange account manager

### Optional parameters

- `data-test`: Pass the parameter with the "true" value to test the PubExchange module
