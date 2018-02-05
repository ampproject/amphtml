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

import * as sinon from 'sinon';
import {handleMessageEvent} from '../a2a-listener';
import {installDocService} from '../../../../src/service/ampdoc-impl';

describe('amp-ad a2a listener', function() {
  let sandbox;
  let event;
  let win;
  let findClosestAd;
  let navigateTo;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const source = {};
    findClosestAd = true;
    event = {
      type: 'message',
      origin: 'https://foo.com',
      source,
      data: 'a2a;' + JSON.stringify({
        url: 'https://cdn.ampproject.org/c/test',
      }),
    };
    navigateTo = sandbox.stub();
    win = {
      document: {
        nodeType: /* DOCUMENT */ 9,
        activeElement: {
          tagName: 'IFRAME',
          contentWindow: source,
          closest: tagName => {
            return findClosestAd && tagName == 'amp-ad';
          },
        },
      },
      services: {
        viewer: {
          obj: {
            navigateTo,
          },
        },
      },
    };
    win.document.defaultView = win;
    installDocService(win, /* isSingleDoc */ true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  function expectNavigation() {
    expect(navigateTo).to.be.calledOnce;
    expect(navigateTo.lastCall.args[0]).to.equal(
        'https://cdn.ampproject.org/c/test');
    expect(navigateTo.lastCall.args[1]).to.equal(
        'ad-https://foo.com');
  }

  it('should ignore other messages', () => {
    event.data = {};
    handleMessageEvent(win, event);
    event.data = '{}';
    handleMessageEvent(win, event);
    expect(navigateTo).to.have.not.been.called;
  });

  it('should initiate navigation', () => {
    handleMessageEvent(win, event);
    expectNavigation();
  });

  it('should initiate navigation (nested frames)', () => {
    const source = win.document.activeElement.contentWindow;
    const parent = win.document.activeElement.contentWindow = {};
    source.parent = parent;
    handleMessageEvent(win, event);
    expectNavigation();
  });

  it('should fail for invalid active element', () => {
    win.document.activeElement.tagName = 'INPUT';
    expect(() => {
      handleMessageEvent(win, event);
    }).to.throw(/A2A request with invalid active element/);
  });

  it('should fail for invalid url', () => {
    event.data = 'a2a;' + JSON.stringify({
      url: 'https://test.com/c/test',
    });
    expect(() => {
      handleMessageEvent(win, event);
    }).to.throw(/Invalid ad A2A URL/);
  });

  it('should fail for invalid url', () => {
    findClosestAd = false;
    expect(() => {
      handleMessageEvent(win, event);
    }).to.throw(/A2A request from non-ad frame/);
  });
});
