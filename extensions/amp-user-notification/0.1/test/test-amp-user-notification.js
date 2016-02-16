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

import * as sinon from 'sinon';
import {
  AmpUserNotification,
  UserNotificationManager
} from '../../../../build/all/v0/amp-user-notification-0.1.max';
import {createIframePromise} from '../../../../testing/iframe';


describe('amp-user-notification', () => {
  let sandbox;
  let iframe;
  let dftAttrs;
  let storage;
  let storageMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    storage = {
      get: () => {},
      set: () => {},
    };
    storageMock = sandbox.mock(storage);
    dftAttrs = {
      id: 'n1',
      'data-show-if-href': 'https://www.ampproject.org/get/here',
      'data-dismiss-href': 'https://www.ampproject.org/post/here',
      'layout': 'nodisplay',
    };
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
  });

  function getUserNotification(attrs = {}) {
    return createIframePromise().then(iframe_ => {
      iframe = iframe_;
      iframe.win.ampExtendedElements = {};
      return buildElement(iframe.doc, attrs);
    });
  }

  function buildElement(doc, attrs = {}) {
    const elem = doc.createElement('amp-user-notification');

    for (attr in attrs) {
      elem.setAttribute(attr, attrs[attr]);
    }
    const button = doc.createElement('button');
    button.setAttribute('on', 'tap:' + elem.getAttribute('id') + 'dismiss');
    elem.appendChild(button);

    const impl = elem.implementation_;
    impl.storagePromise_ = Promise.resolve(storage);
    impl.userNotificationManager_ = {
      registerUserNotification: () => {}
    };

    return elem;
  }

  it('should have storage key', () => {
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      expect(impl.storageKey_).to.equal('amp-user-notification:n1');
    });
  });

  it('should require an id', () => {
    return getUserNotification().then(el => {
      const impl = el.implementation_;
      expect(impl.buildCallback.bind(impl))
          .to.throw(/should have an id/);
    });
  });

  it('should NOT require `data-show-if-href`', () => {
    return getUserNotification({
      id: 'n1'
    }).then(el => {
      const impl = el.implementation_;
      expect(impl.buildCallback.bind(impl)).to.not.throw;
    });
  });

  it('should NOT require `data-dismiss-href`', () => {
    return getUserNotification({
      id: 'n1',
      'data-show-if-href': 'https://www.ampproject.org/get'
    }).then(el => {
      const impl = el.implementation_;
      expect(impl.buildCallback.bind(impl)).to.not.throw;
    });
  });

  it('shouldShow should return false if storage has been recorded', () => {
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      sandbox.stub(impl, 'getAsyncCid_').throws();
      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.resolve(true))
          .once();
      return impl.shouldShow().then(shouldShow => {
        expect(shouldShow).to.equal(false);
      });
    });
  });

  it('shouldShow should fallback to xhr and return true', () => {
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.resolve(false))
          .once();

      const cidStub = sandbox.stub(impl, 'getAsyncCid_')
          .returns(Promise.resolve('12345'));
      const showEndpointStub = sandbox.stub(impl, 'getShowEndpoint_')
          .returns(Promise.resolve({showNotification: true}));

      return impl.shouldShow().then(shouldShow => {
        expect(shouldShow).to.equal(true);
        expect(cidStub.callCount).to.equal(1);
        expect(showEndpointStub.callCount).to.equal(1);
      });
    });
  });

  it('shouldShow should fallback to xhr and return false', () => {
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.resolve(false))
          .once();

      const cidStub = sandbox.stub(impl, 'getAsyncCid_')
          .returns(Promise.resolve('12345'));
      const showEndpointStub = sandbox.stub(impl, 'getShowEndpoint_')
          .returns(Promise.resolve({showNotification: false}));

      return impl.shouldShow().then(shouldShow => {
        expect(shouldShow).to.equal(false);
        expect(cidStub.callCount).to.equal(1);
        expect(showEndpointStub.callCount).to.equal(1);
      });
    });
  });

  it('shouldShow should return true if not stored and no xhr', () => {
    return getUserNotification({id: 'n1'}).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      sandbox.stub(impl, 'getAsyncCid_').throws();
      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.resolve(undefined))
          .once();
      return impl.shouldShow().then(shouldShow => {
        expect(shouldShow).to.equal(true);
      });
    });
  });

  it('shouldShow should recover from error to xhr', () => {
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.reject('intentional'))
          .once();

      const cidStub = sandbox.stub(impl, 'getAsyncCid_')
          .returns(Promise.resolve('12345'));
      const showEndpointStub = sandbox.stub(impl, 'getShowEndpoint_')
          .returns(Promise.resolve({showNotification: true}));

      return impl.shouldShow().then(shouldShow => {
        expect(shouldShow).to.equal(true);
        expect(cidStub.callCount).to.equal(1);
        expect(showEndpointStub.callCount).to.equal(1);
      });
    });
  });

  it('shouldShow should recover from error and return true with no xhr', () => {
    return getUserNotification({id: 'n1'}).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      sandbox.stub(impl, 'getAsyncCid_').throws();
      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.reject('intentional'))
          .once();
      return impl.shouldShow().then(shouldShow => {
        expect(shouldShow).to.equal(true);
      });
    });
  });

  it('should store value on dismiss and run post', () => {
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('set')
          .withExactArgs('amp-user-notification:n1', true)
          .returns(Promise.resolve())
          .once();
      const postDismissStub = sandbox.stub(impl, 'postDismissEnpoint_');

      impl.dismiss();
      expect(postDismissStub.callCount).to.equal(1);
    });
  });

  it('should ignore post on dismiss if not configured', () => {
    return getUserNotification({id: 'n1'}).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('set')
          .withExactArgs('amp-user-notification:n1', true)
          .returns(Promise.resolve())
          .once();
      const postDismissStub = sandbox.stub(impl, 'postDismissEnpoint_');

      impl.dismiss();
      expect(postDismissStub.callCount).to.equal(0);
    });
  });

  it('should have class `amp-active`', () => {
    stub = sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    stub1 = sandbox.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      impl.dialogPromise_ = Promise.resolve();

      expect(el).to.not.have.class('amp-active');

      return impl.shouldShow().then(() => {
        expect(el).to.not.have.class('amp-active');
        return impl.show().then(() => {
          expect(el).to.have.class('amp-active');
        });
      });
    });
  });

  it('should not have `amp-active`', () => {
    stub = sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    stub1 = sandbox.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: false}));

    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      impl.dialogPromise_ = Promise.resolve();
      impl.dialogResolve_ = function() {};

      expect(el).to.not.have.class('amp-active');

      return impl.shouldShow().then(shouldShow => {
        if (shouldShow) {
          impl.show();
        }

        expect(el).to.not.have.class('amp-active');
      });
    });
  });

  it('should have `amp-hidden` and no `amp-active`', () => {
    stub = sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    stub1 = sandbox.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));
    stub2 = sandbox.stub(AmpUserNotification.prototype, 'postDismissEnpoint_')
        .returns(Promise.resolve());

    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      impl.dialogPromise_ = Promise.resolve();
      impl.dialogResolve_ = function() {};

      expect(el).to.not.have.class('amp-active');

      return impl.shouldShow().then(shouldShow => {
        if (shouldShow) {
          impl.show();
        }
        expect(el).to.have.class('amp-active');
        expect(stub2.calledOnce).to.be.false;
        impl.executeAction({method: 'dismiss'});
        expect(el).to.not.have.class('amp-active');
        expect(el).to.have.class('amp-hidden');
        expect(stub2.calledOnce).to.be.true;
      });
    });
  });

  describe('buildGetHref_', () => {

    it('should do url replacement', () => {
      dftAttrs['data-show-if-href'] = 'https://www.ampproject.org/path/?ord=RANDOM';
      return getUserNotification(dftAttrs).then(el => {
        const impl = el.implementation_;
        impl.buildCallback();
        return impl.buildGetHref_('12345').then(href => {
          const value = href.match(/\?ord=(.*)$/)[1];
          expect(href).to.not.contain('RANDOM');
          expect(parseInt(value, 10)).to.be.a.number;
        });
      });
    });

    it('should build a valid url', () => {
      return getUserNotification(dftAttrs).then(el => {
        const impl = el.implementation_;
        impl.buildCallback();
        return impl.buildGetHref_('12345').then(href => {
          expect(href).to
              .equal('https://www.ampproject.org/get/here?elementId=n1&ampUserId=12345');
        });
      });
    });
  });

  describe('userNotificationManager', () => {
    let service;
    let tag;

    beforeEach(() => {
      service = new UserNotificationManager(window);
      service.managerReadyPromise_ = Promise.resolve();
      service.nextInQueue_ = service.managerReadyPromise_;
      tag = {
        shouldShow: () => Promise.resolve(true),
        show: () => Promise.resolve()
      };
    });

    it('should be able to get a resolved service', () => {
      service.registerUserNotification('n1', tag);

      return service.get('n1');
    });

    it('should queue up multiple amp-user-notification elements', () => {
      const tag1 = Object.assign({}, tag);
      const tag2 = Object.assign({}, tag);
      const show1 = sandbox.spy(tag, 'show');
      const show2 = sandbox.spy(tag1, 'show');
      const show3 = sandbox.spy(tag2, 'show');
      const p1 = service.registerUserNotification('n1', tag);
      const p2 = service.registerUserNotification('n2', tag1);
      const p3 = service.registerUserNotification('n3', tag2);

      return p1.then(() => {
        expect(show1.calledOnce).to.be.true;
        expect(show2.calledOnce).to.be.false;
        expect(show3.calledOnce).to.be.false;
        return p2.then(() => {
          expect(show2.calledOnce).to.be.true;
          expect(show3.calledOnce).to.be.false;
          return p3.then(() => {
            expect(show3.calledOnce).to.be.true;
          });
        });
      });
    });

    it('should be able to get before a registration of an element', () => {
      const get = service.get.bind(service, 'n4');
      expect(get).to.not.throw();
      expect(get().then).to.be.function;
    });
  });
});
