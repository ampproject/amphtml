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

import {AccessService} from '../../../../build/all/v0/amp-access-0.1.max';
import {Observable} from '../../../../src/observable';
import {installCidService} from '../../../../src/service/cid-impl';
import {markElementScheduledForTesting} from '../../../../src/service';
import * as sinon from 'sinon';


describe('AccessService', () => {

  let sandbox;
  let element;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    markElementScheduledForTesting(window, 'amp-analytics');
    installCidService(window);

    element = document.createElement('script');
    element.setAttribute('id', 'amp-access');
    element.setAttribute('type', 'application/json');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element.parentElement) {
      document.body.removeChild(element);
    }
    sandbox.restore();
    sandbox = null;
  });

  it('should disable service when no config', () => {
    document.body.removeChild(element);
    const service = new AccessService(window);
    expect(service.isEnabled()).to.be.false;
    expect(service.accessElement_).to.be.undefined;
    expect(service.config_).to.be.undefined;
  });

  it('should fail if config is malformed', () => {
    expect(() => {
      new AccessService(window);
    }).to.throw(Error);
  });

  it('should fail if config authorization is missing or malformed', () => {
    const config = {};
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/"authorization" URL must be specified/);

    config['authorization'] = 'http://acme.com/a';
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/https\:/);
  });

  it('should fail if config pingback is missing or malformed', () => {
    const config = {
      'authorization': 'https://acme.com/a'
    };
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/"pingback" URL must be specified/);

    config['pingback'] = 'http://acme.com/p';
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/https\:/);
  });

  it('should fail if config login is missing or malformed', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p'
    };
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/"login" URL must be specified/);

    config['login'] = 'http://acme.com/l';
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/https\:/);
  });

  it('should parse the complete config', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l'
    };
    element.textContent = JSON.stringify(config);
    const service = new AccessService(window);
    expect(service.isEnabled()).to.be.true;
    expect(service.accessElement_).to.equal(element);
    expect(service.config_.authorization).to.equal('https://acme.com/a');
    expect(service.config_.pingback).to.equal('https://acme.com/p');
    expect(service.config_.login).to.equal('https://acme.com/l');
  });

  it('should default type to "client"', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l'
    };
    element.textContent = JSON.stringify(config);
    const service = new AccessService(window);
    expect(service.config_.type).to.equal('client');
  });

  it('should parse type', () => {
    const config = {
      'type': 'client',
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l'
    };
    element.textContent = JSON.stringify(config);
    expect(new AccessService(window).config_.type).to.equal('client');

    config['type'] = 'server';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(window).config_.type).to.equal('server');

    config['type'] = 'other';
    element.textContent = JSON.stringify(config);
    expect(new AccessService(window).config_.type).to.equal('other');
  });

  it('should fail if type is unknown', () => {
    const config = {
      'type': 'unknown',
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l'
    };
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/Unknown access type/);
  });

  it('should NOT start when experiment is off or disabled', () => {
    document.body.removeChild(element);
    const service = new AccessService(window);
    service.startInternal_ = sandbox.spy();
    expect(service.isEnabled()).to.be.false;
    expect(service.isExperimentOn_).to.be.false;

    service.start_();
    expect(service.startInternal_.callCount).to.equal(0);

    service.isExperimentOn_ = true;
    service.start_();
    expect(service.startInternal_.callCount).to.equal(0);
  });

  it('should start when experiment is on and enabled', () => {
    element.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l'
    });
    const service = new AccessService(window);
    service.isExperimentOn_ = true;
    service.startInternal_ = sandbox.spy();
    service.start_();
    expect(service.startInternal_.callCount).to.equal(1);
  });

  it('should initialize publisher origin', () => {
    element.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l'
    });
    const service = new AccessService(window);
    service.isExperimentOn_ = true;
    expect(service.pubOrigin_).to.exist;
    expect(service.pubOrigin_).to.match(/^http.*/);
  });
});


