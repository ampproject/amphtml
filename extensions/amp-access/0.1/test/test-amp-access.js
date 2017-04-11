/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {AccessClientAdapter} from '../amp-access-client';
import {AccessOtherAdapter} from '../amp-access-other';
import {AccessServerAdapter} from '../amp-access-server';
import {AccessServerJwtAdapter} from '../amp-access-server-jwt';
import {AccessVendorAdapter} from '../amp-access-vendor';
import {AccessService} from '../amp-access';
import {Observable} from '../../../../src/observable';
import {cidServiceForDocForTesting,} from
    '../../../../extensions/amp-analytics/0.1/cid-impl';
import {installPerformanceService,} from
    '../../../../src/service/performance-impl';
import {toggleExperiment} from '../../../../src/experiments';
import * as sinon from 'sinon';


describes.fakeWin('AccessService', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document;
  let ampdoc;
  let element;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    element = document.createElement('script');
    element.setAttribute('id', 'amp-access');
    element.setAttribute('type', 'application/json');
    document.body.appendChild(element);
    document.documentElement.classList.remove('amp-access-error');
  });

  afterEach(() => {
    toggleExperiment(win, 'amp-access-server', false);
  });

  it('should disable service when no config', () => {
    document.body.removeChild(element);
    const service = new AccessService(ampdoc);
    expect(service.isEnabled()).to.be.false;
    expect(service.accessElement_).to.be.undefined;
  });

  it('should fail if config is malformed', () => {
    expect(() => {
      new AccessService(ampdoc);
    }).to.throw(Error);
  });

  it('should default to "client" and fail if authorization is missing', () => {
    const config = {};
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(ampdoc);
    }).to.throw(/"authorization" URL must be specified/);
  });

  it('should fail if config login is malformed', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'http://acme.com/l',
    };
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(ampdoc);
    }).to.throw(/https\:/);
  });

  it('should parse the complete config', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    };
    element.textContent = JSON.stringify(config);
    const service = new AccessService(ampdoc);
    expect(service.isEnabled()).to.be.true;
    expect(service.accessElement_).to.equal(element);
    expect(service.type_).to.equal('client');
    expect(service.loginConfig_).to.deep.equal({'': 'https://acme.com/l'});
    expect(service.adapter_).to.be.instanceOf(AccessClientAdapter);
    expect(service.adapter_.authorizationUrl_).to.equal('https://acme.com/a');
  });

  it('should parse multiple login URLs', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': {
        'login1': 'https://acme.com/l1',
        'login2': 'https://acme.com/l2',
      },
    };
    element.textContent = JSON.stringify(config);
    const service = new AccessService(ampdoc);
    expect(service.isEnabled()).to.be.true;
    expect(service.loginConfig_).to.deep.equal({
      'login1': 'https://acme.com/l1',
      'login2': 'https://acme.com/l2',
    });
  });

  it('should parse type', () => {
    let config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    };
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('client');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessClientAdapter);

    config['type'] = 'client';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('client');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessClientAdapter);

    config['type'] = 'server';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('client');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessClientAdapter);

    config['type'] = 'server';
    toggleExperiment(win, 'amp-access-server', true);
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('server');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessServerAdapter);

    // When the 'amp-access-server' experiment is enabled, documents with
    // access type 'client' are also treated as 'server'.
    config['type'] = 'client';
    toggleExperiment(win, 'amp-access-server', true);
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('server');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessServerAdapter);

    config['type'] = 'other';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('other');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessOtherAdapter);

    config = {};
    config['type'] = 'vendor';
    config['vendor'] = 'vendor1';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('vendor');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessVendorAdapter);

    delete config['type'];
    config['vendor'] = 'vendor1';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('vendor');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessVendorAdapter);
  });

  it('should return adapter config', () => {
    const config = {
      type: 'vendor',
      vendor: 'vendor1',
    };
    element.textContent = JSON.stringify(config);
    const accessService = new AccessService(ampdoc);
    sandbox.stub(accessService.adapter_, 'getConfig');
    accessService.getAdapterConfig();
    expect(accessService.adapter_.getConfig.called).to.be.true;
  });

  it('should parse type for JWT w/o experiment', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
      'jwt': true,
    };
    toggleExperiment(win, 'amp-access-jwt', false);
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('client');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessClientAdapter);

    config['type'] = 'client';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('client');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessClientAdapter);

    config['type'] = 'server';
    toggleExperiment(win, 'amp-access-server', true);
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('server');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessServerAdapter);
  });

  it('should parse type for JWT with experiment', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
      'jwt': true,
      'publicKeyUrl': 'https://acme.com/pk',
    };
    toggleExperiment(win, 'amp-access-jwt', true);
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('client');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessServerJwtAdapter);

    config['type'] = 'client';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('client');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessServerJwtAdapter);

    config['type'] = 'server';
    toggleExperiment(win, 'amp-access-server', true);
    element.textContent = JSON.stringify(config);
    expect(new AccessService(ampdoc).type_).to.equal('server');
    expect(new AccessService(ampdoc).adapter_).to.be
        .instanceOf(AccessServerJwtAdapter);
  });

  it('should fail if type is unknown', () => {
    const config = {
      'type': 'unknown',
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    };
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(ampdoc);
    }).to.throw(/Unknown access type/);
  });

  it('should start when enabled', () => {
    element.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    });
    const service = new AccessService(ampdoc);
    service.startInternal_ = sandbox.spy();
    service.start_();
    expect(service.startInternal_).to.be.calledOnce;
  });

  it('should start all services', () => {
    element.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    });
    const service = new AccessService(ampdoc);
    service.buildLoginUrls_ = sandbox.spy();
    service.runAuthorization_ = sandbox.spy();
    service.scheduleView_ = sandbox.spy();
    service.listenToBroadcasts_ = sandbox.spy();
    service.signIn_.start = sandbox.spy();

    service.startInternal_();
    expect(service.buildLoginUrls_).to.be.calledOnce;
    expect(service.signIn_.start).to.be.calledOnce;
    expect(service.runAuthorization_).to.be.calledOnce;
    expect(service.scheduleView_).to.be.calledOnce;
    expect(service.scheduleView_.firstCall.args[0]).to.equal(2000);
    expect(service.listenToBroadcasts_).to.be.calledOnce;
  });

  it('should initialize publisher origin', () => {
    element.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    });
    const service = new AccessService(ampdoc);
    expect(service.pubOrigin_).to.exist;
    expect(service.pubOrigin_).to.match(/^http.*/);
  });

  it('should initialize authorization fallback response', () => {
    element.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
      'authorizationFallbackResponse': {'error': true},
    });
    const service = new AccessService(ampdoc);
    expect(service.authorizationFallbackResponse_).to.deep.equal(
        {'error': true});
  });

  it('should register vendor', () => {
    const config = {
      'vendor': 'vendor1',
    };
    element.textContent = JSON.stringify(config);
    const accessService = new AccessService(ampdoc);
    class Vendor1 {};
    const vendor1 = new Vendor1();
    accessService.registerVendor('vendor1', vendor1);
    return accessService.adapter_.vendorPromise_.then(vendor => {
      expect(vendor).to.equal(vendor1);
    });
  });

  it('should prohibit vendor registration for non-vendor config', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    };
    element.textContent = JSON.stringify(config);
    const accessService = new AccessService(ampdoc);
    class Vendor1 {};
    const vendor1 = new Vendor1();
    expect(() => {
      accessService.registerVendor('vendor1', vendor1);
    }).to.throw(/can only be used for "type=vendor"/);
  });
});


