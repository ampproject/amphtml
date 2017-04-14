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

import {
  AmpUserNotification,
  UserNotificationManager,
} from '../amp-user-notification';
import {createIframePromise} from '../../../../testing/iframe';
import {getExistingServiceForDoc} from '../../../../src/service';
import * as sinon from 'sinon';


describe('amp-user-notification', () => {
  let sandbox;
  let iframe;
  let dftAttrs;
  let storage;
  let storageMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    dftAttrs = {
      id: 'n1',
      'data-show-if-href': 'https://www.ampproject.org/get/here',
      'data-dismiss-href': 'https://www.ampproject.org/post/here',
      'layout': 'nodisplay',
    };
  });

  afterEach(() => {
    if (storageMock) {
      storageMock.verify();
    }
    sandbox.restore();
  });

  function getUserNotification(attrs = {}) {
    return createIframePromise().then(iframe_ => {
      iframe = iframe_;
      storage = getExistingServiceForDoc(iframe.ampdoc, 'storage');
      storageMock = sandbox.mock(storage);
      return buildElement(iframe.doc, iframe.ampdoc, attrs);
    });
  }

  function buildElement(doc, ampdoc, attrs = {}) {
    const elem = doc.createElement('amp-user-notification');
    elem.getAmpDoc = () => ampdoc;

    for (const attr in attrs) {
      elem.setAttribute(attr, attrs[attr]);
    }
    const button = doc.createElement('button');
    button.setAttribute('on', 'tap:' + elem.getAttribute('id') + 'dismiss');
    elem.appendChild(button);

    doc.body.appendChild(elem);
    const impl = elem.implementation_;
    impl.storagePromise_ = Promise.resolve(storage);
    impl.userNotificationManager_ = {
      registerUserNotification: () => {},
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
      id: 'n1',
    }).then(el => {
      const impl = el.implementation_;
      expect(impl.buildCallback.bind(impl)).to.not.throw;
    });
  });

  it('should NOT require `data-dismiss-href`', () => {
    return getUserNotification({
      id: 'n1',
      'data-show-if-href': 'https://www.ampproject.org/get',
    }).then(el => {
      const impl = el.implementation_;
      expect(impl.buildCallback.bind(impl)).to.not.throw;
    });
  });

  it('isDismissed should return true if dismissal has been recorded', () => {
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.resolve(true))
          .once();
      return expect(impl.isDismissed()).to.eventually.equal(true);
    });
  });

  it('isDismissed should return false if dismissal has not been recorded',
      () => {
        return getUserNotification(dftAttrs).then(el => {
          const impl = el.implementation_;
          impl.buildCallback();

          storageMock.expects('get')
              .withExactArgs('amp-user-notification:n1')
              .returns(Promise.resolve(null))
              .once();
          return expect(impl.isDismissed()).to.eventually.equal(false);
        });
      });

  it('isDismissed should return false if data-persist-dismissal=false', () => {
    dftAttrs['data-persist-dismissal'] = false;
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('get').never();
      return expect(impl.isDismissed()).to.eventually.equal(false);
    });
  });

  it('isDismissed should return false if storage throws error', () => {
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.reject('intentional'))
          .once();
      return expect(impl.isDismissed()).to.eventually.equal(false);
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

  it('should skip storage if data-persist-dismissal=false', () => {
    dftAttrs['data-persist-dismissal'] = false;
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('get')
          .withExactArgs('amp-user-notification:n1')
          .returns(Promise.resolve(true))
          .never();

      const cidStub = sandbox.stub(impl, 'getAsyncCid_')
          .returns(Promise.resolve('12345'));
      const showEndpointStub = sandbox.stub(impl, 'getShowEndpoint_')
          .returns(Promise.resolve({showNotification: true}));

      return impl.shouldShow().then(shouldShow => {
        expect(shouldShow).to.equal(true);
        expect(cidStub).to.be.calledOnce;
        expect(showEndpointStub).to.be.calledOnce;
      });
    });
  });

  it('should set persistDismissal to false', () => {
    return getUserNotification({
      id: 'n1',
      layout: 'nodisplay',
      'data-persist-dismissal': false,
    }).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      expect(impl.persistDismissal_).to.be.false;
    });
  });

  it('should set persistDismissal to true for any other value', () => {
    return getUserNotification({
      id: 'n1',
      layout: 'nodisplay',
      'data-persist-dismissal': 'anything',
    }).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      expect(impl.persistDismissal_).to.be.true;
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
        expect(cidStub).to.be.calledOnce;
        expect(showEndpointStub).to.be.calledOnce;
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
        expect(cidStub).to.be.calledOnce;
        expect(showEndpointStub).to.be.calledOnce;
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
        expect(cidStub).to.be.calledOnce;
        expect(showEndpointStub).to.be.calledOnce;
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
      expect(postDismissStub).to.be.calledOnce;
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
      expect(postDismissStub).to.have.not.been.called;
    });
  });

  it('should not store value on dismiss if persist-dismissal=false', () => {
    dftAttrs['data-persist-dismissal'] = false;
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('set')
          .withExactArgs('amp-user-notification:n1', true)
          .returns(Promise.resolve())
          .never();
      const postDismissStub = sandbox.stub(impl, 'postDismissEnpoint_');

      impl.dismiss();
      expect(postDismissStub).to.be.calledOnce;
    });
  });

  it('should not store value on dismiss if persist-dismissal=no', () => {
    dftAttrs['data-persist-dismissal'] = 'no';
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      storageMock.expects('set')
          .withExactArgs('amp-user-notification:n1', true)
          .returns(Promise.resolve())
          .never();
      const postDismissStub = sandbox.stub(impl, 'postDismissEnpoint_');

      impl.dismiss();
      expect(postDismissStub).to.be.calledOnce;
    });
  });

  it('should have class `amp-active`', () => {
    sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    sandbox.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      impl.dialogPromise_ = Promise.resolve();
      const addToFixedLayerStub = sandbox.stub(
          impl.getViewport(), 'addToFixedLayer');

      expect(el).to.not.have.class('amp-active');

      return impl.shouldShow().then(() => {
        expect(el).to.not.have.class('amp-active');
        return impl.show().then(() => {
          expect(el).to.have.class('amp-active');
          expect(addToFixedLayerStub).to.be.calledOnce;
          expect(addToFixedLayerStub.getCall(0).args[0]).to.equal(el);
        });
      });
    });
  });

  it('should not have `amp-active`', () => {
    sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    sandbox.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
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
    sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    sandbox.stub(AmpUserNotification.prototype,
        'getShowEndpoint_').returns(Promise.resolve({showNotification: true}));
    const stub2 = sandbox.stub(AmpUserNotification.prototype,
        'postDismissEnpoint_').returns(Promise.resolve());

    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      impl.dialogPromise_ = Promise.resolve();
      impl.dialogResolve_ = function() {};
      const removeFromFixedLayerStub = sandbox.stub(
          impl.getViewport(), 'removeFromFixedLayer');

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
        expect(removeFromFixedLayerStub).to.be.calledOnce;
        expect(removeFromFixedLayerStub.getCall(0).args[0]).to.equal(el);
      });
    });
  });

  it('should have a default `role` if unspecified', () => {
    return getUserNotification({id: 'n1'}).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      expect(el.getAttribute('role')).to.equal('alert');
    });
  });

  it('should not override `role` if specified', () => {
    return getUserNotification({id: 'n1', role: 'status'}).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();
      expect(el.getAttribute('role')).to.equal('status');
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
        show: () => Promise.resolve(),
      };
    });

    it('getNotificaiton should return notification object after ' +
        'registration', () => {
      return getUserNotification().then(element => {
        const notification = new AmpUserNotification(element);
        service.registerUserNotification('n1', notification);
        return Promise.all([
          expect(service.getNotification('n1'))
              .to.eventually.equal(notification),
          expect(service.getNotification('n2'))
              .to.eventually.equal(undefined),
        ]);
      });
    });

    it('should be able to get AmpUserNotification object by ID', () => {
      let userNotification;

      return getUserNotification().then(element => {
        return new AmpUserNotification(element);
      }).then(un => {
        userNotification = un;
        service.registerUserNotification('n1', userNotification);
      }).then(() => {
        return expect(service.get('n1')).to.eventually.equal(userNotification);
      });
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
