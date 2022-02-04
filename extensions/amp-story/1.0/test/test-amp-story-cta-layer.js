import {registerServiceBuilder} from '../../../../src/service-helpers';
import {AmpStoryCtaLayer} from '../amp-story-cta-layer';

describes.realWin(
  'amp-story-cta-layer',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0'],
    },
  },
  (env) => {
    let win;
    let ampStoryCtaLayer;

    beforeEach(() => {
      win = env.win;
      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });
      const ampStoryCtaLayerEl = win.document.createElement(
        'amp-story-cta-layer'
      );
      win.document.body.appendChild(ampStoryCtaLayerEl);
      ampStoryCtaLayer = new AmpStoryCtaLayer(ampStoryCtaLayerEl);
    });

    it('should build the cta layer', async () => {
      ampStoryCtaLayer.buildCallback();
      await ampStoryCtaLayer.layoutCallback();
      expect(ampStoryCtaLayer.element).to.have.class('i-amphtml-story-layer');
    });

    it('should add or overwrite target attribute to links', async () => {
      const ctaLink = win.document.createElement('a');
      expect(ctaLink).to.not.have.attribute('target');

      ampStoryCtaLayer.element.appendChild(ctaLink);
      ampStoryCtaLayer.buildCallback();

      await ampStoryCtaLayer.layoutCallback();
      expect(ctaLink).to.have.attribute('target');
      expect(ctaLink.getAttribute('target')).to.equal('_blank');
    });

    it('should not add target attribute to other elements', async () => {
      const elem = win.document.createElement('span');
      ampStoryCtaLayer.element.appendChild(elem);
      ampStoryCtaLayer.buildCallback();

      await ampStoryCtaLayer.layoutCallback();
      expect(elem).to.not.have.attribute('target');
    });

    it('should not allow a cta layer on the first page', () => {
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );

      const pageElements = win.document.getElementsByTagName('amp-story-page');

      pageElements[0].appendChild(ampStoryCtaLayer.element);

      ampStoryCtaLayer.layoutCallback().then((layer) => {
        return allowConsoleError(() => {
          return expect(layer).to.throw();
        });
      });
    });

    it('should allow a cta layer on the second or third page', () => {
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );
      win.document.body.appendChild(
        win.document.createElement('amp-story-page')
      );

      const pageElements = win.document.getElementsByTagName('amp-story-page');

      pageElements[1].appendChild(ampStoryCtaLayer.element);
      pageElements[2].appendChild(ampStoryCtaLayer.element);

      ampStoryCtaLayer.layoutCallback().then((layer) => {
        return expect(layer).to.not.throw();
      });
    });

    it('should add or overwrite role attribute to links', async () => {
      const ctaLink = win.document.createElement('a');
      expect(ctaLink).to.not.have.attribute('role');

      ampStoryCtaLayer.element.appendChild(ctaLink);
      ampStoryCtaLayer.buildCallback();

      await ampStoryCtaLayer.layoutCallback();
      expect(ctaLink).to.have.attribute('role');
      expect(ctaLink.getAttribute('role')).to.equal('link');
    });

    it('should add or overwrite role attribute to buttons', async () => {
      const ctaButton = win.document.createElement('button');
      expect(ctaButton).to.not.have.attribute('role');

      ampStoryCtaLayer.element.appendChild(ctaButton);
      ampStoryCtaLayer.buildCallback();

      await ampStoryCtaLayer.layoutCallback();
      expect(ctaButton).to.have.attribute('role');
      expect(ctaButton.getAttribute('role')).to.equal('button');
    });

    it('should not add role attribute to other elements', async () => {
      const elem = win.document.createElement('span');
      ampStoryCtaLayer.element.appendChild(elem);
      ampStoryCtaLayer.buildCallback();

      await ampStoryCtaLayer.layoutCallback();
      expect(elem).to.not.have.attribute('role');
    });
  }
);
