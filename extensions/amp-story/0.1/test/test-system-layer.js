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
import {ProgressBar} from '../progress-bar';
import {Services, registerServiceBuilder} from '../../../../src/services';
import {SystemLayer} from '../system-layer';


const NOOP = () => {};


describes.fakeWin('amp-story system layer', {}, env => {
  let win;
  let systemLayer;
  let progressBarStub;
  let progressBarRoot;

  beforeEach(() => {
    win = env.win;

    registerServiceBuilder(win, 'story-store', () => ({get: NOOP}));
    progressBarRoot = win.document.createElement('div');

    progressBarStub = {
      build: sandbox.stub().returns(progressBarRoot),
      getRoot: sandbox.stub().returns(progressBarRoot),
      setActiveSegmentId: sandbox.spy(),
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
        sandbox.stub(systemLayer, 'addEventHandlers_').callsFake(NOOP);

    const root = systemLayer.build();

    expect(root).to.not.be.null;

    expect(addEventHandlers).to.have.been.called;
  });

  // TODO(alanorozco, #12476): Make this test work with sinon 4.0.
  it.skip('should attach event handlers', () => {
    const rootMock = {addEventListener: sandbox.spy()};

    sandbox.stub(systemLayer, 'root_').callsFake(rootMock);
    sandbox.stub(systemLayer, 'win_').callsFake(rootMock);

    systemLayer.addEventHandlers_();

    expect(rootMock.addEventListener).to.have.been.calledWith('click');
  });

  it('should set the active page index', () => {
    [0, 1, 2, 3, 4].forEach(index => {
      systemLayer.setActivePageId(index);
      progressBarStub.setActiveSegmentId.should.have.been.calledWith(index);
    });
  });
});
