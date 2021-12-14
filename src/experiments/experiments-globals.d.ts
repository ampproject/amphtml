export {};

declare global {
  interface Window {
    __AMP_EXPERIMENT_BRANCHES?: import('./types').ExperimentInfo;
    __AMP_EXP?: HTMLScriptElement;
    AMP_EXP?: {[key: string]: number};
  }
}
