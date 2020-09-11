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
| LCP                     | <pass/fail>         | <pass/fail>        | <pass/fail>       | <pass/fail>      |
| FID                     | <pass/fail>         | <pass/fail>        | <pass/fail>       | <pass/fail>      |
| CLS                     | <pass/fail>         | <pass/fail>        | <pass/fail>       | <pass/fail>      |
| HTTPS                   | <pass/fail>         | <pass/fail>        | <pass/fail>       | <pass/fail>      |
| Safe browsing           | <pass/fail>         | <pass/fail>        | <pass/fail>       | <pass/fail>      |
| Mobile-friendliness     | <pass/fail>         | <pass/fail>        | <pass/fail>       | <pass/fail>      |
| Intrusive Interstitials | <pass/fail>         | <pass/fail>        | <pass/fail>       | <pass/fail>      |

Notes
---

Components in use: 
<!--
List components being used on the page
-->

<!--
<Additional notes>
-->

/cc @ampproject/wg-performance
