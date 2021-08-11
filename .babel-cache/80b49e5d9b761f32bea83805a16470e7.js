/** @enum {string}*/var _classes = { sectionChild: "section-child-00fce3c", header: "header-00fce3c", contentHidden: "content-hidden-00fce3c" }; /**
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



var sectionChild = {
  // Make animations measurable. Without this, padding and margin can skew
  // animations.
  boxSizing: 'border-box !important',
  // Cancel out the margin collapse. Also helps with animations to avoid
  // overflow.
  overflow: 'hidden !important',
  // Ensure that any absolute elements are positioned within the section.
  position: 'relative !important' };


var header = {
  cursor: 'pointer',
  backgroundColor: '#efefef',
  paddingRight: '20px',
  border: 'solid 1px #dfdfdf' };


var contentHidden = {
  '&:not(.i-amphtml-animating)': {
    display: 'none !important' } };



var JSS = {
  sectionChild: sectionChild,
  header: header,
  contentHidden: contentHidden };export var $sectionChild = "section-child-00fce3c";export var $header = "header-00fce3c";export var $contentHidden = "content-hidden-00fce3c";


// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export var useStyles = (function () {return _classes;});export var CSS = ".section-child-00fce3c{overflow:hidden!important;position:relative!important;box-sizing:border-box!important}.header-00fce3c{border:1px solid #dfdfdf;cursor:pointer;padding-right:20px;background-color:#efefef}.content-hidden-00fce3c:not(.i-amphtml-animating){display:none!important}";
// /Users/mszylkowski/src/amphtml/extensions/amp-accordion/1.0/component.jss.js