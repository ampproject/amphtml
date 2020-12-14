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

Yahoo Native Ads requires a unique section code to run. Please reach out to your account manager with any questions about configuring your AMP placements or requesting new section codes.

### Basic

```html
<amp-embed
  width="320"
  height="320"
  type="yahoonativeads"
  data-code="192b5193-edb2-31c0-88be-4022dhca1090"
  data-api-key="P55VS9SY2WQXH7TTN8ZA"
  data-url="https://techcrunch.com"
>
</amp-embed>
```

### Required parameters

-   `data-code` : A unique section code that represents your site and placement.
-   `data-url` : The URL of the site your section code is allowed to run on.

### Optional parameters

-   `data-key` : The API key assigned to your site. Used for legacy integrations.
-   `data-api-key` : The API key assigned to your site. Used for legacy integrations.
-   `data-enabled-ad-feedback` : If defined, a feedback indicator will be shown on eligable ad placements.
-   `data-image-type` : The preferred image rendering "square", "rectangle" or "thumbnail".
-   `json` : You can use this field to define your entire config, if desired (ex: `json='{ "imageType": "square" }'`)
