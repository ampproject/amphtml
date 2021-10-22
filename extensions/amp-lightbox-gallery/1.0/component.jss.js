import {createUseStyles} from 'react-jss';

const TOP_BAR_HEIGHT = 56;
const DEFAULT_DIMENSION = 24;
const DEFAULT_PADDING = 16;

const TOP_BAR_HEIGHT_LARGE = 80;
const DEFAULT_DIMENSION_LARGE = 40;
const DEFAULT_PADDING_LARGE = 20;

const DEFAULT_GRID_PADDING = 5;
export const PADDING_ALLOWANCE = 40;

const gallery = {
  position: 'absolute !important',
  left: '0 !important',
  right: '0 !important',
  top: '0 !important',
  height: '100%',
  width: '100%',
  bottom: '0 !important',
  overflow: 'auto !important',
};

const controlsPanel = {
  position: 'absolute !important',
  height: `${TOP_BAR_HEIGHT}px !important`,
  width: '100% !important',
  zIndex: '1',
  background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0))',
  '@media (min-width:1024px)': {
    height: `${TOP_BAR_HEIGHT_LARGE}px !important`,
  },
};

const lightbox = {
  '&$showControls $control': {
    animationTimingFunction: 'ease-in',
    animationName: '$fadeIn',
  },
  '&$hideControls $control': {
    animationTimingFunction: 'linear',
    animationName: '$fadeOut',
  },
};

const grid = {
  display: 'grid !important',
  justifyContent: 'center !important',
  gridGap: `${DEFAULT_GRID_PADDING}px !important`,
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridAutoRows: 'min-content !important',
  padding: `0px ${DEFAULT_GRID_PADDING}px !important`,
  top: `${TOP_BAR_HEIGHT}px !important`,
  height: `calc(100% - ${TOP_BAR_HEIGHT}px) !important`,
  width: 'calc(100% - 10px) !important',
  '@media (min-width: 1024px)': {
    gridTemplateColumns: `repeat(4, calc(1024px/4 - ${DEFAULT_GRID_PADDING}px * 5 / 4))`,
    top: `${TOP_BAR_HEIGHT_LARGE}px !important`,
    height: `calc(100% - ${TOP_BAR_HEIGHT_LARGE}px) !important`,
  },
};

const thumbnail = {
  position: 'relative !important',
  paddingTop: '100% !important',
  '& > img': {
    width: '100% !important',
    height: '100% !important',
    position: 'absolute !important',
    top: '0 !important',
    objectFit: 'cover !important',
    cursor: 'pointer !important',
  },
};

const showControls = {};
const hideControls = {};

const control = {
  animationFillMode: 'forwards',
  animationDuration: '400ms',
  position: 'absolute !important',
  boxSizing: 'content-box',
  cursor: 'pointer !important',
  zIndex: '2',
};

const topControl = {
  width: DEFAULT_DIMENSION,
  height: DEFAULT_DIMENSION,
  padding: DEFAULT_PADDING,
  '@media (min-width:1024px)': {
    width: DEFAULT_DIMENSION_LARGE,
    height: DEFAULT_DIMENSION_LARGE,
    padding: DEFAULT_PADDING_LARGE,
  },
};

const auto = {};
const clip = {};
const expanded = {};
const caption = {
  bottom: 0,
  boxSizing: 'border-box !important',
  color: '#ffffff',
  textShadow: '1px 0 5px rgba(0, 0, 0, 0.4) !important',
  maxHeight: 'calc(80px + 3rem) !important',
  transition: 'max-height ease-out 0.3s !important',
  pointerEvents: 'none !important',
  /*
   * Make sure we do not overlap with the buttons. This is not applied to
   * `captionText` to avoid expanding the hit area when
   * collapsed.
   */
  paddingTop: `${PADDING_ALLOWANCE}px !important`,
  overflow: 'hidden',
  '&$auto': {
    cursor: 'auto !important',
  },
  '&$clip': {
    /* Fade out the text, using an approximated exponential gradient. */
    maskImage: `linear-gradient(
to top,
rgba(0, 0, 0, 0.0) 0rem,
rgba(0, 0, 0, 0.2) 1rem,
rgba(0, 0, 0, 0.55) 2rem,
rgba(0, 0, 0, 1.0) 3rem
)`,
  },
  '&$expanded': {
    overflowY: 'auto !important',
    WebkitOverflowScrolling: 'touch !important',
    maxHeight: '100% !important',
    transition: 'max-height ease-in-out 0.7s !important',
    /* Fade out the text, using an approxximated exponential gradient. */
    maskImage: `linear-gradient(
      to top,
      rgba(0, 0, 0, 0.0) 0rem,
      rgba(0, 0, 0, 0.2) 0.5rem,
      rgba(0, 0, 0, 0.55) 1rem,
      rgba(0, 0, 0, 1.0) 2rem
      )`,
  },
};

const captionText = {
  padding: '20px !important',
  pointerEvents: 'all !important',
  '&:empty': {
    display: 'none !important',
  },
};

const closeButton = {
  top: 0,
  right: 0,
};

const prevArrow = {};

const nextArrow = {};

const arrow = {
  top: '0 !important',
  bottom: '0 !important',
  margin: 'auto !important',
  filter: 'drop-shadow(0 0 1px black) !important',
  width: DEFAULT_DIMENSION_LARGE,
  height: DEFAULT_DIMENSION_LARGE,
  padding: DEFAULT_PADDING_LARGE,
  '&$nextArrow': {
    right: '0 !important',
    /* Needed for screen reader mode to size correctly. */
    left: 'auto !important',
  },
  '&$prevArrow': {
    left: '0 !important',
    /* Needed for screen reader mode to size correctly. */
    right: 'auto !important',
  },
};

const JSS = {
  '@keyframes fadeIn': {
    from: {opacity: 0},
    to: {
      opacity: 1,
      visibility: 'visible',
    },
  },
  '@keyframes fadeOut': {
    from: {opacity: 1},
    to: {
      opacity: 0,
      visibility: 'hidden',
    },
  },
  arrow,
  auto,
  caption,
  captionText,
  clip,
  closeButton,
  control,
  controlsPanel,
  expanded,
  hideControls,
  lightbox,
  gallery,
  grid,
  nextArrow,
  prevArrow,
  showControls,
  thumbnail,
  topControl,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
