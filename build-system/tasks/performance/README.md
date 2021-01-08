# Performance test

Use `gulp performance` to run this test. It measures performance for the current branch compared to the current release. By default, the command first needs to compile minified runtime and components from the current branch by executing the `gulp dist` task. To skip this step, use the `--nobuild` flag, but the task will throw an error if the dist files are missing. Only the runtime and components used by documents from the configured URLs are compiled.

The `config.json` file contains settings. The default value for `runs` is 50, which takes ~10 minutes to run, and generates results with ~5% margin of error. Differences larger than this should be investigated. The `defaultHandler` within the `handlers` list measures the basic pageview metrics. The other handlers within the list can track different metrics (analytics request time, amount of analytics requests failed, etc...). Each handler within the handlers list must have a `handlerName` as well as a `urls` array (can be empty).

This test measures the Core Web Vitals metrics: `largest contentful paint`, `max first input delay`, and `cumulative layout shift`. For ads, the test also measures `analytics request delay` and `failed percentage of analytics requests`.
