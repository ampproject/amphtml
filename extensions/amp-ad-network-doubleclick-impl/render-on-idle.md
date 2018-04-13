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

# Render On Idle
Slots not marked with data-loading-strategy attribute that are more than 3 viewports but less than 12 from current location are allowed to render when the AMP scheduler
is idle.  The result is an increase in impressions with a much smaller increase in
viewable impressions and clicks.  Publishers sensitive to viewability rate should
set data-loading-strategy=3 to keep the current viewport offset and disable idle render.  Publishers using data-loading-strategy=prefer-viewability-over-views will
use current 1.25 viewport offset with idle render disabled.

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to DoubleClick</a>
