/** @enum {string}*/var _classes = { arrow: "arrow-d701172", auto: "auto-d701172", caption: "caption-d701172", captionText: "caption-text-d701172", clip: "clip-d701172", closeButton: "close-button-d701172", control: "control-d701172", controlsPanel: "controls-panel-d701172", expanded: "expanded-d701172", hideControls: "hide-controls-d701172", lightbox: "lightbox-d701172", gallery: "gallery-d701172", grid: "grid-d701172", nextArrow: "next-arrow-d701172", prevArrow: "prev-arrow-d701172", showControls: "show-controls-d701172", thumbnail: "thumbnail-d701172", topControl: "top-control-d701172" }; /**
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



const TOP_BAR_HEIGHT = 56;
const DEFAULT_DIMENSION = 24;
const DEFAULT_PADDING = 16;

const TOP_BAR_HEIGHT_LARGE = 80;
const DEFAULT_DIMENSION_LARGE = 40;
const DEFAULT_PADDING_LARGE = 20;

const DEFAULT_GRID_PADDING = 5;
export const PADDING_ALLOWANCE = 40;

const gallery = {
  position: 'absolute !important',
  left: '0 !important',
  right: '0 !important',
  top: '0 !important',
  height: '100%',
  width: '100%',
  bottom: '0 !important',
  overflow: 'auto !important' };


const controlsPanel = {
  position: 'absolute !important',
  height: `${TOP_BAR_HEIGHT}px !important`,
  width: '100% !important',
  zIndex: '1',
  background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0))',
  '@media (min-width:1024px)': {
    height: `${TOP_BAR_HEIGHT_LARGE}px !important` } };



const lightbox = {
  '&$showControls $control': {
    animationTimingFunction: 'ease-in',
    animationName: '$fadeIn' },

  '&$hideControls $control': {
    animationTimingFunction: 'linear',
    animationName: '$fadeOut' } };



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
    gridTemplateColumns: `repeat(4, calc(1024px/4 - ${DEFAULT_GRID_PADDING}px * 5 / 4))`,
    top: `${TOP_BAR_HEIGHT_LARGE}px !important`,
    height: `calc(100% - ${TOP_BAR_HEIGHT_LARGE}px) !important` } };



const thumbnail = {
  position: 'relative !important',
  paddingTop: '100% !important',
  '& > img': {
    width: '100% !important',
    height: '100% !important',
    position: 'absolute !important',
    top: '0 !important',
    objectFit: 'cover !important',
    cursor: 'pointer !important' } };



const showControls = {};
const hideControls = {};

const control = {
  animationFillMode: 'forwards',
  animationDuration: '400ms',
  position: 'absolute !important',
  boxSizing: 'content-box',
  cursor: 'pointer !important',
  zIndex: '2' };


const topControl = {
  width: DEFAULT_DIMENSION,
  height: DEFAULT_DIMENSION,
  padding: DEFAULT_PADDING,
  '@media (min-width:1024px)': {
    width: DEFAULT_DIMENSION_LARGE,
    height: DEFAULT_DIMENSION_LARGE,
    padding: DEFAULT_PADDING_LARGE } };



const auto = {};
const clip = {};
const expanded = {};
const caption = {
  bottom: 0,
  boxSizing: 'border-box !important',
  color: '#ffffff',
  textShadow: '1px 0 5px rgba(0, 0, 0, 0.4) !important',
  maxHeight: 'calc(80px + 3rem) !important',
  transition: 'max-height ease-out 0.3s !important',
  pointerEvents: 'none !important',
  /*
   * Make sure we do not overlap with the buttons. This is not applied to
   * `captionText` to avoid expanding the hit area when
   * collapsed.
   */
  paddingTop: `${PADDING_ALLOWANCE}px !important`,
  overflow: 'hidden',
  '&$auto': {
    cursor: 'auto !important' },

  '&$clip': {
    /* Fade out the text, using an approximated exponential gradient. */
    maskImage: `linear-gradient(
to top,
rgba(0, 0, 0, 0.0) 0rem,
rgba(0, 0, 0, 0.2) 1rem,
rgba(0, 0, 0, 0.55) 2rem,
rgba(0, 0, 0, 1.0) 3rem
)` },

  '&$expanded': {
    overflowY: 'auto !important',
    WebkitOverflowScrolling: 'touch !important',
    maxHeight: '100% !important',
    transition: 'max-height ease-in-out 0.7s !important',
    /* Fade out the text, using an approxximated exponential gradient. */
    maskImage: `linear-gradient(
      to top,
      rgba(0, 0, 0, 0.0) 0rem,
      rgba(0, 0, 0, 0.2) 0.5rem,
      rgba(0, 0, 0, 0.55) 1rem,
      rgba(0, 0, 0, 1.0) 2rem
      )` } };



const captionText = {
  padding: '20px !important',
  pointerEvents: 'all !important',
  '&:empty': {
    display: 'none !important' } };



const closeButton = {
  top: 0,
  right: 0 };


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
    left: 'auto !important' },

  '&$prevArrow': {
    left: '0 !important',
    /* Needed for screen reader mode to size correctly. */
    right: 'auto !important' } };



