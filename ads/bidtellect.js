/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {writeScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function bidtellect(global, data) {
  const requiredParams = ['t','pid'];
  const optionalParams = [
    'sid',
    'sname',
    'pubid',
    'pubname',
    'renderid',
    'bestrender',
    'autoplay',
    'playbutton',
    'videotypeid',
    'videocloseicon',
    'targetid',
    'bustframe'];
  validateData(data, requiredParams, optionalParams);
  let params = '?t=' + encodeURIComponent(data.t);
  params += '&pid=' + encodeURIComponent(data.pid);
  if (data.width) {
    params += '&w=' + encodeURIComponent(data.width);
  }
  if (data.height) {
    params += '&h=' + encodeURIComponent(data.height);
  }
  if (data.sid) {
    params += '&sid=' + encodeURIComponent(data.sid);
  }
  if (data.sname) {
    params += '&sname=' + encodeURIComponent(data.sname);
  }
  if (data.pubid) {
    params += '&pubid=' + encodeURIComponent(data.pubid);
  }
  if (data.pubname) {
    params += '&pubname=' + encodeURIComponent(data.pubname);
  }
  if (data.renderid) {
    params += '&renderid=' + encodeURIComponent(data.renderid);
  }
  if (data.bestrender) {
    params += '&bestrender=' + encodeURIComponent(data.bestrender);
  }
  if (data.autoplay) {
    params += '&autoplay=' + encodeURIComponent(data.autoplay);
  }
  if (data.playbutton) {
    params += '&playbutton=' + encodeURIComponent(data.playbutton);
  }
  if (data.videotypeid) {
    params += '&videotypeid=' + encodeURIComponent(data.videotypeid);
  }
  if (data.videocloseicon) {
    params += '&videocloseicon=' + encodeURIComponent(data.videocloseicon);
  }
  if (data.targetid) {
    params += '&targetid=' + encodeURIComponent(data.targetid);
  }
  if (data.bustframe) {
    params += '&bustframe=' + encodeURIComponent(data.bustframe);
  }
  const url = 'https://cdn.bttrack.com/js/infeed/2.0/infeed.min.js' + params;
  writeScript(global, url);
}
