import {createUseStyles} from 'react-jss';

const loaderWrapper = {
  position: 'absolute',
  height: '100%',
  width: '100%',
};

const loader = {
  animation: '$spin 2s linear infinite',
  border: '1px solid #f3f3f3' /* Light grey */,
  'border-radius': '50%',
  'border-top': '2px solid #a3a3a3' /* Dark grey */,
  height: '48px',
  left: 'calc(50% - 24px)',
  position: 'absolute',
  top: 'calc(50% - 24px)',
  width: '48px',
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
