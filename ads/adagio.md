<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

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

# Neodata Ad.Agio adserver

Please refer to [Neodata Help Desk](mailto:adagio@neodatagroup.com) for more
information on how to get required parameters.

## Examples

### Simple ad tag 

```html
 <amp-ad width=320 height=250
          type="adagio"
          data-sid="39"
          data-loc="amp_ampw_amps_ampp_300x250"
          data-keywords=""
          data-uservars="">
  </amp-ad>
```


### Supported parameters

* data-loc: (Required) Location External Id
* data-sid: (Required) Client ID (provided by Neodata)
* data-keywords: (Optional) List of keywords (comma separated) -> oranges,lemons
* data-uservars: (Optional) List of key_values parameter (comma separated) name_John,surname_Doe

