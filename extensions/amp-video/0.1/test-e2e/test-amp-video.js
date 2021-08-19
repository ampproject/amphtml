describes.endtoend(
  'amp-video autoplay with control',
  {
    fixture: 'amp-video/autoplay.html',
    environments: 'amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    function isPaused(elem) {
      return controller.getElementProperty(elem, 'paused');
    }

    it('control buttons should manipulate video box behavior', async () => {
      const videoElem = await controller.findElement('#myVideo video');
      // Wait until video starts to play
      await expect(isPaused(videoElem)).to.be.false;

      const pauseBtn = await controller.findElement('#pauseBtn');
      await controller.click(pauseBtn);
      await expect(isPaused(videoElem)).to.be.true;

      const playBtn = await controller.findElement('#playBtn');
      await controller.click(playBtn);
      await expect(isPaused(videoElem)).to.be.false;
    });
  }
);
