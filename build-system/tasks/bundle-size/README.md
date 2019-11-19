# Bundle Size checks

The `APPROVERS.json` file is a listing of compiled AMP runtime and extensions
files. Each rule has two parts:
- `approvers`: list of GitHub project teams, members of which are allowed to
  approve pull requests that increase the file's bundle size (Brotli-compressed
  size)
- `threshold`: number of KBs that the file can increase before requiring an
  approval from the above team members.

Approval from any single member of any of the file's approval-teams is enough to
satisfy the check.

This file is dynamically fetched by the [Bundle-Size GitHub App](https://github.com/ampproject/amp-github-apps/tree/master/bundle-size)

Note that pull requests that increase the bundle size of multiple files that
each require approval by a different set of teams (e.g., a PR that increases the
bundle-size of three files, requiring approvals by `{team1}`, `{team1, team2}`,
and `{team2}`) will fall back to the set of default approvers, currently set to
@ampproject/wg-runtime and @ampproject/wg-performance. Members of
@ampproject/wg-infra can also approve all all bundle size increases or app
failures, but this should only be done when the cause for the failure is an
infrastructure issue.
