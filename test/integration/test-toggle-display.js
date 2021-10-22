import {setInitialDisplay, toggle} from '#core/dom/style';

import {BrowserController} from '#testing/helpers/service';

describes.integration(
  'toggle display helper',
  {
    body: '<amp-img src="/examples/img/hero@1x.jpg" width="289" height="216"></amp-img>',
  },
  (env) => {
    let browser, doc;
    let img;

    beforeEach(async () => {
      const {win} = env;
      doc = win.document;
      browser = new BrowserController(win);

      await browser.waitForElementLayout('amp-img');
      img = doc.querySelector('amp-img');
    });

    function expectToggleDisplay(el) {
      toggle(el, false);
      expect(el).to.have.display('none');
      toggle(el, true);
      expect(el).to.not.have.display('none');
    }

    it('toggles regular display', () => {
      expectToggleDisplay(img);
    });

    it('toggles initial display style', () => {
      setInitialDisplay(img, 'inline-block');
      expectToggleDisplay(img);
    });

    it('toggles stylesheet display style', () => {
      const style = doc.createElement('style');
      style.innerText = 'amp-img { display: inline-block !important; }';
      doc.head.appendChild(style);

      expectToggleDisplay(img);
    });
  }
);
