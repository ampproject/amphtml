describes.endtoend(
  'amp-list SSR templates',
  {
    fixture: 'amp-list/amp-list.html',
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
      .run('should render ssr rendered list', async function () {
        const container = await getListContainer(controller);
        await verifyContainer(controller, container);

        // Verify that all items rendered.
        const listItems = await getListItems(controller);
        await expect(listItems).to.have.length(6);

        // Verify that bindings work.
        await expect(controller.getElementText(listItems[0])).to.equal(
          'Pineapple'
        );
      });
  }
);

describes.endtoend(
  'amp-list',
  {
    fixture: 'amp-list/amp-list.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render list', async function () {
      const container = await getListContainer(controller);
      await verifyContainer(controller, container);

      // Verify that all items rendered.
      const listItems = await getListItems(controller);
      await expect(listItems).to.have.length(5);
    });
  }
);

function getListContainer(controller) {
  return controller.findElement('div[role=list]');
}

function getListItems(controller) {
  return controller.findElements('div[role=listitem]');
}

async function verifyContainer(controller, container) {
  await expect(controller.getElementAttribute(container, 'class')).to.equal(
    'i-amphtml-fill-content i-amphtml-replaced-content'
  );
}
