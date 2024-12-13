import {CommonSignals_Enum} from '#core/constants/common-signals';
import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {isConnectedNode} from '#core/dom';
import {childElementsByTag} from '#core/dom/query';
import {setStyle} from '#core/dom/style';
import {isArray, isObject} from '#core/types';

import {Services} from '#service';
import {parseExtensionUrl} from '#service/extension-script';

import {dev, user} from '#utils/log';

import {getMode} from './mode';
import {
  disposeServicesForDoc,
  getServicePromiseOrNullForDoc,
} from './service-helpers';
import {
  createShadowDomWriter,
  createShadowRoot,
  importShadowBody,
} from './shadow-embed';
import {installStylesForDoc} from './style-installer';
import {parseUrlDeprecated} from './url';

/** @const @private {string} */
const TAG = 'multidoc-manager';

/**
 * A manager for documents in the multi-doc environment.
 */
export class MultidocManager {
  /**
   * @param {!Window} win
   * @param {!./service/ampdoc-impl.AmpDocService} ampdocService
   * @param {!./service/extensions-impl.Extensions} extensions
   * @param {!./service/timer-impl.Timer} timer
   */
  constructor(win, ampdocService, extensions, timer) {
    /** @const */
    this.win = win;
    /** @private @const */
    this.ampdocService_ = ampdocService;
    /** @private @const */
    this.extensions_ = extensions;
    /** @private @const */
    this.timer_ = timer;

    /** @private @const {!Array<!ShadowRoot>} */
    this.shadowRoots_ = [];
  }

  /**
   * Attaches the shadow root and calls the supplied DOM builder.
   * @param {!Element} hostElement
   * @param {string} url
   * @param {!{[key: string]: string}|undefined} params
   * @param {function(!Object, !ShadowRoot,
   * !./service/ampdoc-impl.AmpDocShadow):!Promise} builder
   * @return {!./runtime.ShadowDoc}
   * @private
   */
  attachShadowDoc_(hostElement, url, params, builder) {
    params = params || Object.create(null);
    this.purgeShadowRoots_();

    setStyle(hostElement, 'visibility', 'hidden');
    const shadowRoot = createShadowRoot(hostElement);

    // TODO: closeShadowRoot_ is asynchronous. While this safety check is well
    // intentioned, it leads to a race between unlayout and layout of custom
    // elements.
    if (shadowRoot.AMP) {
      user().warn(TAG, "Shadow doc wasn't previously closed");
      this.closeShadowRoot_(shadowRoot);
    }

    const amp = {};
    shadowRoot.AMP = amp;
    amp.url = url;
    const {origin} = parseUrlDeprecated(url);

    const ampdoc = this.ampdocService_.installShadowDoc(url, shadowRoot, {
      params,
    });
    /** @const {!./service/ampdoc-impl.AmpDocShadow} */
    amp.ampdoc = ampdoc;
    dev().fine(TAG, 'Attach to shadow root:', shadowRoot, ampdoc);

    // Install runtime CSS.
    installStylesForDoc(
      ampdoc,
      AMP.combinedCss,
      /* callback */ null,
      /* opt_isRuntimeCss */ true
    );
    // Instal doc services.
    AMP.installAmpdocServices(ampdoc);

    const viewer = Services.viewerForDoc(ampdoc);

    /**
     * Sets the document's visibility state.
     * @param {!VisibilityState_Enum} state
     */
    amp['setVisibilityState'] = function (state) {
      ampdoc.overrideVisibilityState(state);
    };

    // Messaging pipe.
    /**
     * Posts message to the ampdoc.
     * @param {string} eventType
     * @param {!JsonObject} data
     * @param {boolean} unusedAwaitResponse
     * @return {(!Promise<*>|undefined)}
     */
    amp['postMessage'] = viewer.receiveMessage.bind(viewer);

    /** @type {?function(string, *, boolean):(!Promise<*>|undefined)|undefined} */
    let onMessage;

    /**
     * Provides a message delivery mechanism by which AMP document can send
     * messages to the viewer.
     * @param {?function(string, *, boolean):(!Promise<*>|undefined)} callback
     */
    amp['onMessage'] = function (callback) {
      onMessage = callback;
    };

    viewer.setMessageDeliverer((eventType, data, awaitResponse) => {
      // Special messages.
      if (eventType == 'broadcast') {
        this.broadcast_(data, shadowRoot);
        return awaitResponse ? Promise.resolve() : undefined;
      }

      // All other messages.
      return onMessage?.(eventType, data, awaitResponse);
    }, origin);

    /**
     * Closes the document, resolving when visibility changes and services have
     * been cleand up. The document can no longer be activated again.
     * @return {Promise}
     */
    amp['close'] = () => {
      return this.closeShadowRoot_(shadowRoot);
    };

    if (getMode().development) {
      amp.toggleRuntime = viewer.toggleRuntime.bind(viewer);
      amp.resources = Services.resourcesForDoc(ampdoc);
    }

    /**
     * Expose amp-bind getState
     * @param {string} name - Name of state or deep state
     * @return {Promise<*>} - Resolves to a copy of the value of a state
     */
    amp['getState'] = (name) => {
      return Services.bindForDocOrNull(shadowRoot).then((bind) => {
        if (!bind) {
          return Promise.reject('amp-bind is not available in this document');
        }
        return bind.getState(name);
      });
    };

    /**
     * Expose amp-bind setState
     * @param {(!JsonObject|string)} state - State to be set
     * @return {Promise} - Resolves after state and history have been updated
     */
    amp['setState'] = (state) => {
      return Services.bindForDocOrNull(shadowRoot).then((bind) => {
        if (!bind) {
          return Promise.reject('amp-bind is not available in this document');
        }
        if (typeof state === 'string') {
          return bind.setStateWithExpression(
            /** @type {string} */ (state),
            /** @type {!JsonObject} */ ({})
          );
        } else if (isObject(state) || isArray(state)) {
          return bind.setStateWithObject(/** @type {!JsonObject} */ (state));
        }
        return Promise.reject('Invalid state');
      });
    };

    // Start building the shadow doc DOM.
    builder(amp, shadowRoot, ampdoc).then(() => {
      // Document is ready.
      ampdoc.setReady();
      ampdoc.signals().signal(CommonSignals_Enum.RENDER_START);
      setStyle(hostElement, 'visibility', 'visible');
    });

    // Store reference.
    if (!this.shadowRoots_.includes(shadowRoot)) {
      this.shadowRoots_.push(shadowRoot);
    }

    dev().fine(TAG, 'Shadow root initialization is done:', shadowRoot, ampdoc);
    return amp;
  }

