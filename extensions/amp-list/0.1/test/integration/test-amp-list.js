import {BrowserController} from '#testing/helpers/service';

const TIMEOUT = 15000;

describes.sandboxed('amp-list (integration)', {}, function () {
  this.timeout(TIMEOUT);

  const basicBody = `<amp-list width=300 height=100 src="http://localhost:9876/list/fruit-data/get?cors=0">
      <template type="amp-mustache">
        {{name}} : {{quantity}} @ {{unitPrice}}
      </template>
    '</amp-list>`;

  const scriptTemplateBody = `<amp-list width=300 height=100 src="http://localhost:9876/list/fruit-data/get?cors=0">
    <script type="text/plain" template="amp-mustache">
      {{name}} : {{quantity}} @ {{unitPrice}}
    </script>
  '</amp-list>`;

  const basicTests = (env) => {
    let browser;
    let doc;
    let win;

    beforeEach(() => {
      win = env.win;
      browser = new BrowserController(win);
      doc = win.document;
    });

    it('should build', function* () {
      const list = doc.querySelector('amp-list');
      expect(list).to.exist;
      yield browser.waitForElementBuild('amp-list', TIMEOUT);
      const container = list.querySelector('div[role="list"]');
      expect(container).to.exist;
    });

    // TODO(choumx): Frequent 10s timeout on Chrome 72.0.3626 (Linux 0.0.0).
    it.skip('should render items', function* () {
      const list = doc.querySelector('amp-list');
      expect(list).to.exist;

      yield browser.waitForElementLayout('amp-list', TIMEOUT);

      const children = list.querySelectorAll('div[role=list] > div');
      expect(children.length).to.equal(3);
      expect(children[0].textContent.trim()).to.equal('apple : 47 @ 0.33');
      expect(children[1].textContent.trim()).to.equal('pear : 538 @ 0.54');
      expect(children[2].textContent.trim()).to.equal('tomato : 0 @ 0.23');
    });
  };

  describes.integration(
    'basic (mustache-0.1)',
    {
      body: basicBody,
      extensions: ['amp-list', 'amp-mustache:0.1'],
    },
    basicTests
  );

  describes.integration(
    'basic (mustache-0.2)',
    {
      body: basicBody,
      extensions: ['amp-list', 'amp-mustache:0.2'],
    },
    basicTests
  );

  describes.integration(
    'basic (mustache-0.1) script template',
    {
      body: scriptTemplateBody,
      extensions: ['amp-list', 'amp-mustache:0.1'],
    },
    basicTests
  );

  describes.integration(
    'basic (mustache-0.2) script template',
    {
      body: scriptTemplateBody,
      extensions: ['amp-list', 'amp-mustache:0.2'],
    },
    basicTests
  );
});
