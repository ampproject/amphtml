/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {BaseElement} from './base-element';
import {BaseTemplate, registerExtendedTemplate} from './service/template-impl';
import {CommonSignals} from './common-signals';
import {
  ShadowDomWriter,
  createShadowRoot,
  importShadowBody,
  installStylesForShadowRoot,
} from './shadow-embed';
import {VisibilityState} from './visibility-state';
import {
  addDocFactoryToExtension,
  addElementToExtension,
  addShadowRootFactoryToExtension,
  installBuiltinElements,
  installExtensionsInShadowDoc,
  installExtensionsService,
  registerExtension,
  stubLegacyElements,
} from './service/extensions-impl';
import {ampdocServiceFor} from './ampdoc';
import {startupChunk} from './chunk';
import {cssText} from '../build/css';
import {dev, user, initLogConstructor, setReportError} from './log';
import {reportError} from './error';
import {
  disposeServicesForDoc,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
} from './service';
import {childElementsByTag} from './dom';
import {getMode} from './mode';
import {
  hasRenderDelayingServices,
} from './render-delaying-services';
import {installActionServiceForDoc} from './service/action-impl';
import {installCryptoService} from './service/crypto-impl';
import {installDocumentInfoServiceForDoc} from './service/document-info-impl';
import {installGlobalClickListenerForDoc} from './service/document-click';
import {installGlobalSubmitListenerForDoc} from './document-submit';
import {extensionsFor} from './services';
import {installHistoryServiceForDoc} from './service/history-impl';
import {installPlatformService} from './service/platform-impl';
import {installResourcesServiceForDoc} from './service/resources-impl';
import {
  installShadowDoc,
  shadowDocHasBody,
  shadowDocReady,
} from './service/ampdoc-impl';
import {installStandardActionsForDoc} from './service/standard-actions-impl';
import {installStorageServiceForDoc} from './service/storage-impl';
import {installStyles} from './style-installer';
import {installTimerService} from './service/timer-impl';
import {installTemplatesService} from './service/template-impl';
import {installUrlReplacementsServiceForDoc,} from
    './service/url-replacements-impl';
import {installViewerServiceForDoc, setViewerVisibilityState,} from
    './service/viewer-impl';
import {installViewportServiceForDoc} from './service/viewport-impl';
import {installVsyncService} from './service/vsync-impl';
import {installXhrService} from './service/xhr-impl';
import {installBatchedXhrService} from './service/batched-xhr-impl';
import {
  isExperimentOn,
  toggleExperiment,
} from './experiments';
import {parseUrl} from './url';
import {platformFor} from './services';
import {registerElement} from './custom-element';
import {registerExtendedElement} from './extended-element';
import {resourcesForDoc} from './services';
import {setStyle} from './style';
import {timerFor} from './services';
import {viewerForDoc} from './services';
import {viewportForDoc} from './services';
import {waitForBody} from './dom';
import * as config from './config';

initLogConstructor();
setReportError(reportError);

/**
 * - n is the name.
 * - f is the function body of the extension.
 * - p is the priority. Only supported value is "high".
 *   high means, that the extension is not subject to chunking.
 *   This should be used for work, that should always happen
 *   as early as possible. Currently this is primarily used
 *   for viewer communication setup.
 * @typedef {{
 *   n: string,
 *   f: function(!Object),
 *   p: (string|undefined),
 * }}
 */
let ExtensionPayloadDef;

/** @const @private {string} */
const TAG = 'runtime';

/** @type {!Object} */
const elementsForTesting = {};

/**
 * Install runtime-level services.
 * @param {!Window} global Global scope to adopt.
 */
export function installRuntimeServices(global) {
  installCryptoService(global);
  installPlatformService(global);
  installTimerService(global);
  installVsyncService(global);
  installXhrService(global);
  installBatchedXhrService(global);
  installTemplatesService(global);
}


/**
 * Install ampdoc-level services.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Object<string, string>=} opt_initParams
 */
