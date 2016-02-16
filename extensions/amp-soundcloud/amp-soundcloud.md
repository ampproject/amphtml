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

### <a name="amp-soundcloud"></a>amp-soundcloud

Displays a Soundcloud clip

Example Visual Mode:
```html
<amp-soundcloud height=657
    layout="fixed-height"
    data-trackid="243169232"
    data-visual="true"></amp-soundcloud>
```

Example Classic Mode:
```html
<amp-soundcloud height=657
    layout="fixed-height"
    data-trackid="243169232"
    data-color="ff5500"></amp-soundcloud>
```

#### Attributes

**data-trackid**

The ID of the track.

**data-visual**

Displays full width "Visual" mode.

**data-color**

Custom color override. Only works with "Classic" Mode. Will be ignored in "Visual" Mode.

**width and height**
Layout is `fixed-height` and will fill all the available horizontal space. This is ideal for `classic mode`, but for `visual-mode`, height is recommended to be 300px, 450px or 600px, as per Soundcloud embed code. This will allow the clip's internal elements to resize properly on mobile.
