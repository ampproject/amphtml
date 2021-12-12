import {getNextArrow, getPrevArrow} from './helpers';

describes.endtoend(
  'amp-base-carousel - mixed length carousel arrows',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/no-arrows.amp.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;
    let prevArrow;
    let nextArrow;

    /**
     * Attach an event listener to page to capture the 'slideChange' event.
     * If given a selector, click on it to fire the event being listened for.
     * @return {!Promise}
     */
    function slideChangeEventAfterClicking(opt_selector) {
      return controller.evaluate((opt_selector) => {
        return new Promise((resolve) => {
          document.addEventListener(
            'slideChange',
            (e) => resolve(e.data),
            {once: true} // Remove listener after first invocation
          );
          if (opt_selector) {
            document.querySelector(opt_selector).click();
          }
        });
      }, opt_selector);
    }

    beforeEach(async () => {
      controller = env.controller;

      nextArrow = await getNextArrow(controller);
      prevArrow = await getPrevArrow(controller);
    });

    it('should not have arrows when at start or end', async () => {
      await expect(
        controller.getElementCssValue(prevArrow, 'opacity')
      ).to.equal('0');
      await expect(
        controller.getElementCssValue(nextArrow, 'opacity')
      ).to.equal('1');

      // click next
      await slideChangeEventAfterClicking(
        '.i-amphtml-base-carousel-arrow-next-slot :first-child'
      );

      await expect(
        controller.getElementCssValue(prevArrow, 'opacity')
      ).to.equal('1');
      await expect(
        controller.getElementCssValue(nextArrow, 'opacity')
      ).to.equal('0');

      // click back
      await slideChangeEventAfterClicking(
        '.i-amphtml-base-carousel-arrow-prev-slot :first-child'
      );

      await expect(
        controller.getElementCssValue(prevArrow, 'opacity')
      ).to.equal('0');
      await expect(
        controller.getElementCssValue(nextArrow, 'opacity')
      ).to.equal('1');
    });
  }
);
