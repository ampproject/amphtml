# Render On Idle

Slots not marked with data-loading-strategy attribute that are more than 3 viewports but less than 12 from current location are allowed to render when the AMP scheduler
is idle. The result is an increase in impressions with a much smaller increase in
viewable impressions and clicks. Publishers sensitive to viewability rate should
set data-loading-strategy=3 to keep the current viewport offset and disable idle render. Publishers using data-loading-strategy=prefer-viewability-over-views will
use current 1.25 viewport offset with idle render disabled.

#### <a href="amp-ad-network-doubleclick-impl-internal.md">Back to Google Ad Manager</a>