  /**
   * Implementation for `attachShadowDoc` function. Attaches the shadow doc and
   * configures ampdoc for it.
   * @param {!Element} hostElement
   * @param {!Document} doc
   * @param {string} url
   * @param {!{[key: string]: string}=} opt_initParams
   * @return {!./runtime.ShadowDoc}
   */
  attachShadowDoc(hostElement, doc, url, opt_initParams) {
    user().assertString(url);
    dev().fine(TAG, 'Attach shadow doc:', doc);
    // TODO(dvoytenko, #9490): once stable, port full document case to emulated
    // stream.
    return this.attachShadowDoc_(
      hostElement,
      url,
      opt_initParams,
      (amp, shadowRoot, ampdoc) => {
        // Install extensions.
        this.mergeShadowHead_(ampdoc, shadowRoot, doc);

        // Append body.
        if (doc.body) {
          const body = importShadowBody(shadowRoot, doc.body, /* deep */ true);
          body.classList.add('amp-shadow');
          ampdoc.setBody(body);
        }

        // TODO(dvoytenko): find a better and more stable way to make content
        // visible. E.g. integrate with dynamic classes. In shadow case
        // specifically, we have to wait for stubbing to complete, which may
        // take awhile due to importNode.
        setTimeout(() => {
          ampdoc.signals().signal(CommonSignals_Enum.RENDER_START);
          setStyle(hostElement, 'visibility', 'visible');
        }, 50);

        return Promise.resolve();
      }
    );
  }

  /**
   * Implementation for `attachShadowDocAsStream` function. Attaches the shadow
   * doc and configures ampdoc for it.
   * @param {!Element} hostElement
   * @param {string} url
   * @param {!{[key: string]: string}=} opt_initParams
   * @return {!Object}
   */
  attachShadowDocAsStream(hostElement, url, opt_initParams) {
    user().assertString(url);
    dev().fine(TAG, 'Attach shadow doc as stream');
    return this.attachShadowDoc_(
      hostElement,
      url,
      opt_initParams,
      (amp, shadowRoot, ampdoc) => {
        // Start streaming.
        let renderStarted = false;
        const writer = createShadowDomWriter(this.win);
        amp['writer'] = writer;
        writer.onBody((doc) => {
          // Install extensions.
          this.mergeShadowHead_(ampdoc, shadowRoot, doc);

          // Append shallow body.
          const body = importShadowBody(
            shadowRoot,
            dev().assertElement(doc.body),
            /* deep */ false
          );
          body.classList.add('amp-shadow');
          ampdoc.setBody(body);
          return body;
        });
        writer.onBodyChunk(() => {
          // TODO(dvoytenko): find a better and more stable way to make
          // content visible. E.g. integrate with dynamic classes. In shadow
          // case specifically, we have to wait for stubbing to complete,
          // which may take awhile due to node importing.
          if (!renderStarted) {
            renderStarted = true;
            setTimeout(() => {
              ampdoc.signals().signal(CommonSignals_Enum.RENDER_START);
              setStyle(hostElement, 'visibility', 'visible');
            }, 50);
          }
        });
        return new Promise((resolve) => {
          writer.onEnd(() => {
            resolve();
            amp.writer = null;
          });
        });
      }
    );
  }

