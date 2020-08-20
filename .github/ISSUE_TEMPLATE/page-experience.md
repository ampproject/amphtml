---
name: Page experience 
about: Used to report issues where AMP pages don't meet page experience criteria.
title: "Page experience issue"
labels: 'Type: Page experience'
assignees: ''

---

<!--
Please only file issues when your AMP page isn't performing well on page experience and the [AMP Page Experience checker](go.amp.dev/page-experience)
Replace/remove all of the text in brackets, including this text.
-->

Details
---

This page is failing for the following reason:
<!--
- Cache passes all criteria, Origin fails one or more criteria, Page experience checker had no feedback to provide.
- Cache fails one or more criteria, Origin passes all criteria
- Cache and Origin fail one or more criteria, Page experience checker had no feedback to provide.

-->


| Metric                  | Field data - Origin | Field data - Cache | Lab data - Origin | Lab data - Cache |
|-------------------------|---------------------|--------------------|-------------------|------------------|
| LCP                     |                     |                    |                   |                  |
| FID                     |                     |                    |                   |                  |
| CLS                     |                     |                    |                   |                  |
| HTTPS                   |                     |                    |                   |                  |
| Safe browsing           |                     |                    |                   |                  |
| Mobile-friendliness     |                     |                    |                   |                  |
| Intrusive Interstitials |                     |                    |                   |                  |

<!--
Notes
---
<Additional notes>
-->

/cc @ampproject/wg-performance
