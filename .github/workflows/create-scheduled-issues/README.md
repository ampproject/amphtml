# Scheduled Issues

Some issues in this Github repository are created according to a calendar, like those labeled [`Type: Design Review`](https://github.com/ampproject/amphtml/labels/Type%3A%20Design%20Review).

This directory contains the script that creates these issues, as well as the definitions to how to create them (templates).

## Usage

### Github Workflow

On the main repository, we execute the script on a schedule using the Github Workflow [`create-scheduled-issues.yml`](../create-scheduled-issues.yml).

### Local testing

#### Environment variables

The script relies on environment variables for configuration. Set **`GITHUB_REPOSITORY`** to define the location of issues read and written.

```console
export GITHUB_REPOSITORY=ampproject/amphtml
```

You also need a **`GITHUB_TOKEN`**. You may use a [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) with **repo** and **write:discussion** permissions.

> It's recommended that you read the exported variable's value from a file (`my-token.txt`), so that the token itself is excluded from your console's history:

```console
export GITHUB_TOKEN=$(cat my-token.txt)
```

#### Console

After setting up environment variables, run:

```console
node .github/workflows/create-scheduled-issues [--dry-run]
```

-   `--dry-run`: Avoid writing the new issues, and instead display their tentative content.

> This script does not require a previous `npm install`, so we call `node` directly rather than the `amp` task runner.

## Writing an issue template

To define a new type of scheduled issue, add a Javascript file to [`template/`](./). This file should export a default object like **`Template`** below. See [`design-review.js`](./template/design-review.js) for an example.

> Days of the week start from zero, so `SUNDAY === 0`.

```ts
interface Template {
  // Set an n-weekly frequency: [weeks, dayOfWeek]
  // (Incompatible with frequencyWeekdayOfMonth)
  // Examples:
  //   - every Sunday: [1, 0]
  //   - every other Tuesday: [2, 2]
  frequencyWeekly?: [number, DayOfWeek];

  // Set a monthly frequency as "nth weekday of month" [n, dayOfWeek]
  // (Incompatible with frequencyWeekly)
  // Examples:
  //   - first monday of the month: [1, 1]
  //   - second sunday of the month: [2, 0]
  //   - third friday of the month: [3, 4]
  frequencyWeekdayOfMonth?: [number, DayOfWeek];

  // Schedule after skipping N sessions. Useful to cover the next N sessions
  // after the previous have been created. (optional)
  sessionsFromNow?: number;

  // Duration of the session in hours.
  // Accepts decimals, so 30 minutes is expressed as 0.5
  sessionDurationHours: number;

  // Set of time to rotate as [region, timeUtc] like
  // ["Americas", "18:00"].
  // If the session always occurs at the same time of day, this array
  // should contain only one item.
  timeRotationUtc: [string, string][];

  // Date of the first session as YYYYMMDD.
  // This is used to select the selected timezone in the rotation.
  timeRotationStartYyyyMmDd: string;

  // Labels to be added to the created issue.
  labels: string[];

  // Receives the scheduled date (Result), and returns the issue title.
  createTitle: (Result) => string;

  // Receives the scheduled date (Result), and returns the contents of
  // the issue.
  createBody: (Result) => string;
}

interface Result {
  // Year as YYYY
  yyyy: string;
  // Month as MM
  mm: string;
  // Day of the month as DD
  dd: string;
  // UTC time, 24 hrs.
  timeUtc: string;
  // startZ and endZ contain full formatted datetimes to interpolate
  // in a link to Google Calendar.
  startZ: string;
  endZ: string;
}
```

Then, make your template findable by adding the file's basename to [`index.js`](./index.js).

```diff
  const templates = [
    'design-review',
+   'my-template',
    'wg-components-office-hours'
  ];
```
