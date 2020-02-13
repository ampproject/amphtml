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

# Yahoo Native Ads

## Example

Yahoo Native Ads only requires a configured section code to run. Please work with your account manager to configure your AMP sections.

### Basic

```html
<amp-embed
  width="320"
  height="320"
  type="yahoonativeads"
  data-code="192b5193-edb2-31c0-88be-4022dhca1090"
  data-key="P55VS9SY2WQXH7TTN8ZA"
  data-url="https://techcrunch.com"
>
</amp-embed>
```

### Required parameters

- `data-code` : Unique section code that represents your site and placement
- `data-key` : Unique API key that was issued for your site
- `data-url` : Url that your API key and section code are valid to run on