export function installAmpdocServices(ampdoc, opt_initParams) {
  installDocumentInfoServiceForDoc(ampdoc);
  installViewerServiceForDoc(ampdoc, opt_initParams);
  installViewportServiceForDoc(ampdoc);
  installHistoryServiceForDoc(ampdoc);
  installResourcesServiceForDoc(ampdoc);
  installUrlReplacementsServiceForDoc(ampdoc);
  installActionServiceForDoc(ampdoc);
  installStandardActionsForDoc(ampdoc);
  installStorageServiceForDoc(ampdoc);
  installGlobalClickListenerForDoc(ampdoc);
  installGlobalSubmitListenerForDoc(ampdoc);
}


/**
 * Install builtins.
 * @param {!Window} global Global scope to adopt.
 */
export function installBuiltins(global) {
  installBuiltinElements(global);
}


/**
 * Applies the runtime to a given global scope for a single-doc mode.
 * Multi frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 * @param {!{
 *     registerElement: function(
 *         !Window,
 *         !./service/extensions-impl.Extensions,
 *         string, !Function, string=),
 *     registerServiceForDoc: function(
 *         !Window,
 *         !./service/extensions-impl.Extensions,
 *         string,
 *         (function(new:Object, !./service/ampdoc-impl.AmpDoc)|undefined),
 *         (function(!./service/ampdoc-impl.AmpDoc):!Object|undefined)),
 *   }} opts
 * @param {function(!Window, !./service/extensions-impl.Extensions)} callback
 */
