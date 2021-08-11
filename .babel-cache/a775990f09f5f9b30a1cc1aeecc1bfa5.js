/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import { createElementWithAttributes, escapeHtml } from "../../../src/core/dom";
import { dict } from "../../../src/core/types/object";
import { getFieSafeScriptSrcs } from "../../../src/friendly-iframe-embed";
// If making changes also change ALLOWED_FONT_REGEX in head-validation.js

/** @const {string} */
var fontProviderAllowList = ['https://cdn.materialdesignicons.com', 'https://cloud.typography.com', 'https://fast.fonts.net', 'https://fonts.googleapis.com', 'https://maxcdn.bootstrapcdn.com', 'https://p.typekit.net', 'https://pro.fontawesome.com', 'https://use.fontawesome.com', 'https://use.typekit.net'].join(' ');

/** @const {string} */
var sandboxVals = 'allow-forms ' + 'allow-popups ' + 'allow-popups-to-escape-sandbox ' + 'allow-same-origin ' + 'allow-scripts ' + 'allow-top-navigation';

/**
 * Create the starting html for all FIE ads. If streaming is supported body will be
 * piped in later.
 * @param {string} url
 * @param {string} sanitizedHeadElements
 * @param {string} body
 * @return {string}
 */
export var createSecureDocSkeleton = function createSecureDocSkeleton(url, sanitizedHeadElements, body) {
  return "<!DOCTYPE html>\n  <html \u26A14ads lang=\"en\">\n  <head>\n    <base href=\"" + escapeHtml(url) + "\">\n    <meta charset=\"UTF-8\">\n    <meta http-equiv=Content-Security-Policy content=\"\n      img-src * data:;\n      media-src *;\n      font-src *;\n      connect-src *;\n      script-src " + getFieSafeScriptSrcs() + ";\n      object-src 'none';\n      child-src 'none';\n      default-src 'none';\n      style-src " + fontProviderAllowList + " 'unsafe-inline';\n    \">\n    " + sanitizedHeadElements + "\n  </head>\n  <body>" + body + "</body>\n  </html>";
};

/**
 * Create iframe with predefined CSP and sandbox attributes for security.
 * @param {!Window} win
 * @param {string} title
 * @param {string} height
 * @param {string} width
 * @return {!HTMLIFrameElement}
 */
export function createSecureFrame(win, title, height, width) {
  var document = win.document;
  var iframe =
  /** @type {!HTMLIFrameElement} */
  createElementWithAttributes(document, 'iframe', dict({
    // NOTE: It is possible for either width or height to be 'auto',
    // a non-numeric value.
    'height': height,
    'width': width,
    'title': title,
    'frameborder': '0',
    'allowfullscreen': '',
    'allowtransparency': '',
    'scrolling': 'no',
    'sandbox': sandboxVals
  }));

  if (isAttributionReportingSupported(document)) {
    iframe.setAttribute('allow', "attribution-reporting 'src'");
  }

  return iframe;
}

