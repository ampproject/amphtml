describes.endtoend(
  'amp-bind',
  {
    fixture: 'amp-bind/bind-form.html',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    describe('with <amp-form>', () => {
      it('should NOT allow invalid bindings or values', async function () {
        const xhrText = await controller.findElement('#xhrText');
        const templatedText = await controller.findElement('#templatedText');
        const illegalHref = await controller.findElement('#illegalHref');
        const submitButton = await controller.findElement('#submitButton');

        await expect(controller.getElementText(xhrText)).to.equal('');
        await expect(controller.getElementAttribute(illegalHref, 'href')).to.be
          .null;
        await expect(controller.getElementAttribute(templatedText, 'onclick'))
          .to.be.null;
        await expect(
          controller.getElementAttribute(templatedText, 'onmouseover')
        ).to.be.null;
        await expect(controller.getElementAttribute(templatedText, 'style')).to
          .be.null;
        await expect(controller.getElementText(templatedText)).to.equal('');

        await controller.click(submitButton);

        // The <amp-form> has on="submit-success:AMP.setState(...)".

        // References to XHR JSON data should work on submit-success.
        await expect(controller.getElementText(xhrText)).to.equal(
          'John Miller'
        );
        await expect(controller.getElementAttribute(illegalHref, 'href')).to.be
          .null;
        await expect(controller.getElementAttribute(templatedText, 'onclick'))
          .to.be.null;
        await expect(
          controller.getElementAttribute(templatedText, 'onmouseover')
        ).to.be.null;
        await expect(controller.getElementAttribute(templatedText, 'style')).to
          .be.null;
        await expect(controller.getElementText(templatedText)).to.equal(
          'textIsLegal'
        );
      });
    });
  }
);