function adoptShared(global, opts, callback) {

  // Tests can adopt the same window twice. sigh.
  if (global.AMP_TAG) {
    return;
  }
  global.AMP_TAG = true;
  // If there is already a global AMP object we assume it is an array
  // of functions
  /** @const {!Array<function(!Object)|ExtensionPayloadDef>} */
  const preregisteredExtensions = global.AMP || [];

  installExtensionsService(global);
  /** @const {!./service/extensions-impl.Extensions} */
  const extensions = extensionsFor(global);
  installRuntimeServices(global);
  stubLegacyElements(global);

  global.AMP = {
    win: global,
  };

  // `AMP.extension()` function is only installed in a non-minified mode.
  // This function is meant to play the same role for development and testing
  // as `AMP.push()` in production.
  if (!getMode().minified) {
    /**
     * @param {string} unusedName
     * @param {string} unusedVersion
     * @param {function(!Object)} installer
     * @const
     */
    global.AMP.extension = function(unusedName, unusedVersion, installer) {
      installer(global.AMP);
    };
  }

  /** @const */
  global.AMP.config = config;

  global.AMP.BaseElement = BaseElement;

  global.AMP.BaseTemplate = BaseTemplate;

  /**
   * Registers an extended element and installs its styles.
   * @param {string} name
   * @param {function(new:BaseElement)} implementationClass
   * @param {string=} opt_css
   */
  global.AMP.registerElement = opts.registerElement.bind(null,
      global, extensions);

  /**
   * Registers an extended template.
   * @param {string} name
   * @param {function(new:BaseTemplate)} implementationClass
   */
  global.AMP.registerTemplate = function(name, implementationClass) {
    registerExtendedTemplate(global, name, implementationClass);
  };

  /**
   * Registers an ampdoc service.
   * @param {string} name
   * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)|undefined} opt_ctor
   * @param {function(!./service/ampdoc-impl.AmpDoc):!Object|undefined} opt_factory
   */
  global.AMP.registerServiceForDoc = opts.registerServiceForDoc.bind(null,
      global, extensions);

  // Experiments.
  /**
   * @param {string} experimentId
   * @return {boolean}
   */
  global.AMP.isExperimentOn = isExperimentOn.bind(null, global);
  /**
   * @param {string} experimentId
   * @param {boolean=} opt_on
   * @return {boolean}
   */
  global.AMP.toggleExperiment = toggleExperiment.bind(null, global);

  /**
   * Sets the function to forward tick events to.
   * @param {function(string,?string=,number=)} fn
   * @param {function()=} opt_flush
   * @deprecated
   * @export
   */
  global.AMP.setTickFunction = (fn, opt_flush) => {};

  // Run specific setup for a single-doc or shadow-doc mode.
  callback(global, extensions);

  /**
   * @param {function(!Object)|ExtensionPayloadDef} fnOrStruct
   */
  function installExtension(fnOrStruct) {
    const register = () => {
      waitForBody(global.document, () => {
        if (typeof fnOrStruct == 'function') {
          fnOrStruct(global.AMP);
        } else {
          registerExtension(extensions, fnOrStruct.n, fnOrStruct.f, global.AMP);
        }
      });
    };
    if (typeof fnOrStruct == 'function' || fnOrStruct.p == 'high') {
      // "High priority" extensions do not go through chunking.
      // This should be used for extensions that need to run early.
      // One example would be viewer communication that is required
      // to transition document from pre-render to visible (which
      // affects chunking itself).
      // We consider functions as high priority, because
      // - if in doubt, that is a better default
      // - the only actual  user is a viewer integration that should
      //   be high priority.
      Promise.resolve().then(register);
    } else {
      register.displayName = fnOrStruct.n;
      startupChunk(global.document, register);
    }
  }

  /**
   * Certain extensions can be auto-loaded by runtime based on experiments or
   * other configurations.
   */
  function installAutoLoadExtensions() {
    if (!getMode().test && isExperimentOn(global, 'amp-lightbox-viewer-auto')) {
      extensionsFor(global).loadExtension('amp-lightbox-viewer');
    }
  }

  // Handle high priority extensions now, and if necessary issue
  // requests for new extensions (used for experimental version
  // locking).
  for (let i = 0; i < preregisteredExtensions.length; i++) {
    const fnOrStruct = preregisteredExtensions[i];
    if (maybeLoadCorrectVersion(global, fnOrStruct)) {
      preregisteredExtensions.splice(i--, 1);
    }
    else if (typeof fnOrStruct == 'function' || fnOrStruct.p == 'high') {
      try {
        installExtension(fnOrStruct);
      } catch (e) {
        // Throw errors outside of loop in its own micro task to
        // avoid on error stopping other extensions from loading.
        dev().error(TAG, 'Extension failed: ', e, fnOrStruct.n);
      }
      // We handled the entry. Remove from set for future execution.
      preregisteredExtensions.splice(i--, 1);
    }
  }

  maybePumpEarlyFrame(global, () => {
    /**
     * Registers a new custom element.
     * @param {function(!Object)|ExtensionPayloadDef} fnOrStruct
     */
    global.AMP.push = function(fnOrStruct) {
      if (maybeLoadCorrectVersion(global, fnOrStruct)) {
        return;
      }
      installExtension(fnOrStruct);
    };
    // Execute asynchronously scheduled elements.
    for (let i = 0; i < preregisteredExtensions.length; i++) {
      const fnOrStruct = preregisteredExtensions[i];
      if (maybeLoadCorrectVersion(global, fnOrStruct)) {
        continue;
      }
      try {
        installExtension(fnOrStruct);
      } catch (e) {
        // Throw errors outside of loop in its own micro task to
        // avoid on error stopping other extensions from loading.
        dev().error(TAG, 'Extension failed: ', e, fnOrStruct.n);
      }
    }
    // Make sure we empty the array of preregistered extensions.
    // Technically this is only needed for testing, as everything should
    // go out of scope here, but just making sure.
    preregisteredExtensions.length = 0;
  });
  // If the closure passed to maybePumpEarlyFrame didn't execute
  // immediately we need to keep pushing onto preregisteredExtensions
  if (!global.AMP.push) {
    global.AMP.push = preregisteredExtensions.push.bind(
      preregisteredExtensions);
  }

  installAutoLoadExtensions();

  // For iOS we need to set `cursor:pointer` to ensure that click events are
  // delivered.
  if (platformFor(global).isIos()) {
    setStyle(global.document.documentElement, 'cursor', 'pointer');
  }
}


