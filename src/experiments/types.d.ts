export type ExperimentInfo = {
 experimentId: string;
 isTrafficEligible: (win: Window) => boolean;
 branches: string[];
};
