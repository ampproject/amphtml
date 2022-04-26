import {createUseStyles} from 'react-jss';

const mainNav = {
  'white-space': 'nowrap',
  display: 'flex',
  background: 'white',

  '& > ul': {
    margin: 0,
    padding: 0,

    '& > li': {
      display: 'inline',
      margin: '1em',
      '&:first-child': {
        margin: 0,
      },
    },
  },
};
const item = {
  display: 'inline-block',
  cursor: 'pointer',
};
const content = {
  display: 'none',
  position: 'absolute !important',
  left: '0',
  width: '100vw',
  background: 'white',
  opacity: 0,
  visibility: 'hidden',

  '&.open': {
    display: 'block',
    opacity: 1,
    visibility: 'visible',
  },
};
const parent = {
  'z-index': 1000,
};

const mask = {
  position: 'fixed',
  'z-index': -1,
  visibility: 'hidden',
  opacity: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(0,0,0,0.5)',
  transition: 'opacity 200ms, visibility 0s 200ms',

  '&.open': {
    opacity: 1,
    visibility: 'visible',
    transition: 'opacity 200ms',
  },
};

const JSS = {
  mainNav,
  item,
  content,
  mask,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
