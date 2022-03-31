import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {
  getScrollingElement,
  isElementInViewport,
  isElementOutOfViewport,
} from './helpers';

describes.endtoend(
  'bento-base-carousel',
  {
    version: '1.0',
    fixture: 'bento/base-carousel.html',
    environments: ['single'],
  },
  (env) => {
    const styles = useStyles();
    let controller;

    beforeEach(() => (controller = env.controller));

    it('should be able to swtich slides in the light DOM', async () => {
      //   const element = await controller.findElement('bento-base-carousel');
      //   await controller.switchToShadowRoot(element);

      const slides = await controller.findElements('[slot]');
      await expect(controller.getElementRect(slides[1])).to.include({
        left: 8,
      });
      await isElementOutOfViewport(slides[0], controller);
      await expect(controller.getElementText(slides[0])).to.equal('A');
      await isElementInViewport(slides[1], controller);
      await expect(controller.getElementText(slides[1])).to.equal('B');
      await isElementInViewport(slides[2], controller);
      await expect(controller.getElementText(slides[2])).to.equal('C');
      await isElementInViewport(slides[3], controller);
      await expect(controller.getElementText(slides[3])).to.equal('D');
      await isElementOutOfViewport(slides[4], controller);
      // await expect(controller.getElementText(slides[4])).to.equal('E');
      await isElementOutOfViewport(slides[5], controller);
      // await expect(controller.getElementText(slides[5])).to.equal('F');
      await isElementOutOfViewport(slides[6], controller);
      // await expect(controller.getElementText(slides[6])).to.equal('G');

      const gotoButton = await controller.findElement('#go-to-button');
      await controller.click(gotoButton);

      await expect(controller.getElementRect(slides[2])).to.include({
        left: 8,
      });
      await isElementOutOfViewport(slides[0], controller);
      // await expect(controller.getElementText(slides[0])).to.equal('A');
      await isElementOutOfViewport(slides[1], controller);
      await expect(controller.getElementText(slides[1])).to.equal('B');
      await isElementInViewport(slides[2], controller);
      await expect(controller.getElementText(slides[2])).to.equal('C');
      await isElementInViewport(slides[3], controller);
      await expect(controller.getElementText(slides[3])).to.equal('D');
      await isElementInViewport(slides[4], controller);
      await expect(controller.getElementText(slides[4])).to.equal('E');
      await isElementOutOfViewport(slides[5], controller);
      // await expect(controller.getElementText(slides[5])).to.equal('F');
      await isElementOutOfViewport(slides[6], controller);
      // await expect(controller.getElementText(slides[6])).to.equal('G');

      const nextButton = await controller.findElement('#next-button');
      await controller.click(nextButton);
      await expect(controller.getElementRect(slides[3])).to.include({
        left: 8,
      });
      await isElementOutOfViewport(slides[0], controller);
      // await expect(controller.getElementText(slides[0])).to.equal('A');
      await isElementOutOfViewport(slides[1], controller);
      // await expect(controller.getElementText(slides[1])).to.equal('B');
      await isElementOutOfViewport(slides[2], controller);
      await expect(controller.getElementText(slides[2])).to.equal('C');
      await isElementInViewport(slides[3], controller);
      await expect(controller.getElementText(slides[3])).to.equal('D');
      await isElementInViewport(slides[4], controller);
      await expect(controller.getElementText(slides[4])).to.equal('E');
      await isElementInViewport(slides[5], controller);
      await expect(controller.getElementText(slides[5])).to.equal('F');
      await isElementOutOfViewport(slides[6], controller);
      // await expect(controller.getElementText(slides[6])).to.equal('G');

      const previousButton = await controller.findElement('#prev-button');
      await controller.click(previousButton);

      await expect(controller.getElementRect(slides[2])).to.include({
        left: 8,
      });
      await isElementOutOfViewport(slides[0], controller);
      // await expect(controller.getElementText(slides[0])).to.equal('A');
      await isElementOutOfViewport(slides[1], controller);
      await expect(controller.getElementText(slides[1])).to.equal('B');
      await isElementInViewport(slides[2], controller);
      await expect(controller.getElementText(slides[2])).to.equal('C');
      await isElementInViewport(slides[3], controller);
      await expect(controller.getElementText(slides[3])).to.equal('D');
      await isElementInViewport(slides[4], controller);
      await expect(controller.getElementText(slides[4])).to.equal('E');
      await isElementOutOfViewport(slides[5], controller);
      // await expect(controller.getElementText(slides[5])).to.equal('F');
      await isElementOutOfViewport(slides[6], controller);
      // await expect(controller.getElementText(slides[6])).to.equal('G');
    });

    it('should switch slides in the shadowDOM', async () => {
      const slides = await controller.findElements('[slot]');
      const element = await controller.findElement('bento-base-carousel');
      await controller.switchToShadowRoot(element);

      await expect(controller.getElementRect(slides[1])).to.include({
        left: 8,
      });
      await isElementOutOfViewport(slides[0], controller);
      await expect(controller.getElementText(slides[0])).to.equal('A');
      await isElementInViewport(slides[1], controller);
      await expect(controller.getElementText(slides[1])).to.equal('B');
      await isElementInViewport(slides[2], controller);
      await expect(controller.getElementText(slides[2])).to.equal('C');
      await isElementInViewport(slides[3], controller);
      await expect(controller.getElementText(slides[3])).to.equal('D');
      await isElementOutOfViewport(slides[4], controller);
      // await expect(controller.getElementText(slides[4])).to.equal('E');
      await isElementOutOfViewport(slides[5], controller);
      // await expect(controller.getElementText(slides[5])).to.equal('F');
      await isElementOutOfViewport(slides[6], controller);
      // await expect(controller.getElementText(slides[6])).to.equal('G');

      const el = await getScrollingElement(styles, controller);
      await controller.scrollBy(el, {left: -300});
      await expect(controller.getElementRect(slides[0])).to.include({
        left: 8,
      });
      await isElementInViewport(slides[0], controller);
      await expect(controller.getElementText(slides[0])).to.equal('A');
      await isElementInViewport(slides[1], controller);
      await expect(controller.getElementText(slides[1])).to.equal('B');
      await isElementInViewport(slides[2], controller);
      await expect(controller.getElementText(slides[2])).to.equal('C');
      await isElementOutOfViewport(slides[3], controller);
      await expect(controller.getElementText(slides[3])).to.equal('D');
      await isElementOutOfViewport(slides[4], controller);
      // await expect(controller.getElementText(slides[4])).to.equal('E');
      await isElementOutOfViewport(slides[5], controller);
      // await expect(controller.getElementText(slides[5])).to.equal('F');
      await isElementOutOfViewport(slides[6], controller);
      // await expect(controller.getElementText(slides[6])).to.equal('G');

      const nextButton = await controller.findElement(
        '[aria-label="Next item in carousel"]'
      );
      await controller.click(nextButton);

      await expect(controller.getElementRect(slides[1])).to.include({
        left: 8,
      });
      await isElementOutOfViewport(slides[0], controller);
      await expect(controller.getElementText(slides[0])).to.equal('A');
      await isElementInViewport(slides[1], controller);
      await expect(controller.getElementText(slides[1])).to.equal('B');
      await isElementInViewport(slides[2], controller);
      await expect(controller.getElementText(slides[2])).to.equal('C');
      await isElementInViewport(slides[3], controller);
      await expect(controller.getElementText(slides[3])).to.equal('D');
      await isElementOutOfViewport(slides[4], controller);
      // await expect(controller.getElementText(slides[4])).to.equal('E');
      await isElementOutOfViewport(slides[5], controller);
      // await expect(controller.getElementText(slides[5])).to.equal('F');
      await isElementOutOfViewport(slides[6], controller);
      // await expect(controller.getElementText(slides[6])).to.equal('G');

      const prevButton = await controller.findElement(
        '[aria-label="Previous item in carousel"]'
      );
      await controller.click(prevButton);
      await expect(controller.getElementRect(slides[0])).to.include({
        left: 8,
      });
      await isElementInViewport(slides[0], controller);
      await expect(controller.getElementText(slides[0])).to.equal('A');
      await isElementInViewport(slides[1], controller);
      await expect(controller.getElementText(slides[1])).to.equal('B');
      await isElementInViewport(slides[2], controller);
      await expect(controller.getElementText(slides[2])).to.equal('C');
      await isElementOutOfViewport(slides[3], controller);
      await expect(controller.getElementText(slides[3])).to.equal('D');
      await isElementOutOfViewport(slides[4], controller);
      // await expect(controller.getElementText(slides[4])).to.equal('E');
      await isElementOutOfViewport(slides[5], controller);
      // await expect(controller.getElementText(slides[5])).to.equal('F');
      await isElementOutOfViewport(slides[6], controller);
      // await expect(controller.getElementText(slides[6])).to.equal('G');
    });
  }
);