describe('AccessService authorization', () => {

  let sandbox;
  let configElement, elementOn, elementOff;
  let xhrMock;
  let cidMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    markElementScheduledForTesting(window, 'amp-analytics');
    installCidService(window);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID'
    });
    document.body.appendChild(configElement);

    elementOn = document.createElement('div');
    elementOn.setAttribute('amp-access', 'access');
    document.body.appendChild(elementOn);

    elementOff = document.createElement('div');
    elementOff.setAttribute('amp-access', 'NOT access');
    document.body.appendChild(elementOff);

    service = new AccessService(window);
    service.isExperimentOn_ = true;

    sandbox.stub(service.resources_, 'mutateElement',
        (unusedElement, mutator) => {
          mutator();
        });
    service.vsync_ = {
      mutate: callback => {
        callback();
      },
      mutatePromise: callback => {
        callback();
        return Promise.resolve();
      }
    };
    xhrMock = sandbox.mock(service.xhr_);
    const cid = {
      get: () => {}
    };
    cidMock = sandbox.mock(cid);
    service.cid_ = Promise.resolve(cid);
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
    sandbox.restore();
    sandbox = null;
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
    xhrMock.expects('fetchJson')
        .withExactArgs('https://acme.com/a?rid=reader1',
            {credentials: 'include'})
        .returns(Promise.resolve({access: true}))
        .once();
    const promise = service.runAuthorization_();
    expect(document.documentElement).to.have.class('amp-access-loading');
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(elementOn).not.to.have.attribute('amp-access-hide');
      expect(elementOff).to.have.attribute('amp-access-hide');
      expect(service.authResponse_).to.exist;
      expect(service.authResponse_.access).to.be.true;
    });
  });

  it('should recover from authorization failure', () => {
    expectGetReaderId('reader1');
    xhrMock.expects('fetchJson')
        .withExactArgs('https://acme.com/a?rid=reader1',
            {credentials: 'include'})
        .returns(Promise.reject('intentional'))
        .once();
    const promise = service.runAuthorization_();
    expect(document.documentElement).to.have.class('amp-access-loading');
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(elementOn).not.to.have.attribute('amp-access-hide');
      expect(elementOff).not.to.have.attribute('amp-access-hide');
    });
  });

  it('should resolve first-authorization promise after success', () => {
    expectGetReaderId('reader1');
    xhrMock.expects('fetchJson')
        .withExactArgs('https://acme.com/a?rid=reader1',
            {credentials: 'include'})
        .returns(Promise.resolve({access: true}))
        .once();
    return service.runAuthorization_().then(() => {
      expect(service.firstAuthorizationPromise_).to.exist;
      return service.firstAuthorizationPromise_;
    });
  });

  it('should NOT resolve first-authorization promise after failure', () => {
    expectGetReaderId('reader1');
    xhrMock.expects('fetchJson')
        .withExactArgs('https://acme.com/a?rid=reader1',
            {credentials: 'include'})
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
    expect(service.runAuthorization_.callCount).to.equal(0);

    // Wrong origin.
    broadcastHandler({type: 'amp-access-reauthorize', origin: 'other'});
    expect(service.runAuthorization_.callCount).to.equal(0);

    // Broadcast with the right origin.
    broadcastHandler({type: 'amp-access-reauthorize',
        origin: service.pubOrigin_});
    expect(service.runAuthorization_.callCount).to.equal(1);
  });
});


