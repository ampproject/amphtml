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

# SpotX

## Example

### Basic

```html
  <amp-ad width="300" height="250"
<<<<<<< HEAD
      type="spotx"
      data-spotx_channel_id="85394"
      data-spotx_autoplay="1">
=======
          type="spotx"
          data-spotx_channel_id="85394"
          data-spotx_autoplay="1"
          >
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  </amp-ad>
```

### Using Custom Key-Value Pairs

```html
<<<<<<< HEAD
<amp-ad width="300" height="250"
    type="spotx"
    data-spotx_channel_id="85394"
    data-spotx_custom='{"key1": "val1", "key2": "val2"}'>
</amp-ad>
=======
  <amp-ad width="300" height="250"
          type="spotx"
          data-spotx_channel_id="85394"
          data-spotx_custom='{"key1": "val1", "key2": "val2"}'
          >
  </amp-ad>
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
```

## Configuration

<<<<<<< HEAD
The SpotX `amp-ad` integration has many of the same capabilities and options as our SpotX EASI integration. For full list of options, please see the [SpotX EASI integration documentation](https://developer.spotxchange.com/content/local/docs/sdkDocs/EASI/README.md#common-javascript-attributes).

### Required parameters

- `data-spotx_channel_id`
- `width`
- `height`
=======
The SpotX `amp-ad` integration has many of the same capabilities and options as our SpotX EASI integration. For full list of options, please see the SpotX EASI integration documenation:

https://developer.spotxchange.com/content/local/docs/sdkDocs/EASI/README.md#common-javascript-attributes

Required Parameters:

- data-spotx_channel_id
- width
- height
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
