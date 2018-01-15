/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {loadScript} from '../3p/3p';
export function nativo(global, data) {
  let ntvAd;
  (function(ntvAd, global, data) {
    global
        .history
        .replaceState(null,
            null,
            location.pathname + location.hash.replace(/({).*(})/, ''));
    // Private
    let delayedAdLoad = false;
    let percentageOfadViewed;
    const loc = global.context.location;
    function isValidDelayTime(delay) {
      return ((typeof delay != 'undefined'
        && !isNaN(delay)
        && parseInt(delay,10) >= 0));
    }
    function isDelayedTimeStart(data) {
      return (isValidDelayTime(data.delayByTime)
        && ('delay' in data)
        && !('delayByView' in data));
    }
    function isDelayedViewStart(data) {
      return (isValidDelayTime(data.delayByTime)
        && ('delayByView' in data));
    }
    function loadAdWhenViewed() {
      const g = global;
      global.context.observeIntersection(function(positions) {
        const coordinates = getLastPositionCoordinates(positions);
        if (typeof coordinates.rootBounds != 'undefined'
            && (coordinates
                .intersectionRect
                .top == (coordinates
                  .rootBounds.top + coordinates
                    .boundingClientRect
                    .y))) {
          if (isDelayedViewStart(data) && !delayedAdLoad) {
            g.PostRelease.Start();
            delayedAdLoad = true;
          }
        }
      });
    }
    function loadAdWhenTimedout() {
      const g = global;
      setTimeout(function() {
        g.PostRelease.Start();
        delayedAdLoad = true;
      }, parseInt(data.delayByTime, 10));
    }
    function getLastPositionCoordinates(positions) {
      return positions[positions.length - 1];
    }
    function setPercentageOfadViewed(percentage) {
      percentageOfadViewed = percentage;
    }
    // Used to track ad during scrolling event and trigger checkIsAdVisible method on PostRelease instance
    function viewabilityConfiguration(positions) {
      const coordinates = getLastPositionCoordinates(positions);
      setPercentageOfadViewed(
          (((coordinates.intersectionRect
              .height * 100) / coordinates
                .boundingClientRect
                .height) / 100));
      global.PostRelease.checkIsAdVisible();
    }
    // Public
    ntvAd.getPercentageOfadViewed = function() {
      return percentageOfadViewed;
    };
    ntvAd.getScriptURL = function() {
      return 'https://s.ntv.io/serve/load.js';
    };
    // Configuration setup is based on the parameters/attributes associated with the amp-ad node
    ntvAd.setupAd = function() {
      global._prx = [['cfg.Amp']];
      global._prx.push(['cfg.RequestUrl', data['requestUrl'] || loc.href]);
      for (const key in data) {
        switch (key) {
          case 'premium': global._prx.push(['cfg.SetUserPremium']); break;
          case 'debug': global._prx.push(['cfg.Debug']); break;
          case 'delay': if (isValidDelayTime(data.delayByTime)) {
            global._prx.push(['cfg.SetNoAutoStart']);
          } break;
        }
      }
    };
    // Used to Delay Start and Initalize Tracking. This is a callback AMP will use once script is loaded
    ntvAd.Start = function() {
      if (isDelayedTimeStart(data)) {
        loadAdWhenTimedout();
      } else if (isDelayedViewStart(data)) {
        loadAdWhenViewed();
      }
      global.PostRelease.checkAmpViewability = function() {
        return ntvAd.getPercentageOfadViewed();
      };
      // ADD TRACKING HANDLER TO OBSERVER
      global.context.observeIntersection(viewabilityConfiguration);
    };
  })(ntvAd || (ntvAd = {}), global, data);
  // Setup Configurations
  ntvAd.setupAd();
  // Load Nativo Script
  loadScript(global, ntvAd.getScriptURL(), ntvAd.Start);
}