describe('AccessService applyAuthorizationToElement_', () => {

  let sandbox;
  let configElement, elementOn, elementOff;
  let templatesMock;
  let mutateElementStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    markElementScheduledForTesting(window, 'amp-analytics');
    installCidService(window);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID'
    });
    document.body.appendChild(configElement);

    elementOn = document.createElement('div');
    elementOn.setAttribute('amp-access', 'access');
    document.body.appendChild(elementOn);

    elementOff = document.createElement('div');
    elementOff.setAttribute('amp-access', 'NOT access');
    document.body.appendChild(elementOff);

    service = new AccessService(window);
    service.isExperimentOn_ = true;

    mutateElementStub = sandbox.stub(service.resources_, 'mutateElement',
        (unusedElement, mutator) => {
          mutator();
        });
    service.vsync_ = {
      mutatePromise: callback => {
        callback();
        return Promise.resolve();
      }
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
    sandbox.restore();
    sandbox = null;
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
    expect(mutateElementStub.callCount).to.equal(1);
    expect(mutateElementStub.getCall(0).args[0]).to.equal(elementOff);

    service.applyAuthorizationToElement_(elementOn, {access: false});
    service.applyAuthorizationToElement_(elementOff, {access: false});
    expect(elementOn).to.have.attribute('amp-access-hide');
    expect(elementOff).not.to.have.attribute('amp-access-hide');
    expect(mutateElementStub.callCount).to.equal(3);
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


describe('AccessService pingback', () => {

  let sandbox;
  let clock;
  let configElement;
  let xhrMock;
  let cidMock;
  let visibilityChanged;
  let scrolled;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    markElementScheduledForTesting(window, 'amp-analytics');
    installCidService(window);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID&type=AUTHDATA(type)',
      'login': 'https://acme.com/l?rid=READER_ID'
    });
    document.body.appendChild(configElement);

    service = new AccessService(window);
    service.isExperimentOn_ = true;

    xhrMock = sandbox.mock(service.xhr_);

    const cid = {
      get: () => {}
    };
    cidMock = sandbox.mock(cid);
    service.cid_ = Promise.resolve(cid);

    this.docState_ = {
      onReady: callback => callback()
    };

    visibilityChanged = new Observable();
    service.viewer_ = {
      isVisible: () => true,
      whenVisible: () => Promise.resolve(),
      onVisibilityChanged: callback => visibilityChanged.add(callback),
      broadcast: () => {},
    };

    scrolled = new Observable();
    service.viewport_ = {
      onScroll: callback => scrolled.add(callback)
    };

    // Emulate first authorization complete.
    service.firstAuthorizationResolver_();
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
    sandbox.restore();
    sandbox = null;
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
    const p = service.reportWhenViewed_();
    return Promise.resolve().then(() => {
      clock.tick(2001);
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_.callCount).to.equal(1);
      expect(visibilityChanged.getHandlerCount()).to.equal(0);
      expect(scrolled.getHandlerCount()).to.equal(0);
    });
  });

  it('should register "viewed" signal after scroll', () => {
    service.reportViewToServer_ = sandbox.spy();
    const p = service.reportWhenViewed_();
    return Promise.resolve().then(() => {
      scrolled.fire();
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_.callCount).to.equal(1);
      expect(visibilityChanged.getHandlerCount()).to.equal(0);
      expect(scrolled.getHandlerCount()).to.equal(0);
    });
  });

  it('should register "viewed" signal after click', () => {
    service.reportViewToServer_ = sandbox.spy();
    const p = service.reportWhenViewed_();
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
      expect(service.reportViewToServer_.callCount).to.equal(1);
      expect(visibilityChanged.getHandlerCount()).to.equal(0);
      expect(scrolled.getHandlerCount()).to.equal(0);
    });
  });

  it('should wait for authorization completion', () => {
    expect(service.firstAuthorizationPromise_).to.exist;
    let firstAuthorizationResolver;
    service.firstAuthorizationPromise_ = new Promise(resolve => {
      firstAuthorizationResolver = resolve;
    });
    service.reportViewToServer_ = sandbox.spy();
    service.reportWhenViewed_();
    return Promise.resolve().then(() => {
      clock.tick(2001);
      return Promise.resolve();
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_.callCount).to.equal(0);
      firstAuthorizationResolver();
      return service.firstAuthorizationPromise_;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_.callCount).to.equal(1);
    });
  });

  it('should cancel "viewed" signal after click', () => {
    service.reportViewToServer_ = sandbox.spy();
    const p = service.reportWhenViewed_();
    return Promise.resolve().then(() => {
      service.viewer_.isVisible = () => false;
      visibilityChanged.fire();
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_.callCount).to.equal(0);
      expect(visibilityChanged.getHandlerCount()).to.equal(0);
      expect(scrolled.getHandlerCount()).to.equal(0);
    });
  });

  it('should schedule "viewed" monitoring only once', () => {
    service.whenViewed_ = () => Promise.resolve();
    service.reportViewToServer_ = sandbox.spy();
    const p1 = service.reportWhenViewed_();
    const p2 = service.reportWhenViewed_();
    expect(p2).to.equal(p1);
    return p1.then(() => {
      const p3 = service.reportWhenViewed_();
      expect(p3).to.equal(p1);
      return p3;
    }).then(() => {
      expect(service.reportViewToServer_.callCount).to.equal(1);
    });
  });

  it('should re-schedule "viewed" monitoring after visibility change', () => {
    service.reportViewToServer_ = sandbox.spy();

    service.scheduleView_();

    // 1. First attempt fails due to document becoming invisible.
    const p1 = service.reportViewPromise_;
    return Promise.resolve().then(() => {
      service.viewer_.isVisible = () => false;
      visibilityChanged.fire();
      return p1;
    }).then(() => 'SUCCESS', () => 'ERROR').then(result => {
      expect(result).to.equal('ERROR');
      expect(service.reportViewToServer_.callCount).to.equal(0);
      expect(service.reportViewPromise_).to.not.exist;
    }).then(() => {
      // 2. Second attempt is rescheduled and will complete.
      service.viewer_.isVisible = () => true;
      visibilityChanged.fire();
      const p2 = service.reportViewPromise_;
      expect(p2).to.exist;
      expect(p2).to.not.equal(p1);
      expect(service.reportViewToServer_.callCount).to.equal(0);
      return Promise.resolve().then(() => {
        clock.tick(2001);
        expect(service.reportViewToServer_.callCount).to.equal(0);
        return p2;
      });
    }).then(() => 'SUCCESS', () => 'ERROR').then(result => {
      expect(result).to.equal('SUCCESS');
      expect(service.reportViewToServer_.callCount).to.equal(1);
      expect(service.reportViewPromise_).to.exist;
    });
  });

  it('should send POST pingback', () => {
    expectGetReaderId('reader1');
    xhrMock.expects('sendSignal')
        .withExactArgs('https://acme.com/p?rid=reader1&type=',
            sinon.match(init => {
              return (init.method == 'POST' &&
                  init.credentials == 'include' &&
                  init.body == '' &&
                  init.headers['Content-Type'] ==
                      'application/x-www-form-urlencoded');
            }))
        .returns(Promise.resolve())
        .once();
    return service.reportViewToServer_().then(() => {
      return 'SUCCESS';
    }, error => {
      return 'ERROR ' + error;
    }).then(result => {
      expect(result).to.equal('SUCCESS');
    });
  });

  it('should resolve AUTH vars in POST pingback', () => {
    expectGetReaderId('reader1');
    service.setAuthResponse_({type: 'premium'});
    xhrMock.expects('sendSignal')
        .withArgs('https://acme.com/p?rid=reader1&type=premium')
        .returns(Promise.resolve())
        .once();
    return service.reportViewToServer_().then(() => {
      return 'SUCCESS';
    }, error => {
      return 'ERROR ' + error;
    }).then(result => {
      expect(result).to.equal('SUCCESS');
    });
  });

  it('should broadcast "viewed" signal to other documents', () => {
    service.reportViewToServer_ = sandbox.stub().returns(Promise.resolve());
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    const p = service.reportWhenViewed_();
    return Promise.resolve().then(() => {
      clock.tick(2001);
      return p;
    }).then(() => {}, () => {}).then(() => {
      expect(service.reportViewToServer_.callCount).to.equal(1);
      expect(broadcastStub.callCount).to.equal(1);
      expect(broadcastStub.firstCall.args[0]).to.deep.equal({
        'type': 'amp-access-reauthorize',
        'origin': service.pubOrigin_
      });
    });
  });
});


