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
             data-widgetIds="AMP_1,AMP_2"
             data-testMode="true">
  </amp-embed>
```

The above code must be accompanied by AMP-enabled widgets delivered by Outbrain’s Account Management Team, do not directly install this code with existing widgets.

## Parameters

- widgetIds *(**mandatory**)* - Widget Id/s Provided by Account Manager.
- htmlURL *(optional)* - The URL of the standard html version of the page.
- ampURL *(optional)* - The URL of the AMP version of the page.
- testMode *(optional)* - Pass the parameter with the “true” value while testing the AMP pages. 
- styleFile *(optional)* - Provide publisher an option to pass CSS file in order to inherit the design for the AMP displayed widget. **Consult with Account Manager regarding CSS options**.
