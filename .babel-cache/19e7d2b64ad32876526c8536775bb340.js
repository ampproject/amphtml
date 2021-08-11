/** @enum {string}*/var _classes = { fillStretch: "fill-stretch-c645120", fillContentOverlay: "fill-content-overlay-c645120" }; /**
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



// TODO(alanorozco): Share these across components.
export var fillStretch = {
  'position': 'relative',
  'width': '100%',
  'height': '100%' };


export var fillContentOverlay = {
  'position': 'absolute',
  'left': 0,
  'right': 0,
  'bottom': 0,
  'top': 0 };


var JSS = {
  fillStretch: fillStretch,
  fillContentOverlay: fillContentOverlay };export var $fillStretch = "fill-stretch-c645120";export var $fillContentOverlay = "fill-content-overlay-c645120";


// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export var useStyles = (function () {return _classes;});export var CSS = ".fill-stretch-c645120{width:100%;height:100%;position:relative}.fill-content-overlay-c645120{top:0;left:0;right:0;bottom:0;position:absolute}";
// /Users/mszylkowski/src/amphtml/extensions/amp-video/1.0/component.jss.js