import {shouldBlockOnConsentByMeta} from '../../src/consent';

describes.fakeWin('consent', {amp: true}, (env) => {
  describe('block by meta tags', () => {
    let doc;
    let head;
    let meta;
    beforeEach(() => {
      doc = env.win.document;
      head = doc.head;
      meta = doc.createElement('meta');
      meta.setAttribute('name', 'amp-consent-blocking');
      meta.setAttribute('content', 'AMP-TEST,amp-ad');
    });

    it('block by tagName', () => {
      doc.head.appendChild(meta);
      const element = doc.createElement('amp-test');
      element.getAmpDoc = () => {
        return env.ampdoc;
      };
      doc.body.appendChild(element);
      expect(shouldBlockOnConsentByMeta(element)).to.be.true;
    });

    it('block by lowercase tagName', () => {
      head.appendChild(meta);
      const element = doc.createElement('amp-ad');
      element.getAmpDoc = () => {
        return env.ampdoc;
      };
      doc.body.appendChild(element);
      expect(shouldBlockOnConsentByMeta(element)).to.be.true;
    });

    it('not block unspecified element', () => {
      head.appendChild(meta);
      const element = doc.createElement('amp-not-exist');
      element.getAmpDoc = () => {
        return env.ampdoc;
      };
      doc.body.appendChild(element);
      expect(shouldBlockOnConsentByMeta(element)).to.be.false;
    });

    it('handles white space', () => {
      meta = doc.createElement('meta');
      meta.setAttribute('name', 'amp-consent-blocking');
      meta.setAttribute('content', ' amp-this,    amp-that  ');
      head.appendChild(meta);
      const element = doc.createElement('amp-that');
      element.getAmpDoc = () => {
        return env.ampdoc;
      };
      doc.body.appendChild(element);
      expect(shouldBlockOnConsentByMeta(element)).to.be.true;
    });

    it('only work with tagName', () => {
      meta = doc.createElement('meta');
      meta.setAttribute('name', 'amp-consent-blocking');
      meta.setAttribute('content', 'amp-this:name,amp-this[name]');
      head.appendChild(meta);
      const element = doc.createElement('amp-this');
      element.getAmpDoc = () => {
        return env.ampdoc;
      };
      doc.body.appendChild(element);
      expect(shouldBlockOnConsentByMeta(element)).to.be.false;
    });
  });
});
