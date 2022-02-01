import {awaitFrameAfter} from '#testing/helpers';

describes.endtoend(
  'amp-video with video analytics',
  {
    fixture: 'amp-video/analytics-triggers.html',
    environments: ['single'],
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
      const videoElem1 = await controller.findElement('#myVideo video');
      const videoElem2 = await controller.findElement('#myVideo2 video');
      const playBtn1 = await controller.findElement('#playBtn1');
      const playBtn2 = await controller.findElement('#playBtn2');

      // Play video 1
      await controller.click(playBtn1);
      await expect(isPaused(videoElem1)).to.be.false;
      await expect(isPaused(videoElem2)).to.be.true;

      // Sleep 1 second for the `video-percentage-played` event trigger
      // and the request to be sent
      await awaitFrameAfter(750);
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking&id=myVideo'
      ).to.have.been.sent;

      // Play video 2
      await controller.click(playBtn2);
      await expect(isPaused(videoElem1)).to.be.true;
      await expect(isPaused(videoElem2)).to.be.false;
      // Sleep 1 second for the `video-percentage-played` event trigger
      // and the request to be sent
      await awaitFrameAfter(750);
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking&id=myVideo2'
      ).to.have.been.sent;
    });
  }
);
