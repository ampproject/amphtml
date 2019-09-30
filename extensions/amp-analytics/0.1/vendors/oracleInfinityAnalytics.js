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

import {jsonLiteral} from '../../../../src/json';

const ORACLEINFINITYANALYTICS_CONFIG = jsonLiteral({
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'requests': {
    'host': 'https://dc.oracleinfinity.io/${guid}/dcs.gif?',
    'baseUrl': 'dcssip=${dcssip}&dcsuri=${dcsuri}',
    'baseRef': '&dcsref=${documentReferrer}',
    'baseEs': '&WT.es=${sourceHost}${sourcePath}',
    'baseTi': '&WT.ti=${ti}&dcsdat=${timestamp}',
    'basePrefix': '${baseUrl}${baseTi}${baseRef}${baseEs}',
    'screenBs': '&WT.bs=${availableScreenWidth}x${availableScreenHeight}',
    'screenSr': '&WT.sr=${screenWidth}x${screenHeight}',
    'screenDc': '&WT.cd=${screenColorDepth}',
    'screenMeasures': '${screenBs}${screenSr}${screenDc}',
    'browserUl': '&WT.ul=${browserLanguage}',
    'browserLe': '&WT.le=${documentCharset}',
    'browserMeasures': '${browserUl}${browserLe}&WT.js=Yes',
    'sessCof': '&WT.co_f=${clientId(WT_AMP)}',
    'sessVer': '&ora.tv_amp=1.0.0&ora.amp_ver=${ampVersion}',
    'sessionization': '${sessCof}${sessVer}&dcscfg=3',
    'baseP1': '${host}${basePrefix}',
    'baseP2': '${screenMeasures}${browserMeasures}${sessionization}',
    'baseDl': '&WT.dl=${dl}',
    'pageview': '${baseP1}${baseP2}${baseDl}',
    'event': '${baseP1}${baseP2}${baseDl}',
    'dlPdf': 'a[href$=".pdf"]',
    'dlXls': ',a[href$=".xls"]',
    'dlPpt': ',a[href$=".ppt"]',
    'dlZip': ',a[href$=".zip"]',
    'dlTxt': ',a[href$=".txt"]',
    'dlRtf': ',a[href$=".rtf"]',
    'dlXml': ',a[href$=".xml"]',
    'downLoad': '${dlPdf}${dlXls}${dlPpt}${dlZip}${dlTxt}${dlRtf}${dlXml}',
  },
  'vars': {
    'dcssip': '${sourceHost}',
    'dcsuri': '${sourcePath}',
    'dl': '0',
    'ti': '${title}',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
    'trackAnchorClicks': {
      'on': 'click',
      'selector': 'a',
      'request': 'event',
      'vars': {
        'dl': '99',
        'ti': 'Link Click',
      },
    },
  },
  'trackDownloadClicks': {
    'on': 'click',
    'selector': '${downLoad}',
    'request': 'event',
    'vars': {
      'dl': '20',
      'ti': 'Download Click',
    },
  },
});

export {ORACLEINFINITYANALYTICS_CONFIG};