describes.fakeWin('AccessService adapter context', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let clock;
  let configElement;
  let service;
  let context;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;
    clock = sandbox.useFakeTimers();
    clock.tick(0);

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
    });
    document.body.appendChild(configElement);

    service = new AccessService(ampdoc);
    service.readerIdPromise_ = Promise.resolve('reader1');
    context = service.adapter_.context_;
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
  });

  it('should resolve URL without auth response and no authdata vars', () => {
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ false).then(url => {
          expect(url).to.equal('?rid=reader1&type=');
        });
  });

  it('should resolve URL without auth response and with authdata vars', () => {
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ true).then(url => {
          expect(url).to.equal('?rid=reader1&type=');
        });
  });

  it('should resolve URL with auth response and no authdata vars', () => {
    service.setAuthResponse_({child: {type: 'premium'}});
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ false).then(url => {
          expect(url).to.equal('?rid=reader1&type=');
        });
  });

  it('should resolve URL with auth response and with authdata vars', () => {
    service.setAuthResponse_({child: {type: 'premium'}});
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ true).then(url => {
          expect(url).to.equal('?rid=reader1&type=premium');
        });
  });

  it('should resolve URL with unknown authdata var', () => {
    service.setAuthResponse_({child: {type: 'premium'}});
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type2)',
        /* useAuthData */ true).then(url => {
          expect(url).to.equal('?rid=reader1&type=');
        });
  });

  it('should resolve URL with ACCESS_TOKEN, but not enabled', () => {
    return context.buildUrl('?at=ACCESS_TOKEN').then(url => {
      expect(url).to.equal('?at=');
    });
  });

  it('should resolve URL with ACCESS_TOKEN, enabled, but null', () => {
    sandbox.stub(service.signIn_, 'getAccessTokenPassive', () => null);
    return context.buildUrl('?at=ACCESS_TOKEN').then(url => {
      expect(url).to.equal('?at=');
    });
  });

  it('should resolve URL with ACCESS_TOKEN, enabled, but null promise', () => {
    sandbox.stub(service.signIn_, 'getAccessTokenPassive',
        () => Promise.resolve(null));
    return context.buildUrl('?at=ACCESS_TOKEN').then(url => {
      expect(url).to.equal('?at=');
    });
  });

  it('should resolve URL with ACCESS_TOKEN, enabled, not null', () => {
    sandbox.stub(service.signIn_, 'getAccessTokenPassive',
        () => Promise.resolve('access_token'));
    return context.buildUrl('?at=ACCESS_TOKEN').then(url => {
      expect(url).to.equal('?at=access_token');
    });
  });
});