describe('AccessService login', () => {

  let sandbox;
  let configElement;
  let cidMock;
  let serviceMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    markElementScheduledForTesting(window, 'amp-analytics');
    installCidService(window);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID'
    });
    document.body.appendChild(configElement);

    service = new AccessService(window);
    service.isExperimentOn_ = true;

    const cid = {
      get: () => {}
    };
    cidMock = sandbox.mock(cid);
    service.cid_ = Promise.resolve(cid);

    service.openLoginDialog_ = () => {};
    serviceMock = sandbox.mock(service);
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
    sandbox.restore();
    sandbox = null;
  });

  function expectGetReaderId(result) {
    cidMock.expects('get')
        .withExactArgs(
            {scope: 'amp-access', createCookieIfNotPresent: true},
            sinon.match(() => true))
        .returns(Promise.resolve(result))
        .once();
  }

  it('should open dialog in the same microtask', () => {
    service.openLoginDialog_ = sandbox.stub();
    service.openLoginDialog_.returns(Promise.resolve());
    expectGetReaderId('reader1');
    service.login();
    expect(service.openLoginDialog_.callCount).to.equal(1);
    expect(service.openLoginDialog_.firstCall.args[0].then).to.exist;
  });

  it('should succeed login with success=true', () => {
    service.runAuthorization_ = sandbox.spy();
    const broadcastStub = sandbox.stub(service.viewer_, 'broadcast');
    expectGetReaderId('reader1');
    let urlPromise = null;
    serviceMock.expects('openLoginDialog_')
        .withExactArgs(sinon.match(arg => {
          urlPromise = arg;
          return !!arg.then;
        }))
        .returns(Promise.resolve('#success=true'))
        .once();
    return service.login().then(() => {
      expect(service.loginPromise_).to.not.exist;
      expect(service.runAuthorization_.callCount).to.equal(1);
      expect(broadcastStub.callCount).to.equal(1);
      expect(broadcastStub.firstCall.args[0]).to.deep.equal({
        'type': 'amp-access-reauthorize',
        'origin': service.pubOrigin_
      });
      expect(urlPromise).to.exist;
      return urlPromise;
    }).then(url => {
      expect(url).to.equal('https://acme.com/l?rid=reader1');
    });
  });

  it('should fail login with success=no', () => {
    service.runAuthorization_ = sandbox.spy();
    expectGetReaderId('reader1');
    serviceMock.expects('openLoginDialog_')
        .withExactArgs(sinon.match(arg => !!arg.then))
        .returns(Promise.resolve('#success=no'))
        .once();
    return service.login().then(() => {
      expect(service.loginPromise_).to.not.exist;
      expect(service.runAuthorization_.callCount).to.equal(0);
    });
  });

  it('should fail login with empty response', () => {
    service.runAuthorization_ = sandbox.spy();
    expectGetReaderId('reader1');
    serviceMock.expects('openLoginDialog_')
        .withExactArgs(sinon.match(arg => !!arg.then))
        .returns(Promise.resolve(''))
        .once();
    return service.login().then(() => {
      expect(service.loginPromise_).to.not.exist;
      expect(service.runAuthorization_.callCount).to.equal(0);
    });
  });

  it('should fail login with aborted dialog', () => {
    service.runAuthorization_ = sandbox.spy();
    expectGetReaderId('reader1');
    serviceMock.expects('openLoginDialog_')
        .withExactArgs(sinon.match(arg => !!arg.then))
        .returns(Promise.reject('abort'))
        .once();
    return service.login().then(() => 'SUCCESS', () => 'ERROR').then(result => {
      expect(result).to.equal('ERROR');
      expect(service.loginPromise_).to.not.exist;
      expect(service.runAuthorization_.callCount).to.equal(0);
    });
  });

  it('should run login only once at a time', () => {
    service.runAuthorization_ = sandbox.spy();
    expectGetReaderId('reader1');
    serviceMock.expects('openLoginDialog_')
        .withExactArgs(sinon.match(arg => !!arg.then))
        .returns(new Promise(() => {}))
        .once();
    const p1 = service.login();
    const p2 = service.login();
    expect(p1).to.equal(service.loginPromise_);
    expect(p2).to.equal(p1);
  });
});


