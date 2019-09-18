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

import {AmpdocAnalyticsRoot} from '../analytics-root';
import {ScrollManager} from '../scroll-manager';

describes.realWin('ScrollManager', {amp: 1}, env => {
  let win;
  let ampdoc;
  let root;
  let body, target, child, other;
  let scrollManager;
  let fakeViewport;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    root = new AmpdocAnalyticsRoot(ampdoc);
    body = win.document.body;

    target = win.document.createElement('target');
    target.id = 'target';
    target.className = 'target';
    body.appendChild(target);

    child = win.document.createElement('child');
    child.id = 'child';
    child.className = 'child';
    target.appendChild(child);

    other = win.document.createElement('div');
    other.id = 'other';
    other.className = 'other';
    body.appendChild(other);

    scrollManager = new ScrollManager(ampdoc);
    root.scrollManager_ = scrollManager;
    fakeViewport = {
      'getSize': sandbox
        .stub()
        .returns({top: 0, left: 0, height: 200, width: 200}),
      'getScrollTop': sandbox.stub().returns(0),
      'getScrollLeft': sandbox.stub().returns(0),
      'getScrollHeight': sandbox.stub().returns(500),
      'getScrollWidth': sandbox.stub().returns(500),
      'onChanged': () => {
        return sandbox.stub();
      },
    };
    scrollManager.viewport_ = fakeViewport;
  });

  it('should initalize, add listeners and dispose', () => {
    expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(0);

    scrollManager.addScrollHandler(sandbox.stub());
    expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(1);

    scrollManager.dispose();
    expect(scrollManager.scrollObservable_.getHandlerCount()).to.equal(0);
  });

  it(
    'should add a viewport onChanged listener with scroll handlers, ' +
      'and dispose when there are none',
    () => {
      expect(scrollManager.viewportOnChangedUnlistener_).to.not.be.ok;

      const fn1 = sandbox.stub();
      scrollManager.addScrollHandler(fn1);

      expect(scrollManager.viewportOnChangedUnlistener_).to.be.ok;
      const unlistenStub = scrollManager.viewportOnChangedUnlistener_;

      scrollManager.removeScrollHandler(fn1);

      expect(scrollManager.viewportOnChangedUnlistener_).to.not.be.ok;
      expect(unlistenStub).to.have.callCount(1);
    }
  );

  it('fires on scroll', () => {
    const fn1 = sandbox.stub();
    const fn2 = sandbox.stub();
    scrollManager.addScrollHandler(fn1);
    scrollManager.addScrollHandler(fn2);

    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);

    // Scroll Down
    fakeViewport.getScrollTop.returns(500);
    fakeViewport.getScrollLeft.returns(500);
    scrollManager.onScroll_({top: 500, left: 500, height: 250, width: 250});

    const expectedScrollEvent = {
      top: 500,
      left: 500,
      height: 250,
      width: 250,
      scrollWidth: 500,
      scrollHeight: 500,
    };

    function matcher(expected) {
      return actual => {
        // Returns true if all of the object keys have the same value
        return !Object.keys(actual).some(key => {
          return actual[key] !== expected[key];
        });
      };
    }

    expect(fn1).to.have.callCount(2);
    expect(
      fn1.getCall(1).calledWithMatch(sinon.match(matcher(expectedScrollEvent)))
    ).to.be.true;

    expect(fn2).to.have.callCount(2);
    expect(
      fn2.getCall(1).calledWithMatch(sinon.match(matcher(expectedScrollEvent)))
    ).to.be.true;
  });

  it('can remove specifc handlers', () => {
    const fn1 = sandbox.stub();
    const fn2 = sandbox.stub();
    scrollManager.addScrollHandler(fn1);
    scrollManager.addScrollHandler(fn2);

    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);

    scrollManager.removeScrollHandler(fn2);

    // Scroll Down
    fakeViewport.getScrollTop.returns(500);
    fakeViewport.getScrollLeft.returns(500);
    scrollManager.onScroll_({top: 500, left: 500, height: 250, width: 250});

    expect(fn1).to.have.callCount(2);
    expect(fn2).to.have.callCount(1);
  });
});
