# Long-Term Stable (lts) Release Channel

The **lts** release channel provides a previous **stable** build for four-week intervals. Every four weeks, the current **stable** release is promoted to **lts**. This is not recommended for all AMP publishers, but is provided so publishers performing a QA cycle may do so less often. Individual pages can explicitly opt into **lts**.

> Note: The **lts** release channel is available only to AMP Websites; it is not available to AMP Actions, AMP for Email, AMP Stories, or AMP for Ads.

## How to Opt-In

```html
<!-- Standard AMP HTML runtime and extension scripts -->
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script
  async
  custom-element="amp-ad"
  src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"
></script>

<!-- LTS AMP HTML runtime and extension scripts -->
<script async src="https://cdn.ampproject.org/lts/v0.js"></script>
<script
  async
  custom-element="amp-ad"
  src="https://cdn.ampproject.org/lts/v0/amp-ad-0.1.js"
></script>
```

While it is a requirement that the same version is used for the runtime and extension scripts, requesting **lts** is valid AMP. It will get the same cache benefits as the stable release channel.

Important: Publishers using the **lts** release channel should not use newly introduced features. Because of the four-week cycle, the **lts** release may be as much as six weeks behind the `HEAD` of [`ampproject/amphtml`](https://github.com/ampproject/amphtml). See the section on [determining if your change is in a release](https://github.com/ampproject/amphtml/blob/master/contributing/release-schedule.md#Determining-if-your-change-is-in-a-release).