describes.fakeWin('AccessService authorization', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let clock;
  let configElement, elementOn, elementOff, elementError;
  let cidMock;
  let adapterMock;
  let performanceMock;
  let service;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;
    clock = sandbox.useFakeTimers();
    clock.tick(0);

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID',
    });
    document.body.appendChild(configElement);
    document.documentElement.classList.remove('amp-access-error');

    elementOn = document.createElement('div');
    elementOn.setAttribute('amp-access', 'access');
    document.body.appendChild(elementOn);

    elementOff = document.createElement('div');
    elementOff.setAttribute('amp-access', 'NOT access');
    document.body.appendChild(elementOff);

    elementError = document.createElement('div');
    elementError.setAttribute('amp-access', 'error');
    elementError.setAttribute('amp-access-hide', '');
    document.body.appendChild(elementError);

    service = new AccessService(ampdoc);

    const adapter = {
      getConfig: () => {},
      isAuthorizationEnabled: () => true,
      isPingbackEnabled: () => true,
      authorize: () => {},
    };
    service.adapter_ = adapter;
    adapterMock = sandbox.mock(adapter);

    sandbox.stub(service.resources_, 'mutateElement',
        (unusedElement, mutator) => {
          mutator();
          return Promise.resolve();
        });
    service.vsync_ = {
      mutate: callback => {
        callback();
      },
      mutatePromise: callback => {
        callback();
        return Promise.resolve();
      },
    };
    const cid = {
      get: () => {},
    };
    cidMock = sandbox.mock(cid);
    service.cid_ = Promise.resolve(cid);

    service.analyticsEvent_ = sandbox.spy();
    performanceMock = sandbox.mock(service.performance_);
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
    if (elementOn.parentElement) {
      elementOn.parentElement.removeChild(elementOn);
    }
    if (elementOff.parentElement) {
      elementOff.parentElement.removeChild(elementOff);
    }
    if (elementError.parentElement) {
      elementError.parentElement.removeChild(elementError);
    }
    adapterMock.verify();
    performanceMock.verify();
  });

  function expectGetReaderId(result) {
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve(result))
        .once();
  }

  it('should short-circuit authorization flow when disabled', () => {
    adapterMock.expects('isAuthorizationEnabled')
        .withExactArgs()
        .returns(false)
        .once();
    adapterMock.expects('authorize').never();
    cidMock.expects('get').never();
    const promise = service.runAuthorization_();
    expect(document.documentElement).not.to.have.class('amp-access-loading');
    expect(document.documentElement).not.to.have.class('amp-access-error');
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(document.documentElement).not.to.have.class('amp-access-error');
      expect(service.firstAuthorizationPromise_).to.exist;
      return service.firstAuthorizationPromise_;
    }).then(() => {
      expect(service.lastAuthorizationPromise_).to.equal(
          service.firstAuthorizationPromise_);
      expect(service.authResponse_).to.be.null;
    });
  });

  it('should run authorization flow', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: true}))
        .once();
    service.buildLoginUrls_ = sandbox.spy();
    expect(service.lastAuthorizationPromise_).to.equal(
        service.firstAuthorizationPromise_);
    const promise = service.runAuthorization_();
    const lastPromise = service.lastAuthorizationPromise_;
    expect(lastPromise).to.not.equal(service.firstAuthorizationPromise_);
    expect(document.documentElement).to.have.class('amp-access-loading');
    expect(document.documentElement).not.to.have.class('amp-access-error');
    expect(service.buildLoginUrls_).to.have.not.been.called;
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(document.documentElement).not.to.have.class('amp-access-error');
      expect(elementOn).not.to.have.attribute('amp-access-hide');
      expect(elementOff).to.have.attribute('amp-access-hide');
      expect(service.authResponse_).to.exist;
      expect(service.authResponse_.access).to.be.true;
      expect(service.buildLoginUrls_).to.be.calledOnce;
      // Last authorization promise stays unchanged.
      expect(service.lastAuthorizationPromise_).to.equal(lastPromise);
    });
  });

  it('should recover from authorization failure', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.reject('intentional'))
        .once();
    const promise = service.runAuthorization_();
    expect(document.documentElement).to.have.class('amp-access-loading');
    expect(document.documentElement).not.to.have.class('amp-access-error');
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(document.documentElement).to.have.class('amp-access-error');
      expect(elementOn).not.to.have.attribute('amp-access-hide');
      expect(elementOff).not.to.have.attribute('amp-access-hide');
    });
  });

  it('should NOT resolve last promise until first success', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.reject('intentional'))
        .once();
    const promise = service.runAuthorization_();
    let lastResolved = false;
    service.lastAuthorizationPromise_.then(() => {
      lastResolved = true;
    });
    expect(service.lastAuthorizationPromise_).to.not.equal(promise);
    expect(service.lastAuthorizationPromise_).to.not.equal(
        service.firstAuthorizationPromise_);
    return promise.then(() => {
      // Skip microtask.
    }).then(() => {
      // The authorization promise succeeded, but not the last promise.
      expect(lastResolved).to.be.false;
      // Resolve the first promise.
      service.firstAuthorizationResolver_();
      return service.lastAuthorizationPromise_;
    }).then(() => {
      // After first promise has been resolved, the last promised is resolved
      // as well.
      expect(lastResolved).to.be.true;
    });
  });

  it('should use fallback on authorization failure when available', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.reject('intentional'))
        .once();
    service.authorizationFallbackResponse_ = {'error': true};
    const promise = service.runAuthorization_();
    expect(document.documentElement).to.have.class('amp-access-loading');
    expect(document.documentElement).not.to.have.class('amp-access-error');
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(document.documentElement).not.to.have.class('amp-access-error');
      expect(elementOn).to.have.attribute('amp-access-hide');
      expect(elementOff).not.to.have.attribute('amp-access-hide');
      expect(elementError).not.to.have.attribute('amp-access-hide');
    });
  });

  it('should NOT fallback on authorization failure when disabled', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.reject('intentional'))
        .once();
    service.authorizationFallbackResponse_ = {'error': true};
    const promise = service.runAuthorization_(/* disableFallback */ true);
    expect(document.documentElement).to.have.class('amp-access-loading');
    expect(document.documentElement).not.to.have.class('amp-access-error');
    return promise.then(() => {
      expect(document.documentElement).to.have.class('amp-access-error');
    });
  });

  it('should resolve first-authorization promise after success', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: true}))
        .once();
    performanceMock.expects('tick')
        .withExactArgs('aaa')
        .once();
    performanceMock.expects('tickSinceVisible')
        .withExactArgs('aaav')
        .once();
    expect(service.firstAuthorizationPromise_).to.exist;
    return service.runAuthorization_().then(() => {
      return service.whenFirstAuthorized().then(() => {
        expect(service.analyticsEvent_).to.have.been.calledOnce;
        expect(service.analyticsEvent_).to.have.been.calledWith(
            'access-authorization-received');
      });
    });
  });

  it('should NOT resolve first-authorization promise after failure', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.reject('intentional'))
        .once();
    return service.runAuthorization_().then(() => {
      expect(service.firstAuthorizationPromise_).to.exist;
      let resolved = false;
      service.firstAuthorizationPromise_.then(() => {
        resolved = true;
      });
      return Promise.resolve().then(() => {
        expect(resolved).to.be.false;
        expect(service.analyticsEvent_).to.have.been.calledOnce;
        expect(service.analyticsEvent_).to.not.have.been.calledWith(
            'access-authorization-received');
        expect(service.analyticsEvent_).to.have.been.calledWith(
            'access-authorization-failed');
      });
    });
  });

  it('should run authorization for broadcast events on same origin', () => {
    let broadcastHandler;
    sandbox.stub(service.viewer_, 'onBroadcast', handler => {
      broadcastHandler = handler;
    });
    service.runAuthorization_ = sandbox.spy();
    service.listenToBroadcasts_();
    expect(broadcastHandler).to.exist;

    // Unknown message.
    broadcastHandler({});
    expect(service.runAuthorization_).to.have.not.been.called;

    // Wrong origin.
    broadcastHandler({type: 'amp-access-reauthorize', origin: 'other'});
    expect(service.runAuthorization_).to.have.not.been.called;

    // Broadcast with the right origin.
    broadcastHandler({type: 'amp-access-reauthorize',
        origin: service.pubOrigin_});
    expect(service.runAuthorization_).to.be.calledOnce;
  });
});


