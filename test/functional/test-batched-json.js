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

import {Services} from '../../src/services';
import {UrlReplacementPolicy, batchFetchJsonFor} from '../../src/batched-json';
import {user} from '../../src/log';

describe('batchFetchJsonFor', () => {
  let sandbox;
  // Fakes.
  const ampdoc = {win: null};
  // Service fakes.
  let urlReplacements;
  let batchedXhr;
  // Function stubs.
  let fetchJson;
  // Mutable return variables.
  const data = {'foo': 'bar'};

  /**
   * @param {string} src
   * @return {!Element}
   */
  function element(src) {
    // Doesn't matter that it's amp-list. Could be anything with a src attr.
    const el = document.createElement('AMP-LIST');
    el.setAttribute('src', src);
    return el;
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    urlReplacements = {
      expandUrlAsync: sandbox.stub(),
      collectUnwhitelistedVars: sandbox.stub(),
    };
    sandbox.stub(Services, 'urlReplacementsForDoc').returns(urlReplacements);

    fetchJson = sandbox.stub().returns(Promise.resolve({
      json: () => Promise.resolve(data),
    }));
    batchedXhr = {fetchJson};
    sandbox.stub(Services, 'batchedXhrFor').returns(batchedXhr);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('URL replacement', () => {
    it('should not replace URL vars if opt_urlReplacement == NONE', () => {
      const el = element('https://data.com?x=FOO&y=BAR');

      return batchFetchJsonFor(ampdoc, el).then(() => {
        expect(fetchJson).to.be.calledWith('https://data.com?x=FOO&y=BAR');
        expect(urlReplacements.expandUrlAsync).to.not.be.called;
        expect(urlReplacements.collectUnwhitelistedVars).to.not.be.called;
      });
    });

    it('should throw user error if expanding non-whitelisted vars with ' +
      'opt_urlReplacement == OPT_IN', () => {
      const el = element('https://data.com?x=FOO&y=BAR');

      urlReplacements.expandUrlAsync
          .withArgs('https://data.com?x=FOO&y=BAR')
          .returns(Promise.resolve('https://data.com?x=abc&y=BAR'));
      urlReplacements.collectUnwhitelistedVars
          .withArgs(el)
          .returns(Promise.resolve(['BAR']));
      const userError = sandbox.stub(user(), 'error');

      const optIn = UrlReplacementPolicy.OPT_IN;
      return batchFetchJsonFor(ampdoc, el, null, optIn).then(() => {
        expect(fetchJson).to.be.calledWith('https://data.com?x=abc&y=BAR');
        expect(userError).calledWithMatch('AMP-LIST', /data-amp-replace="BAR"/);
      });
    });

    it('should replace all URL vars if opt_urlReplacement == ALL', () => {
      const el = element('https://data.com?x=FOO&y=BAR');

      urlReplacements.expandUrlAsync
          .withArgs('https://data.com?x=FOO&y=BAR')
          .returns(Promise.resolve('https://data.com?x=abc&y=BAR'));
      const userError = sandbox.stub(user(), 'error');

      const all = UrlReplacementPolicy.ALL;
      return batchFetchJsonFor(ampdoc, el, null, all).then(() => {
        expect(fetchJson).to.be.calledWith('https://data.com?x=abc&y=BAR');
        expect(urlReplacements.collectUnwhitelistedVars).to.not.be.called;
        expect(userError).to.not.be.called;
      });
    });
  });

  // TODO(choumx): Add tests for normal fetch functionality.
});
