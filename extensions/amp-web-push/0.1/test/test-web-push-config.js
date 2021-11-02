import '../amp-web-push';
import {WEB_PUSH_CONFIG_ATTRIBUTES_ENUM} from '../amp-web-push-config';
import {CONFIG_TAG, TAG} from '../vars';

describes.realWin(
  'web-push-config',
  {
    amp: {
      extensions: ['amp-web-push'],
    },
  },
  (env) => {
    let win;
    let webPushConfig = {};

    function setDefaultWebPushConfig() {
      const webPushConfig = {};
      webPushConfig[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.HELPER_FRAME_URL] =
        'https://a.com/webpush/amp/helper?https=1';
      webPushConfig[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.PERMISSION_DIALOG_URL] =
        'https://a.com/webpush/amp/subscribe?https=1';
      webPushConfig[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.SERVICE_WORKER_URL] =
        'https://a.com/service-worker.js?param=value';
      webPushConfig[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.SERVICE_WORKER_SCOPE] = '/';
      return webPushConfig;
    }

    beforeEach(() => {
      win = env.win;
      webPushConfig = setDefaultWebPushConfig();
    });

    function createConfigElementWithAttributes(attributes) {
      const element = env.win.document.createElement(CONFIG_TAG);
      element.setAttribute('layout', 'nodisplay');
      element.setAttribute(
        WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.HELPER_FRAME_URL,
        attributes[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.HELPER_FRAME_URL]
      );
      element.setAttribute(
        WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.PERMISSION_DIALOG_URL,
        attributes[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.PERMISSION_DIALOG_URL]
      );
      element.setAttribute(
        WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.SERVICE_WORKER_URL,
        attributes[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.SERVICE_WORKER_URL]
      );
      element.setAttribute(
        WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.SERVICE_WORKER_SCOPE,
        attributes[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.SERVICE_WORKER_SCOPE]
      );
      element.setAttribute('id', TAG);
      win.document.body.appendChild(element);
      return element;
    }

    function removeAllWebPushConfigElements() {
      const elements = win.document.querySelectorAll(CONFIG_TAG);
      elements.forEach((element) => element.remove());
    }

    it('should fail if element does not have correct ID', () => {
      return env.ampdoc.whenReady().then(async () => {
        const element = createConfigElementWithAttributes(webPushConfig);
        const impl = await element.getImpl(false);
        element.removeAttribute('id');
        expect(() => {
          impl.validate();
        }).to.throw(/must have an id attribute with value/);
      });
    });

    it('should fail if page contains duplicate element id', () => {
      return env.ampdoc.whenReady().then(async () => {
        createConfigElementWithAttributes(webPushConfig);
        const element = createConfigElementWithAttributes(webPushConfig);
        const impl = await element.getImpl(false);
        expect(() => {
          impl.validate();
        }).to.throw(/only one .* element may exist on a page/i);
      });
    });

    it('should fail if any mandatory attribute is missing', () => {
      const promises = [];
      for (const attribute in WEB_PUSH_CONFIG_ATTRIBUTES_ENUM) {
        const configName = WEB_PUSH_CONFIG_ATTRIBUTES_ENUM[attribute];
        if (
          configName !== WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.SERVICE_WORKER_SCOPE
        ) {
          const promise = env.ampdoc.whenReady().then(async () => {
            removeAllWebPushConfigElements();
            webPushConfig = setDefaultWebPushConfig();
            delete webPushConfig[configName];
            const element = createConfigElementWithAttributes(webPushConfig);
            const impl = await element.getImpl(false);
            expect(() => {
              impl.validate();
            }).to.throw(
              new RegExp('must have a valid ' + configName + ' attribute')
            );
          });
          promises.push(promise);
        }
      }
      return Promise.all(promises);
    });

    it('should fail if any attribute is HTTP', () => {
      const promises = [];
      for (const attribute in WEB_PUSH_CONFIG_ATTRIBUTES_ENUM) {
        const configName = WEB_PUSH_CONFIG_ATTRIBUTES_ENUM[attribute];
        const promise = env.ampdoc.whenReady().then(async () => {
          removeAllWebPushConfigElements();
          webPushConfig[configName] = 'http://example.com/test';
          const element = createConfigElementWithAttributes(webPushConfig);
          const impl = await element.getImpl(false);
          expect(() => {
            impl.validate();
          }).to.throw(/should begin with the https:\/\/ protocol/);
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    });

    it('should fail if any attribute is site root page', () => {
      const promises = [];
      for (const attribute in WEB_PUSH_CONFIG_ATTRIBUTES_ENUM) {
        const configName = WEB_PUSH_CONFIG_ATTRIBUTES_ENUM[attribute];
        const promise = env.ampdoc.whenReady().then(async () => {
          removeAllWebPushConfigElements();
          webPushConfig[configName] = 'http://example.com/';
          const element = createConfigElementWithAttributes(webPushConfig);
          const impl = await element.getImpl(false);
          expect(() => {
            impl.validate();
          }).to.throw(/and point to the/);
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    });

    it("should fail if any attribute value's protocol is missing", () => {
      const promises = [];
      for (const attribute in WEB_PUSH_CONFIG_ATTRIBUTES_ENUM) {
        const configName = WEB_PUSH_CONFIG_ATTRIBUTES_ENUM[attribute];
        const promise = env.ampdoc.whenReady().then(async () => {
          removeAllWebPushConfigElements();
          webPushConfig[configName] = 'www.example.com/test';
          const element = createConfigElementWithAttributes(webPushConfig);
          const impl = await element.getImpl(false);
          expect(() => {
            impl.validate();
          }).to.throw(/should begin with the https:\/\/ protocol/);
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    });

    it('should fail if attribute origins differ', () => {
      webPushConfig[WEB_PUSH_CONFIG_ATTRIBUTES_ENUM.HELPER_FRAME_URL] =
        'https://another-origin.com/test';
      return env.ampdoc.whenReady().then(async () => {
        const element = createConfigElementWithAttributes(webPushConfig);
        const impl = await element.getImpl(false);
        expect(() => {
          impl.validate();
        }).to.throw(/must all share the same origin/);
      });
    });

    it('should succeed for valid config', () => {
      return env.ampdoc.whenReady().then(async () => {
        const element = createConfigElementWithAttributes(webPushConfig);
        const impl = await element.getImpl(false);
        impl.validate();
      });
    });
  }
);
