import '../amp-ima-video';
import {waitForChildPromise} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {Services} from '#service';

import {installResizeObserverStub} from '#testing/resize-observer-stub';

describes.realWin(
  'amp-ima-video',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-ima-video'],
    },
  },
  (env) => {
    let html;

    async function waitForChild(element, selector) {
      let child;
      await waitForChildPromise(
        element,
        () => (child = element.querySelector(selector))
      );
      return child;
    }

    beforeEach(() => {
      html = htmlFor(env.win.document);
      installResizeObserverStub(env.sandbox, env.win);
    });

    it('passes sourceChildren into iframe context', async () => {
      const element = html`
        <amp-ima-video data-tag="https://example.com" width="1" height="1">
          <source data-foo="bar" src="src" />
          <track any-attribute />
          <span>Other elements should be excluded</span>
        </amp-ima-video>
      `;

      env.win.document.body.appendChild(element);
      await element.whenBuilt();

      element.layoutCallback();

      const iframe = await waitForChild(element, 'iframe');
      const parsedName = JSON.parse(iframe.name);
      const sourceChildrenSerialized = parsedName?.attributes?.sourceChildren;
      expect(sourceChildrenSerialized).to.not.be.null;
      const sourceChildren = JSON.parse(sourceChildrenSerialized);
      expect(sourceChildren).to.have.length(2);
      expect(sourceChildren[0][0]).to.eql('SOURCE');
      expect(sourceChildren[0][1]).to.eql({'data-foo': 'bar', src: 'src'});
      expect(sourceChildren[1][0]).to.eql('TRACK');
      expect(sourceChildren[1][1]).to.eql({'any-attribute': ''});
    });

    it('sets consent data in context object', async () => {
      const initialConsentState = 'foo_getConsentPolicyState';
      const initialConsentMetadata = {'foo_getConsentMetadata': 'bar'};
      const initialConsentValue = 'foo_getConsentPolicyInfo';

      env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').resolves({
        whenPolicyResolved: () => Promise.resolve(initialConsentState),
        getConsentMetadataInfo: () => Promise.resolve(initialConsentMetadata),
        getConsentStringInfo: () => Promise.resolve(initialConsentValue),
        whenPolicyUnblock: () => Promise.resolve(true),
        whenPurposesUnblock: () => Promise.resolve(true),
      });

      const element = html`
        <amp-ima-video
          data-block-on-consent
          data-tag="https://example.com"
          data-poster="https://example.com/foo.png"
          width="1"
          height="1"
        ></amp-ima-video>
      `;

      env.win.document.body.appendChild(element);
      await element.whenBuilt();

      element.layoutCallback();

      const iframe = await waitForChild(element, 'iframe');
      const parsedName = JSON.parse(iframe.name);
      expect(parsedName.attributes._context).to.deep.include({
        initialConsentState,
        initialConsentMetadata,
        initialConsentValue,
      });
    });

    it('creates placeholder image from data-poster attribute', async () => {
      const element = html`
        <amp-ima-video
          data-tag="https://example.com"
          data-poster="https://example.com/foo.png"
          width="1"
          height="1"
        ></amp-ima-video>
      `;

      env.win.document.body.appendChild(element);
      await element.whenBuilt();

      const img = element.querySelector('img');
      expect(img).to.not.be.null;
      expect(img).to.have.attribute('placeholder');
      expect(img).to.have.class('i-amphtml-fill-content');
      expect(img.getAttribute('loading')).to.equal('lazy');
      expect(img.getAttribute('src')).to.equal('https://example.com/foo.png');
    });
  }
);
