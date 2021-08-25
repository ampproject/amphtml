import {createUseStyles} from 'react-jss';

const gallery = {
  display: 'flex',
  flexGrow: 1,
  '&$extraSpace': {
    justifyContent: 'center',
  },
};
const extraSpace = {};
const arrow = {
  position: 'relative',
  zIndex: 1,
  border: 'none',
  outline: 'none',
  boxShadow: '0px 2px 6px 0px rgba(0,0,0,.4)',
  backgroundColor: 'rgba(255,255,255,0.6)',
  backgroundSize: '24px 24px',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backdropFilter: 'blur(3px)',
  transition: '200ms opacity ease-in',
};
const arrowPrev = {};
const arrowNext = {};
const insetArrow = {
  flexShrink: 0,
  width: '40px',
  height: '40px',
  padding: '8px',
  margin: '-12px',
  '&$arrowPrev': {
    borderRadius: '0px 4px 4px 0px',
  },
  '&$arrowNext': {
    borderRadius: '4px 0px 0px 4px',
  },
};
const outsetArrow = {
  flexShrink: 0,
  width: '32px',
  height: '32px',
  padding: '4px',
  margin: '2px',
  borderRadius: '50%',
  pointerEvents: 'auto',
};

const JSS = {
  arrow,
  arrowPrev,
  arrowNext,
  extraSpace,
  gallery,
  insetArrow,
  outsetArrow,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