/**
 * Applies the runtime to a given global scope for a single-doc mode.
 * Multi frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 */
export function adopt(global) {
  adoptShared(global, {
    registerElement: prepareAndRegisterElement,
    registerServiceForDoc: prepareAndRegisterServiceForDoc,
  }, global => {
    const viewer = viewerForDoc(global.document);

    global.AMP.viewer = viewer;

    if (getMode().development) {
      global.AMP.toggleRuntime = viewer.toggleRuntime.bind(viewer);
      global.AMP.resources = resourcesForDoc(global.document);
    }

    const viewport = viewportForDoc(global.document);

    global.AMP.viewport = {};
    global.AMP.viewport.getScrollLeft = viewport.getScrollLeft.bind(viewport);
    global.AMP.viewport.getScrollWidth = viewport.getScrollWidth.bind(viewport);
    global.AMP.viewport.getWidth = viewport.getWidth.bind(viewport);
  });
}


/**
 * Applies the runtime to a given global scope for shadow mode.
 * @param {!Window} global Global scope to adopt.
 */
export function adoptShadowMode(global) {
  adoptShared(global, {
    registerElement: prepareAndRegisterElementShadowMode,
    registerServiceForDoc: prepareAndRegisterServiceForDocShadowMode,
  }, (global, extensions) => {

    const manager = new MultidocManager(
        global,
        ampdocServiceFor(global),
        extensions,
        timerFor(global));

    /**
     * Registers a shadow root document via a fully fetched document.
     * @param {!Element} hostElement
     * @param {!Document} doc
     * @param {string} url
     * @param {!Object<string, string>=} opt_initParams
     * @return {!Object}
     */
    global.AMP.attachShadowDoc = manager.attachShadowDoc.bind(manager);

    /**
     * Registers a shadow root document via a stream.
     * @param {!Element} hostElement
     * @param {string} url
     * @param {!Object<string, string>=} opt_initParams
     * @return {!Object}
     */
    global.AMP.attachShadowDocAsStream =
        manager.attachShadowDocAsStream.bind(manager);
  });
}


/**
 * Registers an extended element and installs its styles in a single-doc mode.
 * @param {!Window} global
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {string} name
 * @param {function(new:BaseElement)} implementationClass
 * @param {string=} opt_css
 */
function prepareAndRegisterElement(global, extensions,
    name, implementationClass, opt_css) {
  addElementToExtension(extensions, name, implementationClass, opt_css);
  if (opt_css) {
    installStyles(global.document, opt_css, () => {
      registerElementClass(global, name, implementationClass, opt_css);
    }, false, name);
  } else {
    registerElementClass(global, name, implementationClass, opt_css);
  }
}


/**
 * Registers an extended element and installs its styles in a shodow-doc mode.
 * @param {!Window} global
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {string} name
 * @param {function(new:BaseElement)} implementationClass
 * @param {string=} opt_css
 */
function prepareAndRegisterElementShadowMode(global, extensions,
    name, implementationClass, opt_css) {
  addElementToExtension(extensions, name, implementationClass, opt_css);
  registerElementClass(global, name, implementationClass, opt_css);
  if (opt_css) {
    addShadowRootFactoryToExtension(extensions, shadowRoot => {
      installStylesForShadowRoot(shadowRoot, dev().assertString(opt_css),
          /* isRuntimeCss */ false, name);
    });
  }
}


/**
 * Registration steps for an extension element in both single- and shadow-doc
 * modes.
 * @param {!Window} global
 * @param {string} name
 * @param {function(new:BaseElement)} implementationClass
 * @param {string=} opt_css
 */
