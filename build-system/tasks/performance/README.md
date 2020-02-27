# Performance test

Use `gulp performance` to run this test. It measures performance for the current branch compared to the current release. By default, the command first needs to compile minified runtime and components from the current branch by executing the `gulp dist` task. To skip this step, use the `--nobuild` flag, but the task will throw an error if the dist files are missing. Only the runtime and components used by documents from the configured URLs are compiled.

The `config.json` file contains settings. If you set `headless` to `false`, you will be able to watch the test run in Chrome. The default value for `runs` is 100, which takes ~10 minutes to run, and generates results with ~5% margin of error. Differences larger than this should be investigated. The `urls` array of strings must be set before running the test, and each URL will be tested separately.

This test measures the following metrics: `visible`, `first paint`, `first contentful paint`, `largest contentful paint`, `time to interactive`, `max first input delay`, and `cumulative layout shift`.
