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
import { LayoutRectDef, layoutRectLtwh } from "./rect";

/**
 * @param {!Element} element
 * @return {!LayoutRectDef}
 */
export function getPageLayoutBoxBlocking(element) {
  var stop = element.ownerDocument.body;
  var left = 0;
  var top = 0;

  for (var n = element; n && n != stop; n = n.
  /*OK*/
  offsetParent) {
    left += n.
    /*OK*/
    offsetLeft;
    top += n.
    /*OK*/
    offsetTop;
  }

  var offsetHeight =
  /** @type {!HTMLElement} */
  element.offsetHeight,
      offsetWidth =
  /** @type {!HTMLElement} */
  element.offsetWidth;
  return layoutRectLtwh(left, top, offsetWidth, offsetHeight);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtbGF5b3V0LWJveC5qcyJdLCJuYW1lcyI6WyJMYXlvdXRSZWN0RGVmIiwibGF5b3V0UmVjdEx0d2giLCJnZXRQYWdlTGF5b3V0Qm94QmxvY2tpbmciLCJlbGVtZW50Iiwic3RvcCIsIm93bmVyRG9jdW1lbnQiLCJib2R5IiwibGVmdCIsInRvcCIsIm4iLCJvZmZzZXRQYXJlbnQiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0Iiwib2Zmc2V0V2lkdGgiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLGFBQVIsRUFBdUJDLGNBQXZCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyx3QkFBVCxDQUFrQ0MsT0FBbEMsRUFBMkM7QUFDaEQsTUFBTUMsSUFBSSxHQUFHRCxPQUFPLENBQUNFLGFBQVIsQ0FBc0JDLElBQW5DO0FBQ0EsTUFBSUMsSUFBSSxHQUFHLENBQVg7QUFDQSxNQUFJQyxHQUFHLEdBQUcsQ0FBVjs7QUFDQSxPQUFLLElBQUlDLENBQUMsR0FBR04sT0FBYixFQUFzQk0sQ0FBQyxJQUFJQSxDQUFDLElBQUlMLElBQWhDLEVBQXNDSyxDQUFDLEdBQUdBLENBQUM7QUFBQztBQUFPQyxFQUFBQSxZQUFuRCxFQUFpRTtBQUMvREgsSUFBQUEsSUFBSSxJQUFJRSxDQUFDO0FBQUM7QUFBT0UsSUFBQUEsVUFBakI7QUFDQUgsSUFBQUEsR0FBRyxJQUFJQyxDQUFDO0FBQUM7QUFBT0csSUFBQUEsU0FBaEI7QUFDRDs7QUFDRCxNQUFPQyxZQUFQO0FBQW9DO0FBQTZCVixFQUFBQSxPQUFqRSxDQUFPVSxZQUFQO0FBQUEsTUFBcUJDLFdBQXJCO0FBQW9DO0FBQTZCWCxFQUFBQSxPQUFqRSxDQUFxQlcsV0FBckI7QUFDQSxTQUFPYixjQUFjLENBQUNNLElBQUQsRUFBT0MsR0FBUCxFQUFZTSxXQUFaLEVBQXlCRCxZQUF6QixDQUFyQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7TGF5b3V0UmVjdERlZiwgbGF5b3V0UmVjdEx0d2h9IGZyb20gJy4vcmVjdCc7XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IUxheW91dFJlY3REZWZ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYWdlTGF5b3V0Qm94QmxvY2tpbmcoZWxlbWVudCkge1xuICBjb25zdCBzdG9wID0gZWxlbWVudC5vd25lckRvY3VtZW50LmJvZHk7XG4gIGxldCBsZWZ0ID0gMDtcbiAgbGV0IHRvcCA9IDA7XG4gIGZvciAobGV0IG4gPSBlbGVtZW50OyBuICYmIG4gIT0gc3RvcDsgbiA9IG4uLypPSyovIG9mZnNldFBhcmVudCkge1xuICAgIGxlZnQgKz0gbi4vKk9LKi8gb2Zmc2V0TGVmdDtcbiAgICB0b3AgKz0gbi4vKk9LKi8gb2Zmc2V0VG9wO1xuICB9XG4gIGNvbnN0IHtvZmZzZXRIZWlnaHQsIG9mZnNldFdpZHRofSA9IC8qKiBAdHlwZSB7IUhUTUxFbGVtZW50fSAqLyAoZWxlbWVudCk7XG4gIHJldHVybiBsYXlvdXRSZWN0THR3aChsZWZ0LCB0b3AsIG9mZnNldFdpZHRoLCBvZmZzZXRIZWlnaHQpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/dom/layout/page-layout-box.js