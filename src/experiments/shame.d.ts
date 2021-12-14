import '#utils/log.shame.d';

declare module '#experiments' {
  export const randomlySelectUnsetExperiments:
    (win: Window, exp: import('./types.d').ExperimentInfo[]) => void;
}
