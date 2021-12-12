# Running Experiment with Different Binaries

We understand that experimenting a new feature or change on the client side is not always practical. For example, if you rewrite a big chunk of the code base, or include a new transformer in the transpiling process, you would want to run the experiment at the server level, where different binaries will be returned.

This doc explains how to create a server side diverted experiment.

_Refer to [enabling AMP experimental features doc](https://amp.dev/documentation/guides-and-tutorials/learn/experimental) to learn more on client side experiments_

## Before you start

Because real traffic can be automatically assigned to the experiment, plus the experiment slots are limited. Any experiment declaration and launch requires an issue tracker and at least one approval from @ampproject/wg-approvers or @ampprojeg/wg-monetization depending on the type of experiment environment(#environment).

## Run an Experiment

### Declare an Experiment

Declare an experiment flag that's used during transpiling process. An example looks like

```
// eslint-disable-next-line no-undef
if (MY_EXPERIMENT) {
  // new code path
} else {
  // old code path
}
```

During transpiling, babel will replace the experiment flag with a boolean value and removed the unused code path.

The experiment flag values are default to `false`. You can use the `--define_experiment_constant` flag to set the value to `true`.

```
amp build --define_experiment_const MY_EXPERIMENT`
```

### Start an Experiment

Once you receive approval to start a server side experiment. You can add your experiment to one of the three experiment slots under the `experiments-config.js` [file](https://github.com/ampproject/amphtml/blob/main/build-system/global-configs/experiments-config.json).

Example

```
{
  "experimentA": {
    "name": "myExperimentName",
    "environment": "AMP",
    "issue": "Link to the experiment tracking issue",
    "expiration_date_utc": "Date in YYYY-MM-DD format, in UTC",
    "define_experiment_constant": "MY_EXPERIMENT"
  },
  "experimentB": {},
  "experimentC": {}
}
```

In the same pull request you also need to add an experiment constant in the `experiments-const.json` [file](https://github.com/ampproject/amphtml/blob/main/build-system/global-configs/experiments-const.json).

Example

```
{
  "MY_EXPERIMENT": false,
  ...
}
```

You start with the `false` value at first. Note that the `experiment-config.json` constants override the values set in the `experiment-const.json` file.

#### More on Experiment Config

##### Environment

There are two types of environment `AMP` and `INABOX`. Use `AMP` if your experiment applied to AMP Documents, use `INABOX` if you want to run the experiment within AMPHTML ads.

##### Expiration Date UTC

The experiment expiration date in YYYY-MM-DD format, in UTC. If an experiment is expired, it will fail the build process. This expiration date is only read during the build. As a result, the experiment will actually end on the following release date after the expiration.

Please keep the expiration date 30 days within the start date unless otherwise instructed.

### What's Happening Behind

#### Building Experimental Binaries

After a new experiment slot has been added, AMP's release framework will respect the config and build additional experimental binaries. E2E tests will be ran with these experiment binaries.

Once the experimental binaries are shipped, once can access those with different RTV prefix.

For Experiment with `environment = AMP`. The Beta version that has prefix (03) will be used as control group for all experiments.

| Experiment Slot Used | RTV Prefix |
| -------------------- | ---------- |
| A                    | 10         |
| B                    | 11         |
| C                    | 12         |

For Experiment with `environment = INABOX`, two binaries will be built for each experiment.
| Experiment Slot Used | RTV Prefix (Experimental Build) | RTV Prefix (Control Build)
|---------------------- | ------------------------------- | --------------------|
|A | 21 | 20|
|B | 23 | 22|
|C | 25 | 24|

Tip: To test experimental build, you can opt into the corresponding RTV number via the AMP experiments [site](https://cdn.ampproject.org/experiments.html).

#### Running an Experiment

##### AMP Documents

There's no additional step to run an experiment with `environment = AMP`. The same amount of traffic will be automatically diverted to the RTV experiment slot A/B/C channel when we promote a small portion of traffic to the Beta channel. When comparing metrics, the Beta channel will serve as the control group to all experiments.

##### AMPHTML Ads

To run an experiment with `environment = INABOX`, please reach out to @ampproject/wg-monetization for additional instructions.

## Launch an Experiment

Once approvals have been collected from the corresponding working group. One can quickly launch an experiment by setting the experiment flag value under
[`experiment-consts.json`](https://github.com/ampproject/amphtml/blob/main/build-system/global-configs/experiments-const.json).

E.g.

```
{
  "MY_EXPERIMENT": true,
}
```

Make sure to remove the experiment config from [`experiment-configs.json`](https://github.com/ampproject/amphtml/blob/main/build-system/global-configs/experiments-config.json) when you do so. Because the config will override the value from [`experiment-consts.json`](https://github.com/ampproject/amphtml/blob/main/build-system/global-configs/experiments-const.json).

It is recommended to follow up with a proper clean up and remove the flag from the above file after the change is stable in production.
