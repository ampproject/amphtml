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

# Navegg

If you want to serve ads with Navegg data you need to use this adapter.


## Example

```html
<amp-ad width=320 height=50
  type="navegg"
  data-acc="10"
  data-slot="/4119129/mobile_ad_banner"
  json='{"targeting":{"sport":["rugby","cricket"]}}'>
</amp-ad>

```
note: It is common to see a no-content ad in this example.

### Configuration

The Navegg adapter only supports Doubleclick for now.
For the most up-to-date list of Doubleclick supported parameters and usage please refer to Doubleclick reference guide [here](google/doubleclick.md).
To get Navegg integration working you only need to specify the 'data-acc' with your Navegg Account ID:
```html
  data-acc="NAVEGG_ACCOUNT_ID"
```

For any help, please contact
[us](https://www.navegg.com/en/institutional/#contact)