/**
 * Determine if `attribution-reporting` API is available in browser.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isAttributionReportingSupported(doc) {
  var _doc$featurePolicy;

  return (_doc$featurePolicy = doc.featurePolicy) == null ? void 0 : _doc$featurePolicy.features().includes('attribution-reporting');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlY3VyZS1mcmFtZS5qcyJdLCJuYW1lcyI6WyJjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMiLCJlc2NhcGVIdG1sIiwiZGljdCIsImdldEZpZVNhZmVTY3JpcHRTcmNzIiwiZm9udFByb3ZpZGVyQWxsb3dMaXN0Iiwiam9pbiIsInNhbmRib3hWYWxzIiwiY3JlYXRlU2VjdXJlRG9jU2tlbGV0b24iLCJ1cmwiLCJzYW5pdGl6ZWRIZWFkRWxlbWVudHMiLCJib2R5IiwiY3JlYXRlU2VjdXJlRnJhbWUiLCJ3aW4iLCJ0aXRsZSIsImhlaWdodCIsIndpZHRoIiwiZG9jdW1lbnQiLCJpZnJhbWUiLCJpc0F0dHJpYnV0aW9uUmVwb3J0aW5nU3VwcG9ydGVkIiwic2V0QXR0cmlidXRlIiwiZG9jIiwiZmVhdHVyZVBvbGljeSIsImZlYXR1cmVzIiwiaW5jbHVkZXMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLDJCQUFSLEVBQXFDQyxVQUFyQztBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxvQkFBUjtBQUVBOztBQUNBO0FBQ0EsSUFBTUMscUJBQXFCLEdBQUcsQ0FDNUIscUNBRDRCLEVBRTVCLDhCQUY0QixFQUc1Qix3QkFINEIsRUFJNUIsOEJBSjRCLEVBSzVCLGlDQUw0QixFQU01Qix1QkFONEIsRUFPNUIsNkJBUDRCLEVBUTVCLDZCQVI0QixFQVM1Qix5QkFUNEIsRUFVNUJDLElBVjRCLENBVXZCLEdBVnVCLENBQTlCOztBQVlBO0FBQ0EsSUFBTUMsV0FBVyxHQUNmLGlCQUNBLGVBREEsR0FFQSxpQ0FGQSxHQUdBLG9CQUhBLEdBSUEsZ0JBSkEsR0FLQSxzQkFORjs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyx1QkFBdUIsR0FBRyxTQUExQkEsdUJBQTBCLENBQUNDLEdBQUQsRUFBTUMscUJBQU4sRUFBNkJDLElBQTdCO0FBQUEsMkZBSXJCVCxVQUFVLENBQUNPLEdBQUQsQ0FKVywwTUFXcEJMLG9CQUFvQixFQVhBLHlHQWVyQkMscUJBZnFCLHdDQWlCakNLLHFCQWpCaUMsNkJBbUI3QkMsSUFuQjZCO0FBQUEsQ0FBaEM7O0FBc0JQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLGlCQUFULENBQTJCQyxHQUEzQixFQUFnQ0MsS0FBaEMsRUFBdUNDLE1BQXZDLEVBQStDQyxLQUEvQyxFQUFzRDtBQUMzRCxNQUFPQyxRQUFQLEdBQW1CSixHQUFuQixDQUFPSSxRQUFQO0FBQ0EsTUFBTUMsTUFBTTtBQUFHO0FBQ2JqQixFQUFBQSwyQkFBMkIsQ0FDekJnQixRQUR5QixFQUV6QixRQUZ5QixFQUd6QmQsSUFBSSxDQUFDO0FBQ0g7QUFDQTtBQUNBLGNBQVVZLE1BSFA7QUFJSCxhQUFTQyxLQUpOO0FBS0gsYUFBU0YsS0FMTjtBQU1ILG1CQUFlLEdBTlo7QUFPSCx1QkFBbUIsRUFQaEI7QUFRSCx5QkFBcUIsRUFSbEI7QUFTSCxpQkFBYSxJQVRWO0FBVUgsZUFBV1A7QUFWUixHQUFELENBSHFCLENBRDdCOztBQW1CQSxNQUFJWSwrQkFBK0IsQ0FBQ0YsUUFBRCxDQUFuQyxFQUErQztBQUM3Q0MsSUFBQUEsTUFBTSxDQUFDRSxZQUFQLENBQW9CLE9BQXBCO0FBQ0Q7O0FBRUQsU0FBT0YsTUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLCtCQUFULENBQXlDRSxHQUF6QyxFQUE4QztBQUFBOztBQUNuRCwrQkFBT0EsR0FBRyxDQUFDQyxhQUFYLHFCQUFPLG1CQUFtQkMsUUFBbkIsR0FBOEJDLFFBQTlCLENBQXVDLHVCQUF2QyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMsIGVzY2FwZUh0bWx9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2dldEZpZVNhZmVTY3JpcHRTcmNzfSBmcm9tICcuLi8uLi8uLi9zcmMvZnJpZW5kbHktaWZyYW1lLWVtYmVkJztcblxuLy8gSWYgbWFraW5nIGNoYW5nZXMgYWxzbyBjaGFuZ2UgQUxMT1dFRF9GT05UX1JFR0VYIGluIGhlYWQtdmFsaWRhdGlvbi5qc1xuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgZm9udFByb3ZpZGVyQWxsb3dMaXN0ID0gW1xuICAnaHR0cHM6Ly9jZG4ubWF0ZXJpYWxkZXNpZ25pY29ucy5jb20nLFxuICAnaHR0cHM6Ly9jbG91ZC50eXBvZ3JhcGh5LmNvbScsXG4gICdodHRwczovL2Zhc3QuZm9udHMubmV0JyxcbiAgJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20nLFxuICAnaHR0cHM6Ly9tYXhjZG4uYm9vdHN0cmFwY2RuLmNvbScsXG4gICdodHRwczovL3AudHlwZWtpdC5uZXQnLFxuICAnaHR0cHM6Ly9wcm8uZm9udGF3ZXNvbWUuY29tJyxcbiAgJ2h0dHBzOi8vdXNlLmZvbnRhd2Vzb21lLmNvbScsXG4gICdodHRwczovL3VzZS50eXBla2l0Lm5ldCcsXG5dLmpvaW4oJyAnKTtcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3Qgc2FuZGJveFZhbHMgPVxuICAnYWxsb3ctZm9ybXMgJyArXG4gICdhbGxvdy1wb3B1cHMgJyArXG4gICdhbGxvdy1wb3B1cHMtdG8tZXNjYXBlLXNhbmRib3ggJyArXG4gICdhbGxvdy1zYW1lLW9yaWdpbiAnICtcbiAgJ2FsbG93LXNjcmlwdHMgJyArXG4gICdhbGxvdy10b3AtbmF2aWdhdGlvbic7XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBzdGFydGluZyBodG1sIGZvciBhbGwgRklFIGFkcy4gSWYgc3RyZWFtaW5nIGlzIHN1cHBvcnRlZCBib2R5IHdpbGwgYmVcbiAqIHBpcGVkIGluIGxhdGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHBhcmFtIHtzdHJpbmd9IHNhbml0aXplZEhlYWRFbGVtZW50c1xuICogQHBhcmFtIHtzdHJpbmd9IGJvZHlcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlY3VyZURvY1NrZWxldG9uID0gKHVybCwgc2FuaXRpemVkSGVhZEVsZW1lbnRzLCBib2R5KSA9PlxuICBgPCFET0NUWVBFIGh0bWw+XG4gIDxodG1sIOKaoTRhZHMgbGFuZz1cImVuXCI+XG4gIDxoZWFkPlxuICAgIDxiYXNlIGhyZWY9XCIke2VzY2FwZUh0bWwodXJsKX1cIj5cbiAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIj5cbiAgICA8bWV0YSBodHRwLWVxdWl2PUNvbnRlbnQtU2VjdXJpdHktUG9saWN5IGNvbnRlbnQ9XCJcbiAgICAgIGltZy1zcmMgKiBkYXRhOjtcbiAgICAgIG1lZGlhLXNyYyAqO1xuICAgICAgZm9udC1zcmMgKjtcbiAgICAgIGNvbm5lY3Qtc3JjICo7XG4gICAgICBzY3JpcHQtc3JjICR7Z2V0RmllU2FmZVNjcmlwdFNyY3MoKX07XG4gICAgICBvYmplY3Qtc3JjICdub25lJztcbiAgICAgIGNoaWxkLXNyYyAnbm9uZSc7XG4gICAgICBkZWZhdWx0LXNyYyAnbm9uZSc7XG4gICAgICBzdHlsZS1zcmMgJHtmb250UHJvdmlkZXJBbGxvd0xpc3R9ICd1bnNhZmUtaW5saW5lJztcbiAgICBcIj5cbiAgICAke3Nhbml0aXplZEhlYWRFbGVtZW50c31cbiAgPC9oZWFkPlxuICA8Ym9keT4ke2JvZHl9PC9ib2R5PlxuICA8L2h0bWw+YDtcblxuLyoqXG4gKiBDcmVhdGUgaWZyYW1lIHdpdGggcHJlZGVmaW5lZCBDU1AgYW5kIHNhbmRib3ggYXR0cmlidXRlcyBmb3Igc2VjdXJpdHkuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlXG4gKiBAcGFyYW0ge3N0cmluZ30gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ30gd2lkdGhcbiAqIEByZXR1cm4geyFIVE1MSUZyYW1lRWxlbWVudH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlY3VyZUZyYW1lKHdpbiwgdGl0bGUsIGhlaWdodCwgd2lkdGgpIHtcbiAgY29uc3Qge2RvY3VtZW50fSA9IHdpbjtcbiAgY29uc3QgaWZyYW1lID0gLyoqIEB0eXBlIHshSFRNTElGcmFtZUVsZW1lbnR9ICovIChcbiAgICBjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMoXG4gICAgICBkb2N1bWVudCxcbiAgICAgICdpZnJhbWUnLFxuICAgICAgZGljdCh7XG4gICAgICAgIC8vIE5PVEU6IEl0IGlzIHBvc3NpYmxlIGZvciBlaXRoZXIgd2lkdGggb3IgaGVpZ2h0IHRvIGJlICdhdXRvJyxcbiAgICAgICAgLy8gYSBub24tbnVtZXJpYyB2YWx1ZS5cbiAgICAgICAgJ2hlaWdodCc6IGhlaWdodCxcbiAgICAgICAgJ3dpZHRoJzogd2lkdGgsXG4gICAgICAgICd0aXRsZSc6IHRpdGxlLFxuICAgICAgICAnZnJhbWVib3JkZXInOiAnMCcsXG4gICAgICAgICdhbGxvd2Z1bGxzY3JlZW4nOiAnJyxcbiAgICAgICAgJ2FsbG93dHJhbnNwYXJlbmN5JzogJycsXG4gICAgICAgICdzY3JvbGxpbmcnOiAnbm8nLFxuICAgICAgICAnc2FuZGJveCc6IHNhbmRib3hWYWxzLFxuICAgICAgfSlcbiAgICApXG4gICk7XG5cbiAgaWYgKGlzQXR0cmlidXRpb25SZXBvcnRpbmdTdXBwb3J0ZWQoZG9jdW1lbnQpKSB7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnYWxsb3cnLCBgYXR0cmlidXRpb24tcmVwb3J0aW5nICdzcmMnYCk7XG4gIH1cblxuICByZXR1cm4gaWZyYW1lO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBgYXR0cmlidXRpb24tcmVwb3J0aW5nYCBBUEkgaXMgYXZhaWxhYmxlIGluIGJyb3dzZXIuXG4gKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBdHRyaWJ1dGlvblJlcG9ydGluZ1N1cHBvcnRlZChkb2MpIHtcbiAgcmV0dXJuIGRvYy5mZWF0dXJlUG9saWN5Py5mZWF0dXJlcygpLmluY2x1ZGVzKCdhdHRyaWJ1dGlvbi1yZXBvcnRpbmcnKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-a4a/0.1/secure-frame.js