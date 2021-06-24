# Sweep experiments tool

Sweeps experiments by id, or when they were last flipped before a certain cutoff date.

## Command line

By default, removes experiments whose [production launch value](../../global-configs/prod-config.json) was last set to either `1` or `0` over ~6 months ago:

```console
amp sweep-experiments
```

You may configure the cutoff date using `--days_ago`:

```console
amp sweep-experiments --days_ago=180
```

The tool can also sweep a specific experiment by id, regardless of its launch value:

```console
amp sweep-experiments --experiment=my-experiment
```

For all available options, see the [exported flags.](./index.js)

## Generated commmit history

The tool adds new commits to the history, so you should make sure that the tool runs on a clean branch.

### Removal commits

Each experiment has its own removal commit, so that it can be reverted or referenced independently.

Their description includes the experiment's id, its evaluated launch value, and
previous launch flip history. The most recent flip commit in the history is also referenced on the subject line:

```
(2019-12-01, aa1bb2c) `my-experiment`: 1

Previous history on prod-config.json:

- aa1bb2c - 2019-12-01T00:00:00-08:00 - Launch my-experiment to 100% of production
- c3dd4ee - 2019-10-01T00:00:00-08:00 - Launch my-experiment to 100% of canary
```

These commits remove the following:

1. **Launch bit** entry on `prod-config.json` and `canary-config.json`.

2. **Listing entry** on `experiments-config.js`.

3. **References in source code**, such as `isExperimentOn()`.

References in source code that were removed or replaced **[require additional modification done manually](#followup).**

### Summary commit

A final, empty commit (no file changes) is created, whose description includes a summary report of all changes. This commit can be referenced for a pull request description, or to find files in which to intervene manually.

## <a id="#followup"></a> Manual follow-up changes

Javascript changes on runtime or test code are **not** ready to be submitted, so they require follow-up changes.

Each removal may be different depending on the implementation that referenced the experiment. The following are steps to take on common cases.

### <a id="followup:isExperimentOn"></a> `isExperimentOn()`

Calls to `isExperimentOn()` are replaced their launch % as a boolean literal. This is likely changed on runtime code.

Users of these calls may now be unnecessary, so they should be intervened manually:

#### Assertions

If an assertion like `userAssert` or `devAssert` evaluates on `true`, it should be removed:

```diff
  doStuffWhenExperimentIsOn() {
-   userAssert(/* isExperimentOn(win, 'my-experiment') // launched: true */ true);
    doStuff();
  }
```

If an assertion now evalues on `false`, it's likely part of a larger block that
is now dead code:

```diff
-  doStuffWhenExperimentIsOff() {
-    devAssert(/* isExperimentOn(win, 'my-experiment') // launched: false */ false);
-    doStuff();
-  }
```

#### Conditional blocks

Conditions that result on `false` should have their block removed altogether, for example:

```diff
- if (/* isExperimentOn(win, 'my-experiment') // launched: false */ false) {
-   doStuff();
- } else {
    doStuffOtherwise();
- }
```

If the conditions results on `true`, the block should always be executed:

```diff
- if (/* isExperimentOn(win, 'my-experiment') // launched: true */ true) {
    doStuff();
- } else {
-   doStuffOtherwise();
- }
```

Watch for the complete evaluated result:

```diff
  // Remove entire block when condition evaluates to false
- if (!(/* isExperimentOn(win, 'my-experiment') // launched: true */ true)) {
-   return;
- }
- if (
-    someOtherValue &&
-    (/* isExperimentOn(win, 'my-experiment') // launched: false */ false)
- ) {
-   return;
- }

  // Inverted, so evalues to `true` and its block should always be executed:
- if (!(/* isExperimentOn(win, 'my-experiment') // launched: false */ false)) {
    doSomething();
- }

  // Literal boolean operand is redundant, but other operands remain:
  if (
-  (/* isExperimentOn(win, 'my-experiment') // launched: true */ true) &&
   someOtherValue
  ) {
    return;
  }
  if (
-  (/* isExperimentOn(win, 'my-experiment') // launched: false */ false) ||
   someOtherValue
  ) {
    return;
  }
```

Experiment flag values may be set early and read later, so look for conditionals with backward references:

```diff
  constructor() {
-   this.isMyComponentExperimentOn_ =
-     /* isExperimentOn(win, 'my-experiment') // launched: true */
-     true;
  }
  layoutCallback() {
-   if (this.isMyComponentExperimentOn_) {
      doStuff();
-   }
  }
```

### <a id="followup:toggleExperiment"></a> `toggleExperiment()`

Calls to `toggleExperiment()` most likely occur on tests.

If a toggle flip matches the experiment launch value, the call has already been safely removed. As a result, useless blocks may be left over, so they should be removed:

```diff
- // Turn on experiment so tests work.
- beforeEach(() => {});
-
- // Turn off experiment to cleanup.
- afterEach(() => {
-   /* toggleExperiment(win, 'my-experiment', false) // launched: true */
-   false;
- })
```

Otherwise the the test is likely obsolete and will fail, since it requires a state not possible with the current launch value:

```diff
- it('should fail if experiment is off', () => {
-   /* toggleExperiment(win, 'my-experiment', false) // launched: true */
-   false;
-   shouldFail();
- })

  it('returns value', () => {
    expect(foo()).to.equal('value returned with experiment on');
-   /* toggleExperiment(win, 'my-experiment', false) // launched: true */
-   false;
-   expect(foo()).to.equal('value returned with experiment off');
  });
```

### <a id="followup:html"></a> References on HTML files

The summary commit may list HTML files that contain references to an experiment as a string (`"my-experiment"` or `'my-experiment'`).

These should be handled manually:

-   **Turned on via `amp-experiment-opt-in`**

    Experiments may be turned using a `<meta>` tag, so it should be removed:

    ```diff
    - <meta name="amp-experiments-opt-in" content="my-experiment">
    ```

    If other experiments are opted-into, only some entries should be removed:

    ```diff
      <meta
        name="amp-experiments-opt-in"
    -   content="some-other-experiment,my-removed-experiment"
    +   content="some-other-experiment"
      >
    ```

-   **Toggled via `<script>` snippet**

    Some HTML files include a `<script>` tag that toggles the experiment. In which case, their execution block should be removed:

    ```diff
    - <script>
    -   (self.AMP = self.AMP || []).push(function(AMP) {
    -     AMP.toggleExperiment('my-experiment', true);
    -   });
    - </script>
    ```

-   **Benign references**

    Some HTML files reference the experiment name if it's homonymous with an unrelated attribute, like when an experiment is named after a new extension. In this case, **there's nothing to remove:**

    ```diff
    <!-- Experiment is called the same as amp-my-extension: -->
    <script custom-element="amp-my-extension" ...></script>
    ```
