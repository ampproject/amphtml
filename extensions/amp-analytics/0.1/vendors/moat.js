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

export const MOAT_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'element': ':root',
  },
  'requests': {
    'load': JSON.stringify(
      /** @type {!JsonObject} */ ({
        'type': 'load',
        'pcode': '${pcode}',
        'l0t': '${l0t}',
        'acctType': '${acctType}',
        'adType': '${adType}',
        'qs': '${qs}',
        'element': {
          'src': '${htmlAttr(img,src,width)}',
          'viewer': '${viewer}',
        },
        'document': {
          'AMPDocumentHostname': '${ampdocHostname}',
          'AMPDocumentURL': '${ampdocUrl}',
          'canonicalHost': '${canonicalHost}',
          'canonicalHostname': '${canonicalHostname}',
          'canonicalPath': '${canonicalPath}',
          'canonicalURL': '${canonicalUrl}',
          'documentCharset': '${documentCharset}',
          'documentReferrer': '${documentReferrer}',
          'externalReferrer': '${externalReferrer}',
          'sourceURL': '${sourceUrl}',
          'sourceHost': '${sourceHost}',
          'sourceHostname': '${sourceHostname}',
          'sourcePath': '${sourcePath}',
          'title': '${title}',
          'viewer': '${viewer}',
        },
        'device': {
          'availableScreenHeight': '${availableScreenHeight}',
          'availableScreenWidth': '${availableScreenWidth}',
          'browserLanguage': '${browserLanguage}',
          'screenColorDepth': '${screenColorDepth}',
          'screenHeight': '${screenHeight}',
          'screenWidth': '${screenWidth}',
          'scrollHeight': '${scrollHeight}',
          'scrollWidth': '${scrollWidth}',
          'scrollLeft': '${scrollLeft}',
          'scrollTop': '${scrollTop}',
          'timezone': '${timezone}',
          'userAgent': '${userAgent}',
          'viewportHeight': '${viewportHeight}',
          'viewportWidth': '${viewportWidth}',
        },
        'requestCount': '${requestCount}',
        'timeStamp': '${timestamp}',
      })
    ),
    'unload': JSON.stringify(
      /** @type {!JsonObject} */ ({
        'type': 'unload',
        'pcode': '${pcode}',
        'l0t': '${l0t}',
        'requestCount': '${requestCount}',
        'timeStamp': '${timestamp}',
      })
    ),
    'click': JSON.stringify(
      /** @type {!JsonObject} */ ({
        'type': 'click',
        'pcode': '${pcode}',
        'l0t': '${l0t}',
        'requestCount': '${requestCount}',
        'timeStamp': '${timestamp}',
      })
    ),
    'viewability': JSON.stringify(
      /** @type {!JsonObject} */ ({
        'type': 'viewability',
        'pcode': '${pcode}',
        'l0t': '${l0t}',
        'backgroundState': '${backgroundState}',
        'intersectionRect': '${intersectionRect}',
        'intersectionRatio': '${intersectionRatio}',
        'maxVisiblePercentage': '${maxVisiblePercentage}',
        'minVisiblePercentage': '${minVisiblePercentage}',
        'x': '${elementX}',
        'y': '${elementY}',
        'height': '${elementHeight}',
        'width': '${elementWidth}',
        'viewportHeight': '${viewportHeight}',
        'viewportWidth': '${viewportWidth}',
        'opacity': '${opacity}',
        'timeStamp': '${timestamp}',
        'requestCount': '${requestCount}',
      })
    ),
    'iframe': JSON.stringify(
      /** @type {!JsonObject} */ ({
        'type': 'iframe',
        'pcode': '${pcode}',
        'height': '${elementHeight}',
        'width': '${elementWidth}',
        'x': '${elementX}',
        'y': '${elementY}',
        'requestCount': '${requestCount}',
      })
    ),
  },
  'triggers': {
    'load': {
      'on': 'ini-load',
      'request': 'load',
    },
    'unload': {
      'on': 'ad-refresh',
      'selector': '${element}',
      'request': 'unload',
    },
    'click': {
      'on': 'click',
      'selector': '${element}',
      'request': 'click',
    },
    'viewability': {
      'on': 'visible',
      'selector': '${element}',
      'request': 'viewability',
      'visibilitySpec': {
        'repeat': true,
        'visiblePercentageThresholds': [
          [0, 0],
          [0, 5],
          [5, 10],
          [10, 15],
          [15, 20],
          [20, 25],
          [25, 30],
          [30, 35],
          [35, 40],
          [40, 45],
          [45, 50],
          [50, 55],
          [55, 60],
          [60, 65],
          [65, 70],
          [70, 75],
          [75, 80],
          [80, 85],
          [85, 90],
          [90, 95],
          [95, 100],
          [100, 100],
        ],
      },
    },
    'iframe': {
      'on': 'visible',
      'selector': ':root',
      'request': 'iframe',
      'visibilitySpec': {
        'repeat': true,
        'visiblePercentageThresholds': [[0, 0]],
      },
    },
  },
});
