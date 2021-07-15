# Scheduled Issues

We use Github issues to track scheduled events, like [Design Reviews](https://github.com/ampproject/amphtml/labels/Type%3A%20Design%20Review).

This directory includes a script that creates these issues automatically. It also contains definitions of schedules and contents, which we call templates.

## Usage

### Automatically

A [Github Workflow](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions) located on [`../create-scheduled-issues.yml`](../create-scheduled-issues.yml) runs the script daily.

> Running daily supports flexible scheduling schemes on a best-effort basis. Changes in template schedules should be merged one day or longer before the next event is configured to occur. This accounts both for timezones and execution frequency. If it's not possible to merge a change as early, you can run the script manually and create the issue on your behalf.

### Manually

You might want to run the script manually in order to try out local changes. You can also run it to post issues in spite of the automatic workflow, or in case it fails.

First, **set up environment variables**:

-   **`GITHUB_REPOSITORY`**. If you're trying out local changes, it's best to point this to a repository under your own account.

-   **`GITHUB_TOKEN`** for API access. You can use a [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) with **repo** and **write:discussion** permissions.

For example:

```console
export GITHUB_REPOSITORY=ampproject/amphtml
export GITHUB_TOKEN=$(cat my-token.txt)
```

> It's recommended that you read the `GITHUB_TOKEN` from a file (`my-token.txt`) to prevent its value from being leaked by your console's history.

Once you've set up the environment variables, **you may run**:

```console
node .github/workflows/create-scheduled-issues --dry-run
```

The previous command outputs the issues to create, but doesn't actually post them on Github. **To post them, omit `--dry-run`**:

```console
node .github/workflows/create-scheduled-issues
```

## Writing an issue template

To define a new type of scheduled issue:

1. Create a Javascript file located in [`template/`](./). This file should export a default object like the **`Template`** type below.

2. Make your template findable by listing it on [`index.js`](./index.js)

```js
// template/my-template.js

module.exports = {
  frequency: { ... },
  ...
};
```

```diff
// index.js

const templates = [
  'design-review',
+ 'my-template',
  'wg-components-office-hours'
];
```

See [`design-review.js`](./template/design-review.js) for an example.

### Types

> All dates and time are UTC.

> Days of the week index Sunday at zero: `SUNDAY = 0`, `MONDAY = 1`, etc.

```ts
interface Template {
  // Frequency of events to create issues for.
  // One of:
  //  - {dayOfWeek} to set a weekly frequency.
  //     e.g. every Sunday: {dayOfWeek: 0}
  //     e.g. every Friday: {dayOfWeek: 5}
  //
  //  - {nthDayOfWeek} to set [n, dayOfWeek], once a month
  //     e.g. first (1) Sunday (0) of every month: [1, 0]
  //     e.g. third (3) Thursday (4) of every month: [3, 4]
  frequency:
    | {dayOfWeek: number}
    | {nthDayOfWeek: [number, number]};

  // Create issues for up to N upcoming events
  // (optional, at least 1)
  upcoming?: number;

  // Set of time to rotate as [region, time] like
  // ["Americas", "18:00"].
  // If the even always occurs at the same time of day, this
  // array should contain only one item.
  timeRotation: [string, string][];

  // Date of the first event as YYYYMMDD.
  // This is used to index selected timezones in the rotation.
  timeRotationStartYyyyMmDd: string;

  // Labels to be added to the created issue.
  // The given set should exclusively label issues created by the
  // template, since we look up previous issues based on labels.
  labels: string[];

  // Receives a ScheduledEvent, and returns the title of the issue.
  createTitle: (ScheduledEvent) => string;

  // Receives a ScheduledEvent, and returns the body of the issue.
  createBody: (ScheduledEvent) => string;
}

interface ScheduledEvent {
  region: string;
  yyyy: string;
  mm: string;
  dd: string;
  hours: number;
  minutes: number;
  time: string; // Same as `${hours}:${minutes}`
}
```
