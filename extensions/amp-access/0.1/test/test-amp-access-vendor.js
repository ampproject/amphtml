/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AccessVendor} from '../access-vendor';
import {AccessVendorAdapter} from '../amp-access-vendor';


describes.sandboxed('AccessVendorAdapter', {}, () => {
  let validConfig;

  beforeEach(() => {
    validConfig = {
      'vendor': 'vendor1',
    };
  });

  describe('config', () => {
    it('should load valid config', () => {
      const adapter = new AccessVendorAdapter(window, validConfig);
      expect(adapter.vendorName_).to.equal('vendor1');
      expect(adapter.getConfig()).to.deep.equal({
        vendor: 'vendor1',
      });
      expect(adapter.isAuthorizationEnabled()).to.be.true;
      expect(adapter.isPingbackEnabled()).to.be.true;
    });

    it('should require vendor name', () => {
      delete validConfig['vendor'];
      expect(() => {
        new AccessVendorAdapter(window, validConfig);
      }).to.throw(/"vendor" name must be specified/);
    });

    it('should wait registration', () => {
      const adapter = new AccessVendorAdapter(window, validConfig);
      expect(adapter.vendorResolve_).to.exist;
      const vendor = {};
      adapter.registerVendor('vendor1', vendor);
      expect(adapter.vendorResolve_).to.not.exist;
      return adapter.vendorPromise_.then(v => {
        expect(v).to.equal(vendor);
      });
    });

    it('should fail registration with a wrong name', () => {
      const adapter = new AccessVendorAdapter(window, validConfig);
      expect(() => {
        adapter.registerVendor('vendor2', {});
      }).to.throw(/match the configured vendor/);
    });

    it('should fail re-registration', () => {
      const adapter = new AccessVendorAdapter(window, validConfig);
      expect(adapter.vendorResolve_).to.exist;
      adapter.registerVendor('vendor1', {});
      expect(() => {
        adapter.registerVendor('vendor2', {});
      }).to.throw(/Vendor has already been registered/);
    });
  });

  describe('runtime', () => {

    let adapter;
    let vendor;
    let vendorMock;

    beforeEach(() => {
      adapter = new AccessVendorAdapter(window, validConfig);
      vendor = new AccessVendor();
      vendorMock = sandbox.mock(vendor);
      adapter.registerVendor(validConfig['vendor'], vendor);
    });

    afterEach(() => {
      vendorMock.verify();
    });

    describe('authorize', () => {
      it('should call vendor authorization', () => {
        vendorMock.expects('authorize')
            .withExactArgs()
            .returns(Promise.resolve({access: 'A'}))
            .once();
        return adapter.authorize().then(response => {
          expect(response).to.exist;
          expect(response.access).to.equal('A');
        });
      });

      it('should fail when vendor fails', () => {
        vendorMock.expects('authorize')
            .withExactArgs()
            .returns(Promise.reject('intentional'))
            .once();
        return adapter.authorize().then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/intentional/);
        });
      });
    });

    describe('pingback', () => {
      it('should send pingback signal', () => {
        vendorMock.expects('pingback')
            .withExactArgs()
            .returns(Promise.resolve())
            .once();
        return adapter.pingback();
      });

      it('should fail when vendor fails', () => {
        vendorMock.expects('pingback')
            .withExactArgs()
            .returns(Promise.reject('intentional'))
            .once();
        return adapter.pingback().then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/intentional/);
        });
      });
    });
  });
});
