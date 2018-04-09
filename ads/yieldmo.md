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

# Yieldmo

## Example

```html
<amp-ad width="300" height="168"
    type="yieldmo"
    data-ymid="1349317029731662884">
</amp-ad>
```

## Configuration

For semantics configuration, please [contact Yieldmo](https://yieldmo.com/#contact).

Supported parameters:

- `data-ymid`

## Multi-size Ad

Yieldmo implicitly handles rendering different sized ads that are bid to the same placement. No additional configuration is required for the tag.

---

Above the fold ads do not resize, so as not to not disrupt the user experience:

![](http://test.yieldmo.com.s3.amazonaws.com/amp-demo/big-notResized.gif)
![](http://test.yieldmo.com.s3.amazonaws.com/amp-demo/small-notResized.gif)

---

Below the fold, ads resize:

![](http://test.yieldmo.com.s3.amazonaws.com/amp-demo/big-resized.gif)
![](http://test.yieldmo.com.s3.amazonaws.com/amp-demo/small-resized.gif)

---
