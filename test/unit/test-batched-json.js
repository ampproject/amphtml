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
  // Fakes.
  const ampdoc = {win: null};
  // Service fakes.
  let urlReplacements;
  let batchedXhr;
  let xhr;
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
    urlReplacements = {
      expandUrlAsync: window.sandbox.stub(),
      collectDisallowedVarsSync: window.sandbox.stub(),
    };
    window.sandbox
      .stub(Services, 'urlReplacementsForDoc')
      .returns(urlReplacements);

    fetchJson = window.sandbox.stub().returns(
      Promise.resolve({
        json: () => Promise.resolve(data),
      })
    );

    xhr = {xssiJson: () => Promise.resolve(data)};
    window.sandbox.stub(Services, 'xhrFor').returns(xhr);

    batchedXhr = {fetchJson};
    window.sandbox.stub(Services, 'batchedXhrFor').returns(batchedXhr);
  });

  describe('URL replacement', () => {
    it('should not replace URL vars if opt_urlReplacement == NONE', () => {
      const el = element('https://data.com?x=FOO&y=BAR');

      return batchFetchJsonFor(ampdoc, el).then(() => {
        expect(fetchJson).to.be.calledWith('https://data.com?x=FOO&y=BAR');
        expect(urlReplacements.expandUrlAsync).to.not.be.called;
        expect(urlReplacements.collectDisallowedVarsSync).to.not.be.called;
      });
    });

    it(
      'should throw user error if expanding non-allowlisted vars with ' +
        'urlReplacement == OPT_IN',
      () => {
        const el = element('https://data.com?x=FOO&y=BAR');

        urlReplacements.expandUrlAsync
          .withArgs('https://data.com?x=FOO&y=BAR')
          .returns(Promise.resolve('https://data.com?x=abc&y=BAR'));
        urlReplacements.collectDisallowedVarsSync.withArgs(el).returns(['BAR']);

        const optIn = UrlReplacementPolicy.OPT_IN;
        const rejectError = /Please add data-amp-replace="BAR" to the <AMP-LIST> element./;
        return batchFetchJsonFor(ampdoc, el, {
          urlReplacement: optIn,
        }).should.eventually.be.rejectedWith(rejectError);
      }
    );

    it('should replace all URL vars if opt_urlReplacement == ALL', () => {
      const el = element('https://data.com?x=FOO&y=BAR');

      urlReplacements.expandUrlAsync
        .withArgs('https://data.com?x=FOO&y=BAR')
        .returns(Promise.resolve('https://data.com?x=abc&y=BAR'));

      const userError = window.sandbox.stub(user(), 'error');
      const all = UrlReplacementPolicy.ALL;
      return batchFetchJsonFor(ampdoc, el, {urlReplacement: all}).then(() => {
        expect(fetchJson).to.be.calledWith('https://data.com?x=abc&y=BAR');
        expect(urlReplacements.collectDisallowedVarsSync).to.not.be.called;
        expect(userError).to.not.be.called;
      });
    });
  });

  describe('POST based identity', () => {
    it('should send POST request with auth token is present', () => {
      const el = element('https://data.com');
      const all = UrlReplacementPolicy.ALL;

      urlReplacements.expandUrlAsync
        .withArgs('https://data.com')
        .returns(Promise.resolve('https://data.com'));

      const expectedRequest = {
        'body': {'ampViewerAuthToken': 'idtoken'},
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        'method': 'POST',
      };

      return batchFetchJsonFor(ampdoc, el, {
        urlReplacment: all,
        token: 'idtoken',
      }).then(() => {
        expect(fetchJson).to.be.calledWithExactly(
          'https://data.com',
          expectedRequest
        );
      });
    });

    it('should send POST request with empty, defined identity token', () => {
      const el = element('https://data.com');
      const all = UrlReplacementPolicy.ALL;

      urlReplacements.expandUrlAsync
        .withArgs('https://data.com')
        .returns(Promise.resolve('https://data.com'));

      const token = '';
      return batchFetchJsonFor(ampdoc, el, {
        replacementUrl: all,
        token,
      }).then(() => {
        const fetchOpt = fetchJson.firstCall.args[1];
        expect(fetchOpt.body.ampViewerAuthToken).to.equal('');
        expect(fetchOpt.method).to.equal('POST');
      });
    });

    it('should not transform the request with an undefined token', () => {
      const el = element('https://data.com');
      const all = UrlReplacementPolicy.ALL;

      urlReplacements.expandUrlAsync
        .withArgs('https://data.com')
        .returns(Promise.resolve('https://data.com'));

      const expectedRequest = {};

      return batchFetchJsonFor(ampdoc, el, {urlReplacement: all}).then(() => {
        expect(fetchJson).to.be.calledWithExactly(
          'https://data.com',
          expectedRequest
        );
      });
    });
  });
  // TODO(choumx): Add tests for normal fetch functionality.
});
