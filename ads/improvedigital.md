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

# Improve Digital

Please refer to [Improve Digital Help Center](https://improvedigital.zendesk.com/hc/en-us) for more
information on how to get the required placement IDs and [optional] keyvalue cases.
                    
## Example

### Simple ad tag 


```html
<amp-ad width=300 height=250
    type="improvedigital"
    data-placement="869276"
    data-optin="y">
</amp-ad>
```

### Ad tag with Keyvalues


```html
<amp-ad width=300 height=250
    type="improvedigital"
    data-placement="869276"
    data-optin="y"
    data-keyvalue="gender=woman&age=10-15">
</amp-ad>
```

### Supported parameters

- `placement`
- `optin`
- `keyvalue`

The parameter; placement is mandatory. When using keyvalues please fill in the keyvalues as written in the example. 