  /**
   * Processes the contents of the shadow document's head.
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!ShadowRoot} shadowRoot
   * @param {!Document} doc
   * @private
   */
  mergeShadowHead_(ampdoc, shadowRoot, doc) {
    if (doc.head) {
      shadowRoot.AMP.head = doc.head;
      const parentLinks = {};
      const links = childElementsByTag(
        dev().assertElement(this.win.document.head),
        'link'
      );
      for (let i = 0; i < links.length; i++) {
        const href = links[i].getAttribute('href');
        if (href) {
          parentLinks[href] = true;
        }
      }

      for (let n = doc.head.firstElementChild; n; n = n.nextElementSibling) {
        const {tagName} = n;
        const name = n.getAttribute('name');
        const rel = n.getAttribute('rel');
        switch (tagName) {
          case 'TITLE':
            shadowRoot.AMP.title = n.textContent;
            dev().fine(TAG, '- set title: ', shadowRoot.AMP.title);
            break;
          case 'META':
            if (n.hasAttribute('charset')) {
              // Ignore.
            } else if (name == 'viewport') {
              // Ignore.
            } else if (name) {
              // Store meta name/content pairs.
              ampdoc.setMetaByName(name, n.getAttribute('content') || '');
            } else {
              // TODO(dvoytenko): copy other meta tags.
              dev().warn(TAG, 'meta ignored: ', n);
            }
            break;
          case 'LINK':
            /** @const {string} */
            const href = n.getAttribute('href');
            if (rel == 'canonical') {
              shadowRoot.AMP.canonicalUrl = href;
              dev().fine(TAG, '- set canonical: ', shadowRoot.AMP.canonicalUrl);
            } else if (rel == 'stylesheet') {
              // Must be a font definition: no other stylesheets are allowed.
              if (parentLinks[href]) {
                dev().fine(TAG, '- stylesheet already included: ', href);
                // To accomodate icon fonts whose stylesheets include
                // the class definitions in addition to the font definition,
                // we re-import the stylesheet into the shadow document.
                // Note: <link> in shadow mode is not yet fully supported on
                // all browsers, so we use <style>@import "url"</style> instead
                installStylesForDoc(
                  ampdoc,
                  `@import "${href}"`,
                  /* callback */ null,
                  /* isRuntimeCss */ false
                );
              } else {
                parentLinks[href] = true;
                const el = this.win.document.createElement('link');
                el.setAttribute('rel', 'stylesheet');
                el.setAttribute('type', 'text/css');
                el.setAttribute('href', href);
                this.win.document.head.appendChild(el);
                dev().fine(TAG, '- import font to parent: ', href, el);
              }
            } else {
              dev().fine(TAG, '- ignore link rel=', rel);
            }
            break;
          case 'STYLE':
            if (n.hasAttribute('amp-boilerplate')) {
              // Ignore.
              dev().fine(TAG, '- ignore boilerplate style: ', n);
            } else if (n.hasAttribute('amp-custom')) {
              installStylesForDoc(
                ampdoc,
                n.textContent,
                /* callback */ null,
                /* isRuntimeCss */ false,
                'amp-custom'
              );
              dev().fine(TAG, '- import style: ', n);
            } else if (n.hasAttribute('amp-keyframes')) {
              installStylesForDoc(
                ampdoc,
                n.textContent,
                /* callback */ null,
                /* isRuntimeCss */ false,
                'amp-keyframes'
              );
              dev().fine(TAG, '- import style: ', n);
            }
            break;
          case 'SCRIPT':
            if (n.hasAttribute('src')) {
              dev().fine(TAG, '- src script: ', n);
              const src = n.getAttribute('src');
              const urlParts = parseExtensionUrl(src);
              // Note: Some extensions don't have [custom-element] or
              // [custom-template] e.g. amp-viewer-integration.
              const customElement = n.getAttribute('custom-element');
              const customTemplate = n.getAttribute('custom-template');
              const extensionId = customElement || customTemplate;
              if (!urlParts) {
                dev().fine(TAG, '- ignore runtime script: ', src);
              } else if (extensionId) {
                // This is an extension.
                this.extensions_.installExtensionForDoc(
                  ampdoc,
                  extensionId,
                  urlParts.extensionVersion
                );
              } else if (!n.hasAttribute('data-amp-report-test')) {
                user().error(TAG, '- unknown script: ', n, src);
              }
            } else {
              // Non-src version of script.
              const type = n.getAttribute('type') || 'application/javascript';
              if (type.indexOf('javascript') == -1) {
                shadowRoot.appendChild(this.win.document.importNode(n, true));
                dev().fine(TAG, '- non-src script: ', n);
              } else if (!n.hasAttribute('amp-onerror')) {
                // Don't error on amp-onerror script (https://github.com/ampproject/amphtml/issues/31966)
                user().error(TAG, '- unallowed inline javascript: ', n);
              }
            }
            break;
          case 'NOSCRIPT':
            // Ignore.
            break;
          default:
            user().error(TAG, '- UNKNOWN head element:', n);
            break;
        }
      }
    }
    ampdoc.setExtensionsKnown();
  }

