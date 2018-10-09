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
import {
  NotificationUiManager,
} from '../../src/service/notification-ui-manager';
import {macroTask} from '../../testing/yield';


describes.realWin('NotificationUiManager', {amp: 1}, () => {
  describe('Notification UI Manager', () => {
    let manager;
    let show1, show2, show3;
    let showSpy1, showSpy2, showSpy3;
    let resolve1, resolve2, resolve3;
    let p1, p2, p3;
    beforeEach(() => {
      manager = new NotificationUiManager();
      showSpy1 = sandbox.spy();
      showSpy2 = sandbox.spy();
      showSpy3 = sandbox.spy();

      p1 = new Promise(resolve => {
        resolve1 = resolve;
      });
      p2 = new Promise(resolve => {
        resolve2 = resolve;
      });
      p3 = new Promise(resolve => {
        resolve3 = resolve;
      });

      show1 = () => {
        showSpy1();
        return p1;
      };

      show2 = () => {
        showSpy2();
        return p2;
      };

      show3 = () => {
        showSpy3();
        return p3;
      };

    });

    it('show UI in sequence', function* () {
      manager.registerUI(show1);
      manager.registerUI(show2);
      manager.registerUI(show3);
      yield macroTask();
      expect(showSpy1).to.be.calledOnce;
      expect(showSpy2).to.not.be.called;
      expect(showSpy3).to.not.be.called;
      resolve1();
      yield macroTask();
      expect(showSpy1).to.be.calledOnce;
      expect(showSpy2).to.be.calledOnce;
      expect(showSpy3).to.not.be.called;
      resolve2();
      yield macroTask();
      expect(showSpy1).to.be.calledOnce;
      expect(showSpy2).to.be.calledOnce;
      expect(showSpy3).to.be.calledOnce;
      resolve3();
      yield macroTask();
      expect(showSpy1).to.be.calledOnce;
      expect(showSpy2).to.be.calledOnce;
      expect(showSpy3).to.be.calledOnce;
    });

    it('queue empty handler', function* () {
      const handler = sandbox.spy();
      manager.registerUI(show1);
      manager.registerUI(show2);
      manager.onQueueEmpty(handler);
      expect(handler).to.not.be.called;
      resolve1();
      resolve2();
      yield macroTask();
      expect(handler).to.be.calledOnce;
    });

    it('queue not empty handler', function* () {
      const handler = sandbox.spy();
      manager.onQueueNotEmpty(handler);
      manager.registerUI(show1);
      manager.registerUI(show2);
      expect(handler).to.be.calledOnce;
      resolve1();
      resolve2();
      yield macroTask();
      expect(handler).to.be.calledOnce;
      manager.registerUI(show1);
      expect(handler).to.be.calledTwice;
    });
  });
});
