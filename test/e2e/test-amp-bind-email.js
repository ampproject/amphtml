describes.endtoend(
  'amp-bind',
  {
    fixture: 'amp-bind/bind-amp4email.html',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    // The only difference in amp4email is that URL attributes cannot be bound.
    // TODO(choumx): fails in shadow env when using shadow-v0.js but succeeds when using amp-shadow.js
    describe('amp4email', () => {
      it.configure()
        .skipShadowDemo()
        .run('should NOT allow mutation of a[href]', async () => {
          const button = await controller.findElement('#changeHrefButton');
          const a = await controller.findElement('#anchorElement');

          await expect(controller.getElementAttribute(a, 'href')).to.equal(
            'https://foo.com'
          );

          await controller.click(button);
          await expect(controller.getElementAttribute(a, 'href')).to.equal(
            'https://foo.com'
          );
        });

      it.configure()
        .skipShadowDemo()
        .run('should NOT allow mutation of img[src]', async () => {
          const button = await controller.findElement('#changeImgSrcButton');
          const image = await controller.findElement('#image');

          await expect(controller.getElementAttribute(image, 'src')).to.equal(
            'https://foo.com/foo.jpg'
          );

          await controller.click(button);
          await expect(controller.getElementAttribute(image, 'src')).to.equal(
            'https://foo.com/foo.jpg'
          );
        });
    });
  }
);
