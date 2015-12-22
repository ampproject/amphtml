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

import {createServedIframe} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';

const iframeSrc = '/base/test/fixtures/served/amp-dynamic-css-classes.html';

describe('dynamic classes are inserted at runtime', () => {
  let documentElement, win;
  beforeEach(() => {
    return createServedIframe(iframeSrc).then(fixture => {
      win = fixture.win;
      documentElement = fixture.doc.documentElement;
    });
  });

  describe('when experiment is disabled', () => {
    beforeEach(() => {
      toggleExperiment(win, 'dynamic-css-classes', false);
      return win.insertDynamicCssScript();
    });

    it('should not include referrer classes', () => {
      expect(documentElement).not.to.have.class('amp-referrer-localhost');
    });

    it('should not include viewer class', () => {
      expect(documentElement).not.to.have.class('amp-viewer');
    });
  });

  describe('when experiment is enabled', () => {
    beforeEach(() => {
      toggleExperiment(win, 'dynamic-css-classes', true);
      return win.insertDynamicCssScript();
    });

    it('should include referrer classes', () => {
      expect(documentElement).to.have.class('amp-referrer-localhost');
    });

    it('should include viewer class', () => {
      expect(documentElement).to.have.class('amp-viewer');
    });
  });
});
