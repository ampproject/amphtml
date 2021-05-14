/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {getChildJsonConfig} from '../../src/json';

describes.sandboxed('json', {}, () => {
  describe('getChildJsonConfig', () => {
    let element;
    let script;
    let text;
    beforeEach(() => {
      element = document.createElement('div');
      script = document.createElement('script');
      script.setAttribute('type', 'application/json');
      text = '{"a":{"b": "c"}}';
      script.textContent = text;
    });

    it('return json config', () => {
      element.appendChild(script);
      expect(getChildJsonConfig(element)).to.deep.equal({
        'a': {
          'b': 'c',
        },
      });
    });

    it('throw if not one script', () => {
      expect(() => getChildJsonConfig(element)).to.throw(
        'Found 0 <script> children. Expected 1'
      );
      element.appendChild(script);
      const script2 = document.createElement('script');
      element.appendChild(script2);
      expect(() => getChildJsonConfig(element)).to.throw(
        'Found 2 <script> children. Expected 1'
      );
    });

    it('throw if type is not application/json', () => {
      script.setAttribute('type', '');
      element.appendChild(script);
      expect(() => getChildJsonConfig(element)).to.throw(
        '<script> child must have type="application/json"'
      );
    });

    it('throw if cannot parse json', () => {
      const invalidText = '{"a":{"b": "c",}}';
      script.textContent = invalidText;
      element.appendChild(script);
      expect(() => getChildJsonConfig(element)).to.throw(
        'Failed to parse <script> contents. Is it valid JSON?'
      );
    });
  });
});
