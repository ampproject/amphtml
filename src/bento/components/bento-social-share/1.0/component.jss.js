import {createUseStyles} from 'react-jss';

const button = {
  'textDecoration': 'none',
  'cursor': 'pointer',
  'position': 'relative',
  '&:focus': {
    outline: '#0389ff solid 2px',
    outlineOffset: '2px',
  },
};

const JSS = {
  button,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
