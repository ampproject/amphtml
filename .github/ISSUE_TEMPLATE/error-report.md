---
name: Error report
about: Used to report production errors seen in AMP Error Reporting.
title: "\U0001F6A8 Error: [error message]"
labels: 'Type: Error Report'
assignees: ''

---

<!--
Please only file error reports from AMP Error Reporting here.
Replace/remove all of the text in brackets, including this text.
-->

Details
---

<!--
Remove the backticks around the link below and replace Error_ID with the ID from
the Cloud Error Reporting URL.
-->
**Error report:** `[link](go/ampe/<Error_ID>)`
**First seen:** <First seen date> <!--
Select "1 day" on the error details page for the error and record the
occurrences.
-->
**Frequency:** ~ <Daily occurrences>/day


Stacktrace
---
```
<!-- Stacktrace here -->
```

<!--
If there are other interesting trends to note (ex. all user-agent strings are
from iPhones, sudden jump in volume with recent release, etc.),
uncomment and include them in the section below.
-->

<!--
Notes
---
<Additional notes>
-->

/cc @ampproject/release-on-duty
