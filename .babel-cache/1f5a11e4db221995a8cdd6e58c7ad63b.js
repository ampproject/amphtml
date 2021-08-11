/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { FilterType } from "./filters/filter";
import { IFRAME_TRANSPORTS } from "../../amp-analytics/0.1/iframe-transport-vendors";
import { user, userAssert } from "../../../src/log";

/**
 * @typedef {{
 *   startTimingEvent: (string|undefined)
 * }}
 */
export var AmpAdExitConfigOptions;

/**
 * @typedef {{
 *   targets: !Object<string, !NavigationTargetConfig>,
 *   filters: (!Object<string, !FilterConfig>|undefined),
 *   transport: (!Object<TransportMode, boolean>|undefined),
 *   options: (!AmpAdExitConfigOptions|undefined)
 * }}
 */
export var AmpAdExitConfig;

/**
 * @typedef {{
 *   finalUrl: string,
 *   trackingUrls: (!Array<string>|undefined),
 *   vars: (VariablesDef|undefined),
 *   filters: (!Array<string>|undefined),
 *   behaviors: (BehaviorsDef|undefined)
 * }}
 */
export var NavigationTargetConfig;

/**
 * @typedef {{
 *   defaultValue: (string|number|boolean),
 *   iframeTransportSignal: (string|undefined)
 * }}
 */
export var VariableDef;

/**
 * @typedef {!Object<string, !VariableDef>}
 */
export var VariablesDef;

/**
 * Supported Behaviors:
 *  -- clickTarget -- Specifies where to try to open the click.
 *                    Either '_blank'(default) or '_top'
 *
 * @typedef {{
 *   clickTarget: (string|undefined)
 * }}
 */
export var BehaviorsDef;

/**
 * @typedef {{
 *   type: !FilterType,
 *   delay: number,
 *   startTimingEvent: (string|undefined)
 * }}
 */
export var ClickDelayConfig;

/**
 * @typedef {{
 *   type: !FilterType,
 *   top: (number|undefined),
 *   right: (number|undefined),
 *   bottom: (number|undefined),
 *   left: (number|undefined),
 *   relativeTo: (string|undefined)
 * }}
 */
export var ClickLocationConfig;

/**
 * @typedef {{
 *   type: !FilterType,
 *   selector: string
 * }}
 */
export var InactiveElementConfig;

/** @typedef {!ClickDelayConfig|!ClickLocationConfig} */
export var FilterConfig;

/** @enum {string} */
export var TransportMode = {
  BEACON: 'beacon',
  IMAGE: 'image'
};

/**
 * Checks whether the object conforms to the AmpAdExitConfig spec.
 *
 * @param {?JsonObject} config The config to validate.
 * @return {!JsonObject}
 */
export function assertConfig(config) {
  userAssert(typeof config == 'object');

  if (config['filters']) {
    assertFilters(config['filters']);
  } else {
    config['filters'] = {};
  }

  if (config['transport']) {
    assertTransport(config['transport']);
  } else {
    config['transport'] = {};
  }

  assertTargets(config['targets'],
  /** @type {!JsonObject} */
  config);
  return (
    /** @type {!JsonObject} */
    config
  );
}

/**
 * Asserts a transport.
 * @param {!JsonObject} transport
 */
function assertTransport(transport) {
  for (var t in transport) {
    userAssert(t == TransportMode.BEACON || t == TransportMode.IMAGE, "Unknown transport option: '" + t + "'");
    userAssert(typeof transport[t] == 'boolean');
  }
}

/**
 * Asserts an array of filters.
 * @param {!JsonObject} filters
 */
function assertFilters(filters) {
  var validFilters = [FilterType.CLICK_DELAY, FilterType.CLICK_LOCATION, FilterType.INACTIVE_ELEMENT];

  for (var name in filters) {
    userAssert(typeof filters[name] == 'object', "Filter specification '%s' is malformed", name);
    userAssert(validFilters.indexOf(filters[name].type) != -1, 'Supported filters: ' + validFilters.join(', '));
  }
}

/**
 * Asserts targets and its config
 *
 * @param {!JsonObject} targets
 * @param {!JsonObject} config
 */