const JSS = {
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: {
      opacity: 1,
      visibility: 'visible' } },


  '@keyframes fadeOut': {
    from: { opacity: 1 },
    to: {
      opacity: 0,
      visibility: 'hidden' } },


  arrow,
  auto,
  caption,
  captionText,
  clip,
  closeButton,
  control,
  controlsPanel,
  expanded,
  hideControls,
  lightbox,
  gallery,
  grid,
  nextArrow,
  prevArrow,
  showControls,
  thumbnail,
  topControl };export const $arrow = "arrow-d701172";export const $auto = "auto-d701172";export const $caption = "caption-d701172";export const $captionText = "caption-text-d701172";export const $clip = "clip-d701172";export const $closeButton = "close-button-d701172";export const $control = "control-d701172";export const $controlsPanel = "controls-panel-d701172";export const $expanded = "expanded-d701172";export const $hideControls = "hide-controls-d701172";export const $lightbox = "lightbox-d701172";export const $gallery = "gallery-d701172";export const $grid = "grid-d701172";export const $nextArrow = "next-arrow-d701172";export const $prevArrow = "prev-arrow-d701172";export const $showControls = "show-controls-d701172";export const $thumbnail = "thumbnail-d701172";export const $topControl = "top-control-d701172";


// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = (() => _classes);export const CSS = "@keyframes keyframes-fade-in-d701172{0%{opacity:0}to{opacity:1;visibility:visible}}@keyframes keyframes-fade-out-d701172{0%{opacity:1}to{opacity:0;visibility:hidden}}.arrow-d701172{top:0!important;width:40px;bottom:0!important;filter:drop-shadow(0 0 1px black)!important;height:40px;margin:auto!important;padding:20px}.arrow-d701172.next-arrow-d701172{left:auto!important;right:0!important}.arrow-d701172.prev-arrow-d701172{left:0!important;right:auto!important}.caption-d701172{color:#fff;bottom:0;overflow:hidden;box-sizing:border-box!important;max-height:calc(80px + 3rem)!important;transition:max-height 0.3s ease-out!important;padding-top:40px!important;text-shadow:1px 0 5px rgba(0,0,0,0.4)!important;pointer-events:none!important}.caption-d701172.auto-d701172{cursor:auto!important}.caption-d701172.clip-d701172{-webkit-mask-image:linear-gradient(0deg,transparent 0rem,rgba(0,0,0,0.2) 1rem,rgba(0,0,0,0.55) 2rem,#000 3rem);mask-image:linear-gradient(0deg,transparent 0rem,rgba(0,0,0,0.2) 1rem,rgba(0,0,0,0.55) 2rem,#000 3rem)}.caption-d701172.expanded-d701172{-webkit-mask-image:linear-gradient(0deg,transparent 0rem,rgba(0,0,0,0.2) 0.5rem,rgba(0,0,0,0.55) 1rem,#000 2rem);mask-image:linear-gradient(0deg,transparent 0rem,rgba(0,0,0,0.2) 0.5rem,rgba(0,0,0,0.55) 1rem,#000 2rem);max-height:100%!important;overflow-y:auto!important;transition:max-height 0.7s ease-in-out!important;-webkit-overflow-scrolling:touch!important}.caption-text-d701172{padding:20px!important;pointer-events:all!important}.caption-text-d701172:empty{display:none!important}.close-button-d701172{top:0;right:0}.control-d701172{cursor:pointer!important;z-index:2;position:absolute!important;box-sizing:content-box;animation-duration:400ms;animation-fill-mode:forwards}.controls-panel-d701172{width:100%!important;height:56px!important;z-index:1;position:absolute!important;background:linear-gradient(rgba(0,0,0,0.3),transparent)}@media (min-width:1024px){.controls-panel-d701172{height:80px!important}}.lightbox-d701172.show-controls-d701172 .control-d701172{animation-name:keyframes-fade-in-d701172;animation-timing-function:ease-in}.lightbox-d701172.hide-controls-d701172 .control-d701172{animation-name:keyframes-fade-out-d701172;animation-timing-function:linear}.gallery-d701172{top:0!important;left:0!important;right:0!important;width:100%;bottom:0!important;height:100%;overflow:auto!important;position:absolute!important}.grid-d701172{top:56px!important;width:calc(100% - 10px)!important;height:calc(100% - 56px)!important;display:grid!important;padding:0px 5px!important;grid-gap:5px!important;grid-auto-rows:-webkit-min-content!important;grid-auto-rows:min-content!important;-ms-flex-pack:center!important;justify-content:center!important;grid-template-columns:repeat(3,1fr)}@media (min-width:1024px){.grid-d701172{top:80px!important;height:calc(100% - 80px)!important;grid-template-columns:repeat(4,249.75px)}}.thumbnail-d701172{position:relative!important;padding-top:100%!important}.thumbnail-d701172>img{top:0!important;width:100%!important;cursor:pointer!important;height:100%!important;position:absolute!important;-o-object-fit:cover!important;object-fit:cover!important}.top-control-d701172{width:24px;height:24px;padding:16px}@media (min-width:1024px){.top-control-d701172{width:40px;height:40px;padding:20px}}";