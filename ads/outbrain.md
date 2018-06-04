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

# Outbrain

## Example installation of the Outbrain widget

### Basic

```html
<amp-embed width="100" height="100"
     type="outbrain"
     layout="responsive"
     data-widgetIds="AMP_1,AMP_2">
</amp-embed>
```

The above code must be accompanied by AMP-enabled widgets delivered by Outbrain’s Account Management Team, do not directly install this code with existing widgets.

## Configuration

For details on the configuration semantics, please contact Outbrain’s Account Management Team.

### Required parameters

- `widgetIds`: Widget Id/s Provided by Account Manager.

### Optional parameters

- `htmlURL`: The URL of the standard html version of the page.
- `ampURL`: The URL of the AMP version of the page.
- `styleFile`: Provide publisher an option to pass CSS file in order to inherit the design for the AMP displayed widget. **Consult with Account Manager regarding CSS options**.

## Troubleshooting 

### Widget is cut off

According to the AMP API, "resizes are honored when the resize will not adjust the content the user is currently reading.  That is, if the ad is above the viewport's contents, it'll resize. Same if it's below. If it's in the viewport, it ignores it."

**Resolution**

 You can set an initial height of what the widget height is supposed to be. That is, instead of `height="100"`, if the widget's final height is 600px, then set `height="600"`. Setting the initial height ***will not*** finalize the widget height if it's different from the actual. The widget will resize to it's true dimensions after the widget leaves the viewport.
