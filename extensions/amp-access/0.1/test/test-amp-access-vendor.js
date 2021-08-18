import {AccessVendor} from '../access-vendor';
import {AccessVendorAdapter} from '../amp-access-vendor';

describes.realWin('AccessVendorAdapter', {amp: true}, (env) => {
  let ampdoc;
  let validConfig;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    validConfig = {
      'vendor': 'vendor1',
      'vendor1': {
        'vendorConfigParam': 'vendorConfigValue',
      },
    };
  });

  describe('config', () => {
    it('should load valid config', () => {
      const adapter = new AccessVendorAdapter(ampdoc, validConfig);
      expect(adapter.vendorName_).to.equal('vendor1');
      expect(adapter.getConfig()).to.deep.equal({
        vendorConfigParam: 'vendorConfigValue',
      });
      expect(adapter.isAuthorizationEnabled()).to.be.true;
      expect(adapter.isPingbackEnabled()).to.be.true;
    });

    it('should require vendor name', () => {
      delete validConfig['vendor'];
      allowConsoleError(() => {
        expect(() => {
          new AccessVendorAdapter(ampdoc, validConfig);
        }).to.throw(/"vendor" name must be specified/);
      });
    });

    it('should wait on registration', () => {
      const adapter = new AccessVendorAdapter(ampdoc, validConfig);
      expect(adapter.vendorResolve_).to.exist;
      const vendor = {};
      adapter.registerVendor(vendor);
      expect(adapter.vendorResolve_).to.not.exist;
      return adapter.vendorPromise_.then((v) => {
        expect(v).to.equal(vendor);
      });
    });

    it('should fail re-registration', () => {
      const adapter = new AccessVendorAdapter(ampdoc, validConfig);
      expect(adapter.vendorResolve_).to.exist;
      adapter.registerVendor('vendor1', {});
      allowConsoleError(() => {
        expect(() => {
          adapter.registerVendor('vendor2', {});
        }).to.throw(/Vendor has already been registered/);
      });
    });
  });

  describe('runtime', () => {
    let adapter;
    let vendor;
    let vendorMock;

    beforeEach(() => {
      adapter = new AccessVendorAdapter(ampdoc, validConfig);
      vendor = new AccessVendor();
      vendorMock = env.sandbox.mock(vendor);
      adapter.registerVendor(vendor);
    });

    afterEach(() => {
      vendorMock.verify();
    });

    describe('authorize', () => {
      it('should call vendor authorization', () => {
        vendorMock
          .expects('authorize')
          .withExactArgs()
          .returns(Promise.resolve({access: 'A'}))
          .once();
        return adapter.authorize().then((response) => {
          expect(response).to.exist;
          expect(response.access).to.equal('A');
        });
      });

      it('should fail when vendor fails', () => {
        vendorMock
          .expects('authorize')
          .withExactArgs()
          .returns(Promise.reject('intentional'))
          .once();
        return adapter.authorize().then(
          () => {
            throw new Error('must never happen');
          },
          (error) => {
            expect(error).to.match(/intentional/);
          }
        );
      });
    });

    describe('pingback', () => {
      it('should send pingback signal', () => {
        vendorMock
          .expects('pingback')
          .withExactArgs()
          .returns(Promise.resolve())
          .once();
        return adapter.pingback();
      });

      it('should fail when vendor fails', () => {
        vendorMock
          .expects('pingback')
          .withExactArgs()
          .returns(Promise.reject('intentional'))
          .once();
        return adapter.pingback().then(
          () => {
            throw new Error('must never happen');
          },
          (error) => {
            expect(error).to.match(/intentional/);
          }
        );
      });
    });
  });
});
