/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {
  PLACEHOLDER_ICON_LARGE_MARGIN,
  PLACEHOLDER_ICON_LARGE_WIDTH,
} from '../0.1/def';
import {createUseStyles} from 'react-jss';

const docked = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 'auto',
  bottom: 'auto',
  padding: 0,
  minWidth: 0,
  minHeight: 0,
  maxWidth: 'auto',
  maxHeight: 'auto',
  transformOrigin: 'left top',
  willChange: 'width, height, transition, transform, opacity',
};

const placeholderBackground = {
  background: 'rgba(200, 200, 200, 0.5)',
  transitionProperty: 'opacity',
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: -1,
  '& > img': {
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    filter: 'blur(20px)',
    transform: 'scale(1.1)',
    opacity: 0.3,
  },
};

const placeholderIcon = {
  maskImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg version='1.1' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpolygon points='0 0 48 0 48 48 0 48'/%3E%3Cpath d='m40 4h-24c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4v-24c0-2.2-1.8-4-4-4zm-32 8h-4v28c0 2.2 1.8 4 4 4h28v-4h-28v-28zm28 3.868l-12.618 12.618-2.8284-2.8284 12.658-12.658h-8.2111v-4h15v15h-4v-8.132z' fill='%23000' fill-rule='nonzero'/%3E%3C/g%3E%3C/svg%3E\")",
  maskSize: '48px 48px',
  height: PLACEHOLDER_ICON_LARGE_WIDTH,
  width: PLACEHOLDER_ICON_LARGE_WIDTH,
  maskRepeat: 'no-repeat',
  maskPosition: 'bottom left',
  background: 'rgba(100, 100, 100, 0.8)',
  transitionProperty: 'opacity, transform',
  willChange: 'opacity, transform',
  position: 'absolute',
  bottom: PLACEHOLDER_ICON_LARGE_MARGIN,
  left: PLACEHOLDER_ICON_LARGE_MARGIN,
};

const shadowLayer = {
  boxShadow: '0px 0 20px 6px rgba(0, 0, 0, 0.2)',
};

const overlay = {
  opacity: 0,
  transition: '0.3s opacity ease',
  contain: 'strict',
  zIndex: 2147483645,
};

const overlayControlsBg = {
  background: 'rgba(230, 230, 230, 0.6)',
  opacity: 1,
};

const controls = {
  direction: 'ltr',
  opacity: 0,
  pointerEvents: 'none',
  transition: '0.3s opacity ease',
  position: 'fixed',
  zIndex: 2147483646,
  display: 'flex',
  flexDirection: 'column',
};

const controlsShown = {
  opacity: 1,
  pointerEvents: 'initial',
};

const controlsGroup = {
  '&:not([hidden])': {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto 0',
    display: 'flex',
    height: 40,
  },
};

const controlsToggleButton = {
  margin: 0,
  minWidth: 40,
  height: 40,
  borderRadius: 40,

  '&:active': {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },

  '& > div': {
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    width: '100%',
    height: '100%',
  },
};

const dismissButtonGroup = {
  position: 'absolute',
  top: 8,
  right: 8,
  '& > div': {
    minWidth: 32,
    height: 32,
    borderRadius: 32,
    backgroundSize: '20px 20px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  },
};

const muteButton = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")",
};
const unmuteButton = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")",
};
const pauseButton = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")",
};
const playButton = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")",
};
const fullscreenButton = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'/%3E%3C/svg%3E\")",
};
const dismissButton = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")",
};
const scrollBackButton = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg width=40 height=40 xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M-4-4h48v48H-4z'/%3E%3Cpath d='M36 0c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V4c0-2.2 1.8-4 4-4h24zM16 11.868l12.618 12.618 2.829-2.828L18.789 9H27V5H12v15h4v-8.132zM4 8H0v28c0 2.2 1.8 4 4 4h28v-4H4V8z' fill='%23000' fill-rule='nonzero'/%3E%3C/g%3E%3C/svg%3E\")",
  backgroundSize: '50%',
};

const JSS = {
  docked,
  placeholderBackground,
  placeholderIcon,
  shadowLayer,
  overlay,
  overlayControlsBg,
  controls,
  controlsShown,
  controlsGroup,
  controlsToggleButton,
  dismissButtonGroup,
  muteButton,
  unmuteButton,
  pauseButton,
  playButton,
  fullscreenButton,
  dismissButton,
  scrollBackButton,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
