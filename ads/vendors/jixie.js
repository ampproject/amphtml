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

 import {loadScript, validateData} from '../../3p/3p';
/* 
 export function jixie(global, data) {
     console.log("!!!! CALLED jixie");
     //just this copied from Teads TEMPORARILY just so you can SEE something show up
     //later we use what is in the REAL_jixie ...
     //and you comment out this function!!

    //eslint "google-camelcase/google-camelcase": 0
    global._teads_amp = {
      allowed_data: ['pid', 'tag'],
      mandatory_data: ['pid'],
      mandatory_tag_data: ['tta', 'ttp'],
      data,
    };
  
    validateData(
      data,
      global._teads_amp.mandatory_data,
      global._teads_amp.allowed_data
    );
  
    if (data.tag) {
      validateData(data.tag, global._teads_amp.mandatory_tag_data);
      global._tta = data.tag.tta;
      global._ttp = data.tag.ttp;
  
      loadScript(
        global,
        'https://s8t.teads.tv/media/format/' +
          encodeURI(data.tag.js || 'v3/teads-format.min.js')
      );
    } else {
      loadScript(
        global,
        'https://a.teads.tv/page/' + encodeURIComponent(data.pid) + '/tag'
      );
    }
  }
  */
      
							   
 export function jixie(global, data, scriptLoader = loadScript) {
   //validateData(data, ['unit']);
   const d = global.document.createElement('div');
   d.setAttribute('id', 'jxOutstreamContainer');
   global.document.getElementById('c').appendChild(d);
   
   var p = {
    responsive: 1, 
    maxwidth: 640, 
    unit: "62dfd0d28588b4a2ed791b90dda06fce",
    container: "jxOutstreamContainer", // indicates where to create the iFrame, otherwise will be created as a child of the parent node
    creativeid: 613,
  };
  function jxdefer(p) {
    if (global.jxuniversal) {
          global.jxuniversal.init(p);
    } else {
          setTimeout(function() { jxdefer(p) }, 100);
    }
  }
  jxdefer(p);
   //jixie3p = global.jixie3p || {};
   //global.jixie3p.params = {
     //unit: data.unit
   //};
   //there is a loadScript and there is a writeScript
   //please check what the difference is. I think to do with sychronouse or asynchronous loading
   //
   loadScript(
    global,
    'https://scripts.jixie.io/jxfriendly.1.3.min.js'
  );
 }
 
 