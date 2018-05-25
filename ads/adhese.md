<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

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

# Adhese

<<<<<<< HEAD
Serves ads from [Adhese](https://www.adhese.com).
=======
Adhese adserver.
More information about us can be found on our [website](https://www.adhese.com).
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d

## Example

### Basic setup

```html
<<<<<<< HEAD
<amp-ad width="300" height="250"
=======
<amp-ad width=300 height=250
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    type="adhese"
    data-location="_sdk_amp_"
    data-position=""
    data-format="amprectangle"
    data-account="demo"
    data-request-type="ad">
</amp-ad>
```

### With additional parameters

```html
<<<<<<< HEAD
<amp-ad width="300" height="250"
=======
<amp-ad width=300 height=250
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    type="adhese"
    data-location="_sdk_amp_"
    data-position=""
    data-format="amprectangle"
    data-account="demo"
    data-request-type="ad"
    json='{"targeting":{"br": ["sport", "info"],"dt": ["desktop"]}}'>
</amp-ad>
```


## Configuration

<<<<<<< HEAD
For details on the configuration semantics, see the [Adhese website](https://www.adhese.com) or contact Adhese support.

### Required parameters
=======
See ad network documentation or contact Adhese support.

Required parameters:
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d

- `data-account`
- `data-request_type`
- `data-location`
- `data-position`
- `data-format`

<<<<<<< HEAD
### Optional parameter 

The following optional parameter is supported via the 'json' attribute:

- `targeting`
=======
Optional parameter supported via 'json' attribute:

- 'targeting'
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
