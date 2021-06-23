/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {createUseStyles} from 'react-jss';

const TOP_BAR_HEIGHT = 56;
const DEFAULT_DIMENSION = 24;
const DEFAULT_PADDING = 16;

const TOP_BAR_HEIGHT_LARGE = 80;
const DEFAULT_DIMENSION_LARGE = 40;
const DEFAULT_PADDING_LARGE = 20;

const DEFAULT_GRID_NUM = 4;
const DEFAULT_GRID_PADDING = 5;

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
    gridTemplateColumns: `repeat(${DEFAULT_GRID_NUM}, calc(1024px/${DEFAULT_GRID_NUM} - ${DEFAULT_GRID_PADDING}px * ${DEFAULT_GRID_PADDING} / ${DEFAULT_GRID_NUM}))`,
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
  closeButton,
  control,
  controlsPanel,
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
