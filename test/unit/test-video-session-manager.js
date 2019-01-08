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

import {VideoSessionManager} from '../../src/service/video-session-manager';

describes.sandboxed('VideoSessionManager', {}, () => {
  let manager;

  beforeEach(() => {
    manager = new VideoSessionManager();
  });

  it('should trigger a listener when a session ends', () => {
    const sessionSpy = sandbox.spy();
    manager.onSessionEnd(sessionSpy);

    manager.beginSession();
    manager.endSession();
    expect(sessionSpy).to.be.calledOnce;
  });

  it('should only begin a session once even after repeated calls', () => {
    const sessionSpy = sandbox.spy();
    manager.onSessionEnd(sessionSpy);

    manager.beginSession();
    manager.beginSession();
    manager.beginSession();
    manager.endSession();
    expect(sessionSpy).to.be.calledOnce;
  });

  it('should only end a session once even after repeated calls', () => {
    const sessionSpy = sandbox.spy();
    manager.onSessionEnd(sessionSpy);

    manager.beginSession();
    manager.beginSession();
    manager.endSession();
    manager.endSession();
    manager.endSession();
    expect(sessionSpy).to.be.calledOnce;
  });
});
