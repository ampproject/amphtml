export {};

declare global {
  interface Window {
    __AMP_EXPERIMENT_BRANCHES?: import('./types.d').ExperimentBranchMap;
    __AMP__EXPERIMENT_TOGGLES?: {[key: string]: boolean};
    __AMP_EXP?: HTMLScriptElement;
    AMP_EXP?: {[key: string]: number};
  }
}
