/** @enum {string}*/var _classes = { arrow: "arrow-214fab8", arrowPrev: "arrow-prev-214fab8", arrowNext: "arrow-next-214fab8", extraSpace: "extra-space-214fab8", gallery: "gallery-214fab8", insetArrow: "inset-arrow-214fab8", outsetArrow: "outset-arrow-214fab8" }; /**
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



var gallery = {
  display: 'flex',
  flexGrow: 1,
  '&$extraSpace': {
    justifyContent: 'center' } };


var extraSpace = {};
var arrow = {
  position: 'relative',
  zIndex: 1,
  border: 'none',
  outline: 'none',
  boxShadow: '0px 2px 6px 0px rgba(0,0,0,.4)',
  backgroundColor: 'rgba(255,255,255,0.6)',
  backgroundSize: '24px 24px',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backdropFilter: 'blur(3px)',
  transition: '200ms opacity ease-in' };

var arrowPrev = {};
var arrowNext = {};
var insetArrow = {
  flexShrink: 0,
  width: '40px',
  height: '40px',
  padding: '8px',
  margin: '-12px',
  '&$arrowPrev': {
    borderRadius: '0px 4px 4px 0px' },

  '&$arrowNext': {
    borderRadius: '4px 0px 0px 4px' } };


var outsetArrow = {
  flexShrink: 0,
  width: '32px',
  height: '32px',
  padding: '4px',
  margin: '2px',
  borderRadius: '50%',
  pointerEvents: 'auto' };


var JSS = {
  arrow: arrow,
  arrowPrev: arrowPrev,
  arrowNext: arrowNext,
  extraSpace: extraSpace,
  gallery: gallery,
  insetArrow: insetArrow,
  outsetArrow: outsetArrow };export var $arrow = "arrow-214fab8";export var $arrowPrev = "arrow-prev-214fab8";export var $arrowNext = "arrow-next-214fab8";export var $extraSpace = "extra-space-214fab8";export var $gallery = "gallery-214fab8";export var $insetArrow = "inset-arrow-214fab8";export var $outsetArrow = "outset-arrow-214fab8";


// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export var useStyles = (function () {return _classes;});export var CSS = ".arrow-214fab8{border:none;outline:none;z-index:1;position:relative;box-shadow:0px 2px 6px 0px rgba(0,0,0,.4);transition:opacity 200ms ease-in;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);background-size:24px 24px;background-color:rgba(255,255,255,0.6);background-repeat:no-repeat;background-position:50%}.gallery-214fab8{display:-ms-flexbox;display:flex;-ms-flex-positive:1;flex-grow:1}.gallery-214fab8.extra-space-214fab8{-ms-flex-pack:center;justify-content:center}.inset-arrow-214fab8{width:40px;height:40px;margin:-12px;padding:8px;-ms-flex-negative:0;flex-shrink:0}.inset-arrow-214fab8.arrow-prev-214fab8{border-radius:0px 4px 4px 0px}.inset-arrow-214fab8.arrow-next-214fab8{border-radius:4px 0px 0px 4px}.outset-arrow-214fab8{width:32px;height:32px;margin:2px;padding:4px;-ms-flex-negative:0;flex-shrink:0;border-radius:50%;pointer-events:auto}";
// /Users/mszylkowski/src/amphtml/extensions/amp-stream-gallery/1.0/component.jss.js