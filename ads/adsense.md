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

# AdSense

## Example

### Standard size

```html
<amp-ad width=300 height=250
    type="adsense"
    data-ad-client="ca-pub-8125901705757971"
    data-ad-slot="7783467241">
</amp-ad>
```

### Responsive ad unit

```html
<amp-ad width=320 height=100
    heights="(min-width:468px) 60px, (min-width:336px) 280px, (min-width:320px) 100px, (min-width:300px) 250px, 100px"
    type="adsense"
    data-ad-client="ca-pub-8125901705757971"
    data-ad-slot="7783467241">
</amp-ad>
```

Note: `data-ad-slot` should be responsive ad slot ID.

### Responsive ad unit (on the top of the page)

```html
<amp-ad width=320 height=100
    heights="(min-width:468px) 60px, 100px"
    type="adsense"
    data-ad-client="ca-pub-8125901705757971"
    data-ad-slot="7783467241">
</amp-ad>
```

More info: ["AdSense policy FAQs: Is placing a 300x250 ad unit on top of a high-end mobile optimized page considered a policy violation?"](https://support.google.com/adsense/answer/3394713?hl=en#3)

Note: `data-ad-slot` should be responsive ad slot ID.

### Responsive link unit

```html
<amp-ad width=200 height=90
    heights="(min-width:468px) 15px, 90px"
    type="adsense"
    data-ad-format="link"
    data-ad-client="ca-pub-8125901705757971"
    data-ad-slot="7783467241">
</amp-ad>
```

Note: `data-ad-slot` should be responsive link slot ID.

## Configuration

For semantics of configuration, please see ad network documentation.

Supported parameters:

- data-ad-client
- data-ad-slot
- data-ad-format

`data-ad-format` is optional.

`auto`, `horizontal` and `vertical` are not supported values for `data-ad-format`, and will be ignored.

## Todo

- [ ] Matched content unit example.
