import {getSlide} from './helpers';

const pageWidth = 600;
const pageHeight = 600;

describes.endtoend(
  'amp-base-carousel - initial slide',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/initial-slide.amp.html',
    environments: ['single', 'viewer-demo'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render with the correct initial slide', async () => {
      const thirdSlide = await getSlide(controller, 2);

      // Normally, resizing would cause the position to change. We're testing
      // that the carousel moves this to the correct position again.
      await expect(controller.getElementRect(thirdSlide)).to.include({
        'x': 0,
        'width': pageWidth,
      });
    });
  }
);
