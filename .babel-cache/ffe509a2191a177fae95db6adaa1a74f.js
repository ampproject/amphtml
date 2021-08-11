function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { devAssert } from "./log";
import { Services } from "./service";
import { getServicePromise } from "./service-helpers";

/**
 * A map of services that delay rendering. The key is the name of the service
 * and the value is a DOM query which is used to check if the service is needed
 * in the current document.
 * Do not add a service unless absolutely necessary.
 *
 * \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  / _____|
 *  \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
 *   \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
 *    \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
 *     \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|
 *
 * The equivalent of this list is used for server-side rendering (SSR) and any
 * changes made to it must be made in coordination with caches that implement
 * SSR. For more information on SSR see bit.ly/amp-ssr.
 *
 * @const {!Object<string, string>}
 */
var SERVICES = {
  'amp-dynamic-css-classes': '[custom-element=amp-dynamic-css-classes]',
  'variant': 'amp-experiment',
  'amp-story-render': 'amp-story[standalone]'
};

/**
 * Base class for render delaying services.
 * This should be extended to ensure the service
 * is properly handled
 *
 * @interface
 */
export var RenderDelayingService = /*#__PURE__*/function () {
  function RenderDelayingService() {
    _classCallCheck(this, RenderDelayingService);
  }

  _createClass(RenderDelayingService, [{
    key: "whenReady",
    value:
    /**
     * Function to return a promise for when
     * it is finished delaying render, and is ready.
     * NOTE: This should simply return Promise.resolve,
     * if your service does not need to perform any logic
     * after being registered.
     * @return {!Promise}
     */
    function whenReady() {}
  }]);

  return RenderDelayingService;
}();

/**
 * Maximum milliseconds to wait for all extensions to load before erroring.
 * @const
 */
var LOAD_TIMEOUT = 3000;

/**
 * Detects any render delaying services that are required on the page, and
 * returns a promise with a timeout.
 * @param {!Window} win
 * @return {!Promise<!Array<*>>} resolves to an Array that has the same length
 *     as the detected render delaying services
 */
export function waitForServices(win) {
  var promises = includedServices(win).map(function (serviceId) {
    var serviceReadyPromise = getServicePromise(win, serviceId).then(function (service) {
      if (service && isRenderDelayingService(service)) {
        return service.whenReady().then(function () {
          return service;
        });
      }

      return service;
    });
    return Services.timerFor(win).timeoutPromise(LOAD_TIMEOUT, serviceReadyPromise, "Render timeout waiting for service " + serviceId + " to be ready.");
  });
  return Promise.all(promises);
}

/**
 * Returns true if the page has a render delaying service.
 * @param {!Window} win
 * @return {boolean}
 */
export function hasRenderDelayingServices(win) {
  return includedServices(win).length > 0;
}

/**
 * Function to determine if the passed
 * Object is a Render Delaying Service
 * @param {!Object} service
 * @return {boolean}
 */
export function isRenderDelayingService(service) {
  var maybeRenderDelayingService =
  /** @type {!RenderDelayingService}*/
  service;
  return typeof maybeRenderDelayingService.whenReady == 'function';
}

/**
 * Detects which, if any, render-delaying extensions are included on the page.
 * @param {!Window} win
 * @return {!Array<string>}
 */
