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

# AdOcean

## Example

```html
<amp-ad width="300" height="250"
    type="adocean"
    data-ao-id="ado-bIVMPpCJPX0.5tjQbNyrWpnws_dbbTJ1fUnGjLeSqJ3.K7"
    data-ao-emitter="myao.adocean.pl">
</amp-ad>
```

## Configuration

For details on the configuration semantics, see [AdOcean documentation](http://www.adocean-global.com).

### Required parameters 

- `data-ao-id` - Ad unit unique id
- `data-ao-emitter` - Ad server hostname

### Optional parameters 

- `data-ao-mode` - sync|buffered - processing mode
- `data-ao-preview` - livepreview configuration id
- `data-ao-keys` - additional configuration, see adserver documentation
- `data-ao-vars` - additional configuration, see adserver documentation
- `data-ao-clusters` - additional configuration,see adserver documentation
