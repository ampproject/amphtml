/**
 * @typedef {{
 *   experimentId: string,
 *   isTrafficEligible: function(!Window):boolean,
 *   branches: !Array<string>
 * }}
 */
export let ExperimentInfoDef;