describes.fakeWin('AccessService applyAuthorizationToElement_', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let configElement, elementOn, elementOff;
  let templatesMock;
  let mutateElementStub;
  let service;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID',
    });
    document.body.appendChild(configElement);
    document.documentElement.classList.remove('amp-access-error');

    elementOn = document.createElement('div');
    elementOn.setAttribute('amp-access', 'access');
    document.body.appendChild(elementOn);

    elementOff = document.createElement('div');
    elementOff.setAttribute('amp-access', 'NOT access');
    document.body.appendChild(elementOff);

    service = new AccessService(ampdoc);

    mutateElementStub = sandbox.stub(service.resources_, 'mutateElement',
        (unusedElement, mutator) => {
          mutator();
          return Promise.resolve();
        });
    service.vsync_ = {
      mutatePromise: callback => {
        callback();
        return Promise.resolve();
      },
    };
    templatesMock = sandbox.mock(service.templates_);
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
    if (elementOn.parentElement) {
      elementOn.parentElement.removeChild(elementOn);
    }
    if (elementOff.parentElement) {
      elementOff.parentElement.removeChild(elementOff);
    }
  });

  function createTemplate() {
    const template = document.createElement('template');
    template.setAttribute('amp-access-template', '');
    return template;
  }

  it('should toggle authorization attribute', () => {
    expect(elementOn).not.to.have.attribute('amp-access-hide');
    expect(elementOff).not.to.have.attribute('amp-access-hide');

    service.applyAuthorizationToElement_(elementOn, {access: true});
    service.applyAuthorizationToElement_(elementOff, {access: true});
    expect(elementOn).not.to.have.attribute('amp-access-hide');
    expect(elementOff).to.have.attribute('amp-access-hide');
    expect(mutateElementStub).to.be.calledOnce;
    expect(mutateElementStub.getCall(0).args[0]).to.equal(elementOff);

    service.applyAuthorizationToElement_(elementOn, {access: false});
    service.applyAuthorizationToElement_(elementOff, {access: false});
    expect(elementOn).to.have.attribute('amp-access-hide');
    expect(elementOff).not.to.have.attribute('amp-access-hide');
    expect(mutateElementStub).to.have.callCount(3);
    expect(mutateElementStub.getCall(1).args[0]).to.equal(elementOn);
    expect(mutateElementStub.getCall(2).args[0]).to.equal(elementOff);
  });

  it('should render and re-render templates when access is on', () => {
    const template1 = createTemplate();
    const template2 = createTemplate();
    elementOn.appendChild(template1);
    elementOn.appendChild(template2);

    function renderAndCheck() {
      templatesMock = sandbox.mock(service.templates_);
      const result1 = document.createElement('div');
      const result2 = document.createElement('div');
      templatesMock.expects('renderTemplate')
          .withExactArgs(template1, {access: true})
          .returns(Promise.resolve(result1))
          .once();
      templatesMock.expects('renderTemplate')
          .withExactArgs(template2, {access: true})
          .returns(Promise.resolve(result2))
          .once();
      const p = service.applyAuthorizationToElement_(elementOn, {access: true});
      return p.then(() => {
        expect(elementOn.contains(template1)).to.be.false;
        expect(elementOn.contains(result1)).to.be.true;
        expect(result1).to.have.attribute('amp-access-template');
        expect(result1['__AMP_ACCESS__TEMPLATE']).to.equal(template1);

        expect(elementOn.contains(template2)).to.be.false;
        expect(elementOn.contains(result2)).to.be.true;
        expect(result2).to.have.attribute('amp-access-template');
        expect(result2['__AMP_ACCESS__TEMPLATE']).to.equal(template2);

        expect(elementOn.querySelectorAll('[amp-access-template]').length)
            .to.equal(2);
        templatesMock.verify();
      });
    }

    return renderAndCheck().then(() => {
      // Render second time.
      return renderAndCheck();
    }).then(() => {
      // Render third time.
      return renderAndCheck();
    });
  });

  it('should NOT render templates when access is off', () => {
    elementOff.appendChild(createTemplate());
    templatesMock.expects('renderTemplate').never();
    service.applyAuthorizationToElement_(elementOff, {access: true});
  });
});


