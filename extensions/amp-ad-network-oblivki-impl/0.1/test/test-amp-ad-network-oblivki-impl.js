import {createElementWithAttributes} from '#core/dom';

import {
  AmpAdUIHandler, // eslint-disable-line @typescript-eslint/no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-ui';
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line @typescript-eslint/no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {AmpAdNetworkOblivkiImpl} from '../amp-ad-network-oblivki-impl';
import {oblivkiIsA4AEnabled} from '../oblivki-a4a-config';

describes.realWin('oblivki-a4a-config', {amp: false}, (env) => {
  let win, doc;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });
  it('should pass a4a config predicate', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://oblivki.biz/amp/',
      'data-use-a4a': 'true',
    });
    expect(oblivkiIsA4AEnabled(win, element)).to.be.true;
  });
  it('should pass a4a config predicate', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://oblivki.biz/amp/a4a/',
      'data-use-a4a': 'true',
    });
    expect(oblivkiIsA4AEnabled(win, element)).to.be.true;
  });
  it('should fail a4a config predicate due to useRemoteHtml', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://oblivki.biz/amp/a4a/',
      'data-use-a4a': 'true',
    });
    const useRemoteHtml = true;
    expect(oblivkiIsA4AEnabled(win, element, useRemoteHtml)).to.be.false;
  });
  it('should fail a4a config predicate due to missing use-a4a', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://oblivki.biz/amp/',
    });
    expect(oblivkiIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to missing src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-use-a4a': 'true',
    });
    expect(oblivkiIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to invalid src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://evil.com?hello=world&https://oblivki.biz',
      'data-use-a4a': 'true',
    });
    expect(oblivkiIsA4AEnabled(win, element)).to.be.false;
  });
});

describes.realWin(
  'amp-ad-network-oblivki-impl',
  {
    amp: {
      extensions: ['amp-ad-network-oblivki-impl'],
    },
  },
  (env) => {
    let win, doc;
    let oblivkiImpl;
    let oblivkiImplElem;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
      oblivkiImplElem = doc.createElement('amp-ad');
      oblivkiImplElem.setAttribute('type', 'oblivki');
      oblivkiImplElem.setAttribute('data-use-a4a', 'true');
      env.sandbox
        .stub(AmpAdNetworkOblivkiImpl.prototype, 'getSigningServiceNames')
        .callsFake(() => {
          return ['google'];
        });
      oblivkiImpl = new AmpAdNetworkOblivkiImpl(oblivkiImplElem);
    });

    describe('#isValidElement', () => {
      it('should be valid', () => {
        oblivkiImplElem.setAttribute(
          'src',
          'https://oblivki.biz/amp/a4a/?block-key=1&is_a4a=1'
        );
        expect(oblivkiImpl.isValidElement()).to.be.true;
      });
      it('should be valid', () => {
        oblivkiImplElem.setAttribute(
          'src',
          'https://oblivki.biz/amp/?block-key=1&is_a4a=1'
        );
        expect(oblivkiImpl.isValidElement()).to.be.true;
      });
      it('should NOT be valid (impl tag name)', () => {
        oblivkiImplElem = doc.createElement('amp-ad-network-oblivki-impl');
        oblivkiImplElem.setAttribute('type', 'oblivki');
        oblivkiImpl = new AmpAdNetworkOblivkiImpl(oblivkiImplElem);
        expect(oblivkiImpl.isValidElement()).to.be.false;
      });
    });

    describe('#getAdUrl', () => {
      it('should be valid', () => {
        oblivkiImplElem.setAttribute(
          'src',
          'https://oblivki.biz/amp/a4a/?block-key=1&is_a4a=1'
        );
        const base = 'https://oblivki.biz/amp/a4a/';
        expect(oblivkiImpl.getAdUrl().substring(0, base.length)).to.equal(base);
      });
      it('should be valid', () => {
        oblivkiImplElem.setAttribute(
          'src',
          'https://oblivki.biz/amp/?block-key=1&is_a4a=1'
        );
        const base = 'https://oblivki.biz/amp/a4a/';
        expect(oblivkiImpl.getAdUrl().substring(0, base.length)).to.equal(base);
      });
    });
  }
);
