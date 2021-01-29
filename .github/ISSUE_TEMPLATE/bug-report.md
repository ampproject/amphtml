name: "Bug report"
about: "Used to report bugs in AMP."
labels: "Type: Bug"
issue_body: true
inputs:
- type: description
  attributes:
    value: **Please only file reports about bugs in AMP here.**
- type: description
  attributes:
    value: If you have questions about how to use AMP or other general questions about AMP please ask them on Stack Overflow under the AMP HTML tag instead of filing an issue here: http://stackoverflow.com/questions/tagged/amp-html
- type: description
  attributes:
    value: If you have questions/issues related to Google Search please ask them in Google's AMP forum instead of filing an issue here: https://goo.gl/utQ1KZ
- type: textarea
  attributes:
    label: Description
    required: true
    description: Briefly describe the bug.
    placeholder: Describing the expected versus the current behaviour will help us to understand where we should assign the investigation of this issue.
- type: textarea
  attributes:
    label: Reproduction Steps
    required: true
    description: How do we reproduce the issue?
    placeholder: Please provide a public URL and ideally a reduced test case that exhibits only your issue and nothing else. Provide step-by-step instructions for reproducing the issue.
- type: multi_select
  attributes:
    label: What browsers are affected?
    required: true
    choices:
      - Chrome
      - Firefox
      - Safari
      - Edge
      - UC Browser
- type: input
  attributes:
    label: AMP Version Affected
    description: "Which AMP version is affected?"
    placeholder: "Indicate a version, 2101280515000, or just refer to 'latest'"
