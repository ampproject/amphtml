import {createUseStyles} from 'react-jss';

const blockerDetected = {
  color: 'darksalmon',
  background: 'darkred',
};

const blockerNotDetected = {
  color: 'greenyellow',
  background: 'darkgreen',
  display: 'none',
};

const JSS = {
  blockerDetected,
  blockerNotDetected,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
