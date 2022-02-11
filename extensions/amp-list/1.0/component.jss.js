import {createUseStyles} from 'react-jss';

// Make sure to replace "#" with "%23" in these strings!
const spinnerIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="grad"><stop stop-color="rgb(51,51,51)" stop-opacity=".75"></stop><stop offset="100%" stop-color="rgb(51,51,51)" stop-opacity="0"></stop></linearGradient></defs><path d="M11,4.4 A18,18, 0,1,0, 38,20" fill="none" stroke="url(%23grad)" stroke-width="1.725"></path></svg>`;
const refreshIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>`;

const loadMoreSpinner = {
  'display': 'inline-block',
  'vertical-align': 'middle',
  'width': '1em',
  'height': '1em',

  'background-image': `url('data:image/svg+xml;charset=utf-8,${spinnerIcon}')`,
  'animation': '1000ms $loadMoreSpinnerKeyframes linear infinite',
};

const loadMoreIcon = {
  'height': '1em',
  'width': '1em',
  'display': 'inline-block',
  'vertical-align': 'middle',
  'background-image': `url('data:image/svg+xml;charset=utf-8,${refreshIcon}')`,
};

const JSS = {
  '@keyframes loadMoreSpinnerKeyframes': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  loadMoreSpinner,
  loadMoreIcon,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