function assertTargets(targets, config) {
  userAssert(typeof targets == 'object', "'targets' must be an object");

  for (var target in targets) {
    assertTarget(target, targets[target], config);
  }
}

/**
 * Asserts target
 *
 * @param {string} name
 * @param {!JsonObject} target
 * @param {!JsonObject} config
 */
function assertTarget(name, target, config) {
  userAssert(typeof target['finalUrl'] == 'string', "finalUrl of target '%s' must be a string", name);

  if (target['filters']) {
    /** @type {!Array} */
    target['filters'].forEach(function (filter) {
      userAssert(config['filters'][filter], "filter '%s' not defined", filter);
    });
  }

  if (target['vars']) {
    var pattern = /^_[a-zA-Z0-9_-]+$/;

    for (var variable in target['vars']) {
      userAssert(pattern.test(variable), "'%s' must match the pattern '%s'", variable, pattern);
    }
  }
}

/**
 * Checks whether a vendor is valid (i.e. listed in vendors.js and has
 * transport/iframe defined.
 * @param {string} vendor The vendor name that should be listed in vendors.js
 * @return {string} The vendor's iframe URL
 */
export function assertVendor(vendor) {
  return user().assertString(IFRAME_TRANSPORTS[vendor], "Unknown or invalid vendor " + vendor + ", " + 'note that vendor must use transport: iframe');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyJdLCJuYW1lcyI6WyJGaWx0ZXJUeXBlIiwiSUZSQU1FX1RSQU5TUE9SVFMiLCJ1c2VyIiwidXNlckFzc2VydCIsIkFtcEFkRXhpdENvbmZpZ09wdGlvbnMiLCJBbXBBZEV4aXRDb25maWciLCJOYXZpZ2F0aW9uVGFyZ2V0Q29uZmlnIiwiVmFyaWFibGVEZWYiLCJWYXJpYWJsZXNEZWYiLCJCZWhhdmlvcnNEZWYiLCJDbGlja0RlbGF5Q29uZmlnIiwiQ2xpY2tMb2NhdGlvbkNvbmZpZyIsIkluYWN0aXZlRWxlbWVudENvbmZpZyIsIkZpbHRlckNvbmZpZyIsIlRyYW5zcG9ydE1vZGUiLCJCRUFDT04iLCJJTUFHRSIsImFzc2VydENvbmZpZyIsImNvbmZpZyIsImFzc2VydEZpbHRlcnMiLCJhc3NlcnRUcmFuc3BvcnQiLCJhc3NlcnRUYXJnZXRzIiwidHJhbnNwb3J0IiwidCIsImZpbHRlcnMiLCJ2YWxpZEZpbHRlcnMiLCJDTElDS19ERUxBWSIsIkNMSUNLX0xPQ0FUSU9OIiwiSU5BQ1RJVkVfRUxFTUVOVCIsIm5hbWUiLCJpbmRleE9mIiwidHlwZSIsImpvaW4iLCJ0YXJnZXRzIiwidGFyZ2V0IiwiYXNzZXJ0VGFyZ2V0IiwiZm9yRWFjaCIsImZpbHRlciIsInBhdHRlcm4iLCJ2YXJpYWJsZSIsInRlc3QiLCJhc3NlcnRWZW5kb3IiLCJ2ZW5kb3IiLCJhc3NlcnRTdHJpbmciXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFVBQVI7QUFDQSxTQUFRQyxpQkFBUjtBQUNBLFNBQVFDLElBQVIsRUFBY0MsVUFBZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxzQkFBSjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxlQUFKOztB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QU1EO0FBQ0Y7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNHLFlBQVQsQ0FBc0JDLE1BQXRCLEVBQThCO0FBQ25DLFNBQU94QyxJQUFJLEdBQUd5QyxZQUFQLENBQ0wxQyxpQkFBaUIsQ0FBQ3lDLE1BQUQsQ0FEWixFQUVMLCtCQUE2QkEsTUFBN0IsVUFDRSw2Q0FIRyxDQUFQO0FBS0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtGaWx0ZXJUeXBlfSBmcm9tICcuL2ZpbHRlcnMvZmlsdGVyJztcbmltcG9ydCB7SUZSQU1FX1RSQU5TUE9SVFN9IGZyb20gJy4uLy4uL2FtcC1hbmFseXRpY3MvMC4xL2lmcmFtZS10cmFuc3BvcnQtdmVuZG9ycyc7XG5pbXBvcnQge3VzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHN0YXJ0VGltaW5nRXZlbnQ6IChzdHJpbmd8dW5kZWZpbmVkKVxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBBbXBBZEV4aXRDb25maWdPcHRpb25zO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHRhcmdldHM6ICFPYmplY3Q8c3RyaW5nLCAhTmF2aWdhdGlvblRhcmdldENvbmZpZz4sXG4gKiAgIGZpbHRlcnM6ICghT2JqZWN0PHN0cmluZywgIUZpbHRlckNvbmZpZz58dW5kZWZpbmVkKSxcbiAqICAgdHJhbnNwb3J0OiAoIU9iamVjdDxUcmFuc3BvcnRNb2RlLCBib29sZWFuPnx1bmRlZmluZWQpLFxuICogICBvcHRpb25zOiAoIUFtcEFkRXhpdENvbmZpZ09wdGlvbnN8dW5kZWZpbmVkKVxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBBbXBBZEV4aXRDb25maWc7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgZmluYWxVcmw6IHN0cmluZyxcbiAqICAgdHJhY2tpbmdVcmxzOiAoIUFycmF5PHN0cmluZz58dW5kZWZpbmVkKSxcbiAqICAgdmFyczogKFZhcmlhYmxlc0RlZnx1bmRlZmluZWQpLFxuICogICBmaWx0ZXJzOiAoIUFycmF5PHN0cmluZz58dW5kZWZpbmVkKSxcbiAqICAgYmVoYXZpb3JzOiAoQmVoYXZpb3JzRGVmfHVuZGVmaW5lZClcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgTmF2aWdhdGlvblRhcmdldENvbmZpZztcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBkZWZhdWx0VmFsdWU6IChzdHJpbmd8bnVtYmVyfGJvb2xlYW4pLFxuICogICBpZnJhbWVUcmFuc3BvcnRTaWduYWw6IChzdHJpbmd8dW5kZWZpbmVkKVxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBWYXJpYWJsZURlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7IU9iamVjdDxzdHJpbmcsICFWYXJpYWJsZURlZj59XG4gKi9cbmV4cG9ydCBsZXQgVmFyaWFibGVzRGVmO1xuXG4vKipcbiAqIFN1cHBvcnRlZCBCZWhhdmlvcnM6XG4gKiAgLS0gY2xpY2tUYXJnZXQgLS0gU3BlY2lmaWVzIHdoZXJlIHRvIHRyeSB0byBvcGVuIHRoZSBjbGljay5cbiAqICAgICAgICAgICAgICAgICAgICBFaXRoZXIgJ19ibGFuaycoZGVmYXVsdCkgb3IgJ190b3AnXG4gKlxuICogQHR5cGVkZWYge3tcbiAqICAgY2xpY2tUYXJnZXQ6IChzdHJpbmd8dW5kZWZpbmVkKVxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBCZWhhdmlvcnNEZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgdHlwZTogIUZpbHRlclR5cGUsXG4gKiAgIGRlbGF5OiBudW1iZXIsXG4gKiAgIHN0YXJ0VGltaW5nRXZlbnQ6IChzdHJpbmd8dW5kZWZpbmVkKVxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBDbGlja0RlbGF5Q29uZmlnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHR5cGU6ICFGaWx0ZXJUeXBlLFxuICogICB0b3A6IChudW1iZXJ8dW5kZWZpbmVkKSxcbiAqICAgcmlnaHQ6IChudW1iZXJ8dW5kZWZpbmVkKSxcbiAqICAgYm90dG9tOiAobnVtYmVyfHVuZGVmaW5lZCksXG4gKiAgIGxlZnQ6IChudW1iZXJ8dW5kZWZpbmVkKSxcbiAqICAgcmVsYXRpdmVUbzogKHN0cmluZ3x1bmRlZmluZWQpXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IENsaWNrTG9jYXRpb25Db25maWc7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgdHlwZTogIUZpbHRlclR5cGUsXG4gKiAgIHNlbGVjdG9yOiBzdHJpbmdcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgSW5hY3RpdmVFbGVtZW50Q29uZmlnO1xuXG4vKiogQHR5cGVkZWYgeyFDbGlja0RlbGF5Q29uZmlnfCFDbGlja0xvY2F0aW9uQ29uZmlnfSAqL1xuZXhwb3J0IGxldCBGaWx0ZXJDb25maWc7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IFRyYW5zcG9ydE1vZGUgPSB7XG4gIEJFQUNPTjogJ2JlYWNvbicsXG4gIElNQUdFOiAnaW1hZ2UnLFxufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgb2JqZWN0IGNvbmZvcm1zIHRvIHRoZSBBbXBBZEV4aXRDb25maWcgc3BlYy5cbiAqXG4gKiBAcGFyYW0gez9Kc29uT2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0byB2YWxpZGF0ZS5cbiAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Q29uZmlnKGNvbmZpZykge1xuICB1c2VyQXNzZXJ0KHR5cGVvZiBjb25maWcgPT0gJ29iamVjdCcpO1xuICBpZiAoY29uZmlnWydmaWx0ZXJzJ10pIHtcbiAgICBhc3NlcnRGaWx0ZXJzKGNvbmZpZ1snZmlsdGVycyddKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWdbJ2ZpbHRlcnMnXSA9IHt9O1xuICB9XG4gIGlmIChjb25maWdbJ3RyYW5zcG9ydCddKSB7XG4gICAgYXNzZXJ0VHJhbnNwb3J0KGNvbmZpZ1sndHJhbnNwb3J0J10pO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZ1sndHJhbnNwb3J0J10gPSB7fTtcbiAgfVxuICBhc3NlcnRUYXJnZXRzKGNvbmZpZ1sndGFyZ2V0cyddLCAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoY29uZmlnKSk7XG4gIHJldHVybiAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoY29uZmlnKTtcbn1cblxuLyoqXG4gKiBBc3NlcnRzIGEgdHJhbnNwb3J0LlxuICogQHBhcmFtIHshSnNvbk9iamVjdH0gdHJhbnNwb3J0XG4gKi9cbmZ1bmN0aW9uIGFzc2VydFRyYW5zcG9ydCh0cmFuc3BvcnQpIHtcbiAgZm9yIChjb25zdCB0IGluIHRyYW5zcG9ydCkge1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICB0ID09IFRyYW5zcG9ydE1vZGUuQkVBQ09OIHx8IHQgPT0gVHJhbnNwb3J0TW9kZS5JTUFHRSxcbiAgICAgIGBVbmtub3duIHRyYW5zcG9ydCBvcHRpb246ICcke3R9J2BcbiAgICApO1xuICAgIHVzZXJBc3NlcnQodHlwZW9mIHRyYW5zcG9ydFt0XSA9PSAnYm9vbGVhbicpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyBhbiBhcnJheSBvZiBmaWx0ZXJzLlxuICogQHBhcmFtIHshSnNvbk9iamVjdH0gZmlsdGVyc1xuICovXG5mdW5jdGlvbiBhc3NlcnRGaWx0ZXJzKGZpbHRlcnMpIHtcbiAgY29uc3QgdmFsaWRGaWx0ZXJzID0gW1xuICAgIEZpbHRlclR5cGUuQ0xJQ0tfREVMQVksXG4gICAgRmlsdGVyVHlwZS5DTElDS19MT0NBVElPTixcbiAgICBGaWx0ZXJUeXBlLklOQUNUSVZFX0VMRU1FTlQsXG4gIF07XG4gIGZvciAoY29uc3QgbmFtZSBpbiBmaWx0ZXJzKSB7XG4gICAgdXNlckFzc2VydChcbiAgICAgIHR5cGVvZiBmaWx0ZXJzW25hbWVdID09ICdvYmplY3QnLFxuICAgICAgXCJGaWx0ZXIgc3BlY2lmaWNhdGlvbiAnJXMnIGlzIG1hbGZvcm1lZFwiLFxuICAgICAgbmFtZVxuICAgICk7XG4gICAgdXNlckFzc2VydChcbiAgICAgIHZhbGlkRmlsdGVycy5pbmRleE9mKGZpbHRlcnNbbmFtZV0udHlwZSkgIT0gLTEsXG4gICAgICAnU3VwcG9ydGVkIGZpbHRlcnM6ICcgKyB2YWxpZEZpbHRlcnMuam9pbignLCAnKVxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRhcmdldHMgYW5kIGl0cyBjb25maWdcbiAqXG4gKiBAcGFyYW0geyFKc29uT2JqZWN0fSB0YXJnZXRzXG4gKiBAcGFyYW0geyFKc29uT2JqZWN0fSBjb25maWdcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0VGFyZ2V0cyh0YXJnZXRzLCBjb25maWcpIHtcbiAgdXNlckFzc2VydCh0eXBlb2YgdGFyZ2V0cyA9PSAnb2JqZWN0JywgXCIndGFyZ2V0cycgbXVzdCBiZSBhbiBvYmplY3RcIik7XG4gIGZvciAoY29uc3QgdGFyZ2V0IGluIHRhcmdldHMpIHtcbiAgICBhc3NlcnRUYXJnZXQodGFyZ2V0LCB0YXJnZXRzW3RhcmdldF0sIGNvbmZpZyk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRhcmdldFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0geyFKc29uT2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICovXG5mdW5jdGlvbiBhc3NlcnRUYXJnZXQobmFtZSwgdGFyZ2V0LCBjb25maWcpIHtcbiAgdXNlckFzc2VydChcbiAgICB0eXBlb2YgdGFyZ2V0WydmaW5hbFVybCddID09ICdzdHJpbmcnLFxuICAgIFwiZmluYWxVcmwgb2YgdGFyZ2V0ICclcycgbXVzdCBiZSBhIHN0cmluZ1wiLFxuICAgIG5hbWVcbiAgKTtcbiAgaWYgKHRhcmdldFsnZmlsdGVycyddKSB7XG4gICAgLyoqIEB0eXBlIHshQXJyYXl9ICovICh0YXJnZXRbJ2ZpbHRlcnMnXSkuZm9yRWFjaCgoZmlsdGVyKSA9PiB7XG4gICAgICB1c2VyQXNzZXJ0KGNvbmZpZ1snZmlsdGVycyddW2ZpbHRlcl0sIFwiZmlsdGVyICclcycgbm90IGRlZmluZWRcIiwgZmlsdGVyKTtcbiAgICB9KTtcbiAgfVxuICBpZiAodGFyZ2V0Wyd2YXJzJ10pIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gL15fW2EtekEtWjAtOV8tXSskLztcbiAgICBmb3IgKGNvbnN0IHZhcmlhYmxlIGluIHRhcmdldFsndmFycyddKSB7XG4gICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICBwYXR0ZXJuLnRlc3QodmFyaWFibGUpLFxuICAgICAgICBcIiclcycgbXVzdCBtYXRjaCB0aGUgcGF0dGVybiAnJXMnXCIsXG4gICAgICAgIHZhcmlhYmxlLFxuICAgICAgICBwYXR0ZXJuXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmVuZG9yIGlzIHZhbGlkIChpLmUuIGxpc3RlZCBpbiB2ZW5kb3JzLmpzIGFuZCBoYXNcbiAqIHRyYW5zcG9ydC9pZnJhbWUgZGVmaW5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZW5kb3IgVGhlIHZlbmRvciBuYW1lIHRoYXQgc2hvdWxkIGJlIGxpc3RlZCBpbiB2ZW5kb3JzLmpzXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSB2ZW5kb3IncyBpZnJhbWUgVVJMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWZW5kb3IodmVuZG9yKSB7XG4gIHJldHVybiB1c2VyKCkuYXNzZXJ0U3RyaW5nKFxuICAgIElGUkFNRV9UUkFOU1BPUlRTW3ZlbmRvcl0sXG4gICAgYFVua25vd24gb3IgaW52YWxpZCB2ZW5kb3IgJHt2ZW5kb3J9LCBgICtcbiAgICAgICdub3RlIHRoYXQgdmVuZG9yIG11c3QgdXNlIHRyYW5zcG9ydDogaWZyYW1lJ1xuICApO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-ad-exit/0.1/config.js