import {createUseStyles} from 'react-jss';

const sidebar = {
  position: 'fixed !important',
  overflowX: 'hidden !important',
  overflowY: 'auto !important',
  boxSizing: 'border-box !important',
  overscrollBehavior: 'none !important',
};

// User overridable styles
const defaultSidebarStyles = {
  color: '#000000',
  backgroundColor: '#efefef',
  height: '100vh',
  top: 0,
  maxHeight: '100vh',
  maxWidth: '80vw',
  minWidth: '45px',
  outline: 'none',
  zIndex: 2147483647,
};

const left = {
  left: 0,
};

const right = {
  right: 0,
};

const backdrop = {
  position: 'fixed !important',
  top: '0 !important',
  left: '0 !important',
  width: '120vw !important',
  height: '100vh !important',
  overflow: 'hidden scroll !important',
  /* Prevent someone from making this a full-sceen image */
  backgroundImage: 'none !important',
  overscrollBehavior: 'none !important',
};

// User overridable styles
const defaultBackdropStyles = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 2147483646,
};

//TODO(#32400): See PR description.  This is a workaround dependent on a
// a browser bug fix and should be removed when the browser bug is fixed.
const backdropOverscrollBlocker = {
  height: '101vh !important',
  width: '0 !important',
};

const unmounted = {
  display: 'none',
};

const mounted = {
  display: 'contents',
};

const JSS = {
  sidebar,
  defaultSidebarStyles,
  left,
  right,
  backdrop,
  defaultBackdropStyles,
  backdropOverscrollBlocker,
  mounted,
  unmounted,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
