import {createUseStyles} from 'react-jss';

const eq = {
  pointerEvents: 'none !important',
  alignItems: 'flex-end',
  bottom: 7,
  height: 12,
  opacity: 0.8,
  overflow: 'hidden',
  position: 'absolute',
  right: 7,
  width: 20,
  zIndex: 1,
  display: 'flex',
};

const eqCol = {
  flex: 1,
  height: '100%',
  marginRight: 1,
  position: 'relative',
  '&:before, &:after': {
    content: '""',
    animation: '0s linear infinite alternate $eq-animation',
    backgroundColor: '#FAFAFA',
    height: '100%',
    position: 'absolute',
    width: '100%',
    willChange: 'transform',
    animationPlayState: 'paused',
  },
  '&:nth-child(1)': {
    '&:before': {animationDuration: '0.3s'},
    '&:after': {animationDuration: '0.45s'},
  },
  '&:nth-child(2)': {
    '&:before': {animationDuration: '0.5s'},
    '&:after': {animationDuration: '0.4s'},
  },
  '&:nth-child(3)': {
    '&:before': {animationDuration: '0.3s'},
    '&:after': {animationDuration: '0.35s'},
  },
  '&:nth-child(4)': {
    '&:before': {animationDuration: '0.4s'},
    '&:after': {animationDuration: '0.25s'},
  },
};

const eqPlaying = {
  // These are same as `eqCol`
  '& > div:before, & > div:after': {animationPlayState: 'running'},
};

const autoplayMaskButton = {
  display: 'block',
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  width: '100%',
};

const JSS = {
  autoplayMaskButton,
  eq,
  eqPlaying,
  eqCol,
  '@keyframes eq-animation': {
    '0%': {transform: 'translateY(100%)'},
    '100%': {transform: 'translateY(0)'},
  },
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
