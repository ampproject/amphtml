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

import {listenOncePromise} from '../../../../../src/event-helper';

describe.configure().run('amp-sidebar', function() {

  const extensions = ['amp-sidebar'];

  const sidebarBody = `
  <amp-sidebar
    id="sidebar1"
    layout="nodisplay"
    on="sidebarOpen:focusOnMe.focus">
    <ul>
      <li> <a id="focusOnMe" href="https://google.com">Focused on open</a></li>
      <li>
        <button id="sidebarCloser" on="tap:sidebar1.close">
          Close
        </button>
      </li>
    </ul>
  </amp-sidebar>
  <button id="sidebarOpener" on="tap:sidebar1.toggle">Open Sidebar</button>
  <div id="section2" style="position: absolute; top: 1000px;">
    <h1 >Section 2</h1>
  </div>
  <div id="section3" style="position: absolute; top: 2000px;">
    <h1 >Section 3</h1>
  </div>
  `;
  describes.integration('sidebar focus', {
    body: sidebarBody,
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
    });

    it('should focus on opener on close', () => {
      const openerButton = win.document.getElementById('sidebarOpener');
      const sidebar = win.document.getElementById('sidebar1');
      const openedPromise = listenOncePromise(sidebar, 'sidebarOpen');
      openerButton.click();
      return openedPromise.then(() => {
        const closerButton = win.document.getElementById('sidebarCloser');
        const closedPromise = listenOncePromise(sidebar, 'sidebarClose');
        closerButton.click();
        return closedPromise;
      }).then(() => {
        expect(win.document.activeElement).to.equal(openerButton);
      });
    });

    it('should not change scroll position after close', () => {
      const openerButton = win.document.getElementById('sidebarOpener');
      const sidebar = win.document.getElementById('sidebar1');
      const viewport = sidebar.implementation_.getViewport();
      const openedPromise = listenOncePromise(sidebar, 'sidebarOpen');
      openerButton.click();
      expect(viewport.getScrollTop()).to.equal(0);
      return openedPromise.then(() => {
        viewport.setScrollTop(1000);
        expect(viewport.getScrollTop()).to.equal(1000);
        const closerButton = win.document.getElementById('sidebarCloser');
        const closedPromise = listenOncePromise(sidebar, 'sidebarClose');
        closerButton.click();
        return closedPromise;
      }).then(() => {
        expect(viewport.getScrollTop()).to.equal(1000);
        expect(win.document.activeElement).to.not.equal(openerButton);
      });
    });
  });
});
