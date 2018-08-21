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

import {LinkerManager} from '../linker-manager';
import {Priority} from '../../../../src/service/navigation';
import {Services} from '../../../../src/services';

describe('Linkers', () => {
  let sandbox;
  let analytics;
  let expandStub;
  let registerSpy;
  let isProxySpy;

  beforeEach(() => {
    // Linker uses a timestamp value to generate checksum.
    sandbox = sinon.sandbox;

    expandStub = sinon.stub();
    analytics = {
      expandTemplateWithUrlParams: expandStub,
      element: {},
    };

    expandStub.withArgs('CLIENT_ID(_ga)')
        .returns('amp-12345');
    expandStub.returnsArg(0);

    sandbox.stub(Services, 'documentInfoForDoc')
        .returns({
          sourceUrl: 'www.example.com ',
          canonicalUrl: 'www.example.com',
        });

    registerSpy = sandbox.spy();
    sandbox.stub(Services, 'navigationForDoc').returns({
      registerAnchorMutator: registerSpy,
    });

    isProxySpy = sandbox.spy();
    sandbox.stub(Services, 'urlForDoc').returns({
      isProxyOrigin: isProxySpy,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('registers the callback if given valid linkers config', () => {

    const config = {
      linkers: {
        testLinker: {
          ids: {
            gclid: '123',
          },
        },
      },
    };

    const manager = new LinkerManager(analytics, config);
    manager.init();

    expect(registerSpy.calledOnce).to.be.true;
    expect(registerSpy).calledWith(
        sinon.match.func,
        Priority.LINKER,
    );
  });

  it('does not register the callback if no linkers config', () => {
    const config = {};

    const manager = new LinkerManager(analytics, config);
    manager.init();

    expect(registerSpy.notCalled).to.be.true;
  });

  it('starts resolving macros and adds them to map for later use', () => {
    const config = {
      linkers: {
        testLinker1: {
          ids: {
            _key: 'CLIENT_ID(_ga)',
            gclid: '234',
          },
        },
        testLinker2: {
          ids: {
            foo: 'bar',
          },
        },
      },
    };

    const manager = new LinkerManager(analytics, config);
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      const res1 = (manager.resolvedLinkers_['testLinker1']).split('~');
      const res2 = (manager.resolvedLinkers_['testLinker2']).split('~');

      expect(res1[2]).to.equal('_key');
      expect(res1[3]).to.match(/^amp-([a-zA-Z0-9_-]+)/);
      expect(res1[4]).to.equal('gclid');
      expect(res1[5]).to.equal('234');

      expect(res2[2]).to.equal('foo');
      return expect(res2[3]).to.equal('bar');
    });
  });

  it('should add linker with valid config.', () => {
    const config = {
      linkers: {
        testLinker1: {
          ids: {
            _key: 'CLIENT_ID(_ga)',
            gclid: '234',
          },
        },
      },
    };

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(analytics, config);
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.linkerCallback_(a);
      return expect(a.href).to.not.equal('https://www.example.com');
    });
  });

  it('should not add linker if not proxy && proxyOnly == true', () => {

    const config = {
      linkers: {
        testLinker1: {
          proxyOnly: true,
          ids: {
            _key: 'CLIENT_ID(_ga)',
            gclid: '234',
          },
        },
      },
    };

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(analytics, config);
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.linkerCallback_(a);
      return expect(a.href).to.equal('https://www.example.com');
    });
  });

  it('should not add linker destination domains do not match', () => {
    const config = {
      linkers: {
        testLinker1: {
          ids: {
            _key: 'CLIENT_ID(_ga)',
          },
          destinationDomains: ['www.foo.com'],
        },
      },
    };

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(analytics, config);
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.linkerCallback_(a);
      return expect(a.href).to.equal('https://www.example.com');
    });
  });
});
