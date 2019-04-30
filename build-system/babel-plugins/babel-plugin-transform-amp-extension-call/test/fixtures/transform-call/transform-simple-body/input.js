/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

AMP.extension('amp-mustache', '0.2', function(AMP) {
   // First, unregister template to avoid "Duplicate template type"
  // error due to multiple versions of amp-mustache in the same unit test run.
  // This is due to transpilation of test code to ES5 which uses require() and,
  // unlike import, causes side effects (AMP.registerTemplate) to be run.
  // For unit tests, it doesn't actually matter which version of amp-mustache is
  // registered. Integration tests should only have one script version included.
  if (getMode().test) {
    Services.templatesFor(window).unregisterTemplate(TAG);
  }
  AMP.registerTemplate(TAG, AmpMustache);
});
