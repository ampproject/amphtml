/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {parseUrlDeprecated} from '../src/url';
import {setStyles} from '../src/style';
import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function aniview(global, data) {
  const requiredParams = [
    'publisherid',
    'channelid'
  ];
  const optionalParams = [
  ];
  const defaultParams = {
    publisherid: '',
    channelid: '',
    ref1: '',
    adserverdomain: null,
    trackingdomain: null,
    scriptdomain: "player.aniview.com",
    loop: true,
    vastretry: 3,
    errorlimit: 10,
    maximp: null,
    maxrun: null,
    preloader: {},
    logo: true,
    customlogo: null,
    customcss: null,
    passbackurl: null,
    width: 300,
    height: 250,
    av_gdpr: null,
    av_consent: null,
    av_url: null,
    av_subid: null
  };
  const adConfig = {
  };
  const extraRef1 = "";
  for (var attrname in defaultParams) {
    if (defaultParams.hasOwnProperty(attrname)) {
      optionalParams.push(attrname);
      if(data[attrname]) {
        if(attrname == 'publisherid')
          adConfig['publisherId'] = data[attrname];
        else
          if(attrname == 'channelid')
            adConfig['channelId'] = data[attrname];
          else
            if(attrname.indexOf("av_") == 0)
              extraRef1 = extraRef1 + '&' + attrname.toUpperCase() + "=" + data[attrname];
            else
              adConfig[attrname] = data[attrname];
      }
      else
        if(defaultParams[attrname])
          adConfig[attrname] = defaultParams[attrname];
    }
  };
  validateData(data, requiredParams, optionalParams);

  if(adConfig.preloader) {
    try {
      adConfig.preloader = JSON.parse(adConfig.preloader);
    } catch (e) {
    }
  }
  if(adConfig.customlogo) {
    try {
      adConfig.customlogo = JSON.parse(adConfig.customlogo);
    } catch (e) {
    }
  }
  if(!data.av_url)
    adConfig.ref1 = adConfig.ref1 + "AV_URL=" + global.context.location.href;
  adConfig.ref1 = adConfig.ref1 + extraRef1;
  const position = global.document.createElement('div');
  adConfig.position = position.id = "aniplayer";
  adConfig.width = global.document.body.clientWidth;

  (new Image).src = "https://track1.aniview.com/track?pid="+adConfig.publisherId+"&cid="+adConfig.channelId+"&e=playerLoaded"+"&cb="+Date.now();
  const scp = global.document.createElement('script');
  const scpUrl = "https://" + adConfig.scriptdomain + "/script/6.1/aniview.js";

  scp.onload = function() {
    global.context.renderStart();
    const myPlayer = new avPlayer(adConfig);
    myPlayer.play(adConfig);
  };

  scp.src = scpUrl;
  global.document.getElementById('c').appendChild(position);
  global.document.getElementById('c').appendChild(scp);
}
