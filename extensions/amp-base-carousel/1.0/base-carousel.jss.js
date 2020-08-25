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

import {createUseStyles} from 'react-jss';

const slideElement = {
  flex: '0 0 100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always',
};

const scrollContainer = {
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  scrollBehavior: 'smooth',
  WebkitOverflowScrolling: 'touch',
  scrollSnapType: 'x mandatory',
};

const arrowPlacement = {
  position: 'absolute',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  // Center the button vertically.
  top: '50%',
  transform: 'translateY(-50%)',
  alignItems: 'center',
  pointerEvents: 'auto',
};
const arrowPrev = {left: 0};
const arrowNext = {right: 0};
const arrowDisabled = {
  opacity: 0,
  pointerEvents: 'none',
};

const defaultArrowButton = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '36px',
  height: '36px',
  padding: 0,
  margin: '12px',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  stroke: 'currentColor',
  transition: '200ms stroke',
  color: '#FFF',
  ['&:hover']: {
    color: '#222',
  },
  ['&:active']: {
    transitionDuration: '0ms',
  },
  ['&:hover $arrowBackground']: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  ['&:active $arrowBackground']: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    transitionDuration: '0ms',
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
/* Firefox */
const hideScrollbar = {
  scrollbarWidth: 'none',
};
/* Chrome, Safari */
const hideScrollbarPseudo = {
  [`& [hide-scrollbar]::-webkit-scrollbar`]: {
    display: 'none',
    'box-sizing': 'content-box !important',
  },
};

const horizontalScroll = {
  flexDirection: 'row',
  /* Firefox, IE */
  scrollSnapTypeX: 'mandatory',
  scrollSnapType: 'x mandatory',
  /* Hide scrollbar */
  paddingBottom: '20px',
  overflowY: 'hidden',
};

/** Slides only have one child */
const slideSizing = {
  ['& > :first-child, & > ::slotted(*)']: {
    boxSizing: 'border-box !important',
    margin: '0 !important',
    flexShrink: '0 !important',
    maxHeight: '100%',
    maxWidth: '100%',
  },
  ['& > ::slotted(*)']: {
    width: '100%',
  },
};

const JSS = {
  slideElement,
  scrollContainer,
  arrowPlacement,
  arrowPrev,
  arrowNext,
  arrowDisabled,
  defaultArrowButton,
  arrowBaseStyle,
  arrowFrosting,
  arrowBackdrop,
  arrowBackground,
  arrowIcon,
  hideScrollbar,
  hideScrollbarPseudo,
  horizontalScroll,
  slideSizing,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
