import {createUseStyles} from 'react-jss';

// DO NOT SUBMIT: Example class used for styling
const exampleContentHidden = {
  display: 'none',
};

const JSS = {
  exampleContentHidden,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
