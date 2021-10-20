import {createUseStyles} from 'react-jss';

const inline = {
  'display': 'inline-block',
  'vertical-align': 'middle',
};

const JSS = {
  inline,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
