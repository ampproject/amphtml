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
import {AccessService} from '../amp-access';
import {AmpEvents} from '../../../../src/amp-events';
import {Observable} from '../../../../src/observable';
import {Services} from '../../../../src/services';
import {cidServiceForDocForTesting} from
  '../../../../src/service/cid-impl';
import {installPerformanceService} from
  '../../../../src/service/performance-impl';
import {toggleExperiment} from '../../../../src/experiments';

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
    allowConsoleError(() => { expect(() => {
      new AccessService(ampdoc);
    }).to.throw(/"authorization" URL must be specified/); });
  });

  it('should fail if config login is malformed', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'http://acme.com/l',
    };
    element.textContent = JSON.stringify(config);
    allowConsoleError(() => { expect(() => {
      new AccessService(ampdoc);
    }).to.throw(/https\:/); });
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
    const source = service.sources_[0];
    expect(source.type_).to.equal('client');
    expect(source.loginConfig_).to.deep.equal({'': 'https://acme.com/l'});
    expect(source.adapter_).to.be.instanceOf(AccessClientAdapter);
    expect(source.adapter_.authorizationUrl_).to.equal('https://acme.com/a');
  });

  it('should fail if type is unknown', () => {
    const config = {
      'type': 'unknown',
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    };
    element.textContent = JSON.stringify(config);
    allowConsoleError(() => { expect(() => {
      new AccessService(ampdoc);
    }).to.throw(/Unknown access type/); });
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
    service.sources_[0].buildLoginUrls_ = sandbox.spy();
    service.runAuthorization_ = sandbox.spy();
    service.scheduleView_ = sandbox.spy();
    service.listenToBroadcasts_ = sandbox.spy();

    service.startInternal_();
    expect(service.sources_[0].buildLoginUrls_).to.be.calledOnce;
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

  it('should find and register vendor', () => {
    const config = {
      'vendor': 'vendor1',
    };
    element.textContent = JSON.stringify(config);
    const accessService = new AccessService(ampdoc);
    const source = accessService.getVendorSource('vendor1');
    expect(source).to.equal(accessService.sources_[0]);

    class Vendor1 {}
    const vendor1 = new Vendor1();
    source.getAdapter().registerVendor(vendor1);
    return source.adapter_.vendorPromise_.then(vendor => {
      expect(vendor).to.equal(vendor1);
    });
  });

  it('should fail to find non-existent vendor', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
    };
    element.textContent = JSON.stringify(config);
    const accessService = new AccessService(ampdoc);
    allowConsoleError(() => { expect(() => {
      accessService.getVendorSource('vendor1');
    }).to.throw(/can only be used for "type=vendor"/); });
  });

  it('should parse multiple sources', () => {
    const config = [
      {
        'authorization': 'https://acme.com/a',
        'pingback': 'https://acme.com/p',
        'login': 'https://acme.com/l',
        'namespace': 'donuts',
      },
      {
        'authorization': 'https://beta.com/a',
        'pingback': 'https://beta.com/p',
        'login': 'https://beta.com/l',
        'namespace': 'beer',
      },
    ];
    element.textContent = JSON.stringify(config);
    const accessService = new AccessService(ampdoc);
    expect(accessService.sources_.length).to.equal(2);
    expect(accessService.sources_[0].getNamespace()).to.equal('donuts');
    expect(accessService.sources_[1].getNamespace()).to.equal('beer');
  });

  it('should reject invalid multiple sources', () => {
    const config = [
      {
        'authorization': 'https://acme.com/a',
        'pingback': 'https://acme.com/p',
        'login': 'https://acme.com/l',
        'namespace': 'beer',
      },
      {
        'authorization': 'https://beta.com/a',
        'pingback': 'https://beta.com/p',
        'login': 'https://beta.com/l',
        'namespace': 'beer',
      },
    ];
    element.textContent = JSON.stringify(config);
    allowConsoleError(() => { expect(() => {
      new AccessService(ampdoc);
    }).to.throw(/Namespace already used/); });

    delete (config[0].namespace);
    element.textContent = JSON.stringify(config);
    allowConsoleError(() => { expect(() => {
      new AccessService(ampdoc);
    }).to.throw(/Namespace required/); });
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
    service.viewer_ = {
      isVisible: () => true,
      whenFirstVisible: () => Promise.resolve(),
      onVisibilityChanged: () => {},
      broadcast: () => {},
      onBroadcast: () => {},
    };

    const adapter = {
      getConfig: () => {},
      isAuthorizationEnabled: () => true,
      isPingbackEnabled: () => true,
      authorize: () => {},
    };
    service.sources_[0].adapter_ = adapter;
    adapterMock = sandbox.mock(adapter);

    sandbox.stub(service.resources_, 'mutateElement').callsFake(
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
    service.sources_[0].analyticsEvent_ = sandbox.spy();
    performanceMock = sandbox.mock(service.performance_);
    performanceMock.expects('onload_').atLeast(0);
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
    expect(document.documentElement).to.have.class('amp-access-loading');
    expect(document.documentElement).not.to.have.class('amp-access-error');
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(document.documentElement).not.to.have.class('amp-access-error');
      return service.lastAuthorizationPromises_;
    }).then(() => {
      expect(service.sources_[0].authResponse_).to.be.null;
    });
  });

  it('should run authorization flow', () => {
    const source = service.sources_[0];
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: true}))
        .once();
    expectGetReaderId('reader1');
    source.buildLoginUrls_ = sandbox.spy();
    const firstPromise = service.lastAuthorizationPromises_;
    const promise = service.runAuthorization_();
    expect(firstPromise).not.to.equal(promise);
    const lastPromise = service.lastAuthorizationPromises_;
    expect(lastPromise).to.equal(promise);
    expect(document.documentElement).to.have.class('amp-access-loading');
    expect(document.documentElement).not.to.have.class('amp-access-error');
    expect(source.buildLoginUrls_).to.have.not.been.called;
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(document.documentElement).not.to.have.class('amp-access-error');
      expect(elementOn).not.to.have.attribute('amp-access-hide');
      expect(elementOff).to.have.attribute('amp-access-hide');
      expect(source.authResponse_).to.exist;
      expect(source.authResponse_.access).to.be.true;
      expect(source.buildLoginUrls_).to.be.calledOnce;
      // Last authorization promise stays unchanged.
      expect(service.lastAuthorizationPromises_).to.equal(lastPromise);
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
      expect(elementOn).to.have.attribute('amp-access-hide');
      expect(elementOff).not.to.have.attribute('amp-access-hide');
    });
  });

  it('should apply authorization response to new sections', () => {
    function createElements() {
      const container = win.document.createElement('div');
      const elementOff = win.document.createElement('div');
      elementOff.setAttribute('amp-access', 'NOT access');
      container.appendChild(elementOff);
      const elementOn = win.document.createElement('div');
      elementOn.setAttribute('amp-access', 'access');
      container.appendChild(elementOn);
      return {container, elementOn, elementOff};
    }
    function dispatchUpdateEvent(target) {
      const event = win.document.createEvent('Event');
      event.initEvent(AmpEvents.DOM_UPDATE, true, true);
      target.dispatchEvent(event);
    }
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: true}))
        .once();
    const early = createElements();
    const later = createElements();
    // Add "early" elements right away.
    win.document.body.appendChild(early.container);
    dispatchUpdateEvent(early.container);
    expect(early.elementOn).not.to.have.attribute('amp-access-hide');
    expect(early.elementOff).not.to.have.attribute('amp-access-hide');
    return service.runAuthorization_().then(() => {
      // "early" applied by the authorization response.
      expect(early.elementOn).not.to.have.attribute('amp-access-hide');
      expect(early.elementOff).to.have.attribute('amp-access-hide');

      // "later" is not applied yet, not even after event.
      win.document.body.appendChild(later.container);
      dispatchUpdateEvent(later.container);
      expect(later.elementOn).not.to.have.attribute('amp-access-hide');
      expect(later.elementOff).not.to.have.attribute('amp-access-hide');
      return service.lastAuthorizationPromises_;
    }).then(() => {
      expect(later.elementOn).not.to.have.attribute('amp-access-hide');
      expect(later.elementOff).to.have.attribute('amp-access-hide');
    });
  });

  it('should execute the onApplyAuthorizations registered callbacks', () => {
    expectGetReaderId('reader1');
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: true}))
        .once();

    const applyAuthorizationsStub = sandbox.stub();
    service.onApplyAuthorizations(applyAuthorizationsStub);

    return service.runAuthorization_().then(() => {
      expect(applyAuthorizationsStub).to.have.been.calledOnce;
    });
  });

  it('should run authorization for broadcast events on same origin', () => {
    let broadcastHandler;
    sandbox.stub(service.viewer_, 'onBroadcast').callsFake(handler => {
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

    mutateElementStub =
        sandbox.stub(service.resources_, 'mutateElement').callsFake(
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
    service.sources_[0].adapter_ = adapter;
    adapterMock = sandbox.mock(adapter);

    const cid = {
      get: () => {},
    };
    cidMock = sandbox.mock(cid);
    service.cid_ = Promise.resolve(cid);

    service.analyticsEvent_ = sandbox.spy();
    service.sources_[0].analyticsEvent_ = sandbox.spy();
    win.docState_ = {
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
    service.sources_[0].firstAuthorizationResolver_();
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

  it('should wait for last authorization completion', () => {
    expect(service.lastAuthorizationPromises_).to.exist;
    let lastAuthorizationResolver;
    service.lastAuthorizationPromises_ = new Promise(resolve => {
      lastAuthorizationResolver = resolve;
    });
    const triggerStart = 1; // First event is "access-authorization-received".
    service.reportViewToServer_ = sandbox.spy();
    service.reportWhenViewed_(/* timeToView */ 2000);
    return Promise.resolve().then(() => {
      clock.tick(2001);
      return Promise.resolve();
    }).then(() => {
      expect(service.reportViewToServer_).to.have.not.been.called;
      // First event is "access-authorization-received".
      expect(service.analyticsEvent_.callCount).to.equal(triggerStart);
      lastAuthorizationResolver();
      return Promise.all([service.lastAuthorizationPromises_,
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
    const whenViewedSpy = sandbox.stub(service, 'whenViewed_').callsFake(() => {
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
      expect(service.sources_[0].analyticsEvent_).to.have.been.calledWith(
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
      expect(service.sources_[0].analyticsEvent_).to.have.not.been.calledWith(
          'access-pingback-sent');
      expect(service.sources_[0].analyticsEvent_).to.have.been.calledWith(
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

describes.fakeWin('AccessService refresh', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let configElement;
  let serviceMock;
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

    const cid = {
      get: () => {},
    };
    service.cid_ = Promise.resolve(cid);

    service.analyticsEvent_ = sandbox.spy();
    serviceMock = sandbox.mock(service);
    service.sources_[0].openLoginDialog_ = () => {};
    service.sources_[0].loginUrlMap_[''] = 'https://acme.com/l?rid=R';
    service.sources_[0].analyticsEvent_ = sandbox.spy();
    service.sources_[0].getAdapter().postAction = sandbox.spy();

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

  it('should intercept global action to refresh', () => {
    serviceMock.expects('runAuthorization_')
        .withExactArgs()
        .once();
    const event = {preventDefault: sandbox.spy()};
    const invocation = {method: 'refresh', event, satisfiesTrust: () => false};
    service.handleAction_(invocation);
    expect(event.preventDefault).to.not.be.called;

    invocation.satisfiesTrust = () => true;
    service.handleAction_(invocation);
    expect(event.preventDefault).to.be.calledOnce;
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
  let sourceMock;
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
    serviceMock = sandbox.mock(service);
    sourceMock = sandbox.mock(service.sources_[0]);
    service.sources_[0].openLoginDialog_ = () => {};
    service.sources_[0].loginUrlMap_[''] = 'https://acme.com/l?rid=R';
    service.sources_[0].analyticsEvent_ = sandbox.spy();
    service.sources_[0].getAdapter().postAction = sandbox.spy();

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
    const invocation = {method: 'login', event, satisfiesTrust: () => false};
    service.handleAction_(invocation);
    expect(event.preventDefault).to.not.be.called;

    invocation.satisfiesTrust = () => true;
    service.handleAction_(invocation);
    expect(event.preventDefault).to.be.calledOnce;
  });

  it('should intercept global action to login-other', () => {
    serviceMock.expects('loginWithType_')
        .withExactArgs('other')
        .once();
    const event = {preventDefault: sandbox.spy()};
    const invocation =
        {method: 'login-other', event, satisfiesTrust: () => false};
    service.handleAction_(invocation);
    expect(event.preventDefault).to.not.be.called;

    invocation.satisfiesTrust = () => true;
    service.handleAction_(invocation);
    expect(event.preventDefault).to.be.calledOnce;
  });

  it('should build login url', () => {
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve('reader1'))
        .once();
    return service.sources_[0].buildLoginUrls_().then(urls => {
      const {url} = urls[0];
      expect(url).to.equal('https://acme.com/l?rid=reader1');
      expect(service.sources_[0].loginUrlMap_['']).to.equal(url);
    });
  });

  it('should build multiple login url', () => {
    const source = service.sources_[0];
    source.loginConfig_ = {
      'login1': 'https://acme.com/l1?rid=READER_ID',
      'login2': 'https://acme.com/l2?rid=READER_ID',
    };
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve('reader1'))
        .atLeast(1);
    return source.buildLoginUrls_().then(urls => {
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
      expect(source.loginUrlMap_['login1']).to
          .equal('https://acme.com/l1?rid=reader1');
      expect(source.loginUrlMap_['login2']).to
          .equal('https://acme.com/l2?rid=reader1');
    });
  });

  it('should build login url with RETURN_URL', () => {
    const source = service.sources_[0];
    source.loginConfig_[''] =
        'https://acme.com/l?rid=READER_ID&ret=RETURN_URL';
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve('reader1'))
        .once();
    return source.buildLoginUrls_().then(urls => {
      const {url} = urls[0];
      expect(url).to.equal('https://acme.com/l?rid=reader1&ret=RETURN_URL');
      expect(source.loginUrlMap_['']).to.equal(url);
    });
  });

  it('should open dialog in the same microtask', () => {
    const source = service.sources_[0];
    source.openLoginDialog_ = sandbox.stub();
    source.openLoginDialog_.returns(new Promise(() => {}));
    service.loginWithType_('');
    expect(source.openLoginDialog_).to.be.calledOnce;
    expect(source.openLoginDialog_.firstCall.args[0])
        .to.equal('https://acme.com/l?rid=R');
    expect(source.analyticsEvent_).to.have.been.calledWith(
        'access-login-started');
  });

  it('should fail to open dialog if loginUrl is not built yet', () => {
    service.sources_[0].loginUrlMap_[''] = null;
    allowConsoleError(() => {
      expect(() => service.loginWithType_('')).to.throw(
          /Login URL is not ready/);
    });
  });

  it('should succeed login with success=true', () => {
    const source = service.sources_[0];
    const authorizationStub =
        sandbox.stub(source, 'runAuthorization').callsFake(
            () => Promise.resolve());
    const viewStub = sandbox.stub(source, 'scheduleView_');
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    sourceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.resolve('#success=true'))
        .once();
    return service.loginWithType_('').then(() => {
      expect(source.getAdapter().postAction).to.be.calledOnce;
      expect(source.loginPromise_).to.not.exist;
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

      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-success');
    });
  });

  it('should fail login with success=no', () => {
    const source = service.sources_[0];
    service.runAuthorization_ = sandbox.spy();
    sourceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.resolve('#success=no'))
        .once();
    return service.loginWithType_('').then(() => {
      expect(source.loginPromise_).to.not.exist;
      expect(service.runAuthorization_).to.have.not.been.called;
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-rejected');
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
    });
  });

  it('should fail login with empty response, but re-authorize', () => {
    const source = service.sources_[0];
    const authorizationStub =
      sandbox.stub(source, 'runAuthorization').callsFake(
          () => Promise.resolve());
    const viewStub = sandbox.stub(source, 'scheduleView_');
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    sourceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.resolve(''))
        .once();
    return service.loginWithType_('').then(() => {
      expect(source.loginPromise_).to.not.exist;
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
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-rejected');
    });
  });

  it('should fail login with aborted dialog', () => {
    const source = service.sources_[0];
    service.runAuthorization_ = sandbox.spy();
    sourceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.reject('abort'))
        .once();
    return service.loginWithType_('')
        .then(() => 'S', () => 'ERROR').then(result => {
          expect(result).to.equal('ERROR');
          expect(source.loginPromise_).to.not.exist;
          expect(service.runAuthorization_).to.have.not.been.called;
          expect(source.analyticsEvent_).to.have.been.calledWith(
              'access-login-started');
          expect(source.analyticsEvent_).to.have.been.calledWith(
              'access-login-failed');
        });
  });

  it('should succeed login with success=true with multiple logins', () => {
    const source = service.sources_[0];
    source.loginConfig_ = {
      'login1': 'https://acme.com/l1?rid=READER_ID',
      'login2': 'https://acme.com/l2?rid=READER_ID',
    };
    source.loginUrlMap_ = {
      'login1': 'https://acme.com/l1?rid=R',
      'login2': 'https://acme.com/l2?rid=R',
    };
    const authorizationStub =
      sandbox.stub(source, 'runAuthorization').callsFake(
          () => Promise.resolve());
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    sourceMock.expects('openLoginDialog_')
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
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-started');
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-login2-started');
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-success');
      expect(source.analyticsEvent_).to.have.been.calledWith(
          'access-login-login2-success');
    });
  });

  it('should block login for 1 second', () => {
    let p1Reject;
    const p1Promise = new Promise((unusedResolve, reject) => {
      p1Reject = reject;
    });
    const source = service.sources_[0];
    service.runAuthorization_ = sandbox.spy();

    const openLoginDialogStub = sandbox.stub(source, 'openLoginDialog_');
    openLoginDialogStub.onCall(0).returns(p1Promise);
    openLoginDialogStub.onCall(1).returns(new Promise(() => {}));
    openLoginDialogStub.onCall(2).throws();
    const p1 = service.loginWithType_('');

    // The immediate second attempt is blocked.
    const p2 = service.loginWithType_('');
    expect(source.loginPromise_).to.equal(p1);
    expect(p2).to.equal(p1);

    // The delayed third attempt succeeds after 1 second.
    clock.tick(1001);
    const p3 = service.loginWithType_('');
    expect(source.loginPromise_).to.equal(p3);
    expect(p3).to.not.equal(p1);

    // Rejecting the first login attempt does not reject the current promise.
    p1Reject();
    return p1Promise.then(() => 'SUCCESS', () => 'ERROR').then(res => {
      expect(res).to.equal('ERROR');
      expect(source.loginPromise_).to.equal(p3);
    });
  });

  it('should wait for token exchange post-login with success=true', () => {
    const source = service.sources_[0];
    const authorizationStub =
      sandbox.stub(source, 'runAuthorization').callsFake(
          () => Promise.resolve());
    const viewStub = sandbox.stub(source, 'scheduleView_');
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    sourceMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=R')
        .returns(Promise.resolve('#success=true'))
        .once();
    return service.loginWithType_('').then(() => {
      expect(source.loginPromise_).to.not.exist;
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
    service.sources_[0].setAuthResponse_(
        {views: 3, child: {type: 'premium'}, zero: 0});
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
    service.sources_[0].firstAuthorizationResolver_();
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
      service.sources_[0].firstAuthorizationResolver_();
      return promise;
    }).then(() => {
      expect(viewsValue).to.equal(3);
    });
  });

  it('should wait the latest authorization for authdata if started', () => {
    let resolver;
    service.lastAuthorizationPromises_ = new Promise(resolve => {
      resolver = resolve;
    });
    let viewsValue;
    const promise = service.getAuthdataField('views').then(res => {
      viewsValue = res;
    });
    return Promise.resolve().then(() => {
      expect(viewsValue).to.be.undefined;
      // Resolve the first authorization.
      service.sources_[0].firstAuthorizationResolver_();
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


describes.fakeWin('AccessService multiple sources', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let clock;
  let configElement, elementOnBeer, elementOnBeerOrDonuts, elementError;
  let cidMock;
  let adapterBeerMock, adapterDonutsMock;
  let performanceMock;
  let service;
  let sourceBeer, sourceDonuts;

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
    configElement.textContent = JSON.stringify([
      {
        'authorization': 'https://acme.com/a?rid=READER_ID',
        'pingback': 'https://acme.com/p?rid=READER_ID',
        'login': 'https://acme.com/l?rid=READER_ID',
        'namespace': 'beer',
      },
      {
        'authorization': 'https://acme.com/a?rid=READER_ID',
        'pingback': 'https://acme.com/p?rid=READER_ID',
        'login': {
          'login2': 'https://acme.com/l?rid=READER_ID',
        },
        'namespace': 'donuts',
      },
    ]);
    document.body.appendChild(configElement);
    document.documentElement.classList.remove('amp-access-error');

    elementOnBeer = document.createElement('div');
    elementOnBeer.setAttribute('amp-access', 'beer.access');
    document.body.appendChild(elementOnBeer);

    elementOnBeerOrDonuts = document.createElement('div');
    elementOnBeerOrDonuts.setAttribute('amp-access',
        'beer.access OR donuts.access');
    document.body.appendChild(elementOnBeerOrDonuts);

    elementError = document.createElement('div');
    elementError.setAttribute('amp-access', 'error');
    elementError.setAttribute('amp-access-hide', '');
    document.body.appendChild(elementError);

    service = new AccessService(ampdoc);
    sourceBeer = service.sources_[0];
    sourceDonuts = service.sources_[1];

    const adapterBeer = {
      getConfig: () => {},
      isAuthorizationEnabled: () => true,
      isPingbackEnabled: () => true,
      authorize: () => {},
      postAction: () => {},
    };
    const adapterDonuts = {
      getConfig: () => {},
      isAuthorizationEnabled: () => true,
      isPingbackEnabled: () => true,
      authorize: () => {},
      postAction: () => {},
    };
    sourceBeer.adapter_ = adapterBeer;
    adapterBeerMock = sandbox.mock(adapterBeer);

    sourceDonuts.adapter_ = adapterDonuts;
    adapterDonutsMock = sandbox.mock(adapterDonuts);

    sandbox.stub(service.resources_, 'mutateElement').callsFake(
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
    sourceBeer.analyticsEvent_ = sandbox.spy();
    sourceDonuts.analyticsEvent_ = sandbox.spy();
    performanceMock = sandbox.mock(service.performance_);
    performanceMock.expects('onload_').atLeast(0);
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
    if (elementOnBeer.parentElement) {
      elementOnBeer.parentElement.removeChild(elementOnBeer);
    }
    if (elementOnBeerOrDonuts.parentElement) {
      elementOnBeerOrDonuts.parentElement.removeChild(elementOnBeerOrDonuts);
    }
    if (elementError.parentElement) {
      elementError.parentElement.removeChild(elementError);
    }
    adapterBeerMock.verify();
    adapterDonutsMock.verify();
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

  it('should run authorization flow', () => {
    expectGetReaderId('reader1');
    adapterBeerMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: false}))
        .once();
    adapterDonutsMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: true}))
        .once();

    const promise = service.runAuthorization_();
    const lastPromise = service.lastAuthorizationPromises_;
    expect(lastPromise).to.equal(promise);
    expect(document.documentElement).to.have.class('amp-access-loading');
    expect(document.documentElement).not.to.have.class('amp-access-error');
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(document.documentElement).not.to.have.class('amp-access-error');
      expect(elementOnBeer).to.have.attribute('amp-access-hide');
      expect(elementOnBeerOrDonuts).not.to.have.attribute('amp-access-hide');
      expect(sourceBeer.authResponse_).to.exist;
      expect(sourceBeer.authResponse_.access).to.be.false;
      expect(sourceDonuts.authResponse_).to.exist;
      expect(sourceDonuts.authResponse_.access).to.be.true;
      // Last authorization promise stays unchanged.
      expect(service.lastAuthorizationPromises_).to.equal(lastPromise);
    });
  });

  it('should return authdata', () => {
    expectGetReaderId('reader1');
    adapterBeerMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.reject('rejected'))
        .once();
    adapterDonutsMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: true}))
        .once();
    service.runAuthorization_();
    return Promise.all([
      service.getAuthdataField('beer.access'),
      service.getAuthdataField('donuts.access'),
      service.getAuthdataField('garbage'),
      service.getAuthdataField('donuts.garbage'),
      service.getAuthdataField('garbage.garbage'),
    ]).then(res => {
      expect(res[0]).to.be.null;
      expect(res[1]).to.equal(true);
      expect(res[2]).to.be.null;
      expect(res[3]).to.be.null;
      expect(res[4]).to.be.null;
    });
  });

  it('should succeed login flat', () => {
    expectGetReaderId('reader1');
    const authorizationStub =
      sandbox.stub(sourceBeer, 'runAuthorization').callsFake(
          () => Promise.resolve());
    const viewer = Services.viewerForDoc(ampdoc);
    const broadcastStub = sandbox.stub(viewer, 'broadcast');
    const sourceBeerMock = sandbox.mock(sourceBeer);
    sourceBeerMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=reader1')
        .returns(Promise.resolve('#success=true'))
        .once();
    sourceBeer.analyticsEvent_ = sandbox.spy();
    return sourceBeer.buildLoginUrls_()
        .then(() => service.loginWithType_('beer'))
        .then(() => {
          expect(sourceBeer.loginPromise_).to.not.exist;
          expect(authorizationStub).to.be.calledOnce;
          expect(broadcastStub).to.be.calledOnce;
          expect(broadcastStub.firstCall.args[0]).to.deep.equal({
            'type': 'amp-access-reauthorize',
            'origin': service.pubOrigin_,
          });
          expect(sourceBeer.analyticsEvent_).to.have.been.calledWith(
              'access-login-started');
          expect(sourceBeer.analyticsEvent_).to.have.been.calledWith(
              'access-login-success');

          sourceBeerMock.verify();
        });
  });

  it('should succeed login hierarchy', () => {
    expectGetReaderId('reader1');
    const authorizationStub =
      sandbox.stub(sourceDonuts, 'runAuthorization').callsFake(
          () => Promise.resolve());
    const viewer = Services.viewerForDoc(ampdoc);
    const broadcastStub = sandbox.stub(viewer, 'broadcast');
    const sourceDonutsMock = sandbox.mock(sourceDonuts);
    sourceDonutsMock.expects('openLoginDialog_')
        .withExactArgs('https://acme.com/l?rid=reader1')
        .returns(Promise.resolve('#success=true'))
        .once();
    sourceDonuts.analyticsEvent_ = sandbox.spy();
    return sourceDonuts.buildLoginUrls_()
        .then(() => service.loginWithType_('donuts-login2'))
        .then(() => {
          expect(sourceDonuts.loginPromise_).to.not.exist;
          expect(authorizationStub).to.be.calledOnce;
          expect(broadcastStub).to.be.calledOnce;
          expect(broadcastStub.firstCall.args[0]).to.deep.equal({
            'type': 'amp-access-reauthorize',
            'origin': service.pubOrigin_,
          });
          expect(sourceDonuts.analyticsEvent_).to.have.been.calledWith(
              'access-login-started');
          expect(sourceDonuts.analyticsEvent_).to.have.been.calledWith(
              'access-login-login2-started');
          expect(sourceDonuts.analyticsEvent_).to.have.been.calledWith(
              'access-login-success');
          expect(sourceDonuts.analyticsEvent_).to.have.been.calledWith(
              'access-login-login2-success');


          sourceDonutsMock.verify();
        });
  });
});
