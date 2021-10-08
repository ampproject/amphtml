---
$category@: social login
formats:
  - websites
teaser:
  text: Displays Google One Tap.
---

# amp-onetap-google

## Overview

`amp-onetap-google` displays [Google One Tap sign-in](https://developers.google.com/identity/one-tap/web).

#### Example

```html
<amp-onetap-google
  layout="nodisplay"
  data-src="https://example.com/onetap"
></amp-onetap-google>
```

After a successful sign-in, [`amp-access`](https://go.amp.dev/c/amp-access) and/or [`amp-subscriptions`](https://go.amp.dev/c/amp-subscriptions) are refreshed on the page.

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-src (required)</strong></td>
    <td>The URL of the intermediate iframe. You can use <a href="https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-var-substitutions.md">URL substitution variables</a> to pass values like <code>ACCESS_READER_ID</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>
