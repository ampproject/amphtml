import {Key} from '#testing/helpers/types';

describes.endtoend(
  'amp-social-share',
  {
    version: '1.0',
    fixture: 'amp-social-share/amp-social-share.html',
    experiments: ['bento-social-share'],
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    describe('rendering', () => {
      // TODO(#35241): flaky test disabled in #35176
      it.skip('renders the default social share button', async () => {
        const host = await controller.findElement('#one');

        await controller.switchToShadowRoot(host);
        const button = await controller.findElement('[part=button]');
        await expect(
          controller.getElementProperty(button, 'clientWidth')
        ).to.not.equal(0);
      });

      it('supports rendering of a child element', async () => {
        const host = await controller.findElement('#two');
        const child = await controller.findElement('#twoChild');

        await controller.switchToShadowRoot(host);
        const button = await controller.findElement('[part=button]');
        await expect(
          controller.getElementProperty(button, 'clientWidth')
        ).to.not.equal(0);

        await expect(
          controller.getElementProperty(child, 'clientWidth')
        ).to.not.equal(0);
      });

      // TODO(#35241): flaky test disabled in #35176
      it.skip('renders the social share button with custom sizing', async () => {
        const host = await controller.findElement('#three');

        await controller.switchToShadowRoot(host);
        const button = await controller.findElement('[part=button]');
        await expect(
          controller.getElementProperty(button, 'clientWidth')
        ).to.equal(400);

        await expect(
          controller.getElementProperty(button, 'clientHeight')
        ).to.equal(400);
      });

      // TODO(#35241): flaky test disabled in #35176
      it.skip('renders the social share button with custom type and endpoint', async () => {
        const host = await controller.findElement('#four');

        await controller.switchToShadowRoot(host);
        const button = await controller.findElement('[part=button]');
        await expect(
          controller.getElementProperty(button, 'clientWidth')
        ).to.not.equal(0);
      });

      it('does not render the social share button with custom type and w/o endpoint', async () => {
        const child = await controller.findElement('#fiveChild');

        await expect(
          controller.getElementProperty(child, 'clientWidth')
        ).to.equal(0);
      });

      it('does not render the social share button w/o type', async () => {
        const child = await controller.findElement('#sixChild');

        await expect(
          controller.getElementProperty(child, 'clientWidth')
        ).to.equal(0);
      });
    });

    describe('clicking', () => {
      it('opens a new window on click', async () => {
        const host = await controller.findElement('#two');

        let windows = await controller.getAllWindows();
        await expect(windows.length).to.equal(1);

        await controller.click(host);

        windows = await controller.getAllWindows();
        await expect(windows.length).to.equal(2);
        await controller.switchToWindow(windows[1]);

        await expect(controller.getCurrentUrl()).to.have.string(
          'https://twitter.com/'
        );
      });

      it('tabs between multiple social-shares and opens on "enter" keypress', async () => {
        await controller.type(null, Key.Tab);
        await controller.type(null, Key.Tab);
        await controller.type(null, Key.Tab);

        let windows = await controller.getAllWindows();
        await expect(windows.length).to.equal(1);

        await controller.type(null, Key.Enter);

        windows = await controller.getAllWindows();
        await expect(windows.length).to.equal(2);
        await controller.switchToWindow(windows[1]);

        await expect(controller.getCurrentUrl()).to.equal(
          'https://www.tumblr.com/login?redirect_to=https%3A%2F%2Fwww.tumblr.com%2Fwidgets%2Fshare%2Ftool%3FshareSource%3Dlegacy%26canonicalUrl%3D%26url%3Dhttp%253A%252F%252Fexample.com%252F%26posttype%3Dlink%26title%3Damp-social-share%26caption%3D%26content%3Dhttp%253A%252F%252Fexample.com%252F'
        );
      });
    });
  }
);
