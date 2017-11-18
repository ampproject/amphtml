/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {SystemLayer} from '../system-layer';
import {EventType} from '../events';
import {ProgressBar} from '../progress-bar';
import {Services} from '../../../../src/services';


const NOOP = () => {};


describes.fakeWin('amp-story system layer', {}, env => {
  let win;
  let systemLayer;
  let progressBarStub;
  let progressBarRoot;

  function matchEvent(name, bubbles) {
    return sandbox.match.has('type', name)
        .and(sandbox.match.has('bubbles', bubbles));
  }

  function expectEventTransform(eventHandler, expectedEventType) {
    const dispatchEvent = sandbox.spy();
    const stopPropagation = sandbox.spy();

    sandbox.stub(systemLayer, 'getRoot').returns({dispatchEvent});

    eventHandler({stopPropagation});

    expect(stopPropagation).to.be.calledOnce;
    expect(dispatchEvent).to.have.been.calledWith(
        matchEvent(expectedEventType, /* bubbles */ true));
  }

  beforeEach(() => {
    win = env.win;

    progressBarRoot = win.document.createElement('div');

    progressBarStub = {
      build: sandbox.stub().returns(progressBarRoot),
      getRoot: sandbox.stub().returns(progressBarRoot),
      setActivePageIndex: sandbox.spy(),
      updateProgress: sandbox.spy(),
    };

    sandbox.stub(ProgressBar, 'create').returns(progressBarStub);

    systemLayer = new SystemLayer(win);

    sandbox.stub(Services, 'vsyncFor').returns({
      mutate: fn => fn(),
    });
  });

  it('should build UI', () => {
    const addEventHandlers =
        sandbox.stub(systemLayer, 'addEventHandlers_', NOOP);

    const root = systemLayer.build();

    expect(root).to.not.be.null;
    expect(systemLayer.exitFullScreenBtn_).to.not.be.null;

    expect(addEventHandlers).to.have.been.called;
  });

  it('should attach event handlers', () => {
    const rootMock = {addEventListener: sandbox.spy()};

    sandbox.stub(systemLayer, 'root_', rootMock);
    sandbox.stub(systemLayer, 'win_', rootMock);

    systemLayer.addEventHandlers_();

    expect(rootMock.addEventListener).to.have.been.calledWith('click');
  });

  it('should dispatch EXIT_FULLSCREEN when exit button is clicked', () => {
    expectEventTransform(
        e => systemLayer.onExitFullScreenClick_(e), EventType.EXIT_FULLSCREEN);
  });

  it('should dispatch ENTER_FULLSCREEN when enter button is clicked', () => {
    expectEventTransform(
        e => systemLayer.onEnterFullScreenClick_(e), EventType.ENTER_FULLSCREEN
    );
  });

  it('should hide exit and show enter fullscreen button when not in fullscreen',
      () => {
        const exitButton = win.document.createElement('button');
        const enterButton = win.document.createElement('button');

        sandbox.stub(systemLayer, 'exitFullScreenBtn_', exitButton);
        sandbox.stub(systemLayer, 'enterFullScreenBtn_', enterButton);

        systemLayer.setInFullScreen(false);

        expect(exitButton.hasAttribute('hidden')).to.be.true;
        expect(enterButton.hasAttribute('hidden')).to.be.false;
      }
  );

  it('should show exit and hide enter fullscreen button when in fullscreen',
      () => {
        const exitButton = win.document.createElement('button');
        const enterButton = win.document.createElement('button');

        sandbox.stub(systemLayer, 'exitFullScreenBtn_', exitButton);
        sandbox.stub(systemLayer, 'enterFullScreenBtn_', enterButton);

        systemLayer.setInFullScreen(true);

        expect(exitButton.hasAttribute('hidden')).to.be.false;
        expect(enterButton.hasAttribute('hidden')).to.be.true;
      }
  );

  it('should set the active page index', () => {
    [0, 1, 2, 3, 4].forEach(index => {
      systemLayer.setActivePageIndex(index);
      progressBarStub.setActivePageIndex.should.have.been.calledWith(index);
    });
  });
});
