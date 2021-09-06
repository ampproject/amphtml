# AMP Ad Refresh

AMP Ad Refresh provides a mechanism for Google Ad Manager slots to periodically refresh, that is to fetch and render a new creative. Slots will only issue refresh requests once the current creative has been viewed (i.e., has had 50% of its pixels on screen for a continuous second).

For a network implementation guide, please click <a href="../../extensions/amp-a4a/refresh.md">here</a>.

### Page-level Configuration

Refresh may be enabled across all eligible slots for a set of opted-in network on a page by adding the following metadata tag:

`<meta name="amp-ad-enable-refresh" content="network1=refresh_interval1,network2=refresh_interval2,...">`

Where `refresh_interval` is the time, in seconds, in between refresh cycles. This value must be a number greater than or equal to 30. Individual slots may be opted-out of refresh by adding `data-enable-refresh=false` to the slot.

<strong>Note:</strong> Regardless of what `refresh_interval` is set to, the refresh interval will not begin until the current slot is viewable (has had 50% of its pixels on screen for a continuous second).

### Slot-level Configuration

An individual slot is eligible to be refreshed if it is configured as:

```html
<amp-ad ... data-enable-refresh="refresh_interval"></amp-ad>
```

`refresh_interval` must be a number greater than or equal to 30, or `false`. If `refresh_interval` is set to `false`, then this slot will not be refresh-enabled, even if page-level configurations are set. Otherwise, if `refresh_interval` is a numeric value, then it will represent the time, in seconds, between refresh events on this particular slot.

#### SRA Compatibility

Refresh is currently not supported for SRA enabled slots. If a slot is enabled for both, refresh will be disabled, and an error will be logged to the user's console.

#### AMP Ad Container Compatibility

The only AMP ad containers in which refresh is currently supported are amp-sticky-ad and amp-carousel container types.

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to Google Ad Manager</a>
