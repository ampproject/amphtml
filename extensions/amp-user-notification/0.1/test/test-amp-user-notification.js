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
  let iframe;
  let stub;
  let stub1;
  let stub2;
  let notifStub;
  let dftAttrs;

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
    return elem;
  }

  beforeEach(() => {
    dftAttrs = {
      id: 'n1',
      'data-show-if-href': 'https://www.ampproject.org/get/here',
      'data-dismiss-href': 'https://www.ampproject.org/post/here',
      'layout': 'nodisplay',
    };
    notifStub = sinon.stub(AmpUserNotification.prototype, 'isExperimentOn_')
        .returns(true);
  });

  afterEach(() => {
    notifStub.restore();

    if (stub) {
      stub.restore();
      stub = null;
    }

    if (stub1) {
      stub1.restore();
      stub1 = null;
    }

    if (stub2) {
      stub2.restore();
      stub2 = null;
    }
  });

  it('should require an id', () => {
    return getUserNotification().then(el => {
      const impl = el.implementation_;
      expect(impl.buildCallback.bind(impl))
          .to.throw(/should have an id/);
    });
  });

  it('should require `data-show-if-href`', () => {
    return getUserNotification({
      id: 'n1'
    }).then(el => {
      const impl = el.implementation_;
      expect(impl.buildCallback.bind(impl)).to
          .throw(/should have "data-show-if-href" attribute/);
    });
  });

  it('should require `data-dismiss-href`', () => {
    return getUserNotification({
      id: 'n1',
      'data-show-if-href': 'https://www.ampproject.org/get'
    }).then(el => {
      const impl = el.implementation_;
      expect(impl.buildCallback.bind(impl)).to
          .throw(/should have "data-dismiss-href" attribute/);
    });
  });

  it('should show should return a boolean', () => {
    stub = sinon.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    stub1 = sinon.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));
    return getUserNotification(dftAttrs).then(el => {
      const impl = el.implementation_;
      impl.buildCallback();

      return impl.shouldShow().then(shouldShow => {
        expect(shouldShow).to.equal(true);
      });
    });
  });

  it('should have class `amp-active`', () => {
    stub = sinon.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    stub1 = sinon.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
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
    stub = sinon.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    stub1 = sinon.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
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
    stub = sinon.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    stub1 = sinon.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));
    stub2 = sinon.stub(AmpUserNotification.prototype, 'postDismissEnpoint_')
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
      const show1 = sinon.spy(tag, 'show');
      const show2 = sinon.spy(tag1, 'show');
      const show3 = sinon.spy(tag2, 'show');
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
