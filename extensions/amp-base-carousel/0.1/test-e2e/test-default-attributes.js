const pageWidth = 800;
const pageHeight = 800;

describes.endtoend(
  'amp-base-carousel - default attributes',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/default-attributes.amp.html',
    // TODO (micajuineho): Add viewer-demo support.
    environments: ['single'],
    initialRect: {width: pageWidth, height: pageHeight},
  },
  async function (env) {
    let controller;
    let scrollContainer;
    let loop;

    beforeEach(() => {
      controller = env.controller;
    });

    function getScrollContainerByCarouselId(id) {
      return controller.findElement(
        `amp-base-carousel#${id} .i-amphtml-carousel-scroll`
      );
    }

    it('should add loop="false" when loop is omitted (carousel-1)', async () => {
      scrollContainer = await getScrollContainerByCarouselId('carousel-1');
      loop = await controller.getElementAttribute(scrollContainer, 'loop');
      await expect(loop).to.be.equal('false');
    });

    it('should keep loop="true" when valid (carousel-2)', async () => {
      scrollContainer = await getScrollContainerByCarouselId('carousel-2');
      loop = await controller.getElementAttribute(scrollContainer, 'loop');
      await expect(loop).to.equal('true');
    });

    it('should set loop to "false" when invalid (carousel-3)', async () => {
      scrollContainer = await getScrollContainerByCarouselId('carousel-3');
      loop = await controller.getElementAttribute(scrollContainer, 'loop');
      await expect(loop).to.equal('false');
    });

    it('should update loop based on media query', async () => {
      scrollContainer = await getScrollContainerByCarouselId('carousel-4');
      loop = await controller.getElementAttribute(scrollContainer, 'loop');
      await expect(loop).to.equal('false');

      await controller.setWindowRect({
        width: 1200,
        height: 1200,
      });

      scrollContainer = await getScrollContainerByCarouselId('carousel-4');
      loop = await controller.getElementAttribute(scrollContainer, 'loop');
      await expect(loop).to.equal('true');
    });
  }
);