  /**
   * @param {*} data
   * @param {!ShadowRoot} sender
   * @private
   */
  broadcast_(data, sender) {
    this.purgeShadowRoots_();
    this.shadowRoots_.forEach((shadowRoot) => {
      if (shadowRoot == sender) {
        // Don't broadcast to the sender.
        return;
      }
      // Broadcast message asynchronously.
      const viewer = Services.viewerForDoc(shadowRoot.AMP.ampdoc);
      this.timer_.delay(() => {
        viewer.receiveMessage(
          'broadcast',
          /** @type {!JsonObject} */ (data),
          /* awaitResponse */ false
        );
      }, 0);
    });
  }

  /**
   * @param {!ShadowRoot} shadowRoot
   * @return {Promise}
   * @private
   */
  closeShadowRoot_(shadowRoot) {
    this.removeShadowRoot_(shadowRoot);
    const amp = shadowRoot.AMP;
    delete shadowRoot.AMP;
    const {ampdoc} = amp;
    ampdoc.overrideVisibilityState(VisibilityState_Enum.INACTIVE);
    disposeServicesForDoc(ampdoc);

    // There is a race between the visibility state change finishing and
    // resources.onNextPass firing, but this is intentional. closeShadowRoot_
    // was traditionally introduced as a synchronous method, so PWAs in the wild
    // do not expect to have to wait for a promise to resolve before the shadow
    // is deemed 'closed'. Moving .overrideVisibilityState() and
    // disposeServicesForDoc inside a promise could adversely affect sites that
    // depend on at least the synchronous portions of those methods completing
    // before proceeding. The promise race is designed to be very quick so that
    // even if the pass callback completes before resources.onNextPass is called
    // below, we only delay promise resolution by a few ms.
    return this.timer_
      .timeoutPromise(
        15, // Delay for queued pass after visibility change is 10ms
        new this.win.Promise((resolve) => {
          getServicePromiseOrNullForDoc(ampdoc, 'resources').then(
            (resources) => {
              if (resources) {
                resources.onNextPass(resolve);
              } else {
                resolve();
              }
            }
          );
        }),
        'Timeout reached waiting for visibility state change callback'
      )
      .catch((error) => {
        user().info(TAG, error);
      });
  }

  /**
   * @param {!ShadowRoot} shadowRoot
   * @private
   */
  removeShadowRoot_(shadowRoot) {
    const index = this.shadowRoots_.indexOf(shadowRoot);
    if (index != -1) {
      this.shadowRoots_.splice(index, 1);
    }
  }

  /**
   * @param {!ShadowRoot} shadowRoot
   * @private
   */
  closeShadowRootAsync_(shadowRoot) {
    this.timer_.delay(() => {
      this.closeShadowRoot_(shadowRoot);
    }, 0);
  }

  /** @private */
  purgeShadowRoots_() {
    this.shadowRoots_.forEach((shadowRoot) => {
      // The shadow root has been disconnected. Force it closed.
      if (!shadowRoot.host || !isConnectedNode(shadowRoot.host)) {
        user().warn(TAG, "Shadow doc wasn't previously closed");
        this.removeShadowRoot_(shadowRoot);
        this.closeShadowRootAsync_(shadowRoot);
      }
    });
  }
}
