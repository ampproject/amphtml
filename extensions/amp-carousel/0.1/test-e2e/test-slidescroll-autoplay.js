describes.endtoend(
  'AMP carousel 0.1 slideChange on type="slide" with autoplay',
  {
    fixture: 'amp-carousel/0.1/slidescroll-autoplay.html',
    environments: ['single'],
  },
  async function (env) {
    let controller;

    /**
     * Attach an event listener to page to capture the 'slideChange' event.
     * If given a selector, click on it to fire the event being listened for.
     * @return {Promise}
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

    beforeEach(() => {
      controller = env.controller;
    });

    it('should fire low trust event for autoplay advance', async function () {
      this.timeout(5000);
      for (let i = 0; i < 3; i++) {
        const event = await slideChangeEventAfterClicking(/* autoplay */);
        await expect(event.actionTrust).to.equal(1); // ActionTrust.LOW
      }
    });

    it('should fire high trust event on user interaction', async () => {
      const event = await slideChangeEventAfterClicking(
        '.amp-carousel-button-next'
      );
      await expect(event.actionTrust).to.equal(3); // ActionTrust.HIGH
    });

    it('should fire high trust event on user interaction through amp-bind', async () => {
      const event = await slideChangeEventAfterClicking('#go-to-last');
      await expect(event.actionTrust).to.equal(3); // ActionTrust.HIGH
    });
  }
);
