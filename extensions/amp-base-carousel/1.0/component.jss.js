import {createUseStyles} from 'react-jss';

const carousel = {
  overscrollBehavior: 'contain',
};

const scrollContainer = {
  position: 'relative',
  boxSizing: 'content-box !important',
  width: '100%',
  height: '100%',
  outline: 'none',

  display: 'flex',
  flexWrap: 'nowrap',
  flexGrow: 1,

  scrollBehavior: 'smooth',
  WebkitOverflowScrolling: 'touch',
};

const horizontalScroll = {
  flexDirection: 'row',
  scrollSnapTypeX: 'mandatory', // Firefox/IE
  scrollSnapType: 'x mandatory',
  overflowX: 'auto',
  overflowY: 'hidden',
  touchAction: 'pan-x pinch-zoom',
  // Hide scrollbar.
  '&$hideScrollbar': {
    paddingBottom: '20px',
  },
};

const verticalScroll = {
  flexDirection: 'column',
  scrollSnapTypeY: 'mandatory', // Firefox/IE
  scrollSnapType: 'y mandatory',
  overflowX: 'hidden',
  touchAction: 'pan-y pinch-zoom',
};

/*
 * Styles to hide scrollbars, with three different methods:
 *
 * 1. scrollbar-width
 *  - Note: this is actually scrollbar *thickness* and applies to horizontal
 *    scrollbars as well
 * 2. ::-webkit-scrollbar
 * 3. Using padding to push scrollbar outside of the overflow
 *
 * The last method has side-effect of having the bottom of the slides being
 * cut-off, since the height (or width) of the scrollbar is included when
 * calculating the 100% height (or width) of the slide.
 */
const hideScrollbar = {
  // Firefox.
  scrollbarWidth: 'none',

  boxSizing: '',

  // Chrome, Safari
  '&::-webkit-scrollbar': {
    display: 'none',
    boxSizing: 'content-box !important',
  },
};

const slideElement = {
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const startAlign = {};

const centerAlign = {};

const enableSnap = {
  scrollSnapStop: 'always',
  '&$startAlign': {
    scrollSnapAlign: 'start',
  },
  '&$centerAlign': {
    scrollSnapAlign: 'center',
  },
};

const disableSnap = {
  scrollSnapStop: 'none',
  scrollSnapAlign: 'none',
  scrollSnapCoordinate: 'none',
};

/** Slides only have one child */
const slideSizing = {
  '& > :first-child, & > ::slotted(*)': {
    boxSizing: 'border-box !important',
    margin: '0 !important',
    flexShrink: '0 !important',
    maxHeight: '100%',
    maxWidth: '100%',
  },
  '& > ::slotted(*)': {
    width: '100%',
  },
  '&$thumbnails': {
    padding: '0px 4px',
  },
};

const thumbnails = {};

const arrow = {
  zIndex: 1,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  // Center the button vertically.
  top: '50%',
  alignItems: 'center',
  pointerEvents: 'auto',
  '&$ltr': {
    transform: 'translateY(-50%)',
  },
  '&$rtl': {
    transform: 'scaleX(-1) translateY(-50%)',
  },
  '&$arrowPrev$ltr, &$arrowNext$rtl': {
    left: 0,
  },
  '&$arrowNext$ltr, &$arrowPrev$rtl': {
    right: 0,
  },
};

const rtl = {};

const ltr = {};

const arrowPrev = {};

const arrowNext = {};

const arrowDisabled = {
  pointerEvents: 'none',
  '&$insetArrow': {
    opacity: 0,
  },
  '&$outsetArrow': {
    opacity: 0.5,
  },
};

const insetArrow = {
  position: 'absolute',
  padding: '12px',
};

const outsetArrow = {
  position: 'relative',
  flexShrink: 0,
  height: '100%',
  borderRadius: '50%',
  backgroundSize: '24px 24px',
  // Center the button vertically.
  top: '50%',
  transform: 'translateY(-50%)',
  alignItems: 'center',
  pointerEvents: 'auto',
  '&$arrowPrev': {
    marginInlineStart: '4px',
    marginInlineEnd: '10px',
  },
  '&$arrowNext': {
    marginInlineStart: '10px',
    marginInlineEnd: '4px',
  },
};

const defaultArrowButton = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '36px',
  height: '36px',
  padding: 0,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  stroke: 'currentColor',
  transition: '200ms stroke',
  color: '#FFF',
  '&:hover:not([disabled])': {
    color: '#222',
  },
  '&:active:not([disabled])': {
    transitionDuration: '0ms',
  },
  '&:hover:not([disabled]) $arrowBackground': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  '&:active:not([disabled]) $arrowBackground': {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    transitionDuration: '0ms',
  },
  '&:focus': {
    border: '1px black solid',
    borderRadius: '50%',
    boxShadow: '0 0 0 1pt white',
  },
};

const arrowBaseStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: '50%',
};

const arrowFrosting = {
  backdropFilter: 'blur(3px)',
};

const arrowBackdrop = {
  backdropFilter: 'blur(12px) invert(1) grayscale(0.6) brightness(0.8)',
  opacity: 0.5,
};

const arrowBackground = {
  boxShadow: `0 0 0px 1px rgba(0, 0, 0, 0.08) inset,
      0 1px 4px 1px rgba(0, 0, 0, 0.2)`,
  transition: '200ms background-color',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
};

const arrowIcon = {
  position: 'relative',
  width: '24px',
  height: '24px',
};

const JSS = {
  carousel,
  scrollContainer,
  hideScrollbar,
  horizontalScroll,
  verticalScroll,
  slideElement,
  thumbnails,
  startAlign,
  centerAlign,
  enableSnap,
  disableSnap,
  slideSizing,
  arrow,
  ltr,
  rtl,
  arrowPrev,
  arrowNext,
  arrowDisabled,
  insetArrow,
  outsetArrow,
  defaultArrowButton,
  arrowBaseStyle,
  arrowFrosting,
  arrowBackdrop,
  arrowBackground,
  arrowIcon,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
