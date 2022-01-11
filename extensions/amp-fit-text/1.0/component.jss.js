import {createUseStyles} from 'react-jss';

export const LINE_HEIGHT_EM_ = 1.15;

const fitTextContentWrapper = {
  'display': 'flex',
  'flexDirection': 'column',
  'flexWrap': 'nowrap',
  'justifyContent': 'center',
};

/* Legacy comment: We have to use the old-style flex box with line clamping. It will only
    work in WebKit, but unfortunately there's no alternative. */
const fitTextContent = {
  lineHeight: `${LINE_HEIGHT_EM_}em`,
  'display': '-webkit-box',
  '-webkit-box-orient': 'vertical',
  'overflow': 'hidden',
  'textOverflow': 'ellipsis',

  'flexDirection': 'column',
  'flexWrap': 'nowrap',
  'justifyContent': 'center',
};

const minContentHeight = {
  'height': 'min-content',
};

const JSS = {
  fitTextContentWrapper,
  fitTextContent,
  minContentHeight,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
