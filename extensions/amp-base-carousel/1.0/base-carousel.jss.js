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
  [`& > :first-child, & > ::slotted(*)`]: {
    boxSizing: 'border-box !important',
    margin: '0 !important',
    flexShrink: '0 !important',
    maxHeight: '100%',
    maxWidth: '100%',
  },
  [`& > ::slotted(*)`]: {
    width: '100%',
  },
  ...hideScrollbarPseudo,
};

export const JSS = {
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
  horizontalScroll,
  slideSizing,
};

// TODO: automatically generate these two via build step for amp mode.
// As well as update the `useStyles` export.
export const CSS = `.slideElement-0-2-1{flex:0 0 100%;height:100%;display:flex;overflow:hidden;position:relative;align-items:center;flex-direction:column;justify-content:center;scroll-snap-stop:always;scroll-snap-align:start}.scrollContainer-0-2-2{top:0;left:0;right:0;bottom:0;height:100%;display:flex;position:absolute;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;flex-direction:row;scroll-behavior:smooth;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}.arrowPlacement-0-2-3{top:50%;display:flex;z-index:1;position:absolute;transform:translateY(-50%);align-items:center;flex-direction:row;pointer-events:auto;justify-content:space-between}.arrowPrev-0-2-4{left:0}.arrowNext-0-2-5{right:0}.arrowDisabled-0-2-6{opacity:0;pointer-events:none}.defaultArrowButton-0-2-7{color:#fff;width:36px;border:none;height:36px;margin:12px;stroke:currentColor;display:flex;outline:0;padding:0;position:relative;transition:.2s stroke;align-items:center;justify-content:center;background-color:transparent}.defaultArrowButton-0-2-7:hover{color:#222}.defaultArrowButton-0-2-7:active{transition-duration:0s}.defaultArrowButton-0-2-7:hover .arrowBackground-0-2-11{background-color:rgba(255,255,255,.8)}.defaultArrowButton-0-2-7:active .arrowBackground-0-2-11{background-color:#fff;transition-duration:0s}.arrowBaseStyle-0-2-8{top:0;left:0;width:100%;height:100%;position:absolute;border-radius:50%}.arrowFrosting-0-2-9{backdrop-filter:blur(3px)}.arrowBackdrop-0-2-10{opacity:.5;backdrop-filter:blur(12px) invert(1) grayscale(.6) brightness(.8)}.arrowBackground-0-2-11{box-shadow:0 0 0 1px rgba(0,0,0,.08) inset,0 1px 4px 1px rgba(0,0,0,.2);transition:.2s background-color;background-color:rgba(0,0,0,.3)}.arrowIcon-0-2-12{width:24px;height:24px;position:relative}.hideScrollbar-0-2-13{scrollbar-width:none}.horizontalScroll-0-2-14{overflow-y:hidden;flex-direction:row;padding-bottom:20px;scroll-snap-type:x mandatory;scroll-snap-type-x:mandatory}.slideSizing-0-2-15 .slideElement-0-2-1>::slotted(*),.slideSizing-0-2-15>:first-child{margin:0!important;max-width:100%;box-sizing:border-box!important;max-height:100%;flex-shrink:0!important}.slideSizing-0-2-15>::slotted(*){width:100%}.slideSizing-0-2-15 [hide-scrollbar]::-webkit-scrollbar{display:none;box-sizing:content-box!important}`;
const classes = {
  'slideElement': 'slideElement-0-2-1',
  'scrollContainer': 'scrollContainer-0-2-2',
  'arrowPlacement': 'arrowPlacement-0-2-3',
  'arrowPrev': 'arrowPrev-0-2-4',
  'arrowNext': 'arrowNext-0-2-5',
  'arrowDisabled': 'arrowDisabled-0-2-6',
  'defaultArrowButton': 'defaultArrowButton-0-2-7',
  'arrowBaseStyle': 'arrowBaseStyle-0-2-8',
  'arrowFrosting': 'arrowFrosting-0-2-9',
  'arrowBackdrop': 'arrowBackdrop-0-2-10',
  'arrowBackground': 'arrowBackground-0-2-11',
  'arrowIcon': 'arrowIcon-0-2-12',
  'hideScrollbar': 'hideScrollbar-0-2-13',
  'horizontalScroll': 'horizontalScroll-0-2-14',
  'slideSizing': 'slideSizing-0-2-15',
};

let styleAdded = false;

/**
 * Shim for react-jss useStyles.
 * Adds the necessary <style> tag for non-AMP modes.
 * TODO: delete when build step is complete. See: https://docs.google.com/document/d/14gMbnzsTG3F1gxfbLck4kr7At62UYWa-DyrI3nDMJJw/edit?pli=1
 *
 *  @return {!Object}
 */
export function useStyles() {
  if (!styleAdded && !globalThis.AMP) {
    styleAdded = true;
    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }
  return classes;
}
