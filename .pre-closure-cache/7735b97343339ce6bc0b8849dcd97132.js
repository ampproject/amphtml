/** @enum {string}*/var _classes = { carousel: "carousel-f3d75e0", scrollContainer: "scroll-container-f3d75e0", hideScrollbar: "hide-scrollbar-f3d75e0", horizontalScroll: "horizontal-scroll-f3d75e0", verticalScroll: "vertical-scroll-f3d75e0", slideElement: "slide-element-f3d75e0", thumbnails: "thumbnails-f3d75e0", startAlign: "start-align-f3d75e0", centerAlign: "center-align-f3d75e0", enableSnap: "enable-snap-f3d75e0", disableSnap: "disable-snap-f3d75e0", slideSizing: "slide-sizing-f3d75e0", arrow: "arrow-f3d75e0", ltr: "ltr-f3d75e0", rtl: "rtl-f3d75e0", arrowPrev: "arrow-prev-f3d75e0", arrowNext: "arrow-next-f3d75e0", arrowDisabled: "arrow-disabled-f3d75e0", insetArrow: "inset-arrow-f3d75e0", outsetArrow: "outset-arrow-f3d75e0", defaultArrowButton: "default-arrow-button-f3d75e0", arrowBaseStyle: "arrow-base-style-f3d75e0", arrowFrosting: "arrow-frosting-f3d75e0", arrowBackdrop: "arrow-backdrop-f3d75e0", arrowBackground: "arrow-background-f3d75e0", arrowIcon: "arrow-icon-f3d75e0" }; /**
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



const carousel = {
  overscrollBehavior: 'contain' };


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
  WebkitOverflowScrolling: 'touch' };


const horizontalScroll = {
  flexDirection: 'row',
  scrollSnapTypeX: 'mandatory', // Firefox/IE
  scrollSnapType: 'x mandatory',
  overflowX: 'auto',
  overflowY: 'hidden',
  touchAction: 'pan-x pinch-zoom',
  // Hide scrollbar.
  '&$hideScrollbar': {
    paddingBottom: '20px' } };



const verticalScroll = {
  flexDirection: 'column',
  scrollSnapTypeY: 'mandatory', // Firefox/IE
  scrollSnapType: 'y mandatory',
  overflowX: 'hidden',
  touchAction: 'pan-y pinch-zoom' };


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
    boxSizing: 'content-box !important' } };



const slideElement = {
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center' };


const startAlign = {};

const centerAlign = {};

const enableSnap = {
  scrollSnapStop: 'always',
  '&$startAlign': {
    scrollSnapAlign: 'start' },

  '&$centerAlign': {
    scrollSnapAlign: 'center' } };



const disableSnap = {
  scrollSnapStop: 'none',
  scrollSnapAlign: 'none',
  scrollSnapCoordinate: 'none' };


/** Slides only have one child */
const slideSizing = {
  '& > :first-child, & > ::slotted(*)': {
    boxSizing: 'border-box !important',
    margin: '0 !important',
    flexShrink: '0 !important',
    maxHeight: '100%',
    maxWidth: '100%' },

  '& > ::slotted(*)': {
    width: '100%' },

  '&$thumbnails': {
    padding: '0px 4px' } };



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
    transform: 'translateY(-50%)' },

  '&$rtl': {
    transform: 'scaleX(-1) translateY(-50%)' },

  '&$arrowPrev$ltr, &$arrowNext$rtl': {
    left: 0 },

  '&$arrowNext$ltr, &$arrowPrev$rtl': {
    right: 0 } };



const rtl = {};

const ltr = {};

const arrowPrev = {};

const arrowNext = {};

const arrowDisabled = {
  pointerEvents: 'none',
  '&$insetArrow': {
    opacity: 0 },

  '&$outsetArrow': {
    opacity: 0.5 } };



