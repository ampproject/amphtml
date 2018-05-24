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

# Atomx

## Example

```html
<amp-ad width="300" height="250"
    type="atomx"
    data-id="1234">
</amp-ad>
```

## Configuration

For configuration information, see [atomx documentation](https://wiki.atomx.com/tags).

### Required Parameters

* `data-id` - placement ID

### Optional parameters

* `data-click` - URL to pre-pend to the click URL to enable tracking. 
* `data-uv1`, `data-uv2`, `data-uv3` - User value to pass in to the tag. Can be used to track & report on custom values. Needs to be a whole number between 1 and 4,294,967,295. 
* `data-context` - Conversion Callback Context

