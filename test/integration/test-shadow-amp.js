import {BrowserController} from '#testing/helpers/service';

describes.integration(
  'AMP shadow v0',
  {
    amp: false,
    body: `
      <!-- unminified src for local-tests.js -->
      <script async src="/dist/amp-shadow.js"></script>
      <script async src="/dist/shadow-v0.js"></script>
      <div id="host"></div>
      <script>
        function fetchDocument(url) {
          var xhr = new XMLHttpRequest();
          return new Promise((resolve, reject) => {
            xhr.open('GET', url, true);
            xhr.responseType = 'document';
            xhr.setRequestHeader('Accept', 'text/html');
            xhr.onload = () => resolve(xhr.responseXML);
            xhr.send();
          });
        }

        (window.AMP = window.AMP || []).push(() => {
          const host = document.getElementById('host');
          const testUrl = 'http://localhost:9876/test/fixtures/served/shadow.html';
          fetchDocument(testUrl).then(doc => AMP.attachShadowDoc(host, doc, testUrl));
        });
      </script>
    `,
  },
  (env) => {
    let docController;
    let shadowDoc;

    beforeEach(async () => {
      docController = new BrowserController(env.win);
      await docController.waitForShadowRoot('#host', 25000);
      shadowDoc = env.win.document.getElementById('host').shadowRoot;
    });

    it('should attach shadow AMP document', () => {
      return expect(shadowDoc.body.innerText).to.include('Shadow AMP document');
    });

    it('should layout amp-img component in shadow AMP document', async () => {
      const shadowDocController = new BrowserController(env.win, shadowDoc);
      await shadowDocController.waitForElementLayout('amp-img');
      return expect(
        shadowDoc.querySelectorAll('amp-img img[src]')
      ).to.have.length(1);
    });
  }
);
