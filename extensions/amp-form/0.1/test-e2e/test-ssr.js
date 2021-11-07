describes.endtoend(
  'amp-form',
  {
    fixture: 'amp-form/amp-form.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render form response', async () => {
      const searchInput = await controller.findElement(
        '#xhr-get input[name=term]'
      );
      await controller.type(searchInput, 'search term');
      const submitForm = await controller.findElement(
        '#xhr-get input[type=submit]'
      );
      await controller.click(submitForm);

      const renderedTemplate = await controller.findElement(
        'div[i-amphtml-rendered]'
      );
      await expect(controller.getElementText(renderedTemplate)).to.equal(
        'Here are the results for the search:\nResult 1\nResult 2\nResult 3'
      );
    });
  }
);

describes.endtoend(
  'amp-form SSR templates',
  {
    fixture: 'amp-form/amp-form.html',
    environments: ['viewer-demo'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    // TODO(estherkim): fails in viewer
    it.configure()
      .skipViewerDemo()
      .run('should render form response', async () => {
        const searchInput = await controller.findElement(
          '#xhr-get input[name=term]'
        );
        await controller.type(searchInput, 'search term');
        const submitForm = await controller.findElement(
          '#xhr-get input[type=submit]'
        );
        await controller.click(submitForm);

        const renderedTemplate = await controller.findElement(
          'div[i-amphtml-rendered]'
        );
        await expect(controller.getElementText(renderedTemplate)).to.equal(
          'SSR response'
        );
      });
  }
);
