
import {AnchorRewriteDataResponse,createAnchorReplacementTuple} from '../../../../src/service/link-rewrite/link-rewrite-classes';
import {Services} from '../../../../src/services';
import {XCUST_ATTRIBUTE_NAME} from '../constants';
import {parseQueryString, parseUrlDeprecated} from '../../../../src/url';
import AffiliateLinkResolver, {DOMAIN_RESOLVER_URL, LINK_STATUS__AFFILIATE, LINK_STATUS__NON_AFFILIATE, LINK_STATUS__UNKNOWN} from '../affiliate-link-resolver';

describes.realWin('amp-skimlinks', {
  amp: {
    extensions: ['amp-skimlinks'],
  },
}, env => {
  let win, ampdoc, document, xhr;

  beforeEach(() => {
    win = env.win;
    document = win.document;
    ampdoc = env.ampdoc;
    xhr = Services.xhrFor(win);
  });

  afterEach(() => {
    env.sandbox.restore();
  });

  describe('skimOptions', () => {
    it('Should always exclude internal domains', () => {

    });
  });
});