describe('AccessService type=other', () => {

  let sandbox;
  let configElement;
  let xhrMock;
  let cidMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    markElementScheduledForTesting(window, 'amp-analytics');
    installCidService(window);

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({'type': 'other'});
    document.body.appendChild(configElement);

    service = new AccessService(window);
    service.isExperimentOn_ = true;

    service.vsync_ = {
      mutate: callback => {
        callback();
      },
      mutatePromise: callback => {
        callback();
        return Promise.resolve();
      }
    };
    xhrMock = sandbox.mock(service.xhr_);
    const cid = {
      get: () => {}
    };
    cidMock = sandbox.mock(cid);
    service.cid_ = Promise.resolve(cid);
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
    sandbox.restore();
    sandbox = null;
  });

  it('should short-circuit authorization flow', () => {
    cidMock.expects('get').never();
    xhrMock.expects('fetchJson').never();
    const promise = service.runAuthorization_();
    expect(document.documentElement).to.not.have.class('amp-access-loading');
    return promise.then(() => {
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(service.firstAuthorizationPromise_).to.exist;
      return service.firstAuthorizationPromise_;
    });
  });

  it('should short-circuit pingback flow', () => {
    cidMock.expects('get').never();
    xhrMock.expects('fetchJson').never();
    return service.reportViewToServer_();
  });

  it('should short-circuit login flow', () => {
    expect(() => service.login()).to.throw(/Login URL is not configured/);
  });
});
