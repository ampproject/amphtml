# Flags

Please be aware that canary-config.json is actually 1% of production (which is
99%). There are some instances where you might not want this and you should
instead configure the prod-config.json file with a correct frequency value
besides 1 or 0.

# experiments-config.json

- `name`: Experiment name
- `command`: Command used to build the experiment
- `issue`: The issue tracker URL for this experiment
- `defineExperimentConstant`: (Optional) The flag that is used to section out experiment code. This is passed into the `minify-replace` babel plugin and defaults to `false`. If an experiment relies on `minify-replace` to replace its experiment flag, this value must be defined.
