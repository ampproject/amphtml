describes.integration(
  'AMP Context Integration',
  {
    extensions: ['amp-analytics'],
  },
  (env) => {
    it('should load the page and have a window context', async () => {
      const {win} = env;
      expect(win).to.exist;
      expect(win.context).to.exist;
    });
  }
);
