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

# plista

## Example

### Basic

```html
<amp-embed width="300" height="300"
    type="plista"
    layout=responsive
    data-countrycode="de"
    data-publickey="e6a75b42216ffc96b7ea7ad0c94d64946aedaac4"
    data-widgetname="iAMP"
    data-categories="politics">
</amp-embed>
```

### With article information

```html
<amp-embed width="300" height="300"
    type="plista"
    layout=responsive
    data-countrycode="de"
    data-publickey="e6a75b42216ffc96b7ea7ad0c94d64946aedaac4"
    data-widgetname="iAMP"
    data-geo="de"
    data-urlprefix=""
    data-categories="politics"
    json='{"item":{"objectid":"1067327","url":"http://www.plista.com/article/a-1067337.html","updated_at":1449938206}}'>
</amp-embed>
```

## Configuration

For semantics of configuration, please see [Plista's documentation](https://goo.gl/nm9f41).

Supported parameters:

- `data-countrycode`
- `data-publickey`
- `data-widgetname`
- `data-geo`
- `data-urlprefix`
- `data-categories`

Supported via `json` attribute:

- `item`

## Layout

Width and height are optional. You can use different layout types with plista.
