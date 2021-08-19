import {createElementWithAttributes} from '#core/dom';

import {AmpFxCollection} from '../amp-fx-collection';

describes.fakeWin(
  'amp-fx-collection',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-fx-collection'],
    },
  },
  (env) => {
    let win;
    let ampdoc;

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
    });

    function createAmpFx(fxType, opt_attrs) {
      const element = createElementWithAttributes(
        win.document,
        'div',
        opt_attrs
      );
      win.document.body.appendChild(element);
      const ampFxCollection = new AmpFxCollection(ampdoc);
      return ampFxCollection;
    }

    // TODO(alanorozco): Actually write tests. Like the goggles, these do nothing!
    it.skip('creates amp-fx components correctly', () => {
      let ampFx = createAmpFx('parallax', {
        'data-parallax-factor': 1.2,
      });
      expect(ampFx).to.not.be.null;
      expect(ampFx.getFxProvider_()).to.not.be.null;

      ampFx = createAmpFx('fade-in');
      expect(ampFx).to.not.be.null;
      expect(ampFx.getFxProvider_()).to.not.be.null;

      ampFx = createAmpFx('fade-in-scroll');
      expect(ampFx).to.not.be.null;
      expect(ampFx.getFxProvider_()).to.not.be.null;

      ampFx = createAmpFx('fly-in-bottom');
      expect(ampFx).to.not.be.null;
      expect(ampFx.getFxProvider_()).to.not.be.null;

      ampFx = createAmpFx('fly-in-top');
      expect(ampFx).to.not.be.null;
      expect(ampFx.getFxProvider_()).to.not.be.null;

      ampFx = createAmpFx('fly-in-left');
      expect(ampFx).to.not.be.null;
      expect(ampFx.getFxProvider_()).to.not.be.null;

      ampFx = createAmpFx('fly-in-right');
      expect(ampFx).to.not.be.null;
      expect(ampFx.getFxProvider_()).to.not.be.null;
    });
  }
);
