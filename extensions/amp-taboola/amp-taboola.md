<!---
Copyright 2016 Taboola. All Rights Reserved.

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

### <a name="amp-taboola"></a> `amp-taboola`

An `amp-taboola` component displays a TAboola recommendation widget.

Example:
```html
<amp-taboola width=400 height=300
    type=taboola
    layout=responsive
    data-publisher=bloomberg
    data-mode=thumbnails-d
    data-article=auto
    data-url="http://www.bloomberg.com/news/articles/2015-12-10/ronaldo-and-beckham-s-millions-start-with-this-unknown-belgian"
    data-placement="Below Article Thumbnails">
</amp-taboola>```

The width and height will determine the aspect ratio of the widget embed in responsive layouts.


#### Attributes

**data-publisher**

The hosting publisher name

**data-placement**

The placement id given to the widget.

**data-mode**

The name of the requested 'mode'

**data-article**

The unique identifier of the page article. Often 'auto'.

**data-video**

The unique identifier of the page video. Often 'auto'.

**data-photo**

The unique identifier of the page photo. Often 'auto'.

**data-home**

The unique identifier of the home page. Often 'auto'.

**data-category**

The unique identifier of the page category. Often 'auto'.

**data-url**

Optional, the canonical url of the hosting page. By default this attribute will contain the value of the canonical page url as reported by the AMP framework.

**data-referrer**

Optional, the referrer of the hosting page. By default this attribute will contain the value of the referrer url as reported by the AMP framework.

