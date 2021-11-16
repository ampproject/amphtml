import {
  AmpStoryRequestService,
  CONFIG_SRC_ATTRIBUTE_NAME,
} from '../amp-story-request-service';

describes.fakeWin('amp-story-request-service', {amp: true}, (env) => {
  let requestService;
  let storyElement;
  let shareElement;
  let xhrMock;

  beforeEach(() => {
    storyElement = env.win.document.createElement('div');
    shareElement = env.win.document.createElement('amp-story-social-share');
    storyElement.appendChild(shareElement);
    env.win.document.body.appendChild(storyElement);
    requestService = new AmpStoryRequestService(env.win, storyElement);
    xhrMock = env.sandbox.mock(requestService.xhr_);
  });

  it('should not load the config if no src or inline is set', async () => {
    xhrMock.expects('fetchJson').never();

    const config = await requestService.loadConfig(shareElement);

    expect(JSON.stringify(config)).to.equal('{}');

    xhrMock.verify();
  });

  it('should fall back to inline config if no src is set', async () => {
    xhrMock.expects('fetchJson').never();

    const configData = {'data': {'shareUrl': 'https://example.com'}};

    shareElement.innerHTML = `
    <script type="application/json">
      ${JSON.stringify(configData)}
    </script>
    `;

    const config = await requestService.loadConfig(shareElement);

    expect(JSON.stringify(config)).to.equal(JSON.stringify(configData));
    xhrMock.verify();
  });

  it('should use the URL provided in the attribute to load the config', async () => {
    const shareUrl = 'https://publisher.com/share';

    shareElement.setAttribute(CONFIG_SRC_ATTRIBUTE_NAME, shareUrl);
    xhrMock
      .expects('fetchJson')
      .withExactArgs(shareUrl, {})
      .resolves({
        ok: true,
        json() {
          return Promise.resolve();
        },
      })
      .once();

    await requestService.loadConfig(shareElement);
    xhrMock.verify();
  });

  it('should return the expected share config', async () => {
    const shareUrl = 'https://publisher.com/share';
    const fetchedConfig = 'amazingConfig';

    shareElement.setAttribute(CONFIG_SRC_ATTRIBUTE_NAME, shareUrl);
    xhrMock
      .expects('fetchJson')
      .resolves({
        ok: true,
        json() {
          return Promise.resolve(fetchedConfig);
        },
      })
      .once();

    const config = await requestService.loadConfig(shareElement);
    expect(config).to.equal(fetchedConfig);
    xhrMock.verify();
  });

  it('should fetch the share config once if called multiple times', async () => {
    const shareUrl = 'https://publisher.com/share';

    shareElement.setAttribute(CONFIG_SRC_ATTRIBUTE_NAME, shareUrl);
    xhrMock
      .expects('fetchJson')
      .resolves({
        ok: true,
        json() {
          return Promise.resolve();
        },
      })
      .once();

    await requestService.loadShareConfig(shareElement);
    await requestService.loadShareConfig(shareElement);
    xhrMock.verify();
  });

  it('should return the social share config from the share element', async () => {
    const shareUrl = 'https://publisher.com/share';
    const fetchedConfig = 'amazingConfig';

    shareElement.setAttribute(CONFIG_SRC_ATTRIBUTE_NAME, shareUrl);
    xhrMock
      .expects('fetchJson')
      .resolves({
        ok: true,
        json() {
          return Promise.resolve(fetchedConfig);
        },
      })
      .once();

    const config = await requestService.loadConfig(shareElement);
    expect(config).to.equal(fetchedConfig);
    xhrMock.verify();
  });
});
