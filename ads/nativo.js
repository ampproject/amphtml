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

import {writeScript, checkData} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function nativo(global, data) {
  
  //console.log("Nativo Window",window);
  //console.log("Nativo Global",global.context);
  //console.log("Nativo Data",data);
  
  
    var ntvAd;
    !function(){        
       window.frames.location.hash = window.frames.location.hash.replace(/({).*(})/,"");
        
        /// 
        // Private 
        ///    
        var adViewedTimeout, delayedAdLoad =false, percentageOfadViewed, loc = window.context.location;

        function isValidDelayTime(delay){
            return (typeof delay != "undefined" && !isNaN(delay) && parseInt(delay) >=0) ? true : false;
        }        
        function isDelayedTimeStart(data){
           return  isValidDelayTime(data.delayByTime) && ("delay" in data) && !("delayByView" in data) ? true : false;
        }
        function isDelayedViewStart(data){
           return  isValidDelayTime(data.delayByTime) && ("delayByView" in data) ? true : false;
        }        
        function loadAdWhenViewed(){
                    var g = global;
                    global.context.observeIntersection(function(positions){
                        var coordinates = getLastPositionCoordinates(positions);            
                        if((coordinates.intersectionRect.top == (coordinates.rootBounds.top + coordinates.boundingClientRect.y))){
                            if(isDelayedViewStart(data) && !delayedAdLoad) {
                                    g.PostRelease.Start();
                                    delayedAdLoad = true;
                                }
                        }
                    });
        }        
        function loadAdWhenTimedout(){
          var g = global;  
          setTimeout(function(){
                            g.PostRelease.Start();
                            delayedAdLoad = true;
                        },
                        parseInt(data.delayByTime)
                    );
        }
        function getLastPositionCoordinates (positions){ 
            return positions[positions.length-1];
        }        
        function setPercentageOfadViewed(percentage){
            percentageOfadViewed =percentage;
        }
        
       // Used to track ad during scrolling event and trigger checkIsAdVisible method on PostRelease instance
        function viewabilityConfiguration(positions){   
            var coordinates = getLastPositionCoordinates(positions);            
            setPercentageOfadViewed((((coordinates.intersectionRect.height*100)/coordinates.boundingClientRect.height)/100));  
            global.PostRelease.checkIsAdVisible();            
        }        
                
        
        ////
        // Public 
        ///    
        ntvAd.getPercentageOfadViewed = function(){
            return percentageOfadViewed;
        }
        
        
        ntvAd.getScriptURL = function(){
            return loc.protocol + '//s.ntv.io/serve/load.js';
        };
        // Configuration setup is based on the parameters/attributes associated with the amp-ad node
        ntvAd.setupAd = function(){
            global._prx = [['cfg.Amp']];                           
            global._prx.push(["cfg.RequestUrl", data["requestUrl"] || loc.origin]);    
            for(var key in data){
                switch(key){
                    case "premium":
                        global._prx.push(['cfg.SetUserPremium']);
                    break;                    
                    case "debug":
                        global._prx.push(['cfg.Debug']);
                    break;
                    case "delay":
                        (isValidDelayTime(data.delayByTime)) ? global._prx.push(['cfg.SetNoAutoStart']) : "";
                    break;
                }
            }            
        };
        
        //Used to Delay Start and Initalize Tracking. This is a callback AMP will use once script is loaded        
        ntvAd.Start = function(){
            if(isDelayedTimeStart(data)) {
                loadAdWhenTimedout();
            }else if(isDelayedViewStart(data)){
                loadAdWhenViewed();
            }
            global.PostRelease.checkAmpViewability = function(){
                return  ntvAd.getPercentageOfadViewed();
            }
            // ADD TRACKING HANDLER TO OBSERVER
            global.context.observeIntersection(viewabilityConfiguration)
        };              
    }(ntvAd || (ntvAd={}),global,data);
    
    //Setup Configurations
    ntvAd.setupAd();
    
    //Load Nativo Script
    writeScript(global, ntvAd.getScriptURL(),ntvAd.Start);
}