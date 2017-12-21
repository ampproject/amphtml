import {poll} from '../../testing/iframe';

const config = describe.configure().ifNewChrome();

config.run('amp-sidebar', function() {
  this.timeout(100000);

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
      return new Promise((resolve, reject) => {
        const openerButton = win.document.getElementById('sidebarOpener');
        openerButton.click();
        return waitForSidebarOpen(win.document).then(() => {
          const closerButton = win.document.getElementById('sidebarCloser');
          closerButton.click();
          return waitForSidebarClose(win.document);
        }).then(() => {
          try {
            expect(win.document.activeElement).to.equal(openerButton);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });

    it('should not change scroll after close', () => {
      return new Promise((resolve, reject) => {
        const openerButton = win.document.getElementById('sidebarOpener');
        openerButton.click();
        let scrollY = win.scrollY;
        return waitForSidebarOpen(win.document).then(() => {
          try {
            const closerButton = win.document.getElementById('sidebarCloser');
            win.scrollTo(0, 1000);
            scrollY = win.scrollY;
            expect(scrollY).to.equal(1000);
            closerButton.click();
            return waitForSidebarClose(win.document);
          } catch (e) {
            reject(e);
          }
        }).then(() => {
          try {
            expect(win.scrollY).to.equal(scrollY);
            expect(win.document.activeElement).to.not.equal(openerButton);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });
  });
});

function waitForSidebarOpen(document) {
  return poll('wait for sidebar to open', () => {
    const sidebar = document.getElementById('sidebar1');
    console.log(sidebar.getAttribute('aria-hidden'));
    return sidebar.getAttribute('aria-hidden') == 'false';
  });
}

function waitForSidebarClose(document) {
  return poll('wait for sidebar to open', () => {
    const sidebar = document.getElementById('sidebar1');
    return sidebar.getAttribute('aria-hidden') == 'true';
  });
}
