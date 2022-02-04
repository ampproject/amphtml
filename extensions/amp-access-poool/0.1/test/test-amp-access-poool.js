import {PooolVendor} from '../poool-impl';

describes.fakeWin(
  'PooolVendor',
  {
    amp: true,
    location: 'https://pub.com/doc1',
  },
  (env) => {
    let win, document, ampdoc;
    let accessSource;
    let accessService;
    let accessSourceMock;
    let xhrMock;
    let pooolConfig;
    let vendor;

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
      document = win.document;

      pooolConfig = {
        bundleID: 'ZRGA3EYZ4GRBTSHREG345HGGZRTHZEGEH',
        pageType: 'premium',
        itemID: 'amp-test-article',
      };

      accessSource = {
        getAdapterConfig: () => {
          return pooolConfig;
        },
        buildUrl: () => {},
        getReaderId_: () => {},
        getLoginUrl: () => {},
      };

      accessService = {
        ampdoc,
        getSource: () => accessSource,
      };

      accessSourceMock = env.sandbox.mock(accessSource);

      vendor = new PooolVendor(accessService, accessSource);
      xhrMock = env.sandbox.mock(vendor.xhr_);
    });

    afterEach(() => {
      accessSourceMock.verify();
      xhrMock.verify();
    });

    describe('authorize', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.id = 'poool-widget';
        document.body.appendChild(container);
        env.sandbox.stub(vendor, 'renderPoool_');
      });

      afterEach(() => {
        container.parentNode.removeChild(container);
      });

      it('successful authorization', () => {
        vendor.accessUrl_ = 'https://baseurl?param';
        accessSourceMock
          .expects('buildUrl')
          .withExactArgs('https://baseurl?param&iid=amp-test-article', false)
          .returns(Promise.resolve('https://builturl'))
          .once();
        accessSourceMock
          .expects('getLoginUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.resolve({
              json() {
                return Promise.resolve({access: true});
              },
            })
          )
          .once();
        return vendor.authorize().then((resp) => {
          expect(resp.access).to.be.true;
        });
      });

      it('authorization fails because of wrong or missing server config', () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        accessSourceMock
          .expects('getLoginUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.resolve({
              json() {
                return Promise.resolve({access: true});
              },
            })
          )
          .once();
        return vendor.authorize().catch((err) => {
          expect(err.message).to.exist;
        });
      });

      it('authorization response fails - 402 error', () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.reject({
              response: {
                status: 402,
              },
            })
          )
          .once();
        return vendor.authorize().then((err) => {
          expect(err.access).to.be.false;
        });
      });
    });
  }
);
