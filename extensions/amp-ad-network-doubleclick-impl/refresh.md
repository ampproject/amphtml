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

# AMP Ad Refresh
AMP Ad Refresh provides a mechanism for DoubleClick slots to periodically refresh, that is to fetch and render a new creative. Slots will only issue refresh requests once the current creative has been viewed (i.e., has had 50% of its pixels on screen for a continuous second).

For a network implementation guide, please click <a href="../../extensions/amp-a4a/refresh.md">here</a>.

### Page-level Configuration

Refresh may be enabled across all eligible slots for a set of opted-in network on a page by adding the following metadata tag:

`<meta name="amp-ad-refresh" content="network1=refresh_interval1,network2=refresh_interval2,...">`

Where `refresh_interval` is the time, in seconds, in between refresh cycles. This value must be a number greater than or equal to 30. Individual slots may be opted-out of refresh by adding `data-enable-refresh=false` to the slot.

<strong>Note:</strong> Regardless of what `refresh_interval` is set to, the refresh interval will not begin until the current slot is viewable (has had 50% of its pixels on screen for a continuous second).

### Slot-level Configuration

An individual slot is eligible to be refreshed if it is configured as:

```
<amp-ad
 ...
 data-enable-refresh=refresh_interval>
```
`refresh_interval` must be a number greater than or equal to 30, or `false`. If `refresh_interval` is set to `false`, then this slot will not be refresh-enabled, even if page-level configurations are set. Otherwise, if `refresh_interval` is a numeric value, then it will represent the time, in seconds, between refresh events on this particular slot.

#### SRA Compatibility

Refresh is currently not supported for SRA enabled slots. If a slot is enabled for both, refresh will be disabled, and an error will be logged to the user's console.

#### AMP Ad Container Compatibility

The only AMP ad containers in which refresh is currently supported are amp-sticky-ad and amp-carousel container types.

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to DoubleClick</a>
