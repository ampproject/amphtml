import {createUseStyles} from 'react-jss';

const inset = {};

const container = {
  fontSize: '12px',
  /*
   * TODO(https://github.com/ampproject/amphtml/issues/25888)
   * Use a better, common set of fonts for sans-serif.
   */
  fontFamily: 'sans-serif',
  lineHeight: 1,
  height: '20px', // Default height. Can be overriden by user style.
  display: 'flex',
  flexDirection: 'column',
  '&$inset': {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    margin: '18px 0',
    zIndex: 1,
  },
};

const dots = {
  position: 'relative',
  alignSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  maxWidth: '60%',
  '&$inset': {
    padding: '0 4px',
    zIndex: 0,
  },
};

/**
 * Used to allow the spacing of the dots to become more compact as more dots
 * are added.
 */
const dotWrapper = {
  position: 'relative',
  display: 'flex',
  width: '16px',
  minWidth: '14px',
  justifyContent: 'center',
  '&$inset': {
    zIndex: 1,
  },
};

const dot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  position: 'relative',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  '&$inset': {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
};

const dotProgress = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  position: 'absolute',
  top: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  '&$inset': {
    backgroundColor: '#fff',
  },
};

const numbers = {
  position: 'relative',
  alignSelf: 'flex-end',
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: '0 8px',
  color: 'currentColor',
  '&$inset': {
    color: '#fff',
    zIndex: 0,
  },
};

const numbersWrapper = {
  '&$inset': {
    zIndex: 1,
  },
};

const insetBaseStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: '12px',
};

const insetBackground = {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
};

const insetFrosting = {
  backdropFilter: 'blur(3px)',
};

const insetBackdrop = {
  backdropFilter: 'blur(12px) invert(1) grayscale(0.6) brightness(0.8)',
  opacity: 0.5,
};

const JSS = {
  inset,
  container,
  dots,
  dotWrapper,
  dot,
  dotProgress,
  numbers,
  numbersWrapper,
  insetBaseStyle,
  insetBackground,
  insetFrosting,
  insetBackdrop,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
