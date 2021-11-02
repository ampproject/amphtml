import {createUseStyles} from 'react-jss';

const loaderWrapper = {
  position: 'absolute',
  height: '100%',
  width: '100%',
};

const loader = {
  border: '1px solid #f3f3f3' /* Light grey */,
  'border-top': '2px solid #a3a3a3' /* Blue */,
  'border-radius': '50%',
  width: '48px',
  height: '48px',
  animation: '$spin 2s linear infinite',
  position: 'absolute',
  left: 'calc(50% - 24px)',
  top: 'calc(50% - 24px)',
};

const JSS = {
  loader,
  loaderWrapper,
  '@keyframes spin': {
    '0%': {transform: 'rotate(0deg)'},
    '100%': {transform: 'rotate(360deg)'},
  },
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
