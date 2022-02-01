# AMP Ad Lazy Fetch

By default, Doubeclick type AMP Ad fetches all slots on the page independent of their location relative to the viewport. However when they render is dependent on <a href="render-on-idle.md">Render on Idle</a>. If a publisher is seeking to delay the ad request instead of just render, data-lazy-fetch=true attribute can be set on the amp-ad element:

```html
<amp-ad ... data-lazy-fetch="true"></amp-ad>
```

When set, the ad request will be delayed until the slot is 3 viewports away (can be set to a specific viewport value based on data-loading-strategy=viewports. Publishers using data-loading-strategy=prefer-viewability-over-views will use current 1.25 viewports. Example of setting lazy fetch to 2 viewports:

```html
<amp-ad ... data-lazy-fetch="true" data-loading-strategy="2"></amp-ad>
```

Note that when lazy fetch is enabled <a href="sra.md">SRA</a> is disabled.