describes.fakeWin('AccessService pingback', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let clock;
  let configElement;
  let adapterMock;
  let cidMock;
  let visibilityChanged;
  let scrolled;
  let service;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;
    clock = sandbox.useFakeTimers();

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID&type=AUTHDATA(child.type)',
      'login': 'https://acme.com/l?rid=READER_ID',
    });
    document.body.appendChild(configElement);
    document.documentElement.classList.remove('amp-access-error');

    service = new AccessService(ampdoc);

    const adapter = {
      isPingbackEnabled: () => true,
      pingback: () => Promise.resolve(),
    };
    service.adapter_ = adapter;
    adapterMock = sandbox.mock(adapter);

    const cid = {
      get: () => {},
    };
    cidMock = sandbox.mock(cid);
    service.cid_ = Promise.resolve(cid);

    service.analyticsEvent_ = sandbox.spy();
    this.docState_ = {
      onReady: callback => callback(),
    };

    visibilityChanged = new Observable();
    service.viewer_ = {
      isVisible: () => true,
      whenFirstVisible: () => Promise.resolve(),
      onVisibilityChanged: callback => visibilityChanged.add(callback),
      broadcast: () => {},
    };

    scrolled = new Observable();
    service.viewport_ = {
      onScroll: callback => scrolled.add(callback),
    };

    // Emulate first authorization complete.
    service.firstAuthorizationResolver_();
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
    adapterMock.verify();
  });

  function expectGetReaderId(result) {
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve(result))
        .once();
  }

  it('should register "viewed" signal after timeout', () => {
    service.reportViewToServer_ = sandbox.spy();
    const p = service.reportWhenViewed_(/* timeToView */ 2000);
    return Promise.resolve().then(() => {
      clock.tick(2001);
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_).to.be.calledOnce;
      expect(visibilityChanged.getHandlerCount()).to.equal(0);
      expect(scrolled.getHandlerCount()).to.equal(0);
      expect(service.analyticsEvent_).to.have.been.calledWith('access-viewed');
    });
  });

  it('should register "viewed" signal after scroll', () => {
    service.reportViewToServer_ = sandbox.spy();
    const p = service.reportWhenViewed_(/* timeToView */ 2000);
    return Promise.resolve().then(() => {
      scrolled.fire();
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_).to.be.calledOnce;
      expect(visibilityChanged.getHandlerCount()).to.equal(0);
      expect(scrolled.getHandlerCount()).to.equal(0);
      expect(service.analyticsEvent_).to.have.been.calledWith('access-viewed');
    });
  });

  it('should register "viewed" signal after click', () => {
    service.reportViewToServer_ = sandbox.spy();
    const p = service.reportWhenViewed_(/* timeToView */ 2000);
    return Promise.resolve().then(() => {
      let clickEvent;
      if (document.createEvent) {
        clickEvent = document.createEvent('MouseEvent');
        clickEvent.initMouseEvent('click', true, true, window, 1);
      } else {
        clickEvent = document.createEventObject();
        clickEvent.type = 'click';
      }
      document.documentElement.dispatchEvent(clickEvent);
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_).to.be.calledOnce;
      expect(visibilityChanged.getHandlerCount()).to.equal(0);
      expect(scrolled.getHandlerCount()).to.equal(0);
      expect(service.analyticsEvent_).to.have.been.calledWith('access-viewed');
    });
  });

  it('should wait for first authorization completion', () => {
    expect(service.firstAuthorizationPromise_).to.exist;
    let firstAuthorizationResolver;
    service.firstAuthorizationPromise_ = new Promise(resolve => {
      firstAuthorizationResolver = resolve;
    });
    const triggerStart = 1;  // First event is "access-authorization-received".
    service.reportViewToServer_ = sandbox.spy();
    service.reportWhenViewed_(/* timeToView */ 2000);
    return Promise.resolve().then(() => {
      clock.tick(2001);
      return Promise.resolve();
    }).then(() => {
      expect(service.reportViewToServer_).to.have.not.been.called;
      expect(service.analyticsEvent_.callCount).to.equal(triggerStart);
      firstAuthorizationResolver();
      return Promise.all([service.firstAuthorizationPromise_,
          service.reportViewPromise_]);
    }).then(() => {
      expect(service.reportViewToServer_).to.be.calledOnce;
      expect(service.analyticsEvent_.callCount).to.equal(triggerStart + 1);
      expect(service.analyticsEvent_.getCall(triggerStart).args[0])
          .to.equal('access-viewed');
    });
  });

  it('should wait for last authorization completion', () => {
    expect(service.lastAuthorizationPromise_).to.exist;
    let lastAuthorizationResolver;
    service.lastAuthorizationPromise_ = new Promise(resolve => {
      lastAuthorizationResolver = resolve;
    });
    const triggerStart = 1;  // First event is "access-authorization-received".
    service.reportViewToServer_ = sandbox.spy();
    service.reportWhenViewed_(/* timeToView */ 2000);
    return Promise.resolve().then(() => {
      clock.tick(2001);
      return Promise.resolve();
    }).then(() => {
      expect(service.reportViewToServer_).to.have.not.been.called;
      expect(service.analyticsEvent_.callCount).to.equal(triggerStart);
      lastAuthorizationResolver();
      return Promise.all([service.lastAuthorizationPromise_,
          service.reportViewPromise_]);
    }).then(() => {
      expect(service.reportViewToServer_).to.be.calledOnce;
      expect(service.analyticsEvent_.callCount).to.equal(triggerStart + 1);
      expect(service.analyticsEvent_.getCall(triggerStart).args[0])
          .to.equal('access-viewed');
    });
  });

  it('should cancel "viewed" signal after click', () => {
    service.reportViewToServer_ = sandbox.spy();
    const p = service.reportWhenViewed_(/* timeToView */ 2000);
    return Promise.resolve().then(() => {
      service.viewer_.isVisible = () => false;
      visibilityChanged.fire();
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_).to.have.not.been.called;
      expect(visibilityChanged.getHandlerCount()).to.equal(0);
      expect(scrolled.getHandlerCount()).to.equal(0);
    });
  });

  it('should schedule "viewed" monitoring only once', () => {
    const timeToView = 2000;
    service.whenViewed_ = ttv => {
      expect(ttv).to.equal(timeToView);
      return Promise.resolve();
    };
    service.reportViewToServer_ = sandbox.spy();
    const p1 = service.reportWhenViewed_(timeToView);
    const p2 = service.reportWhenViewed_(timeToView);
    expect(p2).to.equal(p1);
    return p1.then(() => {
      const p3 = service.reportWhenViewed_(timeToView);
      expect(p3).to.equal(p1);
      return p3;
    }).then(() => {
      expect(service.reportViewToServer_).to.be.calledOnce;
    });
  });

  it('should ignore "viewed" monitoring when pingback is disabled', () => {
    adapterMock.expects('isPingbackEnabled').returns(false);

    service.reportWhenViewed_ = sandbox.spy();
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');

    service.scheduleView_(/* timeToView */ 2000);

    expect(service.reportWhenViewed_).to.have.not.been.called;
    expect(service.reportViewPromise_).to.be.null;
    expect(broadcastStub).to.have.not.been.called;
  });

  it('should re-schedule "viewed" monitoring after visibility change', () => {
    service.reportViewToServer_ = sandbox.spy();

    service.scheduleView_(/* timeToView */ 2000);

    // 1. First attempt fails due to document becoming invisible.
    let p1;
    return ampdoc.whenReady().then(() => {
      p1 = service.reportViewPromise_;
      expect(p1).to.exist;
      service.viewer_.isVisible = () => false;
      visibilityChanged.fire();
      return p1;
    }).then(() => 'SUCCESS', () => 'ERROR').then(result => {
      expect(result).to.equal('ERROR');
      expect(service.reportViewToServer_).to.have.not.been.called;
      expect(service.reportViewPromise_).to.not.exist;
    }).then(() => {
      // 2. Second attempt is rescheduled and will complete.
      service.viewer_.isVisible = () => true;
      visibilityChanged.fire();
      const p2 = service.reportViewPromise_;
      expect(p2).to.exist;
      expect(p2).to.not.equal(p1);
      expect(service.reportViewToServer_).to.have.not.been.called;
      return Promise.resolve().then(() => {
        clock.tick(2001);
        expect(service.reportViewToServer_).to.have.not.been.called;
        return p2;
      });
    }).then(() => 'SUCCESS', reason => reason).then(result => {
      expect(result).to.equal('SUCCESS');
      expect(service.reportViewToServer_).to.be.calledOnce;
      expect(service.reportViewPromise_).to.exist;
    });
  });

  it('should re-start "viewed" monitoring when directly requested', () => {
    service.lastAuthorizationPromise_ = Promise.resolve();
    const whenViewedSpy = sandbox.stub(service, 'whenViewed_', () => {
      return Promise.resolve();
    });
    service.scheduleView_(/* timeToView */ 0);
    return Promise.resolve().then(() => {
      expect(whenViewedSpy).to.be.calledOnce;
      service.scheduleView_(/* timeToView */ 0);
    }).then(() => {
      expect(whenViewedSpy).to.have.callCount(2);
    });
  });

  it('should send POST pingback', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('pingback')
        .withExactArgs()
        .returns(Promise.resolve())
        .once();
    return service.reportViewToServer_().then(() => {
      return 'SUCCESS';
    }, error => {
      return 'ERROR ' + error;
    }).then(result => {
      expect(result).to.equal('SUCCESS');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-pingback-sent');
    });
  });

  it('should NOT send analytics event if postback failed', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('pingback')
        .withExactArgs()
        .returns(Promise.reject('intentional'))
        .once();
    return service.reportViewToServer_().then(() => {
      return 'SUCCESS';
    }, error => {
      return 'ERROR ' + error;
    }).then(result => {
      expect(result).to.match(/ERROR/);
      expect(service.analyticsEvent_).to.have.not.been.calledWith(
          'access-pingback-sent');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-pingback-failed');
    });
  });

  it('should broadcast "viewed" signal to other documents', () => {
    service.reportViewToServer_ = sandbox.stub().returns(Promise.resolve());
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    const p = service.reportWhenViewed_(/* timeToView */ 2000);
    return Promise.resolve().then(() => {
      clock.tick(2001);
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_).to.be.calledOnce;
      expect(broadcastStub).to.be.calledOnce;
      expect(broadcastStub.firstCall.args[0]).to.deep.equal({
        'type': 'amp-access-reauthorize',
        'origin': service.pubOrigin_,
      });
    });
  });
});


