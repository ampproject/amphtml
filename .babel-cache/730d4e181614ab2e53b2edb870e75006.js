var _templateObject;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

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
import { htmlFor } from "../../../src/core/dom/static-template";
import { map } from "../../../src/core/types/object";
import { user } from "../../../src/log";

/** @private Whether ids are deduplicated or not */
var deduplicatedIds = false;

/**
 * Deduplicates the interactive Ids, only called once
 * @param {!Document} doc
 */
export var deduplicateInteractiveIds = function deduplicateInteractiveIds(doc) {
  if (deduplicatedIds) {
    return;
  }

  deduplicatedIds = true;
  var interactiveEls = doc.querySelectorAll('amp-story-interactive-binary-poll, amp-story-interactive-poll, amp-story-interactive-quiz');
  var idsMap = map();

  for (var i = 0; i < interactiveEls.length; i++) {
    var currId = interactiveEls[i].id || 'interactive-id';

    if (idsMap[currId] === undefined) {
      idsMap[currId] = 0;
    } else {
      user().error('AMP-STORY-INTERACTIVE', "Duplicate interactive ID " + currId);
      var newId = currId + "__" + ++idsMap[currId];
      interactiveEls[i].id = newId;
    }
  }
};

/**
 * Generates the template for the image quizzes and polls.
 *
 * @param {!Element} element
 * @return {!Element}
 */
