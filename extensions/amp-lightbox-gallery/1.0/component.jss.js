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

const gallery = {
  position: 'absolute !important',
  left: '0 !important',
  right: '0 !important',
  top: '0 !important' /* Matches height of top-bar */,
  height: '100%',
  width: '100%',
  bottom: '0 !important',
  overflow: 'auto !important',
};

const controlsPanel = {
  position: 'absolute !important',
  height: '56px !important' /* Matches top of gallery */,
  width: '100% !important',
  zIndex: '1',
  background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0))',
  '@media (min-width:1024px)': {
    height: '80px !important' /* Matches top of gallery */,
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
  width: '24px',
  height: '24px',
  padding: '16px',
  '@media (min-width:1024px)': {
    width: '40px',
    height: '40px',
    padding: '20px',
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
  width: '40px',
  height: '40px',
  padding: '20px',
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
  nextArrow,
  prevArrow,
  showControls,
  topControl,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
