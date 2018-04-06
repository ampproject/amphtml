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

/**
 * @fileoverview
 * Extension gets loaded dynamically and manages video components.
 * It's invalid to include this extension in a document as a `<script>` tag, as
 * it gets automatically inserted by the runtime when required.
 */

import {Observable} from '../../../../src/observable';
import {TimeUpdateEvent} from '../video-behaviors';
import {VideoEntry} from '../amp-video-service';
import {VideoEvents} from '../../../../src/video-interface';

describes.fakeWin('VideoEntry', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let sandbox;
  let video;
  let element;

  beforeEach(() => {
    const signals = {signal: env.sandbox.spy()};

    sandbox = env.sandbox;
    element = env.win.document.createElement('div');

    element.dispatchCustomEvent = sandbox.spy();
    element.whenBuilt = () => Promise.resolve();
    element.signals = () => signals;

    video = {element};
  });

  it('should add classname to element and trigger events on install', () => {
    const expectedClass = 'i-amphtml-video-interface';
    const expectedSignal = VideoEvents.REGISTERED;
    const expectedEvent = VideoEvents.REGISTERED;

    const entry = new VideoEntry(env.ampdoc, /* service */ null, video);

    sandbox.stub(entry, 'maybeTriggerTimeUpdate');
    sandbox.stub(entry, 'registerCommonActions');

    expect(element).to.not.have.class(expectedClass);
    expect(element.signals().signal).to.not.have.been.called;
    expect(element.dispatchCustomEvent).to.not.have.been.called;

    entry.install();

    return element.whenBuilt().then(() => {
      expect(element).to.have.class(expectedClass);
      expect(element.signals().signal).to.have.been.calledWith(expectedSignal);
      expect(element.dispatchCustomEvent)
          .to.have.been.calledWith(expectedEvent);
    });
  });

  it('should register common actions on install', () => {
    const entry = new VideoEntry(env.ampdoc, /* service */ null, video);

    sandbox.stub(entry, 'maybeTriggerTimeUpdate');

    video.registerAction = sandbox.spy();

    entry.install();

    return element.whenBuilt().then(() => {
      expect(video.registerAction).to.have.been.calledWith('play');
      expect(video.registerAction).to.have.been.calledWith('pause');
      expect(video.registerAction).to.have.been.calledWith('mute');
      expect(video.registerAction).to.have.been.calledWith('unmute');
    });
  });

  [
    ['should not', false, ''],
    ['should', true, 'timeUpdate:blah'],
  ].forEach(test => {
    const [shouldOrNot, triggerShouldHaveBeenCalled, on] = test;

    it(`${shouldOrNot} trigger \`timeUpdate\``, () => {
      element.setAttribute('on', on);

      const tick = new Observable();
      const trigger = sandbox.stub(TimeUpdateEvent, 'trigger');
      const service = {
        onTick: sandbox.stub().callsFake(tick.add.bind(tick)),
      };
      const entry = new VideoEntry(env.ampdoc, service, video);

      sandbox.stub(entry, 'registerCommonActions');

      entry.install();
      entry.isPlaying_ = true;

      return element.whenBuilt().then(() => {
        tick.fire();

        if (triggerShouldHaveBeenCalled) {
          expect(service.onTick).to.have.been.calledOnce;
          expect(trigger).to.have.been.calledOnce;
        } else {
          expect(service.onTick).to.not.have.been.called;
          expect(trigger).to.not.have.been.called;
        }
      });
    });
  });
});