export var buildImgTemplate = function buildImgTemplate(element) {
  var html = htmlFor(element);
  return html(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n    <div\n      class=\"i-amphtml-story-interactive-img-container i-amphtml-story-interactive-container\"\n    >\n      <div class=\"i-amphtml-story-interactive-prompt-container\"></div>\n      <div class=\"i-amphtml-story-interactive-img-option-container\"></div>\n    </div>\n  "])));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbImh0bWxGb3IiLCJtYXAiLCJ1c2VyIiwiZGVkdXBsaWNhdGVkSWRzIiwiZGVkdXBsaWNhdGVJbnRlcmFjdGl2ZUlkcyIsImRvYyIsImludGVyYWN0aXZlRWxzIiwicXVlcnlTZWxlY3RvckFsbCIsImlkc01hcCIsImkiLCJsZW5ndGgiLCJjdXJySWQiLCJpZCIsInVuZGVmaW5lZCIsImVycm9yIiwibmV3SWQiLCJidWlsZEltZ1RlbXBsYXRlIiwiZWxlbWVudCIsImh0bWwiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxPQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLElBQVI7O0FBRUE7QUFDQSxJQUFJQyxlQUFlLEdBQUcsS0FBdEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLHlCQUF5QixHQUFHLFNBQTVCQSx5QkFBNEIsQ0FBQ0MsR0FBRCxFQUFTO0FBQ2hELE1BQUlGLGVBQUosRUFBcUI7QUFDbkI7QUFDRDs7QUFDREEsRUFBQUEsZUFBZSxHQUFHLElBQWxCO0FBQ0EsTUFBTUcsY0FBYyxHQUFHRCxHQUFHLENBQUNFLGdCQUFKLENBQ3JCLDJGQURxQixDQUF2QjtBQUdBLE1BQU1DLE1BQU0sR0FBR1AsR0FBRyxFQUFsQjs7QUFDQSxPQUFLLElBQUlRLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdILGNBQWMsQ0FBQ0ksTUFBbkMsRUFBMkNELENBQUMsRUFBNUMsRUFBZ0Q7QUFDOUMsUUFBTUUsTUFBTSxHQUFHTCxjQUFjLENBQUNHLENBQUQsQ0FBZCxDQUFrQkcsRUFBbEIsSUFBd0IsZ0JBQXZDOztBQUNBLFFBQUlKLE1BQU0sQ0FBQ0csTUFBRCxDQUFOLEtBQW1CRSxTQUF2QixFQUFrQztBQUNoQ0wsTUFBQUEsTUFBTSxDQUFDRyxNQUFELENBQU4sR0FBaUIsQ0FBakI7QUFDRCxLQUZELE1BRU87QUFDTFQsTUFBQUEsSUFBSSxHQUFHWSxLQUFQLENBQ0UsdUJBREYsZ0NBRThCSCxNQUY5QjtBQUlBLFVBQU1JLEtBQUssR0FBTUosTUFBTixVQUFpQixFQUFFSCxNQUFNLENBQUNHLE1BQUQsQ0FBcEM7QUFDQUwsTUFBQUEsY0FBYyxDQUFDRyxDQUFELENBQWQsQ0FBa0JHLEVBQWxCLEdBQXVCRyxLQUF2QjtBQUNEO0FBQ0Y7QUFDRixDQXRCTTs7QUF3QlA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQW1CLENBQUNDLE9BQUQsRUFBYTtBQUMzQyxNQUFNQyxJQUFJLEdBQUdsQixPQUFPLENBQUNpQixPQUFELENBQXBCO0FBQ0EsU0FBT0MsSUFBUDtBQVFELENBVk0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcbmltcG9ydCB7bWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHt1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcblxuLyoqIEBwcml2YXRlIFdoZXRoZXIgaWRzIGFyZSBkZWR1cGxpY2F0ZWQgb3Igbm90ICovXG5sZXQgZGVkdXBsaWNhdGVkSWRzID0gZmFsc2U7XG5cbi8qKlxuICogRGVkdXBsaWNhdGVzIHRoZSBpbnRlcmFjdGl2ZSBJZHMsIG9ubHkgY2FsbGVkIG9uY2VcbiAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2NcbiAqL1xuZXhwb3J0IGNvbnN0IGRlZHVwbGljYXRlSW50ZXJhY3RpdmVJZHMgPSAoZG9jKSA9PiB7XG4gIGlmIChkZWR1cGxpY2F0ZWRJZHMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZGVkdXBsaWNhdGVkSWRzID0gdHJ1ZTtcbiAgY29uc3QgaW50ZXJhY3RpdmVFbHMgPSBkb2MucXVlcnlTZWxlY3RvckFsbChcbiAgICAnYW1wLXN0b3J5LWludGVyYWN0aXZlLWJpbmFyeS1wb2xsLCBhbXAtc3RvcnktaW50ZXJhY3RpdmUtcG9sbCwgYW1wLXN0b3J5LWludGVyYWN0aXZlLXF1aXonXG4gICk7XG4gIGNvbnN0IGlkc01hcCA9IG1hcCgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGludGVyYWN0aXZlRWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY3VycklkID0gaW50ZXJhY3RpdmVFbHNbaV0uaWQgfHwgJ2ludGVyYWN0aXZlLWlkJztcbiAgICBpZiAoaWRzTWFwW2N1cnJJZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWRzTWFwW2N1cnJJZF0gPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgICdBTVAtU1RPUlktSU5URVJBQ1RJVkUnLFxuICAgICAgICBgRHVwbGljYXRlIGludGVyYWN0aXZlIElEICR7Y3VycklkfWBcbiAgICAgICk7XG4gICAgICBjb25zdCBuZXdJZCA9IGAke2N1cnJJZH1fXyR7KytpZHNNYXBbY3VycklkXX1gO1xuICAgICAgaW50ZXJhY3RpdmVFbHNbaV0uaWQgPSBuZXdJZDtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBmb3IgdGhlIGltYWdlIHF1aXp6ZXMgYW5kIHBvbGxzLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5leHBvcnQgY29uc3QgYnVpbGRJbWdUZW1wbGF0ZSA9IChlbGVtZW50KSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBodG1sRm9yKGVsZW1lbnQpO1xuICByZXR1cm4gaHRtbGBcbiAgICA8ZGl2XG4gICAgICBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctY29udGFpbmVyIGktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1jb250YWluZXJcIlxuICAgID5cbiAgICAgIDxkaXYgY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktaW50ZXJhY3RpdmUtcHJvbXB0LWNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1pbnRlcmFjdGl2ZS1pbWctb3B0aW9uLWNvbnRhaW5lclwiPjwvZGl2PlxuICAgIDwvZGl2PlxuICBgO1xufTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story-interactive/0.1/utils.js