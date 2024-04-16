# {canary,prod}-config.json

These config files are used to bootstrap experiment values into the runtime and are merged directly into the `AMP_CONFIG` field during the build. `prod-config.json` is used in all [release channels](../../docs/release-schedule.md#release-channels) except Experimental, which uses `canary-config.json`.

# experiments-config.json

This config is used to run server side diverted experiments. Please review the instruction [here](../../docs/running-server-side-experiment.md) beforehand.

-   `name`: Experiment name
-   `environment`: Specify the type of environment the experiment runs. Only support `AMP` and `INABOX`.
-   `issue`: The issue tracker URL for this experiment
-   `expiration_date_utc`: The experiment expiration date in YYYY-MM-DD format, in UTC. If an experiment is expired, it will fail the build process. This expiration date is only read during the build. As a result, the experiment will actually end on the following release date after the expiration.
-   `define_experiment_constant`: (Optional) The flag that is used to section out experiment code. This is passed into the `minify-replace` babel plugin and defaults to `false`. If an experiment relies on `minify-replace` to replace its experiment flag, this value must be defined.

Experiments will be built automatically for AMP releases by running `amp dist --esm --define_experiment_constant ${define_experiment_constant} && amp dist --define_experiment_constant ${define_experiment_constant}`

# custom-config.json

If `build-system/global-configs/custom-config.json` exists at build time, its properties will overlay the active config. For example, consider `amp dist --config=canary` with the following configs:

`canary-config.json` (simplified for brevity)

```json
{
  "canary": 1,
  "chunked-amp": 1,
  "version-locking": 1
}
```

`custom-config.json`

```json
{
  "cdnUrl": "https://example.com/amp",
  "version-locking": 0
}
```

The resulting config is

```json
{
  "canary": 1,
  "chunked-amp": 1,
  "version-locking": 0,
  "cdnUrl": "https://example.com/amp"
}
```

# custom-flavors-config.json

Additional release flavors can be defined in `build-system/global-configs/custom-flavors-config.json` and they will automatically be made available to `amp release`. This file should be an array of `DistFlavorDef` objects (see definition in [build-system/tasks/release/index.js](../tasks/release/index.js)). For example:

```json
[
  {
    "flavorType": "custom-exp",
    "name": "Custom Experimental Release",
    "environment": "AMP",
    "rtvPrefixes": [ "00" ],
    "command": "amp dist --noconfig"
  },
  {
    "flavorType": "custom-prod",
    "name": "Custom Production Release",
    "environment": "AMP",
    "rtvPrefixes": [ "01" ],
    "command": "amp dist --noconfig"
  }
]
```

and then "Custom Production Release" could be built with:

```sh
amp release --flavor="custom-prod"
```

**Tips:**

-   Be sure to pass flag `--noconfig` to `amp dist` in the flavor command, otherwise you will end up with multiple `AMP_CONFIG` definitions in entrypoint files (`v0.js`, `shadow-v0.js`, etc.).
-   Flag `--version_override` is not supported.
-   `AMP_CONFIG` can be customized with [`custom-config.json`](#custom-configjson) to further tailor the build.

# Looking for client-side-experiments-config.json?

This file now resides in the [ampproject/cdn-configuration](https://github.com/ampproject/cdn-configuration/blob/main/configs/client-side-experiments.json) repository.
