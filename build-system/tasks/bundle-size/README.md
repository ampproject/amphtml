# Bundle Size checks

The `APPROVERS.json` file is a listing of compiled AMP runtime and extensions
files in `extglob` syntax. Each rule has two parts:

-   `approvers`: list of GitHub teams whose members may approve pull requests that
    fail the check
-   `threshold`: number of kilobytes by which the brotli-compressed bundle size
    can increase before failing the check

Approval from any single member of any of the file's approval-teams is enough to
satisfy the check.

This file is dynamically fetched by the [Bundle-Size GitHub App](https://github.com/ampproject/amp-github-apps/tree/main/bundle-size)

If a pull request requires a bundle-size approval from more than one _set_ of
approvers, it will fall back to the default set of approvers
(`@ampproject/wg-performance`). Members of `@ampproject/wg-infra` can also
approve all bundle size increases or app failures, but this should only be
done when the cause for the failure is an infrastructure issue.
