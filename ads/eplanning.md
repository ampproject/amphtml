<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# e-planning


## Example

```html
<amp-ad width=320 height=50
      type="eplanning"
      layout=responsive
      data-epl_si="3ee5"
      data-epl_sv="https://ads.us.e-planning.net"
      data-epl_isv="https://us.img.e-planning.net"
      data-epl_sec="Home"
      data-epl_kvs='{"target1":"food", "target2":"cars"}'
      data-epl_e="Banner1">
</amp-ad>
```

## Configuration

For semantics of configuration, please see [ad network documentation](https://www.e-planning.net). For support contact support@e-planning.net

Supported parameters:

- data-epl_si : Site ID
- data-epl_sv : Default adserver
- data-epl_isv : Default CDN
- data-epl_sec : Section
- data-epl_kvs : Data keywords
- data-epl_e : Space name
