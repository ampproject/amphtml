import {createUseStyles} from 'react-jss';

const mainNav = {
  whiteSpace: 'nowrap',
  background: 'white',
  position: 'relative',
  zIndex: 1000,

  '& > ul': {
    display: 'flex',
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    flexWrap: 'wrap',

    gap: '0.5em',
  },
};

const title = {
  cursor: 'pointer',
};
const content = {
  position: 'absolute',
  left: '0',
  width: '100vw',
  background: 'white',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 200ms, visibility 0s 200ms',
  transitionTimingFunction: 'ease-in',

  '&.open': {
    opacity: 1,
    visibility: 'visible',
    transitionDelay: 0,
    transitionTimingFunction: 'ease-out',
  },
};

const mask = {
  position: 'fixed',
  zIndex: 999,
  visibility: 'hidden',
  opacity: 0,

  top: 0,
  bottom: 0,
  left: 0,
  right: 0,

  background: 'black',
  transition: 'opacity 200ms, visibility 0s 200ms',
  transitionTimingFunction: 'ease-in',

  '&.open': {
    opacity: 0.5,
    visibility: 'visible',
    transitionDelay: 0,
    transitionTimingFunction: 'ease-out',
  },
};

const JSS = {
  mainNav,
  title,
  content,
  mask,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
