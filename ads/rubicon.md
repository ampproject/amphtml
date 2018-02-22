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

# Rubicon Project

If you want to serve ads via your Ad Server then there is no need to use the adapter when using Smart Tags.  These can simply be served via your Ad Server in the normal fashion.  You simply need to ensure that you are using secure tags (https).

The Rubicon Project adapter supports Smart Tags and FastLane directly on the page.

The FastLane (Single Slot) runs FastLane at the slot level and then calls DFP passing in the additional targeting data.

## Examples

### Smart Tag
#### Basic

```html
<amp-ad width=320 height=50
    type="rubicon"
    data-method="smartTag"
    data-account="14062"
    data-site="70608"
    data-zone="335918"
    data-size="43">
</amp-ad>
```

#### With additional targeting

```html
<amp-ad width="320" height="50"
    type="rubicon"
    data-method="smartTag"
    data-account="14062"
    data-site="70608"
    data-zone="335918"
    data-size="43"
    data-kw="amp"
    json='{"visitor":{"age":"18-24","gender":"male"},"inventory":{"section":"amp"}}'>
</amp-ad>
```

### FastLane (Single Slot)
#### Basic

```html
<amp-ad width=320 height=50
    type="rubicon"
    data-method="fastLane"
    data-slot="/5300653/amp_test"
    data-account="14062"
    data-pos="atf">
</amp-ad>
```

#### With additional targeting (FastLane & DFP)

```html
<amp-ad width="320" height="50"
    type="rubicon"
    data-method="fastLane"
    data-slot="/5300653/amp_test"
    data-account="14062"
    data-pos="atf"
    data-kw="amp"
    json='{"targeting":{"kw":"amp-test","age":"18-24","gender":"male","section":"amp"},"visitor":{"age":"18-24","gender":"male"},"inventory":{"section":"amp"}}'>
</amp-ad>
```


### Configuration

For semantics of configuration, please contact your Rubicon Account Director @
[Rubicon Project](http://platform.rubiconproject.com])


#### Ad size

By default the ad size is based on the `width` and `height` attributes of the `amp-ad` tag.

#### Supported parameters

#### Smart Tag
- `data-method`
- `data-account`
- `data-site`
- `data-zone`
- `data-size`

#### FastLane (Single Slot)
- `data-method`
- `data-slot`
- `data-account`
- `data-pos`

Supported via `json` attribute (DFP parameters):

- `targeting`
- `categoryExclusions`
- `tagForChildDirectedTreatment`
- `cookieOptions`

For the most up-to-date list of Doubleclick supported parameters and usage please refer to Doubleclick reference guide [here](google/doubleclick.md).

##### First Party Data & Keywords
- `data-kw`
- `json` - for visitor and inventory data
