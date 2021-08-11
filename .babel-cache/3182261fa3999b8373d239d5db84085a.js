var _templateObject, _templateObject2;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

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
import { removeElement } from "../../core/dom";
import { htmlFor } from "../../core/dom/static-template";
import { dev } from "../../log";

/**
 * @param {!Element} node
 * @return {!Element}
 */
function cloneDeep(node) {
  return dev().assertElement(node.cloneNode(
  /* deep */
  true));
}

/**
 * @param {!Element|!Document} elOrDoc
 * @param {?{title: (string|undefined)}=} metadata
 * @return {!Element}
 */
export function renderInteractionOverlay(elOrDoc, metadata) {
  var html = htmlFor(elOrDoc);
  var element = html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <button\n      aria-label=\"Unmute video\"\n      class=\"i-amphtml-video-mask i-amphtml-fill-content\"\n      tabindex=\"0\"\n    ></button>\n  "])));

  if (metadata && metadata.title) {
    element.setAttribute('aria-label', metadata.title);
  }

  return element;
}

/**
 * @param {!Window} win
 * @param {!Element|!Document} elOrDoc
 * @return {!Element}
 */
export function renderIcon(win, elOrDoc) {
  var html = htmlFor(elOrDoc);
  var icon = html(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n    <i-amphtml-video-icon class=\"amp-video-eq\">\n      <div class=\"amp-video-eq-col\">\n        <div class=\"amp-video-eq-filler\"></div>\n        <div class=\"amp-video-eq-filler\"></div>\n      </div>\n    </i-amphtml-video-icon>\n  "])));
  // Copy equalizer column 4x and annotate filler positions for animation.
  var firstCol = dev().assertElement(icon.firstElementChild);

  for (var i = 0; i < 4; i++) {
    var col = cloneDeep(firstCol);
    var fillers = col.children;

    for (var j = 0; j < fillers.length; j++) {
      var filler = fillers[j];
      filler.classList.add("amp-video-eq-" + (i + 1) + "-" + (j + 1));
    }

    icon.appendChild(col);
  }

  // Remove seed column.
  removeElement(firstCol);
  return icon;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1dG9wbGF5LmpzIl0sIm5hbWVzIjpbInJlbW92ZUVsZW1lbnQiLCJodG1sRm9yIiwiZGV2IiwiY2xvbmVEZWVwIiwibm9kZSIsImFzc2VydEVsZW1lbnQiLCJjbG9uZU5vZGUiLCJyZW5kZXJJbnRlcmFjdGlvbk92ZXJsYXkiLCJlbE9yRG9jIiwibWV0YWRhdGEiLCJodG1sIiwiZWxlbWVudCIsInRpdGxlIiwic2V0QXR0cmlidXRlIiwicmVuZGVySWNvbiIsIndpbiIsImljb24iLCJmaXJzdENvbCIsImZpcnN0RWxlbWVudENoaWxkIiwiaSIsImNvbCIsImZpbGxlcnMiLCJjaGlsZHJlbiIsImoiLCJsZW5ndGgiLCJmaWxsZXIiLCJjbGFzc0xpc3QiLCJhZGQiLCJhcHBlbmRDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLGFBQVI7QUFDQSxTQUFRQyxPQUFSO0FBRUEsU0FBUUMsR0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLFNBQVQsQ0FBbUJDLElBQW5CLEVBQXlCO0FBQ3ZCLFNBQU9GLEdBQUcsR0FBR0csYUFBTixDQUFvQkQsSUFBSSxDQUFDRSxTQUFMO0FBQWU7QUFBVyxNQUExQixDQUFwQixDQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0Msd0JBQVQsQ0FBa0NDLE9BQWxDLEVBQTJDQyxRQUEzQyxFQUFxRDtBQUMxRCxNQUFNQyxJQUFJLEdBQUdULE9BQU8sQ0FBQ08sT0FBRCxDQUFwQjtBQUNBLE1BQU1HLE9BQU8sR0FBR0QsSUFBSCxpT0FBYjs7QUFPQSxNQUFJRCxRQUFRLElBQUlBLFFBQVEsQ0FBQ0csS0FBekIsRUFBZ0M7QUFDOUJELElBQUFBLE9BQU8sQ0FBQ0UsWUFBUixDQUFxQixZQUFyQixFQUFtQ0osUUFBUSxDQUFDRyxLQUE1QztBQUNEOztBQUNELFNBQU9ELE9BQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRyxVQUFULENBQW9CQyxHQUFwQixFQUF5QlAsT0FBekIsRUFBa0M7QUFDdkMsTUFBTUUsSUFBSSxHQUFHVCxPQUFPLENBQUNPLE9BQUQsQ0FBcEI7QUFDQSxNQUFNUSxJQUFJLEdBQUdOLElBQUgsNFRBQVY7QUFTQTtBQUNBLE1BQU1PLFFBQVEsR0FBR2YsR0FBRyxHQUFHRyxhQUFOLENBQW9CVyxJQUFJLENBQUNFLGlCQUF6QixDQUFqQjs7QUFDQSxPQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsQ0FBcEIsRUFBdUJBLENBQUMsRUFBeEIsRUFBNEI7QUFDMUIsUUFBTUMsR0FBRyxHQUFHakIsU0FBUyxDQUFDYyxRQUFELENBQXJCO0FBQ0EsUUFBTUksT0FBTyxHQUFHRCxHQUFHLENBQUNFLFFBQXBCOztBQUNBLFNBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0YsT0FBTyxDQUFDRyxNQUE1QixFQUFvQ0QsQ0FBQyxFQUFyQyxFQUF5QztBQUN2QyxVQUFNRSxNQUFNLEdBQUdKLE9BQU8sQ0FBQ0UsQ0FBRCxDQUF0QjtBQUNBRSxNQUFBQSxNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLEdBQWpCLG9CQUFxQ1IsQ0FBQyxHQUFHLENBQXpDLFdBQThDSSxDQUFDLEdBQUcsQ0FBbEQ7QUFDRDs7QUFDRFAsSUFBQUEsSUFBSSxDQUFDWSxXQUFMLENBQWlCUixHQUFqQjtBQUNEOztBQUVEO0FBQ0FwQixFQUFBQSxhQUFhLENBQUNpQixRQUFELENBQWI7QUFFQSxTQUFPRCxJQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtyZW1vdmVFbGVtZW50fSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcblxuaW1wb3J0IHtkZXZ9IGZyb20gJy4uLy4uL2xvZyc7XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudH0gbm9kZVxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIGNsb25lRGVlcChub2RlKSB7XG4gIHJldHVybiBkZXYoKS5hc3NlcnRFbGVtZW50KG5vZGUuY2xvbmVOb2RlKC8qIGRlZXAgKi8gdHJ1ZSkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR8IURvY3VtZW50fSBlbE9yRG9jXG4gKiBAcGFyYW0gez97dGl0bGU6IChzdHJpbmd8dW5kZWZpbmVkKX09fSBtZXRhZGF0YVxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJJbnRlcmFjdGlvbk92ZXJsYXkoZWxPckRvYywgbWV0YWRhdGEpIHtcbiAgY29uc3QgaHRtbCA9IGh0bWxGb3IoZWxPckRvYyk7XG4gIGNvbnN0IGVsZW1lbnQgPSBodG1sYFxuICAgIDxidXR0b25cbiAgICAgIGFyaWEtbGFiZWw9XCJVbm11dGUgdmlkZW9cIlxuICAgICAgY2xhc3M9XCJpLWFtcGh0bWwtdmlkZW8tbWFzayBpLWFtcGh0bWwtZmlsbC1jb250ZW50XCJcbiAgICAgIHRhYmluZGV4PVwiMFwiXG4gICAgPjwvYnV0dG9uPlxuICBgO1xuICBpZiAobWV0YWRhdGEgJiYgbWV0YWRhdGEudGl0bGUpIHtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIG1ldGFkYXRhLnRpdGxlKTtcbiAgfVxuICByZXR1cm4gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshRWxlbWVudHwhRG9jdW1lbnR9IGVsT3JEb2NcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVySWNvbih3aW4sIGVsT3JEb2MpIHtcbiAgY29uc3QgaHRtbCA9IGh0bWxGb3IoZWxPckRvYyk7XG4gIGNvbnN0IGljb24gPSBodG1sYFxuICAgIDxpLWFtcGh0bWwtdmlkZW8taWNvbiBjbGFzcz1cImFtcC12aWRlby1lcVwiPlxuICAgICAgPGRpdiBjbGFzcz1cImFtcC12aWRlby1lcS1jb2xcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFtcC12aWRlby1lcS1maWxsZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImFtcC12aWRlby1lcS1maWxsZXJcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvaS1hbXBodG1sLXZpZGVvLWljb24+XG4gIGA7XG5cbiAgLy8gQ29weSBlcXVhbGl6ZXIgY29sdW1uIDR4IGFuZCBhbm5vdGF0ZSBmaWxsZXIgcG9zaXRpb25zIGZvciBhbmltYXRpb24uXG4gIGNvbnN0IGZpcnN0Q29sID0gZGV2KCkuYXNzZXJ0RWxlbWVudChpY29uLmZpcnN0RWxlbWVudENoaWxkKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICBjb25zdCBjb2wgPSBjbG9uZURlZXAoZmlyc3RDb2wpO1xuICAgIGNvbnN0IGZpbGxlcnMgPSBjb2wuY2hpbGRyZW47XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBmaWxsZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBmaWxsZXIgPSBmaWxsZXJzW2pdO1xuICAgICAgZmlsbGVyLmNsYXNzTGlzdC5hZGQoYGFtcC12aWRlby1lcS0ke2kgKyAxfS0ke2ogKyAxfWApO1xuICAgIH1cbiAgICBpY29uLmFwcGVuZENoaWxkKGNvbCk7XG4gIH1cblxuICAvLyBSZW1vdmUgc2VlZCBjb2x1bW4uXG4gIHJlbW92ZUVsZW1lbnQoZmlyc3RDb2wpO1xuXG4gIHJldHVybiBpY29uO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/video/autoplay.js