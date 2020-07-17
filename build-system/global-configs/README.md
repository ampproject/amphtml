# Flags

Please be aware that canary-config.json is actually 1% of production (which is
99%). There are some instances where you might not want this and you should
instead configure the prod-config.json file with a correct frequency value
besides 1 or 0.

# experiments-config.json

This config is used to run server side diverted experiments. Please review the instruction [here](../../contributing/running-server-side-experiment.md) beforehand.

- `name`: Experiment name
- `environment`: Specify the type of environment the experiment runs. Only support `AMP` and `INABOX`.
- `issue`: The issue tracker URL for this experiment
- `expiration_date_utc`: The experiment expiration date in YYYY-MM-DD format, in UTC. If an experiment is expired, it will fail the build process. This expiration date is only read during the build. As a result, the experiment will actually end on the following release date after the expiration.
- `define_experiment_constant`: (Optional) The flag that is used to section out experiment code. This is passed into the `minify-replace` babel plugin and defaults to `false`. If an experiment relies on `minify-replace` to replace its experiment flag, this value must be defined.

Experiments will be built automatically for AMP releases by running `gulp dist --esm --define_experiment_constant ${define_experiment_constant} && gulp dist --define_experiment_constant ${define_experiment_constant}`

# custom-config.json

If `build-system/global-configs/custom-config.json` exists at build time, its properties will overlay the active config. For example, consider `gulp dist --config=canary` with the following configs:

`canary-config.json` (simplified for brevity)

```
{
  "canary": 1,
  "chunked-amp": 1,
  "version-locking": 1
}
```

`custom-config.json`

```
{
  "cdnUrl": "https://example.com/amp",
  "version-locking": 0
}
```

The resulting config is

```
{
  "canary": 1,
  "chunked-amp": 1,
  "version-locking": 0,
  "cdnUrl": "https://example.com/amp"
}
```
