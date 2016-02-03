/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {writeScript, validateSrcPrefix, validateSrcContains} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function appnexus(global, data) {
  // in case we pass the ttj url to use, simply call it and return
  if (data.src){
	  validateSrcPrefix('https:', data.src);
	  validateSrcContains('/ttj?', data.src);
	  writeScript(global, data.src);
	  return;
  }
  // otherwise, use json configuration to load ast
  if (context.isMaster){ // in case we are in the master iframe, we load AST
	  apntag = (typeof apntag != "undefined")? apntag : {};
	  apntag.anq = apntag.anq || [];
	  apntag.debug = data.debug || false;

	  writeScript(global, "https://acdn.adnxs.com/ast/ast.js");

      apntag.anq.push(function() {
          //set global page options
          apntag.setPageOpts(data.pageOpts);
      });

	  for (var i = 0; i < data.adUnits.length; ++i){
		  (function(j){
	        apntag.anq.push(function() {
	            //define ad tag
	            apntag.defineTag(data.adUnits[j]);
	        });
		  })(i)
	  }

	  apntag.anq.push(function() {
          apntag.loadTags();
      });
  }
  // then for all ad units, define the ad placement and show the ad
  global.docEndCallback = function(){
	  var div = global.document.createElement("div");
	  div.setAttribute("id", data.target);
	  global.document.body.appendChild(div); // create and insert the div for the ad to render in
	  context.master.apntag = (typeof context.master.apntag != "undefined")? context.master.apntag : {};
	  context.master.apntag.anq = context.master.apntag.anq || [];
	  context.master.apntag.anq.push(function() {
		  if (!this.isMaster) // in case we are not in the master iframe, we create a reference to the apntag in the master iframe
			  global.apntag = context.master.apntag;
		  // collapse on no ad is handle here.
		  context.master.apntag.onEvent('adNoBid', data.target, function(){
			context.noContentAvailable();
		  });
		  context.master.apntag.showTag(data.target, global.window);
	  });
  }
}
