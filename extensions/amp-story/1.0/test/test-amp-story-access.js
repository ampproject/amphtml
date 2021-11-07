import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';
import {AmpStoryAccess, Type} from '../amp-story-access';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import {afterRenderPromise} from '#testing/helpers';

describes.realWin('amp-story-access', {amp: true}, (env) => {
  let win;
  let accessConfigurationEl;
  let defaultConfig;
  let storeService;
  let storyAccess;
  let storyEl;

  const setConfig = (config) => {
    accessConfigurationEl.textContent = JSON.stringify(config);
  };

  beforeEach(() => {
    win = env.win;
    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    accessConfigurationEl = win.document.createElement('script');
    accessConfigurationEl.setAttribute('id', 'amp-access');
    accessConfigurationEl.setAttribute('type', 'application/json');
    defaultConfig = {login: 'https://example.com'};
    setConfig(defaultConfig);

    storyEl = win.document.createElement('amp-story');
    const storyAccessEl = win.document.createElement('amp-story-access');
    storyAccessEl.getAmpDoc = () => storyAccessEl;

    storyEl.appendChild(storyAccessEl);

    win.document.body.appendChild(accessConfigurationEl);
    win.document.body.appendChild(storyEl);

    storyAccess = new AmpStoryAccess(storyAccessEl);
  });

  it('should append the publisher provided template in a drawer', () => {
    const publisherTemplateEl = win.document.createElement('button');
    publisherTemplateEl.classList.add('subscribe-button');
    publisherTemplateEl.innerText = 'Subscribe for $1';
    storyAccess.element.appendChild(publisherTemplateEl);

    storyAccess.buildCallback();

    // Publisher provided button is no longer a child of <amp-story-access>.
    expect(
      storyAccess.element.querySelector('amp-story-access > .subscribe-button')
    ).to.be.null;

    // But has been copied in the drawer.
    const buttonInDrawerEl = storyAccess.element.querySelector(
      '.i-amphtml-story-access-content > .subscribe-button'
    );
    expect(buttonInDrawerEl).to.exist;
  });

  it('should display the access blocking paywall on state update', async () => {
    storyAccess.buildCallback();

    storeService.dispatch(Action.TOGGLE_ACCESS, true);

    await afterRenderPromise(win);
    expect(storyAccess.element).to.have.class('i-amphtml-story-access-visible');
  });

  it('should show the access notification on state update', async () => {
    storyAccess.element.setAttribute('type', Type.NOTIFICATION);
    storyAccess.buildCallback();

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'foo',
      index: 0,
    });

    await afterRenderPromise(win);
    expect(storyAccess.element).to.have.class('i-amphtml-story-access-visible');
  });

  it('should allowlist the default <amp-access> actions', () => {
    storyAccess.buildCallback();

    const actions = storyAccess.storeService_.get(
      StateProperty.ACTIONS_ALLOWLIST
    );
    expect(actions).to.deep.contain({tagOrTarget: 'SCRIPT', method: 'login'});
  });

  it('should allowlist the typed <amp-access> actions', () => {
    defaultConfig.login = {
      typefoo: 'https://example.com',
      typebar: 'https://example.com',
    };
    setConfig(defaultConfig);

    storyAccess.buildCallback();

    const actions = storyAccess.storeService_.get(
      StateProperty.ACTIONS_ALLOWLIST
    );
    expect(actions).to.deep.contain({
      tagOrTarget: 'SCRIPT',
      method: 'login-typefoo',
    });
    expect(actions).to.deep.contain({
      tagOrTarget: 'SCRIPT',
      method: 'login-typebar',
    });
  });

  it('should allowlist the namespaced and default <amp-access> actions', () => {
    defaultConfig.namespace = 'foo';
    setConfig(defaultConfig);

    storyAccess.buildCallback();

    // Both namespaced and default actions are allowed.
    const actions = storyAccess.storeService_.get(
      StateProperty.ACTIONS_ALLOWLIST
    );
    expect(actions).to.deep.contain({tagOrTarget: 'SCRIPT', method: 'login'});
    expect(actions).to.deep.contain({
      tagOrTarget: 'SCRIPT',
      method: 'login-foo',
    });
  });

  it('should allowlist namespaced and typed <amp-access> actions', () => {
    const config = [
      {
        namespace: 'namespace1',
        login: {
          type1: 'https://example.com',
          type2: 'https://example.com',
        },
      },
      {
        namespace: 'namespace2',
        login: 'https://example.com',
      },
    ];
    setConfig(config);

    storyAccess.buildCallback();

    const actions = storyAccess.storeService_.get(
      StateProperty.ACTIONS_ALLOWLIST
    );
    expect(actions).to.deep.contain({
      tagOrTarget: 'SCRIPT',
      method: 'login-namespace1-type1',
    });
    expect(actions).to.deep.contain({
      tagOrTarget: 'SCRIPT',
      method: 'login-namespace1-type2',
    });
    expect(actions).to.deep.contain({
      tagOrTarget: 'SCRIPT',
      method: 'login-namespace2',
    });
  });

  it('should require publisher-logo-src to be a URL', () => {
    storyEl.setAttribute('publisher-logo-src', 'foo:bar');

    allowConsoleError(() => {
      expect(() => {
        storyAccess.buildCallback();
      }).to.throw(
        'amp-story publisher-logo-src must start with "https://" or "//"'
      );
    });
  });
});
