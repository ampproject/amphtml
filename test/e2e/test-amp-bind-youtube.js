describes.endtoend(
  'amp-bind',
  {
    fixture: 'amp-bind/bind-youtube.html',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    describe('with <amp-youtube>', () => {
      it('should support binding to data-video-id', async () => {
        const button = await controller.findElement('#youtubeButton');
        const yt = await controller.findElement('#youtube');
        await expect(
          controller.getElementAttribute(yt, 'data-videoid')
        ).to.equal('unbound');

        await controller.click(button);
        await expect(
          controller.getElementAttribute(yt, 'data-videoid')
        ).to.equal('bound');
      });
    });
  }
);
