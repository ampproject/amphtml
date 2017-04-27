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

import {
  writeScript,
  validateData,
  validateSrcPrefix,
//  validateSrcContains,
} from '../3p/3p';

import {addParamsToUrl} from '../src/url';


export function mobusi(global, data) {
  const adsrc = data.src;
  if (typeof adsrc != 'undefined') {
//     validateSrcPrefix('https:', adsrc);
//    validateSrcContains('/addyn/', adsrc);
    writeScript(global, adsrc+'&lgid='+((new Date()).getTime() % 2147483648) + Math.random());
  } else {
    const lz_options =[
	    'a', 'floa', 'idtm','mobdiv',
	    't', 'dis_alg', 'popunders', 'direct',
	    'ip', 'hotf', 'close','offer_key','idextra','offer_bundle','pubid'
    ]
    validateData(data, ['m','ads_server','mobformat'], lz_options);
	if(data.mobformat.toLowerCase()=="banner"){
		url = 'http://'+data.ads_server+'/banner_request.php?';
	}else{
		url = 'http://'+data.ads_server+'/inter_request.php?';
	}
    console.log(data);
    data=removeItemFromArr(data,'ads_server');
    console.log(data);
   writeScript(global,addParamsToUrl(url+'&lgid='+((new Date()).getTime() %2147483648) + Math.random(),data));
  }
}
//elimina un item de un arraglo
var removeItemFromArr = ( arr, item ) => {
	if (!arr) {
		return;
	}
	if (Array.isArray(arr)){
		const index = arr.indexOf(item );
		if (index > -1) {
			arr=arr.splice(index, 1);
		}
	}
	return(arr);
};