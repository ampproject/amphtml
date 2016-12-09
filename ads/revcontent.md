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

# Revcontent

## Example

```html
<amp-ad width="400" height="260" layout="responsive" 
      type="revcontent"
      heights="(max-width: 320px) 933px,
      (max-width: 360px) 1087px,
      (max-width: 375px) 1138px,
      (max-width: 412px) 1189px,
      (max-width: 414px) 1072px,
      (max-width: 568px) 1151px,
      (max-width: 640px) 1128px,
      (max-width: 667px) 1151px,
      (max-width: 732px) 1211px,
      (max-width: 736px) 1151px,
      (max-width: 768px) 633px,
      (max-width: 1024px) 711px,
      86vw"
      data-wrapper="rcjsload_2ff711"
      data-id="203">
  <div placeholder="">Loading ...</div>
</amp-ad>
```

## Configuration

For semantics of configuration, please see [ad network documentation](http://faq.revcontent.com/support/solutions/5000137293).

Supported parameters:

- data-id
- data-wrapper
- data-endpoint
- data-ssl
- data-testing

## Auto-sizing of Ads

Revcontent's AMP service will be updated to support resizing of ads for improved rendering, no additional tag parameters are required at this time.