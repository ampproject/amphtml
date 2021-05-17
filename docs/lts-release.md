# Long-Term Stable (lts) Release Channel

The **lts** release channel provides a previous **stable** build for one-month intervals. On the second Monday of each month, the current **stable** release is promoted to **lts**. This channel is not recommended for all AMP publishers. It is provided so that publishers who wish to perform a QA cycle on their website less frequently may do so by opting specific web pages into the **lts** channel.

In the event that the second Monday of the month falls during a [release freeze](https://github.com/ampproject/amphtml/blob/main/docs/release-schedule.md#release-freezes) (such as on one of the major US holidays), the promotion will be performed after the end of the release freeze.

> Note: The **lts** release channel is available only to AMP Websites and AMP Stories; it is not available to AMP Email or AMP Ads.

## How to Opt-In

### Standard AMP HTML runtime and extension scripts

> Note: recommended for most sites

```html
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script
  async
  custom-element="amp-ad"
  src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"
></script>
```

### LTS AMP HTML runtime and extension scripts

```html
<script async src="https://cdn.ampproject.org/lts/v0.js"></script>
<script
  async
  custom-element="amp-ad"
  src="https://cdn.ampproject.org/lts/v0/amp-ad-0.1.js"
></script>
```

While it is a requirement that the same version is used for the runtime and extension scripts, requesting **lts** is valid AMP. It will get the same cache benefits as the stable release channel.

**Important**: Publishers using the **lts** release channel should be careful when using newly introduced features. Because of the longer cycle, the **lts** release may be as much as seven weeks behind the `HEAD` of [`ampproject/amphtml`](https://github.com/ampproject/amphtml). See the section on [determining if your change is in a release](https://github.com/ampproject/amphtml/blob/main/docs/release-schedule.md#Determining-if-your-change-is-in-a-release) to validate if a change will be ready with your chosen release cycle.
