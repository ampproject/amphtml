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

# SmartAdServer



## Example

### Basic call

```html
<amp-ad width="320" height="50"
    type="smartadserver"
    data-site="94612"
    data-page="629154"
    data-format="38952"
    data-domain="https://<YourSmartAdServerDomain>">
</amp-ad>
```

### With targeting

```html
<amp-ad width="320" height="50"
    type="smartadserver"
    data-site="94612"
    data-page="629154"
    data-format="38952"
    data-target="foo=bar"
    data-domain="https://<YourSmartAdServerDomain>">
</amp-ad>
```

## Configuration

For ``<YourSmartAdServerDomain>``, use the domain assigned to your network (e. g. www3.smartadserver.com); It can be found in Smart AdServer's config.js library (e.g., `http://www3.smartadserver.com/config.js?nwid=1234`).

For semantics of configuration, please see [Smart AdServer help center](http://help.smartadserver.com/).

### Supported parameters

All of the parameters listed here should be prefixed with "data-" when used.

| Parameter name | Description                         | Required |
|----------------|-------------------------------------|----------|
| site           | Your Smart AdServer Site ID         | Yes      |
| page           | Your Smart AdServer Page ID         | Yes      |
| format         | Your Smart AdServer Format ID       | Yes      |
| domain         | Your Smart AdServer call domain     | Yes      |
| target         | Your targeting string               | No       |
| tag            | An ID for the tag containing the ad | No       |

Note: If any of the required parameters is missing, the ad slot won't be filled.
