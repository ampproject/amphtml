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

import {poll} from '../../../../../testing/iframe';

// TODO(cathyxz, #14336): Fails due to console errors.
describe.skip('amp-sidebar', function() {
  // Extend timeout slightly for flakes on Windows environments
  this.timeout(4000);
  const extensions = ['amp-sidebar'];

  const sidebarBody = `
  <amp-sidebar
    id="sidebar1"
    layout="nodisplay"
    // eslint-disable-next-line
    on="sidebarOpen:focusOnMe.focus,dummy.hide;sidebarClose:dummy.show">
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

  <div id="dummy"></div>
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
      const openedPromise = waitForSidebarOpen(win.document);
      openerButton.click();
      return openedPromise.then(() => {
        const closerButton = win.document.getElementById('sidebarCloser');
        const closedPromise = waitForSidebarClose(win.document);
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
      const openedPromise = waitForSidebarOpen(win.document);
      openerButton.click();
      expect(viewport.getScrollTop()).to.equal(0);
      return openedPromise.then(() => {
        viewport.setScrollTop(1000);
        expect(viewport.getScrollTop()).to.equal(1000);
        const closerButton = win.document.getElementById('sidebarCloser');
        const closedPromise = waitForSidebarClose(win.document);
        closerButton.click();
        return closedPromise;
      }).then(() => {
        // Firefox resets scroll to top on pop history
        // Safari resets scroll to top somewhere unrelated to focus
        // expect(viewport.getScrollTop()).to.equal(1000);
        expect(win.document.activeElement).to.not.equal(openerButton);
      });
    });
  });
});

function waitForSidebarOpen(document) {
  return poll('wait for sidebar to open', () => {
    const dummy = document.getElementById('dummy');
    return dummy.style.display == 'none';
  });
}

function waitForSidebarClose(document) {
  return poll('wait for sidebar to open', () => {
    const dummy = document.getElementById('dummy');
    return dummy.style.display == '';
  });
}
