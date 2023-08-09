/** @enum {string} */
const AmpdocEnvironment = {
  SINGLE: 'single',
  VIEWER_DEMO: 'viewer-demo',
  EMAIL_DEMO: 'email-demo',
  SHADOW_DEMO: 'shadow-demo',

  // AMPHTML ads environments
  A4A_FIE: 'a4a-fie',
  A4A_INABOX: 'a4a-inabox',
  A4A_INABOX_FRIENDLY: 'a4a-inabox-friendly',
  A4A_INABOX_SAFEFRAME: 'a4a-inabox-safeframe',
};

/** @const {string} */
const HOST = 'http://localhost:8000';

const EnvironmentBehaviorMap = {
  [AmpdocEnvironment.SINGLE]: {
    ready() {
      return Promise.resolve();
    },

    url(url) {
      return url;
    },
  },

  [AmpdocEnvironment.VIEWER_DEMO]: {
    ready(controller) {
      return controller
        .findElement('#viewer[data-loaded]')
        .then((frame) => controller.switchToFrame(frame));
    },

    url(url) {
      return getViewerUrl(url);
    },
  },

  [AmpdocEnvironment.EMAIL_DEMO]: {
    ready(controller) {
      return controller
        .findElement('#viewer[data-loaded]')
        .then((frame) => controller.switchToFrame(frame));
    },
    url(url) {
      return getViewerUrl(url, {isEmail: true});
    },
  },

  [AmpdocEnvironment.SHADOW_DEMO]: {
    async ready(controller) {
      // TODO(cvializ): this is a HACK
      // There should be a better way to detect that the shadowdoc is ready.
      const shadowHost = await controller.findElement(
        '.amp-doc-host[style="visibility: visible;"]'
      );
      const doc = await controller.getDocumentElement();
      const rect = await controller.getElementRect(shadowHost);
      await controller./*OK*/ scrollTo(doc, {left: rect.left, top: rect.top});
      await controller.switchToShadow(shadowHost);
    },

    url(url) {
      // TODO(estherkim): somehow allow non-8000 port and domain
      return `http://localhost:8000/pwa#href=${url}`;
    },
  },

  [AmpdocEnvironment.A4A_FIE]: {
    async ready(controller) {
      return controller
        .findElement('amp-ad > iframe')
        .then((frame) => controller.switchToFrame(frame));
    },

    url(url) {
      return url.replace(HOST, HOST + '/a4a');
    },
  },

  [AmpdocEnvironment.A4A_INABOX]: {
    async ready(controller) {
      return controller
        .findElement('#inabox-frame')
        .then((frame) => controller.switchToFrame(frame));
    },

    url(url) {
      return url.replace(HOST, HOST + '/inabox');
    },
  },

  [AmpdocEnvironment.A4A_INABOX_FRIENDLY]: {
    async ready(controller) {
      return controller
        .findElement('#inabox-frame')
        .then((frame) => controller.switchToFrame(frame));
    },

    url(url) {
      return url.replace(HOST, HOST + '/inabox-friendly');
    },
  },

  [AmpdocEnvironment.A4A_INABOX_SAFEFRAME]: {
    async ready(controller) {
      return controller
        .findElement('#inabox-frame')
        .then((frame) => controller.switchToFrame(frame));
    },

    url(url) {
      return url.replace(HOST, HOST + '/inabox-safeframe');
    },
  },
};

/**
 * @param {string} url
 * @param {{isEmail: boolean}} opts
 * @return {string}
 */
function getViewerUrl(url, {isEmail} = {isEmail: false}) {
  const defaultCaps = [
    'a2a',
    'focus-rect',
    'foo',
    'keyboard',
    'swipe',
    'iframeScroll',
  ];
  // Correctly append extra params in original url
  url = url.replace('#', '&');
  // TODO(estherkim): somehow allow non-8000 port and domain
  return (
    `http://localhost:8000/test/fixtures/e2e/amp-viewer-integration/viewer.html#href=${url}` +
    `&caps=${defaultCaps.join(',')}` +
    `&isEmail=${isEmail}`
  );
}

/**
 * Provides AMP-related utilities for E2E Functional Tests.
 */
class AmpDriver {
  /**
   * @param {!*} controller
   */
  constructor(controller) {
    /** @private @const */
    this.controller_ = controller;
  }

  /**
   * Toggles an experiment in an AMP document. Uses the current domain.
   * @param {string} name
   * @param {boolean} toggle
   * @return {!Promise}
   */
  async toggleExperiment(name, toggle) {
    await this.controller_.evaluate(
      (name, toggle) => {
        (window.AMP = window.AMP || []).push((AMP) => {
          AMP.toggleExperiment(name, toggle);
        });
      },
      name,
      toggle
    );
  }

  /**
   * Navigate the browser to a URL that will display the given url in the
   * given environment.
   * @param {!AmpdocEnvironment} environment
   * @param {string} url
   * @return {Promise<void>}
   */
  async navigateToEnvironment(environment, url) {
    const ampEnv = EnvironmentBehaviorMap[environment];
    await this.controller_.navigateTo(ampEnv.url(url));

    try {
      await ampEnv.ready(this.controller_);
    } catch (e) {
      // Take a snapshot of current DOM for debugging.
      const documentElement = await this.controller_.getDocumentElement();
      const html = await this.controller_.getElementProperty(
        documentElement,
        'innerHTML'
      );
      throw new Error(e.message + '\n' + html);
    }
  }
}

module.exports = {
  AmpDriver,
  AmpdocEnvironment,
};
