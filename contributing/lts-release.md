# Long-Term Stable (LTS) Release Channel

The **lts** release channel provides a previous **stable** build for four-week intervals. Every four weeks, the current **stable** release is promoted to **lts**. This is not recommended for all AMP publishers, but is provided so publishers performing a QA cycle may do so less often. Individual pages can explicitly opt into **lts**.

> Note: The LTS release channel is available only to AMP HTML pages; it is not available to AMP Actions, AMP for Email, AMP Stories, or AMP for Ads.

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

As long as all runtime and extension scripts in a page must use the same release version, requesting the LTS scripts is considered valid AMP and gets the same cache benefits as the **stable** release channel.

One trade-off to be aware of is that, because the **lts** release is updated every four weeks, the release binaries may be as much as six weeks behind the `HEAD` of [`ampproject/amphtml`](https://github.com/ampproject/amphtml). For this reason, publishers using the **lts** release channel should not use very newly introduced features. See the section on [determining if your change is in a release](#Determining-if-your-change-is-in-a-release).
