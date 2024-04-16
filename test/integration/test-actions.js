import {BrowserController} from '#testing/helpers/service';
import {poll} from '#testing/iframe';

describes.integration(
  'on="..."',
  {
    body: `
  <span id="spanToHide">This text will be hidden by #hideBtn</span>
  <button id="hideBtn" on="tap:spanToHide.hide">Hide #spanToHide</button>

  <amp-img id="imgToToggle" width=200 height=100 src="/examples/img/sample.jpg" layout=fixed></amp-img>
  <button id="toggleBtn" on="tap:imgToToggle.toggleVisibility">Toggle visibility for #img</button>

  <button id="navigateBtn" on="tap:AMP.navigateTo(url='https://google.com')">Navigate to google.com</button>

  <button id="printBtn" on="tap:AMP.print">Print</button>
  `,
  },
  (env) => {
    let browser, win, doc;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      browser = new BrowserController(win);
      await browser.waitForElementLayout('amp-img');
    });

    async function waitForDisplayChange(description, elementId, displayValue) {
      const element = doc.getElementById(elementId);
      await poll(
        description,
        () => win.getComputedStyle(element)['display'] === displayValue
      );
    }

    describe('"tap" event', () => {
      it('<non-AMP element>.toggleVisibility', async () => {
        doc.getElementById('hideBtn').click();
        await waitForDisplayChange('#spanToHide hidden', 'spanToHide', 'none');
      });

      it('<AMP element>.toggleVisibility', async () => {
        const toggleBtn = doc.getElementById('toggleBtn');

        toggleBtn.click();
        await waitForDisplayChange(
          '#imgToToggle hidden',
          'imgToToggle',
          'none'
        );

        toggleBtn.click();
        await waitForDisplayChange(
          '#imgToToggle displayed',
          'imgToToggle',
          'inline-block'
        );
      });

      describe
        .configure()
        .skipIfPropertiesObfuscated()
        .run('navigate', function () {
          it('AMP.navigateTo(url=)', async () => {
            // This is brittle but I don't know how else to stub
            // window navigation.
            const navigationService = win.__AMP_SERVICES.navigation.obj;
            const navigateTo = env.sandbox.stub(
              navigationService,
              'navigateTo'
            );

            doc.getElementById('navigateBtn').click();
            await poll('navigateTo() called with correct args', () =>
              navigateTo.calledWith(win, 'https://google.com')
            );
          });
        });

      it('AMP.print()', async () => {
        const print = env.sandbox.stub(win, 'print');

        doc.getElementById('printBtn').click();
        await poll('print() called once', () => print.calledOnce);
      });
    });
  }
);
