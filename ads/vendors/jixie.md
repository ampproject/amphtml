<!---
Copyright 2021 The AMP HTML Authors. All Rights Reserved.

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

# JIXIE

## Example of JIXIE AD implementation

```html
<amp-ad
  width="300"
  height="250"
  type="jixie"
  layout="responsive"
  data-unit="ADUNIT_CODE"
  data-cid="800"
  data-options='{"miscParams":{"reserve1":"test1","reserve2":"test2"}}'
>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact JIXIE

### Required parameters

-   `data-unit`: ADUNIT_CODE (given by jixie to the publisher)

### Optional parameters

-   `data-cid`: specific creative id
-   `data-options`: stringified json object with miscellaenous info