function registerElementClass(global, name, implementationClass, opt_css) {
  registerExtendedElement(global, name, implementationClass);
  if (getMode().test) {
    elementsForTesting[name] = {
      name,
      implementationClass,
      css: opt_css,
    };
  }
  // Register this extension to resolve its Service Promise.
  registerServiceBuilder(global, name, emptyService);
}


/**
 * Registers an ampdoc service in a single-doc mode.
 * @param {!Window} global
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {string} name
 * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)=} opt_ctor
 * @param {function(!./service/ampdoc-impl.AmpDoc):!Object=} opt_factory
 */
function prepareAndRegisterServiceForDoc(global, extensions,
    name, opt_ctor, opt_factory) {
  // TODO(kmh287, #9292): Refactor to remove opt_factory param and require ctor
  // once #9212 has been in prod for two releases.
  const ampdocService = ampdocServiceFor(global);
  const ampdoc = ampdocService.getAmpDoc();
  registerServiceForDoc(ampdoc, name, opt_ctor, opt_factory);
}


/**
 * Registers an ampdoc service in a shadow-doc mode.
 * @param {!Window} global
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {string} name
 * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)=} opt_ctor
 * @param {function(!./service/ampdoc-impl.AmpDoc):!Object=} opt_factory
 */
function prepareAndRegisterServiceForDocShadowMode(global, extensions,
    name, opt_ctor, opt_factory) {
  // TODO(kmh287, #9292): Refactor to remove opt_factory param and require ctor
  // once #9212 has been in prod for two releases.
  addDocFactoryToExtension(extensions, ampdoc => {
    registerServiceForDoc(ampdoc, name, opt_ctor, opt_factory);
  }, name);
}


/**
 * Registration steps for an ampdoc service in both single- and shadow-doc
 * modes.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} name
 * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)=} opt_ctor
 * @param {function(!./service/ampdoc-impl.AmpDoc):!Object=} opt_factory
 */
function registerServiceForDoc(ampdoc, name, opt_ctor, opt_factory) {
  // TODO(kmh287, #9292): Refactor to remove opt_factory param and require ctor
  // once #9212 has been in prod for two releases.
  // Wrapping factory in function is necessary as opt_factory could be an
  // arrow function, which cannot be used as constructors.
  const ctor = opt_ctor || function(ampdoc) {
    return opt_factory(ampdoc);
  };
  // TODO(kmh287): Investigate removing the opt_instantiate arg after
  // all other services have been refactored.
  registerServiceBuilderForDoc(ampdoc,
                               name,
                               ctor,
                               /* opt_instantiate */ true);
}


/**
 * A manager for documents in the multi-doc environment.
 */
