import {createUseStyles} from 'react-jss';

// TODO(alanorozco): Share these across components.
export const fillStretch = {
  'position': 'relative',
  'width': '100%',
  'height': '100%',
};

export const fillContentOverlay = {
  'position': 'absolute',
  'left': 0,
  'right': 0,
  'bottom': 0,
  'top': 0,
};

const JSS = {
  fillStretch,
  fillContentOverlay,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
