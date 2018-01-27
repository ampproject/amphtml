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
import {batchFetchJsonFor} from '../../src/batched-json';
import {user} from '../../src/log';

describe('batchFetchJsonFor', () => {
  let sandbox;
  // Fakes.
  let ampdoc = {win: null};
  // Service fakes.
  let urlReplacements;
  let batchedXhr;
  // Mutable return variables.
  let data = {'foo': 'bar'};

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

    batchedXhr = {
      fetchJson: sandbox.stub().returns(Promise.resolve({
        json: () => Promise.resolve(data)
      })
    )};
    sandbox.stub(Services, 'batchedXhrFor').returns(batchedXhr);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('URL replacement', () => {
    it('should not replace URL vars if opt_expand is not passed', () => {
      const el = element('https://data.com?x=FOO&y=BAR');

      return batchFetchJsonFor(ampdoc, el).then(() => {
        expect(batchedXhr.fetchJson).to.be.calledWith('https://data.com?x=FOO&y=BAR');
        expect(urlReplacements.expandUrlAsync).to.not.be.called;
        expect(urlReplacements.collectUnwhitelistedVars).to.not.be.called;
      });
    });

    it('should throw user error if expanding non-whitelisted vars and opt_expand is `opt`', () => {
      const el = element('https://data.com?x=FOO&y=BAR');

      urlReplacements.expandUrlAsync
          .withArgs('https://data.com?x=FOO&y=BAR')
          .returns(Promise.resolve('https://data.com?x=expandedFoo&y=BAR'));
      urlReplacements.collectUnwhitelistedVars
          .withArgs(el)
          .returns(['BAR']);
      const userError = sandbox.stub(user(), 'error');

      return batchFetchJsonFor(ampdoc, el, /* opt_expr */ null, 'opt').then(() => {
        expect(batchedXhr.fetchJson).to.be.calledWith('https://data.com?x=expandedFoo&y=BAR');
        expect(userError).calledWithMatch('AMP-LIST', /data-amp-replace="BAR"/);
      });
    });

    it('should replace all URL vars if opt_expand is `all`', () => {
      const el = element('https://data.com?x=FOO&y=BAR');

      urlReplacements.expandUrlAsync
          .withArgs('https://data.com?x=FOO&y=BAR')
          .returns(Promise.resolve('https://data.com?x=expandedFoo&y=BAR'));
      const userError = sandbox.stub(user(), 'error');

      return batchFetchJsonFor(ampdoc, el, /* opt_expr */ null, 'all').then(() => {
        expect(batchedXhr.fetchJson).to.be.calledWith('https://data.com?x=expandedFoo&y=BAR');
        expect(urlReplacements.collectUnwhitelistedVars).to.not.be.called;
        expect(userError).to.not.be.called;
      });
    });
  });

  // TODO(choumx): Add tests for normal fetch functionality.
});
