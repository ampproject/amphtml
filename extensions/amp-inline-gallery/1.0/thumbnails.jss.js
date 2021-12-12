import {createUseStyles} from 'react-jss';

// Default height. Can be overridden by user style.
const thumbnails = {
  height: '100px',
};

// Default background color. Can be overridden by user style.
const slide = {
  backgroundColor: '#999',
  objectFit: 'fill',
};

const JSS = {
  thumbnails,
  slide,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
