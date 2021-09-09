describes.endtoend(
  'amp-list "amp-script:" uri',
  {
    fixture: 'amp-list/amp-list-function-src.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render list backed by amp-script data', async function () {
      const container = await getListContainer(controller);
      await verifyContainer(controller, container);

      // Verify that all items rendered.
      const listItems = await getListItems(controller);
      await expect(listItems).to.have.length(2);
    });
  }
);

describes.endtoend(
  'amp-list "amp-script:" with load-more',
  {
    fixture: 'amp-list/amp-list-function-load-more.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should load more when button is clicked until no more load-more-src', async function () {
      // These two assertions are just to create a wait period ensuring the loadMore button
      // is "clickable".
      // TODO(samouri): expose a method on controller to wait for an element to be interactable.
      await controller.findElement('[role=listitem]:nth-child(3)');
      const loadMore = await controller.findElement('[load-more-clickable]');

      await controller.click(loadMore);

      const fifteenthItem = await controller.findElement(
        '[role=listitem]:nth-child(15)'
      );
      await expect(fifteenthItem).to.be.ok;
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