const insetArrow = {
  position: 'absolute',
  padding: '12px' };


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
    marginInlineEnd: '10px' },

  '&$arrowNext': {
    marginInlineStart: '10px',
    marginInlineEnd: '4px' } };



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
    color: '#222' },

  '&:active:not([disabled])': {
    transitionDuration: '0ms' },

  '&:hover:not([disabled]) $arrowBackground': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)' },

  '&:active:not([disabled]) $arrowBackground': {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    transitionDuration: '0ms' },

  '&:focus': {
    border: '1px black solid',
    borderRadius: '50%',
    boxShadow: '0 0 0 1pt white' } };



const arrowBaseStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: '50%' };


const arrowFrosting = {
  backdropFilter: 'blur(3px)' };


const arrowBackdrop = {
  backdropFilter: 'blur(12px) invert(1) grayscale(0.6) brightness(0.8)',
  opacity: 0.5 };


const arrowBackground = {
  boxShadow: `0 0 0px 1px rgba(0, 0, 0, 0.08) inset,
      0 1px 4px 1px rgba(0, 0, 0, 0.2)`,
  transition: '200ms background-color',
  backgroundColor: 'rgba(0, 0, 0, 0.3)' };


const arrowIcon = {
  position: 'relative',
  width: '24px',
  height: '24px' };


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
  arrowIcon };export const $carousel = "carousel-f3d75e0";export const $scrollContainer = "scroll-container-f3d75e0";export const $hideScrollbar = "hide-scrollbar-f3d75e0";export const $horizontalScroll = "horizontal-scroll-f3d75e0";export const $verticalScroll = "vertical-scroll-f3d75e0";export const $slideElement = "slide-element-f3d75e0";export const $thumbnails = "thumbnails-f3d75e0";export const $startAlign = "start-align-f3d75e0";export const $centerAlign = "center-align-f3d75e0";export const $enableSnap = "enable-snap-f3d75e0";export const $disableSnap = "disable-snap-f3d75e0";export const $slideSizing = "slide-sizing-f3d75e0";export const $arrow = "arrow-f3d75e0";export const $ltr = "ltr-f3d75e0";export const $rtl = "rtl-f3d75e0";export const $arrowPrev = "arrow-prev-f3d75e0";export const $arrowNext = "arrow-next-f3d75e0";export const $arrowDisabled = "arrow-disabled-f3d75e0";export const $insetArrow = "inset-arrow-f3d75e0";export const $outsetArrow = "outset-arrow-f3d75e0";export const $defaultArrowButton = "default-arrow-button-f3d75e0";export const $arrowBaseStyle = "arrow-base-style-f3d75e0";export const $arrowFrosting = "arrow-frosting-f3d75e0";export const $arrowBackdrop = "arrow-backdrop-f3d75e0";export const $arrowBackground = "arrow-background-f3d75e0";export const $arrowIcon = "arrow-icon-f3d75e0";


// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = (() => _classes);export const CSS = ".carousel-f3d75e0{-ms-scroll-chaining:none;overscroll-behavior:contain}.scroll-container-f3d75e0{width:100%;height:100%;display:-ms-flexbox;display:flex;outline:none;position:relative;-ms-flex-positive:1;flex-grow:1;-ms-flex-wrap:nowrap;flex-wrap:nowrap;box-sizing:content-box!important;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}.hide-scrollbar-f3d75e0{scrollbar-width:none}.hide-scrollbar-f3d75e0::-webkit-scrollbar{display:none;box-sizing:content-box!important}.horizontal-scroll-f3d75e0{overflow-x:auto;overflow-y:hidden;-ms-touch-action:pan-x pinch-zoom;touch-action:pan-x pinch-zoom;-ms-flex-direction:row;flex-direction:row;scroll-snap-type:x mandatory;scroll-snap-type-x:mandatory}.horizontal-scroll-f3d75e0.hide-scrollbar-f3d75e0{padding-bottom:20px}.vertical-scroll-f3d75e0{overflow-x:hidden;-ms-touch-action:pan-y pinch-zoom;touch-action:pan-y pinch-zoom;-ms-flex-direction:column;flex-direction:column;scroll-snap-type:y mandatory;scroll-snap-type-y:mandatory}.slide-element-f3d75e0{display:-ms-flexbox;display:flex;overflow:hidden;position:relative;-ms-flex-align:center;align-items:center;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center}.enable-snap-f3d75e0{scroll-snap-stop:always}.enable-snap-f3d75e0.start-align-f3d75e0{scroll-snap-align:start}.enable-snap-f3d75e0.center-align-f3d75e0{scroll-snap-align:center}.disable-snap-f3d75e0{scroll-snap-stop:none;scroll-snap-align:none;scroll-snap-coordinate:none}.slide-sizing-f3d75e0>::slotted(*),.slide-sizing-f3d75e0>:first-child{margin:0!important;max-width:100%;box-sizing:border-box!important;max-height:100%;-ms-flex-negative:0!important;flex-shrink:0!important}.slide-sizing-f3d75e0>::slotted(*){width:100%}.slide-sizing-f3d75e0.thumbnails-f3d75e0{padding:0px 4px}.arrow-f3d75e0{top:50%;display:-ms-flexbox;display:flex;z-index:1;-ms-flex-align:center;align-items:center;-ms-flex-direction:row;flex-direction:row;pointer-events:auto;-ms-flex-pack:justify;justify-content:space-between}.arrow-f3d75e0.ltr-f3d75e0{transform:translateY(-50%)}.arrow-f3d75e0.rtl-f3d75e0{transform:scaleX(-1) translateY(-50%)}.arrow-f3d75e0.arrow-next-f3d75e0.rtl-f3d75e0,.arrow-f3d75e0.arrow-prev-f3d75e0.ltr-f3d75e0{left:0}.arrow-f3d75e0.arrow-next-f3d75e0.ltr-f3d75e0,.arrow-f3d75e0.arrow-prev-f3d75e0.rtl-f3d75e0{right:0}.arrow-disabled-f3d75e0{pointer-events:none}.arrow-disabled-f3d75e0.inset-arrow-f3d75e0{opacity:0}.arrow-disabled-f3d75e0.outset-arrow-f3d75e0{opacity:0.5}.inset-arrow-f3d75e0{padding:12px;position:absolute}.outset-arrow-f3d75e0{top:50%;height:100%;position:relative;transform:translateY(-50%);-ms-flex-align:center;align-items:center;-ms-flex-negative:0;flex-shrink:0;border-radius:50%;pointer-events:auto;background-size:24px 24px}.outset-arrow-f3d75e0.arrow-prev-f3d75e0{margin-inline-end:10px;margin-inline-start:4px}.outset-arrow-f3d75e0.arrow-next-f3d75e0{margin-inline-end:4px;margin-inline-start:10px}.default-arrow-button-f3d75e0{color:#fff;width:36px;border:none;height:36px;stroke:currentColor;display:-ms-flexbox;display:flex;outline:none;padding:0;position:relative;transition:stroke 200ms;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;background-color:transparent}.default-arrow-button-f3d75e0:hover:not([disabled]){color:#222}.default-arrow-button-f3d75e0:active:not([disabled]){transition-duration:0ms}.default-arrow-button-f3d75e0:hover:not([disabled]) .arrow-background-f3d75e0{background-color:hsla(0,0%,100%,0.8)}.default-arrow-button-f3d75e0:active:not([disabled]) .arrow-background-f3d75e0{background-color:#fff;transition-duration:0ms}.default-arrow-button-f3d75e0:focus{border:1px solid #000;box-shadow:0 0 0 1pt #fff;border-radius:50%}.arrow-base-style-f3d75e0{top:0;left:0;width:100%;height:100%;position:absolute;border-radius:50%}.arrow-frosting-f3d75e0{-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}.arrow-backdrop-f3d75e0{opacity:0.5;-webkit-backdrop-filter:blur(12px) invert(1) grayscale(0.6) brightness(0.8);backdrop-filter:blur(12px) invert(1) grayscale(0.6) brightness(0.8)}.arrow-background-f3d75e0{box-shadow:inset 0 0 0px 1px rgba(0,0,0,0.08),0 1px 4px 1px rgba(0,0,0,0.2);transition:background-color 200ms;background-color:rgba(0,0,0,0.3)}.arrow-icon-f3d75e0{width:24px;height:24px;position:relative}";