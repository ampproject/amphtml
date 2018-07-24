<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# Multi-size Ad

To request an ad with multiple sizes, pass a string of comma-separated sizes to
the `data-multi-size` attribute. Each size in the list must be a width followed
by a lowercase 'x' followed by a height. Secondary sizes must not be larger than
their corresponding dimensions specified by the `width` and `height` attributes,
or the `data-override-width` and `data-override-height` attributes, if they are
set. Further, the secondary sizes must not be smaller than 2/3rds, in any of the
two dimensions, of their primary size counterpart, unless 
`data-multi-size-validation` is explicitly set to false. See below for some valid and invalid examples.

#### Attributes
Below the term `primary size` refers to the width and height pair specified by the `width` and `height` attributes of the tag.
- `data-multi-size` A string of comma separated sizes, which if present, forces the tag to request an ad with all of the given sizes, including the primary size. Each individual size must be a number (the width) followed by a lowercase 'x' followed by a number (the height). Each dimension specified this way must not be larger than its counterpart in the primary size. Further, each dimension must be no less than 2/3rds of the corresponding primary dimension, unless `data-mutli-size-validation` is set to false.
- `data-multi-size-validation` If set to false, this will allow secondary sizes (those specified in the `data-multi-size` attribute) to be less than 2/3rds of the corresponding primary size. By default this is assumed to be true.

Example - Valid multi-size request
```html
<amp-ad width=728 height=90
    type="doubleclick"
    data-slot="/6355419/Travel"
    data-multi-size="700x90,700x60,500x60">
</amp-ad>
```

Example - Invalid multi-size request (multi-size size is too small relative to overrides)
```html
<amp-ad width=320 height=50
    type="doubleclick"
    data-slot="/6355419/Travel"
    data-override-width=728
    data-override-height=90
    data-multi-size="300x25">
</amp-ad>
```

Example - Invalid multi-size request (last multi-size size is too small)
```html
<amp-ad width=728 height=90
    type="doubleclick"
    data-slot="/6355419/Travel"
    data-multi-size="700x90,700x60,300x25">
</amp-ad>
```

Example - Valid multi-size request (ignores minimum size constraint)
```html
<amp-ad width=728 height=90
    type="doubleclick"
    data-slot="/6355419/Travel"
    data-multi-size="700x90,700x60,300x25">
    data-multi-size-validation="false">
</amp-ad>
```

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to DoubleClick</a>
