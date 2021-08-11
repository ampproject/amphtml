/** @enum {string}*/var _classes = { fitTextContentWrapper: "fit-text-content-wrapper-faf5e99", fitTextContent: "fit-text-content-faf5e99", minContentHeight: "min-content-height-faf5e99" }; /**
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



export var LINE_HEIGHT_EM_ = 1.15;

var fitTextContentWrapper = {
  'display': 'flex',
  'flexDirection': 'column',
  'flexWrap': 'nowrap',
  'justifyContent': 'center' };


/* Legacy comment: We have to use the old-style flex box with line clamping. It will only
    work in WebKit, but unfortunately there's no alternative. */
var fitTextContent = {
  lineHeight: "".concat(LINE_HEIGHT_EM_, "em"),
  'display': '-webkit-box',
  '-webkit-box-orient': 'vertical',
  'overflow': 'hidden',
  'textOverflow': 'ellipsis',

  'flexDirection': 'column',
  'flexWrap': 'nowrap',
  'justifyContent': 'center' };


var minContentHeight = {
  'height': 'min-content' };


var JSS = {
  fitTextContentWrapper: fitTextContentWrapper,
  fitTextContent: fitTextContent,
  minContentHeight: minContentHeight };export var $fitTextContentWrapper = "fit-text-content-wrapper-faf5e99";export var $fitTextContent = "fit-text-content-faf5e99";export var $minContentHeight = "min-content-height-faf5e99";


// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export var useStyles = (function () {return _classes;});export var CSS = ".fit-text-content-wrapper-faf5e99{display:-ms-flexbox;display:flex}.fit-text-content-faf5e99,.fit-text-content-wrapper-faf5e99{-ms-flex-wrap:nowrap;flex-wrap:nowrap;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center}.fit-text-content-faf5e99{display:-webkit-box;overflow:hidden;line-height:1.15em;text-overflow:ellipsis}.min-content-height-faf5e99{height:-webkit-min-content;height:min-content}";
// /Users/mszylkowski/src/amphtml/extensions/amp-fit-text/1.0/component.jss.js