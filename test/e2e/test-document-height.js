describes.endtoend(
  'documentHeight',
  {
    fixture: 'amp-carousel/0.1/document-height.html',
    environments: ['viewer-demo'],
  },
  (env) => {
    it('should send documentHeight once amp has completed init', async () => {
      const messages = env.receivedMessages;
      const documentHeightMessages = messages.filter(
        ({name}) => name === 'documentHeight'
      );

      await expect(documentHeightMessages.length).equal(1);

      // Example message: ['documentHeight, { height: 200 }]
      const firstHeight = documentHeightMessages[0].data.height;
      await expect(Math.floor(firstHeight)).equal(383);
    });
  }
);
