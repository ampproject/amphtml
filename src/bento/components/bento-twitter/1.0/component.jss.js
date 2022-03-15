import {createUseStyles} from 'react-jss';

// This style is added as part of a workaround to fix the component resizing issue because
// the resizing happens only when the embed comes into viewport and most of the time the
// attemptChangeHeight request is gets rejected.
const loadWrapper = {
  position: 'fixed !important',
  opacity: '0',
  top: '0',
  bottom: '0',
  left: '0',
  right: '0',
  pointerEvents: 'none',
};

const JSS = {
  loadWrapper,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