describes.fakeWin('AccessService login', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let clock;
  let configElement;
  let cidMock;
  let serviceMock;
  let service;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;
    clock = sandbox.useFakeTimers();

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID',
    });
    document.body.appendChild(configElement);
    document.documentElement.classList.remove('amp-access-error');

    service = new AccessService(ampdoc);

    const cid = {
      get: () => {},
    };
    cidMock = sandbox.mock(cid);
    service.cid_ = Promise.resolve(cid);

    service.analyticsEvent_ = sandbox.spy();
    service.openLoginDialog_ = () => {};
    serviceMock = sandbox.mock(service);

    service.loginUrlMap_[''] = 'https://acme.com/l?rid=R';

    service.viewer_ = {
      broadcast: () => {},
      isVisible: () => true,
      onVisibilityChanged: () => {},
    };
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
  });

  it('should intercept global action to login', () => {
    serviceMock.expects('loginWithType_')
        .withExactArgs('')
        .once();
    const event = {preventDefault: sandbox.spy()};
    service.handleAction_({method: 'login', event});
    expect(event.preventDefault).to.be.calledOnce;
  });

  it('should intercept global action to login-other', () => {
    serviceMock.expects('loginWithType_')
        .withExactArgs('other')
        .once();
    const event = {preventDefault: sandbox.spy()};
    service.handleAction_({method: 'login-other', event});
    expect(event.preventDefault).to.be.calledOnce;
  });

  it('should build login url', () => {
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve('reader1'))
        .once();
    return service.buildLoginUrls_().then(urls => {
      const url = urls[0].url;
      expect(url).to.equal('https://acme.com/l?rid=reader1');
      expect(service.loginUrlMap_['']).to.equal(url);
    });
  });

  it('should build multiple login url', () => {
    service.loginConfig_ = {
      'login1': 'https://acme.com/l1?rid=READER_ID',
      'login2': 'https://acme.com/l2?rid=READER_ID',
    };
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve('reader1'))
        .atLeast(1);
    return service.buildLoginUrls_().then(urls => {
      expect(urls).to.have.length(2);
      let l1, l2;
      if (urls[0].type == 'login1') {
        l1 = 0;
        l2 = 1;
      } else {
        l1 = 1;
        l2 = 0;
      }
      expect(urls[l1]).to.deep.equal({
        'type': 'login1',
        'url': 'https://acme.com/l1?rid=reader1',
      });
      expect(urls[l2]).to.deep.equal({
        'type': 'login2',
        'url': 'https://acme.com/l2?rid=reader1',
      });
      expect(service.loginUrlMap_['login1']).to
          .equal('https://acme.com/l1?rid=reader1');
      expect(service.loginUrlMap_['login2']).to
          .equal('https://acme.com/l2?rid=reader1');
    });
  });

  it('should build login url with RETURN_URL', () => {
    service.loginConfig_[''] =
        'https://acme.com/l?rid=READER_ID&ret=RETURN_URL';
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve('reader1'))
        .once();
    return service.buildLoginUrls_().then(urls => {
      const url = urls[0].url;
      expect(url).to.equal('https://acme.com/l?rid=reader1&ret=RETURN_URL');
      expect(service.loginUrlMap_['']).to.equal(url);
    });
  });

  it('should open dialog in the same microtask', () => {
    service.openLoginDialog_ = sandbox.stub();
    service.openLoginDialog_.returns(new Promise(() => {}));
    service.loginWithType_('');
    expect(service.openLoginDialog_).to.be.calledOnce;
    expect(service.openLoginDialog_.firstCall.args[0])
        .to.equal('https://acme.com/l?rid=R');
    expect(service.analyticsEvent_).to.have.been.calledWith(
        'access-login-started');
  });

  it('should fail to open dialog if loginUrl is not built yet', () => {
    service.loginUrlMap_[''] = null;
    expect(() => service.loginWithType_('')).to.throw(/Login URL is not ready/);
  });

  it('should succeed login with success=true', () => {
    const authorizationStub = sandbox.stub(service, 'runAuthorization_',
        () => Promise.resolve());
    const viewStub = sandbox.stub(service, 'scheduleView_');
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    serviceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.resolve('#success=true'))
        .once();
    return service.loginWithType_('').then(() => {
      expect(service.loginPromise_).to.not.exist;
      expect(authorizationStub).to.be.calledOnce;
      expect(authorizationStub).to.be.calledWithExactly(
          /* disableFallback */ true);
      expect(viewStub).to.be.calledOnce;
      expect(viewStub).to.be.calledWithExactly(/* timeToView */ 0);
      expect(broadcastStub).to.be.calledOnce;
      expect(broadcastStub.firstCall.args[0]).to.deep.equal({
        'type': 'amp-access-reauthorize',
        'origin': service.pubOrigin_,
      });

      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-success');
    });
  });

  it('should fail login with success=no', () => {
    service.runAuthorization_ = sandbox.spy();
    serviceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.resolve('#success=no'))
        .once();
    return service.loginWithType_('').then(() => {
      expect(service.loginPromise_).to.not.exist;
      expect(service.runAuthorization_).to.have.not.been.called;
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-rejected');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
    });
  });

  it('should fail login with empty response, but re-authorize', () => {
    const authorizationStub = sandbox.stub(service, 'runAuthorization_',
        () => Promise.resolve());
    const viewStub = sandbox.stub(service, 'scheduleView_');
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    serviceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.resolve(''))
        .once();
    return service.loginWithType_('').then(() => {
      expect(service.loginPromise_).to.not.exist;
      expect(authorizationStub).to.be.calledOnce;
      expect(authorizationStub).to.be.calledWithExactly(
          /* disableFallback */ true);
      expect(viewStub).to.be.calledOnce;
      expect(viewStub).to.be.calledWithExactly(/* timeToView */ 0);
      expect(broadcastStub).to.be.calledOnce;
      expect(broadcastStub.firstCall.args[0]).to.deep.equal({
        'type': 'amp-access-reauthorize',
        'origin': service.pubOrigin_,
      });
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-rejected');
    });
  });

  it('should fail login with aborted dialog', () => {
    service.runAuthorization_ = sandbox.spy();
    serviceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.reject('abort'))
        .once();
    return service.loginWithType_('')
    .then(() => 'S', () => 'ERROR').then(result => {
      expect(result).to.equal('ERROR');
      expect(service.loginPromise_).to.not.exist;
      expect(service.runAuthorization_).to.have.not.been.called;
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-failed');
    });
  });

  it('should succeed login with success=true with multiple logins', () => {
    service.loginConfig_ = {
      'login1': 'https://acme.com/l1?rid=READER_ID',
      'login2': 'https://acme.com/l2?rid=READER_ID',
    };
    service.loginUrlMap_ = {
      'login1': 'https://acme.com/l1?rid=R',
      'login2': 'https://acme.com/l2?rid=R',
    };
    const authorizationStub = sandbox.stub(service, 'runAuthorization_',
        () => Promise.resolve());
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    serviceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l2?rid=R')
        .returns(Promise.resolve('#success=true'))
        .once();
    return service.loginWithType_('login2').then(() => {
      expect(service.loginPromise_).to.not.exist;
      expect(authorizationStub).to.be.calledOnce;
      expect(broadcastStub).to.be.calledOnce;
      expect(broadcastStub.firstCall.args[0]).to.deep.equal({
        'type': 'amp-access-reauthorize',
        'origin': service.pubOrigin_,
      });
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-login2-started');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-success');
      expect(service.analyticsEvent_).to.have.been.calledWith(
          'access-login-login2-success');
    });
  });

  it('should block login for 1 second', () => {
    let p1Reject;
    const p1Promise = new Promise((unusedResolve, reject) => {
      p1Reject = reject;
    });
    service.runAuthorization_ = sandbox.spy();
    const openLoginDialogStub = sandbox.stub(service, 'openLoginDialog_');
    openLoginDialogStub.onCall(0).returns(p1Promise);
    openLoginDialogStub.onCall(1).returns(new Promise(() => {}));
    openLoginDialogStub.onCall(2).throws();
    const p1 = service.loginWithType_('');

    // The immediate second attempt is blocked.
    const p2 = service.loginWithType_('');
    expect(service.loginPromise_).to.equal(p1);
    expect(p2).to.equal(p1);

    // The delayed third attempt succeeds after 1 second.
    clock.tick(1001);
    const p3 = service.loginWithType_('');
    expect(service.loginPromise_).to.equal(p3);
    expect(p3).to.not.equal(p1);

    // Rejecting the first login attempt does not reject the current promise.
    p1Reject();
    return p1Promise.then(() => 'SUCCESS', () => 'ERROR').then(res => {
      expect(res).to.equal('ERROR');
      expect(service.loginPromise_).to.equal(p3);
    });
  });

  it('should login with url only', () => {
    serviceMock.expects('login_')
        .withExactArgs('https://url', '')
        .once();
    service.loginWithUrl('https://url');
  });

  it('should request sign-in when configured', () => {
    service.signIn_.requestSignIn = sandbox.stub();
    service.signIn_.requestSignIn.returns(Promise.resolve('#signin'));
    service.openLoginDialog_ = sandbox.stub();
    service.openLoginDialog_.returns(Promise.resolve('#login'));
    service.loginWithType_('');
    expect(service.signIn_.requestSignIn).to.be.calledOnce;
    expect(service.signIn_.requestSignIn.firstCall.args[0])
        .to.equal('https://acme.com/l?rid=R');
    expect(service.openLoginDialog_).to.have.not.been.called;
  });

  it('should wait for token exchange post-login with success=true', () => {
    service.signIn_.postLoginResult = sandbox.stub();
    service.signIn_.postLoginResult.returns(Promise.resolve());
    const authorizationStub = sandbox.stub(service, 'runAuthorization_',
        () => Promise.resolve());
    const viewStub = sandbox.stub(service, 'scheduleView_');
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    serviceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.resolve('#success=true'))
        .once();
    return service.loginWithType_('').then(() => {
      expect(service.loginPromise_).to.not.exist;
      expect(service.signIn_.postLoginResult).to.be.calledOnce;
      expect(service.signIn_.postLoginResult.firstCall.args[0]).to.deep.equal({
        'success': 'true',
      });
      expect(authorizationStub).to.be.calledOnce;
      expect(viewStub).to.be.calledOnce;
      expect(broadcastStub).to.be.calledOnce;
    });
  });
});


