function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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

/**
 * Vendors who have IAB viewability certification may use iframe transport
 * (see ../amp-analytics.md and ../integrating-analytics.md). In this case,
 * put only the specification of the iframe location in the object below.
 *
 * This object is separated from vendors.js to be shared with extensions
 * other than amp-analytics, for instance amp-ad-exit.
 *
 * @const {!Object}
 */
var prodConfig = {
  'bg': 'https://tpc.googlesyndication.com/b4a/b4a-runner.html',
  'moat': 'https://z.moatads.com/ampanalytics093284/iframe.html'
};

/**
 * Canary config override
 *
 * @const {!Object}
 */
var canaryConfig = _extends({}, prodConfig, {
  'bg': 'https://tpc.googlesyndication.com/b4a/experimental/b4a-runner.html'
});

export var IFRAME_TRANSPORTS =
/** @type {!JsonObject} */
prodConfig;
export var IFRAME_TRANSPORTS_CANARY =
/** @type {!JsonObject} */
canaryConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlmcmFtZS10cmFuc3BvcnQtdmVuZG9ycy5qcyJdLCJuYW1lcyI6WyJwcm9kQ29uZmlnIiwiY2FuYXJ5Q29uZmlnIiwiSUZSQU1FX1RSQU5TUE9SVFMiLCJJRlJBTUVfVFJBTlNQT1JUU19DQU5BUlkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsVUFBVSxHQUFHO0FBQ2pCLFFBQU0sdURBRFc7QUFFakIsVUFBUTtBQUZTLENBQW5COztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxZQUFZLGdCQUNiRCxVQURhO0FBRWhCLFFBQU07QUFGVSxFQUFsQjs7QUFLQSxPQUFPLElBQU1FLGlCQUFpQjtBQUFHO0FBQTRCRixVQUF0RDtBQUNQLE9BQU8sSUFBTUcsd0JBQXdCO0FBQUc7QUFDdENGLFlBREsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBWZW5kb3JzIHdobyBoYXZlIElBQiB2aWV3YWJpbGl0eSBjZXJ0aWZpY2F0aW9uIG1heSB1c2UgaWZyYW1lIHRyYW5zcG9ydFxuICogKHNlZSAuLi9hbXAtYW5hbHl0aWNzLm1kIGFuZCAuLi9pbnRlZ3JhdGluZy1hbmFseXRpY3MubWQpLiBJbiB0aGlzIGNhc2UsXG4gKiBwdXQgb25seSB0aGUgc3BlY2lmaWNhdGlvbiBvZiB0aGUgaWZyYW1lIGxvY2F0aW9uIGluIHRoZSBvYmplY3QgYmVsb3cuXG4gKlxuICogVGhpcyBvYmplY3QgaXMgc2VwYXJhdGVkIGZyb20gdmVuZG9ycy5qcyB0byBiZSBzaGFyZWQgd2l0aCBleHRlbnNpb25zXG4gKiBvdGhlciB0aGFuIGFtcC1hbmFseXRpY3MsIGZvciBpbnN0YW5jZSBhbXAtYWQtZXhpdC5cbiAqXG4gKiBAY29uc3QgeyFPYmplY3R9XG4gKi9cbmNvbnN0IHByb2RDb25maWcgPSB7XG4gICdiZyc6ICdodHRwczovL3RwYy5nb29nbGVzeW5kaWNhdGlvbi5jb20vYjRhL2I0YS1ydW5uZXIuaHRtbCcsXG4gICdtb2F0JzogJ2h0dHBzOi8vei5tb2F0YWRzLmNvbS9hbXBhbmFseXRpY3MwOTMyODQvaWZyYW1lLmh0bWwnLFxufTtcbi8qKlxuICogQ2FuYXJ5IGNvbmZpZyBvdmVycmlkZVxuICpcbiAqIEBjb25zdCB7IU9iamVjdH1cbiAqL1xuY29uc3QgY2FuYXJ5Q29uZmlnID0ge1xuICAuLi5wcm9kQ29uZmlnLFxuICAnYmcnOiAnaHR0cHM6Ly90cGMuZ29vZ2xlc3luZGljYXRpb24uY29tL2I0YS9leHBlcmltZW50YWwvYjRhLXJ1bm5lci5odG1sJyxcbn07XG5cbmV4cG9ydCBjb25zdCBJRlJBTUVfVFJBTlNQT1JUUyA9IC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovIChwcm9kQ29uZmlnKTtcbmV4cG9ydCBjb25zdCBJRlJBTUVfVFJBTlNQT1JUU19DQU5BUlkgPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoXG4gIGNhbmFyeUNvbmZpZ1xuKTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/iframe-transport-vendors.js