import {createUseStyles} from 'react-jss';

const closeButton = {
  position: 'fixed',
  /* keep it on viewport */
  top: 0,
  left: 0,
  /* give it non-zero size, VoiceOver on Safari requires at least 2 pixels
before allowing buttons to be activated. */
  width: '2px',
  height: '2px',
  /* visually hide it with overflow and opacity */
  opacity: 0,
  overflow: 'hidden',
  /* remove any margin or padding */
  border: 'none',
  margin: 0,
  padding: 0,
  /* ensure no other style sets display to none */
  display: 'block',
  visibility: 'visible',
};

const wrapper = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: '100%',
  position: 'fixed',
  boxSizing: 'border-box',
  zIndex: 1000,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  color: '#fff',
};

const content = {
  overflow: 'auto !important',
  overscrollBehavior: 'none !important',
};

const JSS = {
  closeButton,
  wrapper,
  content,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
