import {getSlides, getSpacers} from './helpers';

describes.endtoend(
  'amp-base-carousel - snap property',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/snap-property.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    // TODO(#35241): flaky test disabled in #35176
    it.skip('should set snap property on spacers', async () => {
      const spacers = await getSpacers(controller);
      for (let i = 0; i < spacers.length; i++) {
        const spacer = spacers[i];
        const styles = await controller.getElementProperty(spacer, 'style');
        await expect(styles).to.contain('scroll-snap-align');
      }
    });

    it('should not set snap property on slides when carousel is looped', async () => {
      const slides = await getSlides(controller, '[loop="true"]');
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const styles = await controller.getElementProperty(slide, 'style');
        await expect(styles).to.not.contain('scroll-snap-align');
      }
    });

    it('should set snap property on slides when carousel is not looped', async () => {
      const slides = await getSlides(controller, '[loop="false"]');
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const styles = await controller.getElementProperty(slide, 'style');
        await expect(styles).to.contain('scroll-snap-align');
      }
    });
  }
);
