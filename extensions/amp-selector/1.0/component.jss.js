import {createUseStyles} from 'react-jss';

const option = {
  'cursor': 'pointer',
};

const selected = {
  'cursor': 'auto',
  'outline': 'solid 1px rgba(0, 0, 0, 0.7)',
};

const disabled = {
  'cursor': 'auto',
  'opacity': '0.4',
};

const multiselected = {
  'cursor': 'pointer',
  'outline': 'solid 1px rgba(0, 0, 0, 0.7)',
};

const JSS = {
  option,
  selected,
  disabled,
  multiselected,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
