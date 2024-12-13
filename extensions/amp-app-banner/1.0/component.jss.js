import {createUseStyles} from 'react-jss';

const banner = {
  'position': 'fixed !important',
  'bottom': '0 !important',
  'left': '0',
  'width': '100%',
  'max-height': '100px !important',
  'box-sizing': 'border-box',
  'background': '#fff',
  'z-index': '13',
  'box-shadow': '0 0 5px 0 rgba(0,0,0, 0.2) !important',
};
const bannerPadding = {
  'position': 'absolute',
  'top': '0',
  'left': '0',
  'right': '0',
  'background': '#fff',
  'height': '4px',
  /** Must be above the dismiss button to cover bottom shadow */
  'z-index': '15',
};
const dismiss = {
  'position': 'absolute',
  'width': '28px',
  'height': '28px',
  'top': '-28px',
  'right': '0',
  'background-image': `url('data:image/svg+xml;charset=utf-8,<svg width="13" height="13" viewBox="341 8 13 13" xmlns="http://www.w3.org/2000/svg"><path fill="%234F4F4F" d="M354 9.31L352.69 8l-5.19 5.19L342.31 8 341 9.31l5.19 5.19-5.19 5.19 1.31 1.31 5.19-5.19 5.19 5.19 1.31-1.31-5.19-5.19z" fill-rule="evenodd"/></svg>')`,
  'background-size': '13px 13px',
  'background-position': '9px center',
  'background-color': '#fff',
  'background-repeat': 'no-repeat',
  'z-index': '14',
  'box-shadow': '0 -1px 1px 0 rgba(0,0,0, 0.2)',
  'border': 'none',
  'border-radius': '12px 0 0 0',
  '&:before': {
    'position': 'absolute',
    'content': '""',
    'top': '-20px',
    'right': '0',
    'left': '-20px',
    'bottom': '0',
  },
  '[dir=rtl] &': {
    'right': 'auto',
    'left': '0',
    'border-top-left-radius': '0',
    'border-top-right-radius': '12px',
    'background-position': '6px center',
    '&:before': {
      'right': '-20px',
      'left': '0',
    },
  },
};

const JSS = {
  banner,
  bannerPadding,
  dismiss,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
