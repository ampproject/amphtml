describes.endtoend(
  'amp-bind',
  {
    fixture: 'amp-bind/bind-live-list.html',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    describe('with <amp-live-list>', () => {
      it('should detect bindings in initial live-list elements', async () => {
        const liveListChildren =
          await controller.findElements('#liveListItems > *');
        await expect(liveListChildren.length).to.equal(1);

        const existingItem = await controller.findElement('#liveListItem1');
        await expect(controller.getElementText(existingItem)).to.equal(
          'unbound'
        );

        const button = await controller.findElement(
          '#changeLiveListTextButton'
        );
        await controller.click(button);

        const firstChild = await controller.findElement(
          '#liveListItem1 > :first-child'
        );
        await expect(controller.getElementText(firstChild)).to.equal(
          'hello world'
        );
      });

      // TODO(cvializ,choumx): Configure the server to send different data on the
      // second request. A queryparam should be able to implement this.
      it.skip('should apply scope to bindings in new list items', async () => {
        const liveListChildren =
          await controller.findElements('#liveListItems > *');
        await expect(liveListChildren.length).to.equal(1);

        const existingItem = await controller.findElement('#liveListItem1');
        await expect(controller.getElementText(existingItem)).to.equal(
          'unbound'
        );

        // The test server should handle this
        // const impl = await liveList.getImpl(false);
        // const update = document.createElement('div');
        // update.innerHTML =
        //     '<div items>' +
        //     ` <div id="newItem" data-sort-time=${Date.now()}>` +
        //     '    <p [text]="liveListText">unbound</p>' +
        //     ' </div>' +
        //     '</div>';
        // impl.update(update);

        const updateButton = await controller.findElement(
          '#liveListUpdateButton'
        );
        await controller.click(updateButton);

        await controller.findElement('#liveListItems > :nth-child(2)');
        const newItem = controller.findElement('#newItem');

        const button = await controller.findElement(
          '#changeLiveListTextButton'
        );
        await controller.click(button);

        await expect(controller.getElementText(existingItem)).to.equal(
          'hello world'
        );
        await expect(controller.getElementText(newItem)).to.equal(
          'hello world'
        );
      });
    });
  }
);
