<!---
Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

# My6sense

My6sense specializes in the development and distribution of its own ad server technology, which is called My6sense ad serving. The My6sense ad server now supports AMP.
For more information, visit [www.My6sense.com](https://www.My6sense.com).

## Example

```html
<amp-ad
  width="300"
  height="250"
  type="my6sense"
  data-widget-key="your-widget-key"
  data-zone="[ZONE]"
  data-url="[PAGE_URL]"
  data-organic-clicks="[ORGANIC_TRACKING_PIXEL]"
  data-paid-clicks="[PAID_TRACKING_PIXEL]"
>
</amp-ad>
```

## Configuration

For semantics of configuration and examples, sign-in and see the [My6sense platform](https://my6sense.com/platform/) or [contact My6sense](https://my6sense.com/contact/).

## Required parameters:

- `data-widget-key` : string, non-empty

## Optional parameters:

- `data-zone` : string, non-empty
- `data-url` : string, non-empty
- `data-organic-clicks` : string, non-empty
- `data-paid-clicks` : string, non-empty
