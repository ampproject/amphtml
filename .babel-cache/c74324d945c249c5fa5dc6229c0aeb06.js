/** @enum {string}*/var _classes = { closeButton: "close-button-88b9dee", wrapper: "wrapper-88b9dee", content: "content-88b9dee" }; /**
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



var closeButton = {
  position: 'fixed',
  /* keep it on viewport */
  top: 0,
  left: 0,
  /* give it non-zero size, VoiceOver on Safari requires at least 2 pixels
  before allowing buttons to be activated. */
  width: '2px',
  height: '2px',
  /* visually hide it with overflow and opacity */
  opacity: 0,
  overflow: 'hidden',
  /* remove any margin or padding */
  border: 'none',
  margin: 0,
  padding: 0,
  /* ensure no other style sets display to none */
  display: 'block',
  visibility: 'visible' };


var wrapper = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: '100%',
  position: 'fixed',
  boxSizing: 'border-box',
  zIndex: 1000,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  color: '#fff' };


var content = {
  overflow: 'auto !important',
  overscrollBehavior: 'none !important' };


var JSS = {
  closeButton: closeButton,
  wrapper: wrapper,
  content: content };export var $closeButton = "close-button-88b9dee";export var $wrapper = "wrapper-88b9dee";export var $content = "content-88b9dee";


// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export var useStyles = (function () {return _classes;});export var CSS = ".close-button-88b9dee{top:0;left:0;width:2px;border:none;height:2px;margin:0;display:block;opacity:0;padding:0;overflow:hidden;position:fixed;visibility:visible}.wrapper-88b9dee{top:0;left:0;color:#fff;right:0;width:100%;bottom:0;height:100%;z-index:1000;position:fixed;box-sizing:border-box;background-color:rgba(0,0,0,0.9)}.content-88b9dee{overflow:auto!important;-ms-scroll-chaining:none!important;overscroll-behavior:none!important}";
// /Users/mszylkowski/src/amphtml/extensions/amp-lightbox/1.0/component.jss.js