import {createUseStyles} from 'react-jss';

const imageSliderContainer = {
  position: 'absolute !important',
  top: '0 !important',
  right: '0 !important',
  bottom: '0 !important',
  left: '0 !important',
  /* Fix iOS translate + overflow: hidden bug */
  transform: 'translateZ(0) !important',
  /* Remove webkit tap highlight grayish color
   * '-webkit-tap-highlight-color': 'rgba(0,0,0,0)' <-- Not available in JSS
   */
};

const imageSliderLeftMask = {
  position: 'absolute !important',
  top: '0 !important',
  right: '0 !important',
  bottom: '0 !important',
  left: '0 !important',
  overflow: 'hidden !important',
};

const imageSliderRightMask = {
  position: 'absolute !important',
  top: '0 !important',
  right: '0 !important',
  bottom: '0 !important',
  left: '0 !important',
  overflow: 'hidden !important',
  'z-index': '1 !important',
};

const imageSlider = {
  'amp-img > img': {
    /* Deals with image not fitting size */
    'object-fit': 'cover',
  },
};

const imageSliderPushLeft = {
  height: '100%',
  transform: 'translateX(-50%)',
};

const imageSliderPushRight = {
  transform: 'translateX(50%)',
};

const imageSliderBar = {
  /* make sure arrow directions not change in RTL */
  direction: 'ltr !important',
  position: 'absolute !important',
  top: '0 !important',
  right: '0 !important',
  bottom: '0 !important',
  left: '0 !important',
  'z-index': '3 !important',
};

const imageSliderBarStick = {
  width: '20% !important',
  height: '100% !important',
  cursor: 'col-resize !important',
  '&:before': {
    content: "'' !important",
    position: 'absolute !important',
    display: 'block !important',
    top: '0 !important',
    left: '50% !important',
    bottom: '0 !important',
    border: '0.5px solid white !important',
    'box-sizing': 'border-box !important',
    opacity: '0.5 !important',
    transform: 'translate(-50%, 0) !important',
  },
};

const imageSliderLabelWrapper = {
  position: 'absolute !important',
  top: '0 !important',
  right: '0 !important',
  bottom: '0 !important',
  left: '0 !important',
  'z-index': '1 !important',
};

const imageSliderHintHidden = {
  opacity: 0,
  transition: 'opacity linear 0.4s',
};

const imageSliderHint = {
  position: 'absolute !important',
  top: '0 !important',
  right: '0 !important',
  bottom: '0 !important',
  left: '0 !important',
  'z-index': 2,
  transition: 'opacity ease-in 0.4s',
};

const imageSliderHintLeftWrapper = {
  position: 'absolute !important',
  right: '50% !important',
  height: '100% !important',
  display: 'flex !important',
  'flex-direction': 'column !important',
  'justify-content': 'center !important',
};

const imageSliderHintRightWrapper = {
  position: 'absolute !important',
  left: '50% !important',
  height: '100% !important',
  display: 'flex !important',
  'flex-direction': 'column !important',
  'justify-content': 'center !important',
};

const imageSliderHintLeft = {
  'background-size': '56px 16px',
  width: '56px',
  height: '16px',
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 8'%3E%3Cg%3E%3Cpath d='M4 5h12V3H4V0L0 4l4 4z' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E\")",
  filter: 'drop-shadow(3px 3px 4px black)',
};

const imageSliderHintRight = {
  'background-size': '56px 16px',
  width: '56px',
  height: '16px',
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 8'%3E%3Cpath d='M24 5H12V3h12V0l4 4-4 4z' fill='%23fff'/%3E%3C/svg%3E\")",
  filter: 'drop-shadow(3px 3px 4px black)',
};

const JSS = {
  imageSlider,
  imageSliderContainer,
  imageSliderLeftMask,
  imageSliderRightMask,
  imageSliderPushLeft,
  imageSliderPushRight,
  imageSliderBar,
  imageSliderBarStick,
  imageSliderLabelWrapper,
  imageSliderHintHidden,
  imageSliderHint,
  imageSliderHintLeftWrapper,
  imageSliderHintRightWrapper,
  imageSliderHintLeft,
  imageSliderHintRight,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
