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

# client-side-experiments-config.json

This config is used to run client side diverted experiments, adding runtime support for deploying AMP experiment configuration updates faster via the CDN and cache pages. It is complimentary to `{canary,prod,custom}-config.json` and takes precedence over them. (See I2I issue: [#34013](https://github.com/ampproject/amphtml/issues/34013))

The JSON object must contain exactly one field `experiments` which is an array of experiment definition objects with the following fields:

-   `name`: experiment name
-   `percentage`: percentage of AMP page views that will activate this experiment (between 0 and 1)
-   `rtvPrefix`: (optional) array of RTV prefixes that will cause this experiment to be active, with period (`.`) acting as a wildcard. e.g., `["00", "0.2106"]` will cause this experiment to activate on the Experimental channel, and on every channel for the month of June, 2021 (see [Versioning section in amp-framework-hosting.md](../../docs/spec/amp-framework-hosting.md#versioning) for an explanation of AMP versions and RTV numbers).

Example:

```json
{
  "experiments": [
    {
      "name": "chunked-amp",
      "percentage": 0.5,
    },
    {
      "name": "version-locking",
      "percentage": 1,
      "rtvPrefix": ["01", "02", "03", "04", "05"]
    }
  ]
}
```

Once merged onto the `main` branch, this file is automatically picked up by the AMP CDN (usually within 1-2 hours from PR merge) and its content is injected into `v0.[m]js`. AMP caches can also inject the contents of this file verbatim into pages inside a `<script language=text/json id=__AMP_EXP>{...}</script>` element.
