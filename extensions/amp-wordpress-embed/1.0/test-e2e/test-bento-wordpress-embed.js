describes.endtoend(
  'bento-wordpress-embed',
  {
    version: '1.0',
    fixture: 'bento/wordpress-embed.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render a content from wordpress', async () => {
      const element = await controller.findElement('bento-wordpress-embed');
      await controller.switchToShadowRoot(element);

      const iframe = await controller.findElement('iframe');

      await expect(controller.getElementAttribute(iframe, 'src')).to.equal(
        'https://wordpress.org/news/2021/10/episode-18-the-economics-of-wordpress/?embed=true'
      );
    });
  }
);
