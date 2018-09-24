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

# Ad Up Technology

Please visit [www.adup-tech.com](http://www.adup-tech.com) for more information
on how to get required ad tag or placement keys.

## Examples

### Fixed size

Uses fixed size by the given `width` and `height`.

```html
<amp-ad type="aduptech"
    layout="fixed"
    width="500"
    height="200"
    data-placementkey="ae7906d535ce47fbb29fc5f45ef910b4"
    data-query="reisen;mallorca;spanien"
    data-adtest="1">
</amp-ad>
```

### Filled size

Uses available space of parent html container.

```html
<style amp-custom>
    #aduptech-container {
        width:350px;
        height:300px;
        position:relative;
    }
</style>
<div id="aduptech-container">
    <amp-ad type="aduptech"
        layout="fill"
        data-placementkey="ae7906d535ce47fbb29fc5f45ef910b4"
        data-query="reisen;mallorca;spanien"
        data-adtest="1">
    </amp-ad>
</div>
```

### Fixed height

Uses available width and the given `height`.

```html
<amp-ad type="aduptech"
    layout="fixed-height"
    height="100"
    data-placementkey="ae7906d535ce47fbb29fc5f45ef910b4"
    data-query="reisen;mallorca;spanien"
    data-adtest="1">
</amp-ad>
```

### Responsive

Uses available space but respecting aspect ratio by given `width` and `height` (for example 10:3).

```html
<amp-ad type="aduptech"
    layout="responsive"
    width="10"
    height="3"
    data-placementkey="ae7906d535ce47fbb29fc5f45ef910b4"
    data-query="reisen;mallorca;spanien"
    data-adtest="1">
</amp-ad>
```

## Configuration

### Required parameters

* ```data-placementkey```

### Optional parameters

* ```data-query```
* ```data-mincpc```
* ```data-adtest```

## Design/Layout

Please visit [www.adup-tech.com](http://www.adup-tech.com) and sign up as publisher to create your own placement.
