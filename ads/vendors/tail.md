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

# Tail

How to use AMP data to create, serve ads and create personalized experiences on the web.

## Example

Specify the rtc-config parameter with your Tail Account ID:

```html
<amp-ad width="300" height="250"
  type="doubleclick"
  data-slot="/1234567/medium-rectangle"
  rtc-config="{"vendors": {"tail": {"TAIL_ACCOUNT": "TT-0000-0"}}}">
</amp-ad>
```

## Configuration

Important: Our adapter only supports Google Ad Manager. For the most up-to-date list of Google Ad Manager supported parameters and usage, refer to the [DoubleClick reference guide](https://github.com/ampproject/amphtml/blob/master/ads/google/doubleclick.md).

### Optional Parameters

-   `data-account`: The account identifier to load custom audiences.

If you have any questions, contact your Business Leader or contact us [here](https://tail.digital/contato/).
