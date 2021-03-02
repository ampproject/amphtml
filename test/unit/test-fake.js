describe('test', () => {
  afterEach(() => {
    console.log('done');
  });
  it('my fake test', () => {
    expectAsyncConsoleError('fake message');
  });
});
