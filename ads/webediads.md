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

# Webedia Adserver

Private ad system deployed for all Webedia websites.

## One call method

This method allow you to call one ad position with a specific configuration.

### Basic example

```html
<amp-ad width="300" height="250"
    type="webediads"
    data-site="site_test"
    data-page="amp"
    data-position="middle"
    data-query="">
</amp-ad>
```

### Query example

```html
<amp-ad width="300" height="250"
    type="webediads"
    data-site="site_test"
    data-page="amp"
    data-position="middle"
    data-query="amptest=1">
</amp-ad>
```

### Placeholder and fallback example

```html
<amp-ad width="300" height="250"
    type="webediads"
    data-site="site_test"
    data-page="amp"
    data-position="middle"
    data-query="amptest=1">
    <div placeholder>Loading...</div>
    <div fallback>No ad</div>
</amp-ad>
```

## Configuration

For details on the configuration semantics, please contact the ad network or refer to their documentation.

### Supported parameters

All parameters are mandatory, only "query" can be empty.

- `data-site` (String, non-empty)
- `data-page` (String, non-empty)
- `data-position` (String, non-empty)
- `data-query` (String)
    - `key` are separated with `&`
    - `value` are separted with `|`
    - **Example**: `key1=value1|value2|value3&key2=value4&key3=value5|value6`


