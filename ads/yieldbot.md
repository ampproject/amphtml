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

# Yieldbot

## Example

### Basic

```html
<amp-ad width="300" height="250"
          type="yieldbot"
          data-psn="1234"
          data-yb-slot="medrec"
          data-slot="/2476204/medium-rectangle">
</amp-ad>
```

### With Doubleclick `amp-ad` data attributes

To specify Doubleclick `amp-ad` data attributes, `multi-size` for example, see [Doubleclick](./google/doubleclick.md) for details. Use the
Doubleclick attributes as you would with an `<amp-ad type="doubleclick"/>` element.

```html
<amp-ad width="300" height="250"
          type="yieldbot"
          data-psn="1234"
          data-yb-slot="medrec"
          data-slot="/2476204/medium-rectangle"
          data-multi-size="300x220,300x200"
          json='{"targeting":{"category":["food","lifestyle"]},"categoryExclusions":["health"]}'>
</amp-ad>
```

## Configuration

For further Yieldbot configuration information, please check our [documentation](https://ui.yieldbot.com/documentation/tags/async_gpt_advanced) or [contact us](mailto:pubops@yieldbot.com).

### Yieldbot Required parameters

| Parameter     | Description |
|:------------- |:-------------|
| **`data-psn`**    | Yieldbot publisher site number |
| **`data-yb-slot`**    | Yieldbot slot identifier |
| **`data-slot`**    | Doubleclick for Publishers (DFP) slot identifier |

### Yieldbot Integration Testing

For integration testing, the Yieldbot Platform can be set to always return a bid for requested slots.

The Yieldbot `amp-ad` type can be tested with the following file:
- [test/manual/amp-ad.yieldbot.amp.html](../test/manual/amp-ad.yieldbot.amp.html)

When Yieldbot testing mode is enabled, a cookie (`__ybot_test`) on the domain `.yldbt.com` tells the Yieldbot ad server to always return a bid and when creative is requested, return a static integration testing creative.

- No ad serving metrics are impacted when integration testing mode is enabled.
- The `__ybot_test` cookie expires in 24 hours.
 - It is good practice to click "Stop testing" when testing is complete, to return to normal ad delivery.
