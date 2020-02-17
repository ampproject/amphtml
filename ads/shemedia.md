<!---
Copyright 2019 The AMP HTML Authors. All Rights Reserved.

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

# SHE Media

Your site must be an active member of the [SHE Media Partner Network](http://www.shemedia.com). Please contact [Support](mailto:support@shemedia.com) for specific tags for your site and information on configuration semantics.

## Examples

```html
<amp-ad
  width="300"
  height="250"
  type="shemedia"
  data-slot-type="medrec"
  data-boomerang-path="/amp-example/26403"
  json='{"boomerangConfig": {"vertical": "parenting"}, "targeting":{"abc":["xyz"]}}'
>
</amp-ad>
```

## Configuration

### Required parameters

- `data-slot-type` - SHE Media slot type.
- `data-boomerang-path` - Boomerang path.

### Optional parameters

- `json` - Boomerang configuration key values can be passed using the `boomerangConfig` property. Custom targeting key values can be passed to Boomerang using the `targeting` property.

### Support

Please contact support@shemedia.com with any questions.
