import {createUseStyles} from 'react-jss';

const sectionChild = {
  // Make animations measurable. Without this, padding and margin can skew
  // animations.
  boxSizing: 'border-box !important',
  // Cancel out the margin collapse. Also helps with animations to avoid
  // overflow.
  overflow: 'hidden !important',
  // Ensure that any absolute elements are positioned within the section.
  position: 'relative !important',
};

const header = {
  cursor: 'pointer',
  backgroundColor: '#efefef',
  paddingRight: '20px',
  border: 'solid 1px #dfdfdf',
};

const contentHidden = {
  '&:not(.i-amphtml-animating)': {
    display: 'none !important',
  },
};

const JSS = {
  sectionChild,
  header,
  contentHidden,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
