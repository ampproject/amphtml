// Test `fetch-mock` integration in describes.
describes.sandboxed('fetch-mock', {}, () => {
  /** @param {!Object} env */
  function runTests(env) {
    it('should mock fetches', () => {
      const mock = env.expectFetch('fake.com', {payload: 'foo'});

      return env.win
        .fetch('fake.com')
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          expect(data.payload).to.equal('foo');
          expect(mock.called('fake.com')).to.be.true;
        });
    });
  }

  describes.realWin('on realWin', {mockFetch: true}, (env) => {
    runTests(env);
  });

  describes.fakeWin('on fakeWin', {mockFetch: true}, (env) => {
    runTests(env);
  });
});

function runConfiguredDescribe() {
  describe.configure().run('configure describe', () => {
    it.configure().run('configure it', () => {
      expect(2 + 2).to.equal(4);
    });
  });
}

describes.sandboxed.configure().run('configure sandboxed', {}, () => {
  runConfiguredDescribe();
});

describes.fakeWin.configure().run('configure fakeWin', {}, () => {
  runConfiguredDescribe();
});

describes.realWin.configure().run('configure realWin', {}, () => {
  runConfiguredDescribe();
});

describes.integration.configure().run('configure integration', {}, () => {
  runConfiguredDescribe();
});