export function includedServices(win) {
  /** @const {!Document} */
  var doc = win.document;
  devAssert(doc.body);
  return Object.keys(SERVICES).filter(function (service) {
    return doc.querySelector(SERVICES[service]);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlci1kZWxheWluZy1zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6WyJkZXZBc3NlcnQiLCJTZXJ2aWNlcyIsImdldFNlcnZpY2VQcm9taXNlIiwiU0VSVklDRVMiLCJSZW5kZXJEZWxheWluZ1NlcnZpY2UiLCJMT0FEX1RJTUVPVVQiLCJ3YWl0Rm9yU2VydmljZXMiLCJ3aW4iLCJwcm9taXNlcyIsImluY2x1ZGVkU2VydmljZXMiLCJtYXAiLCJzZXJ2aWNlSWQiLCJzZXJ2aWNlUmVhZHlQcm9taXNlIiwidGhlbiIsInNlcnZpY2UiLCJpc1JlbmRlckRlbGF5aW5nU2VydmljZSIsIndoZW5SZWFkeSIsInRpbWVyRm9yIiwidGltZW91dFByb21pc2UiLCJQcm9taXNlIiwiYWxsIiwiaGFzUmVuZGVyRGVsYXlpbmdTZXJ2aWNlcyIsImxlbmd0aCIsIm1heWJlUmVuZGVyRGVsYXlpbmdTZXJ2aWNlIiwiZG9jIiwiZG9jdW1lbnQiLCJib2R5IiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsInF1ZXJ5U2VsZWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsaUJBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsUUFBUSxHQUFHO0FBQ2YsNkJBQTJCLDBDQURaO0FBRWYsYUFBVyxnQkFGSTtBQUdmLHNCQUFvQjtBQUhMLENBQWpCOztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMscUJBQWI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFLHlCQUFZLENBQUU7QUFUaEI7O0FBQUE7QUFBQTs7QUFZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLFlBQVksR0FBRyxJQUFyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsZUFBVCxDQUF5QkMsR0FBekIsRUFBOEI7QUFDbkMsTUFBTUMsUUFBUSxHQUFHQyxnQkFBZ0IsQ0FBQ0YsR0FBRCxDQUFoQixDQUFzQkcsR0FBdEIsQ0FBMEIsVUFBQ0MsU0FBRCxFQUFlO0FBQ3hELFFBQU1DLG1CQUFtQixHQUFHVixpQkFBaUIsQ0FBQ0ssR0FBRCxFQUFNSSxTQUFOLENBQWpCLENBQWtDRSxJQUFsQyxDQUMxQixVQUFDQyxPQUFELEVBQWE7QUFDWCxVQUFJQSxPQUFPLElBQUlDLHVCQUF1QixDQUFDRCxPQUFELENBQXRDLEVBQWlEO0FBQy9DLGVBQU9BLE9BQU8sQ0FBQ0UsU0FBUixHQUFvQkgsSUFBcEIsQ0FBeUIsWUFBTTtBQUNwQyxpQkFBT0MsT0FBUDtBQUNELFNBRk0sQ0FBUDtBQUdEOztBQUNELGFBQU9BLE9BQVA7QUFDRCxLQVJ5QixDQUE1QjtBQVdBLFdBQU9iLFFBQVEsQ0FBQ2dCLFFBQVQsQ0FBa0JWLEdBQWxCLEVBQXVCVyxjQUF2QixDQUNMYixZQURLLEVBRUxPLG1CQUZLLDBDQUdpQ0QsU0FIakMsbUJBQVA7QUFLRCxHQWpCZ0IsQ0FBakI7QUFrQkEsU0FBT1EsT0FBTyxDQUFDQyxHQUFSLENBQVlaLFFBQVosQ0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNhLHlCQUFULENBQW1DZCxHQUFuQyxFQUF3QztBQUM3QyxTQUFPRSxnQkFBZ0IsQ0FBQ0YsR0FBRCxDQUFoQixDQUFzQmUsTUFBdEIsR0FBK0IsQ0FBdEM7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNQLHVCQUFULENBQWlDRCxPQUFqQyxFQUEwQztBQUMvQyxNQUFNUywwQkFBMEI7QUFBRztBQUNqQ1QsRUFBQUEsT0FERjtBQUdBLFNBQU8sT0FBT1MsMEJBQTBCLENBQUNQLFNBQWxDLElBQStDLFVBQXREO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU1AsZ0JBQVQsQ0FBMEJGLEdBQTFCLEVBQStCO0FBQ3BDO0FBQ0EsTUFBTWlCLEdBQUcsR0FBR2pCLEdBQUcsQ0FBQ2tCLFFBQWhCO0FBQ0F6QixFQUFBQSxTQUFTLENBQUN3QixHQUFHLENBQUNFLElBQUwsQ0FBVDtBQUVBLFNBQU9DLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZekIsUUFBWixFQUFzQjBCLE1BQXRCLENBQTZCLFVBQUNmLE9BQUQsRUFBYTtBQUMvQyxXQUFPVSxHQUFHLENBQUNNLGFBQUosQ0FBa0IzQixRQUFRLENBQUNXLE9BQUQsQ0FBMUIsQ0FBUDtBQUNELEdBRk0sQ0FBUDtBQUdEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7ZGV2QXNzZXJ0fSBmcm9tICcuL2xvZyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcuL3NlcnZpY2UnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlUHJvbWlzZX0gZnJvbSAnLi9zZXJ2aWNlLWhlbHBlcnMnO1xuXG4vKipcbiAqIEEgbWFwIG9mIHNlcnZpY2VzIHRoYXQgZGVsYXkgcmVuZGVyaW5nLiBUaGUga2V5IGlzIHRoZSBuYW1lIG9mIHRoZSBzZXJ2aWNlXG4gKiBhbmQgdGhlIHZhbHVlIGlzIGEgRE9NIHF1ZXJ5IHdoaWNoIGlzIHVzZWQgdG8gY2hlY2sgaWYgdGhlIHNlcnZpY2UgaXMgbmVlZGVkXG4gKiBpbiB0aGUgY3VycmVudCBkb2N1bWVudC5cbiAqIERvIG5vdCBhZGQgYSBzZXJ2aWNlIHVubGVzcyBhYnNvbHV0ZWx5IG5lY2Vzc2FyeS5cbiAqXG4gKiBcXCAgIFxcICAvICBcXCAgLyAgIC8gLyAgIFxcICAgICB8ICAgXyAgXFwgICAgIHwgIFxcIHwgIHwgfCAgfCB8ICBcXCB8ICB8ICAvIF9fX19ffFxuICogIFxcICAgXFwvICAgIFxcLyAgIC8gLyAgXiAgXFwgICAgfCAgfF8pICB8ICAgIHwgICBcXHwgIHwgfCAgfCB8ICAgXFx8ICB8IHwgIHwgIF9fXG4gKiAgIFxcICAgICAgICAgICAgLyAvICAvX1xcICBcXCAgIHwgICAgICAvICAgICB8ICAuIGAgIHwgfCAgfCB8ICAuIGAgIHwgfCAgfCB8XyB8XG4gKiAgICBcXCAgICAvXFwgICAgLyAvICBfX19fXyAgXFwgIHwgIHxcXCAgXFwtLS0tLnwgIHxcXCAgIHwgfCAgfCB8ICB8XFwgICB8IHwgIHxfX3wgfFxuICogICAgIFxcX18vICBcXF9fLyAvX18vICAgICBcXF9fXFwgfCBffCBgLl9fX19ffHxfX3wgXFxfX3wgfF9ffCB8X198IFxcX198ICBcXF9fX19fX3xcbiAqXG4gKiBUaGUgZXF1aXZhbGVudCBvZiB0aGlzIGxpc3QgaXMgdXNlZCBmb3Igc2VydmVyLXNpZGUgcmVuZGVyaW5nIChTU1IpIGFuZCBhbnlcbiAqIGNoYW5nZXMgbWFkZSB0byBpdCBtdXN0IGJlIG1hZGUgaW4gY29vcmRpbmF0aW9uIHdpdGggY2FjaGVzIHRoYXQgaW1wbGVtZW50XG4gKiBTU1IuIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIFNTUiBzZWUgYml0Lmx5L2FtcC1zc3IuXG4gKlxuICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAqL1xuY29uc3QgU0VSVklDRVMgPSB7XG4gICdhbXAtZHluYW1pYy1jc3MtY2xhc3Nlcyc6ICdbY3VzdG9tLWVsZW1lbnQ9YW1wLWR5bmFtaWMtY3NzLWNsYXNzZXNdJyxcbiAgJ3ZhcmlhbnQnOiAnYW1wLWV4cGVyaW1lbnQnLFxuICAnYW1wLXN0b3J5LXJlbmRlcic6ICdhbXAtc3Rvcnlbc3RhbmRhbG9uZV0nLFxufTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciByZW5kZXIgZGVsYXlpbmcgc2VydmljZXMuXG4gKiBUaGlzIHNob3VsZCBiZSBleHRlbmRlZCB0byBlbnN1cmUgdGhlIHNlcnZpY2VcbiAqIGlzIHByb3Blcmx5IGhhbmRsZWRcbiAqXG4gKiBAaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBSZW5kZXJEZWxheWluZ1NlcnZpY2Uge1xuICAvKipcbiAgICogRnVuY3Rpb24gdG8gcmV0dXJuIGEgcHJvbWlzZSBmb3Igd2hlblxuICAgKiBpdCBpcyBmaW5pc2hlZCBkZWxheWluZyByZW5kZXIsIGFuZCBpcyByZWFkeS5cbiAgICogTk9URTogVGhpcyBzaG91bGQgc2ltcGx5IHJldHVybiBQcm9taXNlLnJlc29sdmUsXG4gICAqIGlmIHlvdXIgc2VydmljZSBkb2VzIG5vdCBuZWVkIHRvIHBlcmZvcm0gYW55IGxvZ2ljXG4gICAqIGFmdGVyIGJlaW5nIHJlZ2lzdGVyZWQuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgd2hlblJlYWR5KCkge31cbn1cblxuLyoqXG4gKiBNYXhpbXVtIG1pbGxpc2Vjb25kcyB0byB3YWl0IGZvciBhbGwgZXh0ZW5zaW9ucyB0byBsb2FkIGJlZm9yZSBlcnJvcmluZy5cbiAqIEBjb25zdFxuICovXG5jb25zdCBMT0FEX1RJTUVPVVQgPSAzMDAwO1xuXG4vKipcbiAqIERldGVjdHMgYW55IHJlbmRlciBkZWxheWluZyBzZXJ2aWNlcyB0aGF0IGFyZSByZXF1aXJlZCBvbiB0aGUgcGFnZSwgYW5kXG4gKiByZXR1cm5zIGEgcHJvbWlzZSB3aXRoIGEgdGltZW91dC5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHshUHJvbWlzZTwhQXJyYXk8Kj4+fSByZXNvbHZlcyB0byBhbiBBcnJheSB0aGF0IGhhcyB0aGUgc2FtZSBsZW5ndGhcbiAqICAgICBhcyB0aGUgZGV0ZWN0ZWQgcmVuZGVyIGRlbGF5aW5nIHNlcnZpY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yU2VydmljZXMod2luKSB7XG4gIGNvbnN0IHByb21pc2VzID0gaW5jbHVkZWRTZXJ2aWNlcyh3aW4pLm1hcCgoc2VydmljZUlkKSA9PiB7XG4gICAgY29uc3Qgc2VydmljZVJlYWR5UHJvbWlzZSA9IGdldFNlcnZpY2VQcm9taXNlKHdpbiwgc2VydmljZUlkKS50aGVuKFxuICAgICAgKHNlcnZpY2UpID0+IHtcbiAgICAgICAgaWYgKHNlcnZpY2UgJiYgaXNSZW5kZXJEZWxheWluZ1NlcnZpY2Uoc2VydmljZSkpIHtcbiAgICAgICAgICByZXR1cm4gc2VydmljZS53aGVuUmVhZHkoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXJ2aWNlO1xuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gU2VydmljZXMudGltZXJGb3Iod2luKS50aW1lb3V0UHJvbWlzZShcbiAgICAgIExPQURfVElNRU9VVCxcbiAgICAgIHNlcnZpY2VSZWFkeVByb21pc2UsXG4gICAgICBgUmVuZGVyIHRpbWVvdXQgd2FpdGluZyBmb3Igc2VydmljZSAke3NlcnZpY2VJZH0gdG8gYmUgcmVhZHkuYFxuICAgICk7XG4gIH0pO1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcGFnZSBoYXMgYSByZW5kZXIgZGVsYXlpbmcgc2VydmljZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzUmVuZGVyRGVsYXlpbmdTZXJ2aWNlcyh3aW4pIHtcbiAgcmV0dXJuIGluY2x1ZGVkU2VydmljZXMod2luKS5sZW5ndGggPiAwO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiB0aGUgcGFzc2VkXG4gKiBPYmplY3QgaXMgYSBSZW5kZXIgRGVsYXlpbmcgU2VydmljZVxuICogQHBhcmFtIHshT2JqZWN0fSBzZXJ2aWNlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZW5kZXJEZWxheWluZ1NlcnZpY2Uoc2VydmljZSkge1xuICBjb25zdCBtYXliZVJlbmRlckRlbGF5aW5nU2VydmljZSA9IC8qKiBAdHlwZSB7IVJlbmRlckRlbGF5aW5nU2VydmljZX0qLyAoXG4gICAgc2VydmljZVxuICApO1xuICByZXR1cm4gdHlwZW9mIG1heWJlUmVuZGVyRGVsYXlpbmdTZXJ2aWNlLndoZW5SZWFkeSA9PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIERldGVjdHMgd2hpY2gsIGlmIGFueSwgcmVuZGVyLWRlbGF5aW5nIGV4dGVuc2lvbnMgYXJlIGluY2x1ZGVkIG9uIHRoZSBwYWdlLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4geyFBcnJheTxzdHJpbmc+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5jbHVkZWRTZXJ2aWNlcyh3aW4pIHtcbiAgLyoqIEBjb25zdCB7IURvY3VtZW50fSAqL1xuICBjb25zdCBkb2MgPSB3aW4uZG9jdW1lbnQ7XG4gIGRldkFzc2VydChkb2MuYm9keSk7XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKFNFUlZJQ0VTKS5maWx0ZXIoKHNlcnZpY2UpID0+IHtcbiAgICByZXR1cm4gZG9jLnF1ZXJ5U2VsZWN0b3IoU0VSVklDRVNbc2VydmljZV0pO1xuICB9KTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/render-delaying-services.js