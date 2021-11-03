import {Services} from '#service';

import {user} from '#utils/log';

import {
  UrlReplacementPolicy_Enum,
  batchFetchJsonFor,
} from '../../src/batched-json';

describes.sandboxed('batchFetchJsonFor', {}, (env) => {
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
      expandUrlAsync: env.sandbox.stub(),
      collectDisallowedVarsSync: env.sandbox.stub(),
    };
    env.sandbox
      .stub(Services, 'urlReplacementsForDoc')
      .returns(urlReplacements);

    fetchJson = env.sandbox.stub().returns(
      Promise.resolve({
        json: () => Promise.resolve(data),
      })
    );

    xhr = {xssiJson: () => Promise.resolve(data)};
    env.sandbox.stub(Services, 'xhrFor').returns(xhr);

    batchedXhr = {fetchJson};
    env.sandbox.stub(Services, 'batchedXhrFor').returns(batchedXhr);
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

        const optIn = UrlReplacementPolicy_Enum.OPT_IN;
        const rejectError =
          /Please add data-amp-replace="BAR" to the <AMP-LIST> element./;
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

      const userError = env.sandbox.stub(user(), 'error');
      const all = UrlReplacementPolicy_Enum.ALL;
      return batchFetchJsonFor(ampdoc, el, {urlReplacement: all}).then(() => {
        expect(fetchJson).to.be.calledWith('https://data.com?x=abc&y=BAR');
        expect(urlReplacements.collectDisallowedVarsSync).to.not.be.called;
        expect(userError).to.not.be.called;
      });
    });
  });
});
