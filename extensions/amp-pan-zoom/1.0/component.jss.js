import {createUseStyles} from 'react-jss';
const ampPanZoom = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
};

const ampPanZoomContent = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
};

const ampPanZoomChild = {
  position: 'absolute',
  willChange: 'transform',
};

const ampPanZoomPannable = {
  cursor: 'move',
};

const ampPanZoomButton = {
  position: 'absolute',
  right: '12px',
  width: '36px',
  height: '36px',
  bottom: '12px',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  boxShadow: '1px 1px 2px',
  backgroundColor: 'white',
  borderRadius: '3px',
};

const ampPanZoomInIcon = {
  backgroundImage: `url(
    'data:image/svg+xml;charset=utf-8,<svg height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
  )`,
};

const ampPanZoomOutIcon = {
  backgroundImage: `url(
    'data:image/svg+xml;charset=utf-8,<svg height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H5v-2h14z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
  )`,
};

const JSS = {
  ampPanZoom,
  ampPanZoomChild,
  ampPanZoomContent,
  ampPanZoomPannable,
  ampPanZoomButton,
  ampPanZoomInIcon,
  ampPanZoomOutIcon,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