class MultidocManager {

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
   * @param {!Object<string, string>|undefined} initParams
   * @param {function(!Object, !ShadowRoot, !./service/ampdoc-impl.AmpDocShadow):!Promise} builder
   * @return {!Object}
   * @private
   */
  attachShadowDoc_(hostElement, url, initParams, builder) {
    this.purgeShadowRoots_();

    setStyle(hostElement, 'visibility', 'hidden');
    const shadowRoot = createShadowRoot(hostElement);

    if (shadowRoot.AMP) {
      user().warn(TAG, 'Shadow doc wasn\'t previously closed');
      this.closeShadowRoot_(shadowRoot);
    }

    const amp = {};
    shadowRoot.AMP = amp;
    amp.url = url;
    const origin = parseUrl(url).origin;

    const ampdoc = installShadowDoc(this.ampdocService_, url, shadowRoot);
    /** @const {!./service/ampdoc-impl.AmpDocShadow} */
    amp.ampdoc = ampdoc;
    dev().fine(TAG, 'Attach to shadow root:', shadowRoot, ampdoc);

    // Install runtime CSS.
    installStylesForShadowRoot(shadowRoot, cssText,
        /* opt_isRuntimeCss */ true);

    // Instal doc services.
    installAmpdocServices(ampdoc, initParams || Object.create(null));
    const viewer = viewerForDoc(ampdoc);

    /**
     * Sets the document's visibility state.
     * @param {!VisibilityState} state
     */
    amp.setVisibilityState = function(state) {
      setViewerVisibilityState(viewer, state);
    };

    // Messaging pipe.
    /**
     * Posts message to the ampdoc.
     * @param {string} eventType
     * @param {!JSONType} data
     * @param {boolean} unusedAwaitResponse
     * @return {(!Promise<*>|undefined)}
     */
    amp.postMessage = viewer.receiveMessage.bind(viewer);

    /** @type {function(string, *, boolean):(!Promise<*>|undefined)} */
    let onMessage;

    /**
     * Provides a message delivery mechanism by which AMP document can send
     * messages to the viewer.
     * @param {function(string, *, boolean):(!Promise<*>|undefined)} callback
     */
    amp.onMessage = function(callback) {
      onMessage = callback;
    };

    viewer.setMessageDeliverer((eventType, data, awaitResponse) => {
      // Special messages.
      if (eventType == 'broadcast') {
        this.broadcast_(data, shadowRoot);
        return awaitResponse ? Promise.resolve() : undefined;
      }

      // All other messages.
      if (onMessage) {
        return onMessage(eventType, data, awaitResponse);
      }
    }, origin);

    /**
     * Closes the document. The document can no longer be activated again.
     */
    amp.close = () => {
      this.closeShadowRoot_(shadowRoot);
    };

    if (getMode().development) {
      amp.toggleRuntime = viewer.toggleRuntime.bind(viewer);
      amp.resources = resourcesForDoc(ampdoc);
    }

    // Start building the shadow doc DOM.
    builder(amp, shadowRoot, ampdoc).then(() => {
      // Document is ready.
      shadowDocReady(ampdoc);
      ampdoc.signals().signal(CommonSignals.RENDER_START);
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
   * @param {!Object<string, string>=} opt_initParams
   * @return {!Object}
   */
  attachShadowDoc(hostElement, doc, url, opt_initParams) {
    dev().fine(TAG, 'Attach shadow doc:', doc);
    // TODO(dvoytenko, #9490): once stable, port full document case to emulated
    // stream.
    return this.attachShadowDoc_(
        hostElement, url, opt_initParams,
        (amp, shadowRoot, ampdoc) => {
          // Install extensions.
          const extensionIds = this.mergeShadowHead_(shadowRoot, doc);
          installExtensionsInShadowDoc(this.extensions_, ampdoc, extensionIds);

          // Append body.
          if (doc.body) {
            const body = importShadowBody(
                shadowRoot, doc.body, /* deep */ true);
            body.classList.add('amp-shadow');
            shadowRoot.appendChild(body);
            shadowDocHasBody(ampdoc, body);
          }

          // TODO(dvoytenko): find a better and more stable way to make content
          // visible. E.g. integrate with dynamic classes. In shadow case
          // specifically, we have to wait for stubbing to complete, which may
          // take awhile due to importNode.
          setTimeout(() => {
            ampdoc.signals().signal(CommonSignals.RENDER_START);
            setStyle(hostElement, 'visibility', 'visible');
          }, 50);

          return Promise.resolve();
        });
  }

  /**
   * Implementation for `attachShadowDocAsStream` function. Attaches the shadow
   * doc and configures ampdoc for it.
   * @param {!Element} hostElement
   * @param {string} url
   * @param {!Object<string, string>=} opt_initParams
   * @return {!Object}
   */
  attachShadowDocAsStream(hostElement, url, opt_initParams) {
    dev().fine(TAG, 'Attach shadow doc as stream');
    return this.attachShadowDoc_(
        hostElement, url, opt_initParams,
        (amp, shadowRoot, ampdoc) => {
          // Start streaming.
          let renderStarted = false;
          const writer = new ShadowDomWriter(this.win);
          amp.writer = writer;
          writer.onBody(doc => {
            // Install extensions.
            const extensionIds = this.mergeShadowHead_(shadowRoot, doc);
            // Apply all doc extensions.
            installExtensionsInShadowDoc(
                this.extensions_, ampdoc, extensionIds);

            // Append shallow body.
            const body = importShadowBody(
                shadowRoot,
                /** @type {!Element} */ (doc.body),
                /* deep */ false);
            body.classList.add('amp-shadow');
            shadowRoot.appendChild(body);
            shadowDocHasBody(ampdoc, body);
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
                ampdoc.signals().signal(CommonSignals.RENDER_START);
                setStyle(hostElement, 'visibility', 'visible');
              }, 50);
            }
          });
          return new Promise(resolve => {
            writer.onEnd(() => {
              resolve();
              amp.writer = null;
            });
          });
        });
  }