describes.fakeWin('AccessService analytics', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let configElement;
  let service;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID',
    });
    document.body.appendChild(configElement);
    document.documentElement.classList.remove('amp-access-error');

    service = new AccessService(ampdoc);
    service.enabled_ = true;
    service.getReaderId_ = () => {
      return Promise.resolve('reader1');
    };
    service.setAuthResponse_({views: 3, child: {type: 'premium'}, zero: 0});
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
  });

  it('should return null when not enabled', () => {
    service.enabled_ = false;
    expect(service.getAccessReaderId()).to.be.null;
    expect(service.getAuthdataField('views')).to.be.null;
  });

  it('should return reader id', () => {
    return service.getAccessReaderId().then(readerId => {
      expect(readerId).to.equal('reader1');
    });
  });

  it('should return authdata', () => {
    service.firstAuthorizationResolver_();
    return Promise.all([
      service.getAuthdataField('views'),
      service.getAuthdataField('child.type'),
      service.getAuthdataField('other'),
      service.getAuthdataField('child.other'),
      service.getAuthdataField('zero'),
    ]).then(res => {
      expect(res[0]).to.equal(3);
      expect(res[1]).to.equal('premium');
      expect(res[2]).to.be.null;
      expect(res[3]).to.be.null;
      expect(res[4]).to.equal(0);
    });
  });

  it('should wait the first authorization for authdata', () => {
    let viewsValue;
    const promise = service.getAuthdataField('views').then(res => {
      viewsValue = res;
    });
    return Promise.resolve().then(() => {
      expect(viewsValue).to.be.undefined;
      // Resolve the authorization.
      service.firstAuthorizationResolver_();
      return promise;
    }).then(() => {
      expect(viewsValue).to.equal(3);
    });
  });

  it('should wait the latest authorization for authdata if started', () => {
    let resolver;
    service.lastAuthorizationPromise_ = new Promise(resolve => {
      resolver = resolve;
    });
    let viewsValue;
    const promise = service.getAuthdataField('views').then(res => {
      viewsValue = res;
    });
    return Promise.resolve().then(() => {
      expect(viewsValue).to.be.undefined;
      // Resolve the first authorization.
      service.firstAuthorizationResolver_();
    }).then(() => {
      expect(viewsValue).to.be.undefined;
      // Resolve the second authorization.
      resolver();
      return promise;
    }).then(() => {
      expect(viewsValue).to.equal(3);
    });
  });
});
