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

import {BrowserController} from '../../../../../testing/test-helper';

const TIMEOUT = 15000;

describe('amp-list (integration)', function() {
  this.timeout(TIMEOUT);

  const basicBody = `<amp-list width=300 height=100 src="http://localhost:9876/list/fruit-data/get?cors=0">
      <template type="amp-mustache">
        {{name}} : {{quantity}} @ {{unitPrice}}
      </template>
    '</amp-list>`;

  const scriptTemplateBody = `<amp-list width=300 height=100 src="http://localhost:9876/list/fruit-data/get?cors=0">
    <script type="text/plain" template="amp-mustache">
      {{name}} : {{quantity}} @ {{unitPrice}}
    </script>
  '</amp-list>`;

  const basicTests = env => {
    let browser;
    let doc;
    let win;

    beforeEach(() => {
      win = env.win;
      browser = new BrowserController(win);
      doc = win.document;
    });

    it('should build', function*() {
      const list = doc.querySelector('amp-list');
      expect(list).to.exist;
      yield browser.waitForElementBuild('amp-list', TIMEOUT);
      const container = list.querySelector('div[role="list"]');
      expect(container).to.exist;
    });

    // TODO(choumx): Frequent 10s timeout on Chrome 72.0.3626 (Linux 0.0.0).
    it.skip('should render items', function*() {
      const list = doc.querySelector('amp-list');
      expect(list).to.exist;

      yield browser.waitForElementLayout('amp-list', TIMEOUT);

      const children = list.querySelectorAll('div[role=list] > div');
      expect(children.length).to.equal(3);
      expect(children[0].textContent.trim()).to.equal('apple : 47 @ 0.33');
      expect(children[1].textContent.trim()).to.equal('pear : 538 @ 0.54');
      expect(children[2].textContent.trim()).to.equal('tomato : 0 @ 0.23');
    });
  };

  describes.integration(
    'basic (mustache-0.1)',
    {
      body: basicBody,
      extensions: ['amp-list', 'amp-mustache:0.1'],
    },
    basicTests
  );

  describes.integration(
    'basic (mustache-0.2)',
    {
      body: basicBody,
      extensions: ['amp-list', 'amp-mustache:0.2'],
    },
    basicTests
  );

  describes.integration(
    'basic (mustache-0.1) script template',
    {
      body: scriptTemplateBody,
      extensions: ['amp-list', 'amp-mustache:0.1'],
    },
    basicTests
  );

  describes.integration(
    'basic (mustache-0.2) script template',
    {
      body: scriptTemplateBody,
      extensions: ['amp-list', 'amp-mustache:0.2'],
    },
    basicTests
  );
});