  /**
   * Processes the contents of the shadow document's head.
   * @param {!ShadowRoot} shadowRoot
   * @param {!Document} doc
   * @return {!Array<string>}
   * @private
   */
  mergeShadowHead_(shadowRoot, doc) {
    const extensionIds = [];
    if (doc.head) {
      const parentLinks = {};
      const links = childElementsByTag(
          dev().assertElement(this.win.document.head), 'link');
      for (let i = 0; i < links.length; i++) {
        const href = links[i].getAttribute('href');
        if (href) {
          parentLinks[href] = true;
        }
      }

      for (let n = doc.head.firstElementChild; n; n = n.nextElementSibling) {
        const tagName = n.tagName;
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
            } else {
              installStylesForShadowRoot(shadowRoot, n.textContent,
                  /* isRuntimeCss */ false, 'amp-custom');
              dev().fine(TAG, '- import style: ', n);
            }
            break;
          case 'SCRIPT':
            if (n.hasAttribute('src')) {
              dev().fine(TAG, '- src script: ', n);
              const src = n.getAttribute('src');
              const isRuntime = src.indexOf('/amp.js') != -1 ||
                  src.indexOf('/v0.js') != -1;
              const customElement = n.getAttribute('custom-element');
              const customTemplate = n.getAttribute('custom-template');
              if (isRuntime) {
                dev().fine(TAG, '- ignore runtime script: ', src);
              } else if (customElement || customTemplate) {
                // This is an extension.
                this.extensions_.loadExtension(customElement || customTemplate);
                dev().fine(
                    TAG, '- load extension: ', customElement || customTemplate);
                if (customElement) {
                  extensionIds.push(customElement);
                }
              } else if (!n.hasAttribute('data-amp-report-test')) {
                user().error(TAG, '- unknown script: ', n, src);
              }
            } else {
              // Non-src version of script.
              const type = n.getAttribute('type') || 'application/javascript';
              if (type.indexOf('javascript') == -1) {
                shadowRoot.appendChild(this.win.document.importNode(n, true));
                dev().fine(TAG, '- non-src script: ', n);
              } else {
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
    return extensionIds;
  }

  /**
   * @param {*} data
   * @param {!ShadowRoot} sender
   * @private
   */
  broadcast_(data, sender) {
    this.purgeShadowRoots_();
    this.shadowRoots_.forEach(shadowRoot => {
      if (shadowRoot == sender) {
        // Don't broadcast to the sender.
        return;
      }
      // Broadcast message asynchronously.
      const viewer = viewerForDoc(shadowRoot.AMP.ampdoc);
      this.timer_.delay(() => {
        viewer.receiveMessage('broadcast',
            /** @type {!JSONType} */ (data),
            /* awaitResponse */ false);
      }, 0);
    });
  }

  /**
   * @param {!ShadowRoot} shadowRoot
   * @private
   */
  closeShadowRoot_(shadowRoot) {
    this.removeShadowRoot_(shadowRoot);
    const amp = shadowRoot.AMP;
    delete shadowRoot.AMP;
    const ampdoc = /** @type {!./service/ampdoc-impl.AmpDoc} */ (amp.ampdoc);
    setViewerVisibilityState(viewerForDoc(ampdoc), VisibilityState.INACTIVE);
    disposeServicesForDoc(ampdoc);
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
    this.shadowRoots_.forEach(shadowRoot => {
      // The shadow root has been disconnected. Force it closed.
      if (!this.win.document.contains(shadowRoot.host)) {
        user().warn(TAG, 'Shadow doc wasn\'t previously closed');
        this.removeShadowRoot_(shadowRoot);
        this.closeShadowRootAsync_(shadowRoot);
      }
    });
  }
}


/**
 * @return {!Object}
 */
function emptyService() {
  // All services need to resolve to an object.
  return {};
}


/**
 * Registers all extended elements as normal elements in the given
 * window.
 * Make sure to call `adopt(window)` in your unit test as well and
 * then call this on the generated iframe.
 * @param {!Window} win
 */
export function registerForUnitTest(win) {
  for (const key in elementsForTesting) {
    let element = null;
    element = elementsForTesting[key];
    if (element.css) {
      installStyles(win.document, element.css, () => {
        registerElement(win, element.name, element.implementationClass);
      }, false, element.name);
    } else {
      registerElement(win, element.name, element.implementationClass);
    }
  }
}


/**
 * Registers a specific element for testing.
 * @param {!Window} win
 * @param {string} elementName
 * @visibleForTesting
 */
export function registerElementForTesting(win, elementName) {
  const element = elementsForTesting[elementName];
  if (!element) {
    throw new Error('test element not found: ' + elementName +
      '\nKnown elements ' + Object.keys(elementsForTesting).sort());
  }
  win.AMP.registerElement(element.name, element.implementationClass,
      element.css);
}

/**
 * For a given extension, checks that its version is the same
 * as the version of the main AMP binary.
 * If yes, returns false and does nothing else.
 * If they are different, returns false, and initiates a load
 * of the respective extension via a versioned URL.
 *
 * This is currently guarded by the 'version-locking' experiment.
 * With this active, all scripts in a given page are guaranteed
 * to have the same AMP release version.
 *
 * @param {!Window} win
 * @param {function(!Object)|ExtensionPayloadDef} fnOrStruct
 * @return {boolean}
 */
function maybeLoadCorrectVersion(win, fnOrStruct) {
  if (!isExperimentOn(win, 'version-locking')) {
    return false;
  }
  if (typeof fnOrStruct == 'function') {
    return false;
  }
  const version = fnOrStruct.v;
  // This is non-obvious, but we only care about the release version,
  // not about the full rtv version, because these only differ
  // in the config that is fully determined by the primary binary.
  if ('$internalRuntimeVersion$' == version) {
    return false;
  }
  // The :not is an extra prevention of recursion because it will be
  // added to script tags that go into the code path below.
  const scriptInHead = win.document.head./*OK*/querySelector(
          `[custom-element="${fnOrStruct.n}"]:not([i-amphtml-inserted])`);
  dev().assert(scriptInHead, 'Expected to find script for extension: %s',
      fnOrStruct.n);
  if (!scriptInHead) {
    return false;
  }
  // Mark the element as being replace, so that the loadExtension code
  // assumes it as not-present.
  scriptInHead.removeAttribute('custom-element');
  scriptInHead.setAttribute('i-amphtml-loaded-new-version', fnOrStruct.n);
  extensionsFor(win).loadExtension(fnOrStruct.n,
      /* stubbing not needed, should have already happened. */ false);
  return true;
}

/**
 * If it makes sense, let the browser paint the current frame before
 * executing the callback.
 * @param {!Window} win
 * @param {function()} cb Callback that should run after a frame was
 *     pumped.
 */
function maybePumpEarlyFrame(win, cb) {
  if (!isExperimentOn(win, 'pump-early-frame')) {
    cb();
    return;
  }
  // There is definitely nothing to draw yet, so we might as well
  // proceed.
  if (!win.document.body) {
    cb();
    return;
  }
  if (hasRenderDelayingServices(win)) {
    cb();
    return;
  }
  timerFor(win).delay(cb, 1);
}
