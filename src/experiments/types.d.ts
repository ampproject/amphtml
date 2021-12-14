export type ExperimentInfo = {
 experimentId: string;
 isTrafficEligible: (win: Window) => boolean;
 branches: string[];
};

// Map from experiment ID to one of its branches (or null, if ineligible)
export type ExperimentBranchMap = {[key: string]: (string|null)};
