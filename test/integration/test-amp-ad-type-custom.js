import {BrowserController} from '#testing/helpers/service';

describes.integration(
  'amp-ad type=custom',
  {
    body: `
  <template type="amp-mustache" id="amp-template-id1">
    <a href="{{href}}" target='_blank' rel="noopener noreferrer">
      <amp-img layout='fixed' width="500" height="60" src="{{src}}" data-info="{{info}}"></amp-img>
    </a>
  </template>

  <template type="amp-mustache" id="amp-template-id2">
    <a href="{{href}}" target="_blank" rel="noopener noreferrer">
      <amp-img layout='fixed' height="200" width="200" src="{{src}}" data-info="{{info}}"></amp-img>
    </a>
  </template>

  <amp-ad width="500" height="60"
      id="ad1"
      type="custom"
      data-slot="1"
      data-url="/examples/custom.ad.example.json">
      <template type="amp-mustache" id="amp-template-id-no-slot">
        <a href="{{href}}" target="_blank" rel="noopener noreferrer">
          <amp-img layout='fixed' height="60" width="500" src="{{src}}" data-info="Info"></amp-img>
        </a>
        </div>
      </template>
  </amp-ad>

  <amp-ad width="200" height="200"
      id="ad2"
      type="custom"
      data-slot="2"
      data-url="/examples/custom.ad.example.json">
  </amp-ad>

  <amp-ad width="500" height="60"
      id="ad3"
      type="custom"
      data-url="/examples/custom.ad.example.single.json">
    <template type="amp-mustache" id="amp-template-id-no-slot">
      <a href="{{href}}" target="_blank" rel="noopener noreferrer">
        <amp-img layout='fixed' height="60" width="500" src="{{src}}" data-info="{{info}}"></amp-img>
      </a>
    </template>
  </amp-ad>
      `,
    extensions: ['amp-ad', 'amp-mustache'],
  },
  (env) => {
    let browser;
    let doc;

    beforeEach(() => {
      doc = env.win.document;
      browser = new BrowserController(env.win);
      return browser.waitForElementLayout('amp-ad');
    });

    it.skip('should render template', () => {
      expect(doc.querySelectorAll('amp-img')).to.have.length(3);

      // ad1
      const ad1 = doc.getElementById('ad1');
      expect(ad1.getAttribute('template')).to.be.null;
      expect(ad1.getAttribute('data-vars-var1')).to.be.null;
      expect(ad1.getAttribute('data-vars-var2')).to.be.null;
      const img1 = ad1.querySelector('amp-img');
      expect(img1.getAttribute('data-info')).to.equal('Info');

      // ad2
      const ad2 = doc.getElementById('ad2');
      expect(ad2.getAttribute('template')).to.equal('amp-template-id2');
      const img2 = ad2.querySelector('amp-img');
      expect(img2.getAttribute('data-info')).to.equal('Info2');
      expect(ad2.getAttribute('data-vars-var1')).to.equal('123');
      expect(ad2.getAttribute('data-vars-var2')).to.equal('456');

      // ad3
      const ad3 = doc.getElementById('ad3');
      expect(ad3.getAttribute('template')).to.be.null;
      const img3 = ad3.querySelector('amp-img');
      expect(img3.getAttribute('data-info')).to.equal('Info3');
    });
  }
);
