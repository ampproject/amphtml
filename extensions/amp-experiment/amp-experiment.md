<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# <a name="amp-experiment"></a> `amp-experiment`

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Conduct user experience experiments on an AMP document and collect corresponding data with <code>amp-pixel</code> or <code>amp-analytics</code>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-experiment" src="https://cdn.ampproject.org/v0/amp-experiment-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Examples</strong></td>
    <td><a href="https://ampbyexample.com/components/amp-experiment/">Annotated code example for amp-experiment</a></td>
  </tr>
</table>

## Behavior
The `<amp-experiment>` element is used to conduct user experience experiments on an AMP document. It provides hooks to define customizable variants and allocates traffic to each of the variants based on the configuration. For each page view, the variant allocation is also exposed to `amp-pixel` and `amp-analytics` so that the necessary data can be collected to perform statistical comparison across variants.

A user-sticky variant assignment is supported to provide a consistent user experience to the same client. This functionality relies upon AMP’s [Client ID](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md#client-id) capability to provide random values that are consistent across page views. Please be aware that usage of this feature with this behavior might require updating your privacy policy, or obtaining end user consent in some jurisdictions. (If this is relevant for you, please see `consentNotificationId` below.)

Multiple experiments can be run on the same AMP document in parallel with their own sets of variants. In user sticky mode, the allocations are orthogonal among different experiments, meaning there will be no correlation between 2 variants (user groups) that are from different experiments.

## Configuration
The configuration of the experiments is specified in a JSON object. 

```html
<amp-experiment>
  <script type="application/json">
    {
      aExperiment: {
        sticky: true, 
        consentNotificationId: "consent-notif",
        variants: {
          treatment1: 12.5,
          treatment2: 12.5,
          treatment3: 25.0,
        },
      },
      bExperiment: {...}
    }
  </script>
</amp-experiment>
```

At top level, the JSON is a map of experiment configurations keyed by experiment names. In each experiment, available settings are described in the table below:

<table>
<tr><th>Name                                                 </th><th>Is required field?                                          </th><th>Description </th></tr>
<tr><td class="col-thirty"><code>sticky</code>               </td><td class="col-thirty">No, default=<code>true</code>            </td><td>Whether the experiment assignment is sticky for a user or not. </td></tr>
<tr><td class="col-thirty"><code>consentNotificationId</code></td><td class="col-thirty">No, default=<code>undefined</code>       </td><td>The element ID of the <code>amp-user-notification</code> to be dismissed before a sticky experiment can be conducted. To not block the page rendering, an experiment with this field specified will be skipped if the consent is not provided prior to the current visit. That’s to say, only returning visits with user consent can trigger such an experiment. This setting is only relevant when <code>sticky=true</code>. </td></tr>
<tr><td class="col-thirty"><code>variants</code>             </td><td class="col-thirty">Yes                                      </td><td>A name-to-percentage map where percentage is a float number in range (0, 100) that indicates the amount of traffic will be allocated to the variant. Variants don’t have to sum up to 100%. In that case, there’ll be a portion of the traffic allocated to a variant named <code>none</code>, which is a reserved keyword that indicates no variant was allocated. </td></tr>
<tr><td colspan=3><strong>Advanced settings</strong></td></tr>
<tr><td class="col-thirty"><code>cidScope</code>             </td><td class="col-thirty">No, default=<code>amp-experiment</code>  </td><td>The <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md#client-id">CID scope</a> for user sticky experiment. Only useful when you want to reuse an existing CID. This setting is only relevant when <code>sticky=true</code>. </td></tr>
<tr><td class="col-thirty"><code>group</code>                </td><td class="col-thirty">No, default=<code>{experimentName}</code></td><td>Experiments with the same group name will share the same CID space. Only useful when multiple experiments want to have correlated user grouping. This setting is only relevant when <code>sticky=true</code>. </td></tr>
</table>

Characters used in the experiment name and variant name are restricted to `[a-z,A-Z,0-9,-,_].`  `none` is a reserved keyword and cannot be used. 

## Style a variant
For each experiment, the allocated variant is exposed as attribute of the body element of the document.

```html
<body amp-x-aExperiment="treatment1" amp-x-bExperiment="treatment3">
```

Notice that the experiment name is prefixed by `amp-x-` to avoid naming conflict. Experiments with no variant allocated are ignored.

Use CSS attribute selector to style the document. For example, the code below hide a test banner for the `treatment1` group of experiment `aExperiment`:

```css
body[amp-x-aExperiment="treatment1"] .test-banner {
  display: none;
}
```

## Reporting
Allocated variants are available as a [URL substitution variable](https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md): `VARIANT(experiment)`

```html
<amp-pixel src="https://example.com?xname=aExperiment&xvar=VARIANT(aExperiment)">
```

For experiments with no variants allocated, this variable resolves to string literal `none`.

Variable `VARIANTS` returns all variants serialized in the format of

`{experiment1}.{variant}!{experiment2}.{variant}...`

For example, the URL `https://example.com?variants=VARIANTS` expands to:

`https://example.com?variants=aExperiment.treatmentA!bExperiment.treatmentB`

## Override variant allocation
An experiment can be forced to a variant via URL fragment. This is useful in development.

`https://example.com/amparticle#amp-x-experiment=treatment`

Notice the same `amp-x-` prefix used as in body attributes.

## Validation
One AMP document can have at most one `amp-experiment` element. See [amp-experiment rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-experiment/validator-amp-experiment.protoascii) in the AMP validator specification.
