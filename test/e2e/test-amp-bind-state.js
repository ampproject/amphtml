describes.endtoend(
  'amp-bind',
  {
    fixture: 'amp-bind/bind-basic.html',
    environments: 'ampdoc-amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    describe('+ amp-state', () => {
      it('should update text', async () => {
        const text = await controller.findElement('#textDisplay');
        await expect(controller.getElementText(text)).to.equal('hello');
        const button = await controller.findElement('#changeTextButton');
        await controller.click(button);
        await expect(controller.getElementText(text)).to.equal('world');
      });

      // TODO(cvializ, choumx): Update server to have an endpoint that
      // would test the infinite-loop blocking behavior
      it.skip('should not loop infinitely if updates change its src binding', async () => {
        const changeAmpStateSrcButton =
          await controller.findElement('#changeAmpStateSrc');
        const setState = await controller.findElement('#setState');
        const ampState = await controller.findElement('#ampState');

        // TODO(cvializ, choumx): Replace this with a test server endpoint
        // // Stub XHR for endpoint such that it returns state that would
        // // point the amp-state element back to its original source.
        // sandbox.stub(batchedXhr, 'fetchJson')
        //     .withArgs(
        //         'https://www.google.com/bind/second/source', sinon.match.any)
        //     .returns(Promise.resolve({
        //       json() {
        //         return Promise.resolve({
        //           stateSrc: 'https://www.google.com/bind/first/source',
        //         });
        //       },
        //     }));
        // // Changes amp-state's src from
        // // .../first/source to .../second/source.

        await expect(controller.getElementAttribute(ampState, 'src')).to.equal(
          'https://www.google.com/bind/first/source'
        );

        await controller.click(changeAmpStateSrcButton);
        // bind applications caused by an amp-state mutation SHOULD NOT
        // update src attributes on amp-state elements.
        await expect(
          controller.getElementAttribute(ampState, 'src')
        ).to.not.equal('https://www.google.com/bind/first/source');
        await expect(controller.getElementAttribute(ampState, 'src')).to.equal(
          'https://www.google.com/bind/second/source'
        );

        await controller.click(setState);
        // Now that a non-amp-state mutation has ocurred, the
        // amp-state's src attribute can be updated with the new
        // src from the XHR.
        await expect(controller.getElementAttribute(ampState, 'src')).to.equal(
          'https://www.google.com/bind/first/source'
        );
      });
    });
  }
);
