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

import {DocumentState} from '../../src/service/document-state';
import * as dom from '../../src/dom';
import * as sinon from 'sinon';


describe('DocumentState', () => {

  let sandbox;
  let eventListeners;
  let testDoc;
  let windowApi;
  let docState;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    eventListeners = {};
    testDoc = {
      readyState: 'complete',
      hidden: false,
      visibilityState: 'visible',
      addEventListener: (eventType, handler) => {
        eventListeners[eventType] = handler;
      },
      removeEventListener: (eventType, handler) => {
        if (eventListeners[eventType] == handler) {
          delete eventListeners[eventType];
        }
      },
    };
    windowApi = {document: testDoc};
    docState = new DocumentState(windowApi);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('resolve non-vendor properties', () => {
    expect(docState.hiddenProp_).to.equal('hidden');
    expect(docState.visibilityStateProp_).to.equal('visibilityState');
    expect(docState.visibilityChangeEvent_).to.equal('visibilitychange');
    expect(eventListeners['visibilitychange']).to.not.equal(undefined);
  });

  it('resolve vendor-prefixed properties', () => {
    const otherDoc = {
      webkitHidden: false,
      webkitVisibilityState: 'visible',
      addEventListener: (unusedEventType, unusedHandler) => {},
      removeEventListener: (unusedEventType, unusedHandler) => {},
    };
    const other = new DocumentState({document: otherDoc});
    expect(other.hiddenProp_).to.equal('webkitHidden');
    expect(other.visibilityStateProp_).to.equal('webkitVisibilityState');
    expect(other.visibilityChangeEvent_).to.equal('webkitVisibilitychange');
  });

  it('resolve no properties', () => {
    const otherDoc = {
      addEventListener: (unusedEventType, unusedHandler) => {},
      removeEventListener: (unusedEventType, unusedHandler) => {},
    };
    const other = new DocumentState({document: otherDoc});
    expect(other.hiddenProp_).to.equal(null);
    expect(other.visibilityStateProp_).to.equal(null);
    expect(other.visibilityChangeEvent_).to.equal(null);
  });

  it('should default hidden and visibilityState if unknown', () => {
    const otherDoc = {
      addEventListener: (unusedEventType, unusedHandler) => {},
      removeEventListener: (unusedEventType, unusedHandler) => {},
    };
    const other = new DocumentState({document: otherDoc});
    expect(other.isHidden()).to.equal(false);
    expect(other.getVisibilityState()).to.equal('visible');
  });

  it('should fire visibility change', () => {
    const callback = sandbox.spy();
    docState.onVisibilityChanged(callback);

    expect(docState.isHidden()).to.equal(false);
    expect(docState.getVisibilityState()).to.equal('visible');
    expect(callback.callCount).to.equal(0);

    testDoc.hidden = true;
    testDoc.visibilityState = 'invisible';
    eventListeners['visibilitychange']();

    expect(docState.isHidden()).to.equal(true);
    expect(docState.getVisibilityState()).to.equal('invisible');
    expect(callback.callCount).to.equal(1);
  });

  it('should fire body availability change', () => {
    const callback = sandbox.spy();
    sandbox.stub(dom, 'waitForChild');

    expect(testDoc.body).to.equal(undefined);

    const first = docState.onBodyAvailable(callback);
    expect(first).to.not.equal(null);
    expect(callback.callCount).to.equal(0);

    testDoc.body = {};
    docState.onBodyAvailable_();

    expect(callback.callCount).to.equal(1);

    const second = docState.onBodyAvailable(callback);
    expect(second).to.equal(null);
    expect(callback.callCount).to.equal(2);
  });
});
