<!---
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

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

# Fluid

A fluid ad slot does not require a publisher to specify its size. Instead, the publisher may simply declare an ad slot with the attributes `layout="fluid" height="fluid"`, and a creative of indeterminate size will be returned. The actual size of the slot will be determined by the given creative at render time. It will always occupy the maximum available width, and its height will be determined relative to that width. One benefit of this feature is that, like multi-size, it increases monetization potential by increasing the available pool of creatives that may be rendered in a particular slot. Moreover, this feature relieves the publisher of having to worry about determining what size a slot should use.

Note that due to AMP's no reflow policy, the fluid creative will not be rendered when the slot is within the viewport and it is therefore recommended that fluid be used for below the fold slots.

An example slot might look like:

```html
<amp-ad
    type="doubleclick"
    data-slot="/6355419/Travel"
    layout="fluid"
    height="fluid">
</amp-ad>
```

Note also that the width attribute is optional, and can be specified. When specified, the fluid creative will always occupy that width (unless used in conjunction with multi-size). Further, fluid creatives are fully compatible with multi-size creatives. When both features are turned on, either a fluid creative, or one matching one of the specified multi-size sizes may be given.

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to DoubleClick</a>
