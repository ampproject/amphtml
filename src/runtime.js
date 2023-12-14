import {waitForBodyOpenPromise} from '#core/dom';
import {setStyle} from '#core/dom/style';
import * as mode from '#core/mode';

import {isExperimentOn, toggleExperiment} from '#experiments';

import {shouldLoadPolyfill as shouldLoadInObPolyfill} from '#polyfills/stubs/intersection-observer-stub';
import {shouldLoadPolyfill as shouldLoadResObPolyfill} from '#polyfills/stubs/resize-observer-stub';

import {Services} from '#service';
import {
  installAmpdocServices,
  installRuntimeServices,
} from '#service/core-services';
import {stubElementsForDoc} from '#service/custom-element-registry';
import {
  installExtensionsService,
  stubLegacyElements,
} from '#service/extensions-impl';

import {
  dev,
  initLogConstructor,
  overrideLogLevel,
  setReportError,
} from '#utils/log';

import {BaseElement} from './base-element';
import {startupChunk} from './chunk';
import * as urls from './config/urls';
import {reportErrorForWin} from './error-reporting';
import {getMode} from './mode';
import {MultidocManager} from './multidoc-manager';
import {hasRenderDelayingServices} from './render-delaying-services';

import {cssText as ampDocCss} from '../build/ampdoc.css';
import {cssText as ampSharedCss} from '../build/ampshared.css';

initLogConstructor();
setReportError(reportErrorForWin.bind(null, self));

/** @const @private {string} */
const TAG = 'runtime';

/**
 * @typedef {{
 *  url: (string|undefined),
 *  title: (string|undefined),
 *  canonicalUrl: (string|undefined),
 *  head: (Element|undefined),
 *  ampdoc: (!./service/ampdoc-impl.AmpDoc | undefined),
 *  setVisibilityState: (function(!VisibilityState_Enum)|undefined),
 *  postMessage: (function()|undefined),
 *  onMessage: (function()|undefined),
 *  close: (function()|undefined),
 *  getState: (function()|undefined),
 *  setState: (function()|undefined),
 *  toggleRuntime: (function()|undefined),
 *  resources: (!./service/resources-interface.ResourcesInterface | undefined)
 * }}
 */
export let ShadowDoc;

/**
 * Applies the runtime to a given global scope for a single-doc mode. Multi
 * frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 * @param {function(!Window, !./service/extensions-impl.Extensions):!Promise} callback
 * @return {!Promise}
 */
function adoptShared(global, callback) {
  // Tests can adopt the same window twice. sigh.
  if (global.__AMP_TAG) {
    return Promise.resolve();
  }
  global.__AMP_TAG = true;
  // If there is already a global AMP object we assume it is an array
  // of functions
  /** @const {!Array<function(!Object)|!ExtensionPayload>} */
  const preregisteredExtensions = global.AMP || [];

  installExtensionsService(global);
  /** @const {!./service/extensions-impl.Extensions} */
  const extensions = Services.extensionsFor(global);
  installRuntimeServices(global);
  stubLegacyElements(global);

  global.AMP = {
    win: global,
    // Might not be available in tests.
    '_': global.AMP ? global.AMP['_'] : undefined,
  };

  // `AMP.extension()` function is only installed in a non-minified mode.
  // This function is meant to play the same role for development and testing
  // as `AMP.push()` in production.
  if (!mode.isMinified()) {
    /**
     * @param {string} unusedName
     * @param {string} unusedVersion
     * @param {function(!Object)} installer
     * @const
     */
    global.AMP.extension = function (unusedName, unusedVersion, installer) {
      installer(global.AMP);
    };
  }

  /**
   * @const {{
   *   urls: {
   *     thirdParty: string,
   *     thirdPartyFrameHost: string,
   *     thirdPartyFrameRegex: !RegExp,
   *     cdn: string,
   *     cdnProxyRegex: !RegExp,
   *     localhostRegex: !RegExp,
   *     errorReporting: string,
   *     betaErrorReporting: string,
   *     localDev: boolean,
   *     trustedViewerHosts: !Array<!RegExp>,
   *     geoApi: ?string,
   *   }
   * }}
   */
  global.AMP.config = {
    urls: {
      thirdParty: urls.thirdParty,
      thirdPartyFrameHost: urls.thirdPartyFrameHost,
      thirdPartyFrameRegex: urls.thirdPartyFrameRegex,
      cdn: urls.cdn,
      cdnProxyRegex: urls.cdnProxyRegex,
      localhostRegex: urls.localhostRegex,
      errorReporting: urls.errorReporting,
      betaErrorReporting: urls.betaErrorReporting,
      localDev: urls.localDev,
      trustedViewerHosts: urls.trustedViewerHosts,
      geoApi: urls.geoApi,
    },
  };

  /**
   *
   * NOTE(erwinm, #38644): placeholder for global consent listeners.
   */
  global.AMP.addGlobalConsentListener = function () {};

  /**
   * NOTE(erwinm, #38644): placeholder for global consent listeners.
   */
  global.AMP.addGranularConsentListener = function () {};

  global.AMP.BaseElement = BaseElement;

  /**
   * Registers an extended element and installs its styles.
   * @param {string} name
   * @param {typeof BaseElement} implementationClass
   * @param {?string|undefined} css
   */
  global.AMP.registerElement = extensions.addElement.bind(extensions);

  /**
   * Registers an extended template.
   * @param {string} name
   * @param {typeof ./base-template.BaseTemplate} implementationClass
   */
  global.AMP.registerTemplate = extensions.addTemplate.bind(extensions);

  /**
   * Registers an ampdoc service.
   * @param {string} name
   * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)} implementationClass
   */
  global.AMP.registerServiceForDoc = extensions.addService.bind(extensions);

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
   * @param {import('#utils/log').LogLevel_Enum} level
   */
  global.AMP.setLogLevel = overrideLogLevel.bind(null);

  /**
   * Sets the function to forward tick events to.
   * @param {function(string,?string=,number=)} unusedFn
   * @param {function()=} opt_flush
   * @deprecated
   */
  global.AMP.setTickFunction = (unusedFn, opt_flush) => {};

  // Run specific setup for a single-doc or shadow-doc mode.
  const iniPromise = callback(global, extensions);

  /**
   * @param {function(!Object,!Object)|!ExtensionPayload} fnOrStruct
   */
  function installExtension(fnOrStruct) {
    const register = () => {
      iniPromise.then(() => {
        if (typeof fnOrStruct == 'function') {
          fnOrStruct(global.AMP, global.AMP._);
        } else {
          extensions.registerExtension(
            fnOrStruct.n,
            fnOrStruct.ev,
            fnOrStruct.l,
            fnOrStruct.f,
            global.AMP
          );
        }
      });
    };

    startRegisterOrChunk(global, fnOrStruct, register);
  }

  // Handle high priority extensions now, and if necessary issue
  // requests for new extensions (used for experimental version
  // locking).
  for (let i = 0; i < preregisteredExtensions.length; i++) {
    const fnOrStruct = preregisteredExtensions[i];
    if (maybeLoadCorrectVersion(global, fnOrStruct)) {
      preregisteredExtensions.splice(i--, 1);
    } else if (typeof fnOrStruct == 'function' || fnOrStruct.p == 'high') {
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
     * @param {function(!Object, !Object)|!ExtensionPayload} fnOrStruct
     */
    global.AMP.push = function (fnOrStruct) {
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
    global.AMP.push =
      /** @type {function((ExtensionPayload|function(!Object, !Object): ?))} */ (
        preregisteredExtensions.push.bind(preregisteredExtensions)
      );
  }

  // For iOS we need to set `cursor:pointer` to ensure that click events are
  // delivered.
  if (Services.platformFor(global).isIos()) {
    setStyle(global.document.documentElement, 'cursor', 'pointer');
  }

  // Some deferred polyfills.
  const extensionsFor = Services.extensionsFor(global);
  if (shouldLoadResObPolyfill(global)) {
    extensionsFor.preloadExtension('amp-resize-observer-polyfill');
  }
  if (shouldLoadInObPolyfill(global)) {
    extensionsFor.preloadExtension('amp-intersection-observer-polyfill');
  }

  return iniPromise;
}

/**
 * @param {!Window} global Global scope to adopt.
 * @param {function(!Object, !Object)|!ExtensionPayload} fnOrStruct
 * @param {function()} register
 */
function startRegisterOrChunk(global, fnOrStruct, register) {
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
 * Applies the runtime to a given global scope for a single-doc mode.
 * Multi frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 * @return {!Promise}
 */
export function adopt(global) {
  return adoptShared(global, (global) => {
    // Shared runtimes variables between both multi-doc and single-doc pages
    adoptServicesAndResources(global);

    return waitForBodyOpenPromise(global.document).then(() => {
      // Ensure that all declared extensions are marked and stubbed.
      stubElementsForDoc(global.AMP.ampdoc);
    });
  });
}

/**
 * Applies the runtime to a given global scope for a single-doc mode.
 * Multi frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 * @return {!Promise}
 */
export function adoptWithMultidocDeps(global) {
  return adoptShared(global, (global) => {
    // Shared runtimes variables between both multi-doc and single-doc pages
    adoptServicesAndResources(global);

    // Dependencies to the MultiDocManager
    adoptMultiDocDeps(global);

    return waitForBodyOpenPromise(global.document).then(() => {
      // Ensure that all declared extensions are marked and stubbed.
      stubElementsForDoc(global.AMP.ampdoc);
    });
  });
}

/**
 * Adopt shared runtimes variables between both multi-doc and single-doc pages
 * @param {!Window} global Global scope to adopt.
 */
function adoptServicesAndResources(global) {
  const {documentElement} = global.document;

  const ampdocService = Services.ampdocServiceFor(global);
  const ampdoc = ampdocService.getSingleDoc();
  global.AMP.ampdoc = ampdoc;

  const viewer = Services.viewerForDoc(documentElement);
  global.AMP.viewer = viewer;

  if (getMode().development) {
    global.AMP.toggleRuntime = viewer.toggleRuntime.bind(viewer);
    global.AMP.resources = Services.resourcesForDoc(documentElement);
  }

  const viewport = Services.viewportForDoc(documentElement);
  global.AMP.viewport = {};
  global.AMP.viewport.getScrollLeft = viewport.getScrollLeft.bind(viewport);
  global.AMP.viewport.getScrollWidth = viewport.getScrollWidth.bind(viewport);
  global.AMP.viewport.getWidth = viewport.getWidth.bind(viewport);
}

/**
 * Adopt MultiDocManager dependencies
 * @param {!Window} global Global scope to adopt.
 */
function adoptMultiDocDeps(global) {
  global.AMP.installAmpdocServices = installAmpdocServices.bind(null);
  if (mode.isEsm()) {
    const style = global.document.querySelector('style[amp-runtime]');
    global.AMP.combinedCss = style ? style.textContent : '';
  } else {
    global.AMP.combinedCss = ampDocCss + ampSharedCss;
  }
}

/**
 * Applies the runtime to a given global scope for shadow mode.
 * @param {!Window} global Global scope to adopt.
 * @return {!Promise}
 */
export function adoptShadowMode(global) {
  return adoptShared(global, (global, extensions) => {
    // shadow mode already adopted
    if (global.AMP.attachShadowDoc) {
      return Promise.resolve();
    }

    // Dependencies to the MultiDocManager
    adoptMultiDocDeps(global);

    const manager = new MultidocManager(
      global,
      Services.ampdocServiceFor(global),
      extensions,
      Services.timerFor(global)
    );

    /**
     * Registers a shadow root document via a fully fetched document.
     * @param {!Element} hostElement
     * @param {!Document} doc
     * @param {string} url
     * @param {!{[key: string]: string}=} opt_initParams
     * @return {!Object}
     */
    global.AMP.attachShadowDoc = manager.attachShadowDoc.bind(manager);

    /**
     * Registers a shadow root document via a stream.
     * @param {!Element} hostElement
     * @param {string} url
     * @param {!{[key: string]: string}=} opt_initParams
     * @return {!Object}
     */
    global.AMP.attachShadowDocAsStream =
      manager.attachShadowDocAsStream.bind(manager);

    return waitForBodyOpenPromise(global.document);
  });
}

/**
 * For a given extension, checks that its version is the same
 * as the version of the main AMP binary.
 * If yes, returns false and does nothing else.
 * If they are different, returns false, and initiates a load
 * of the respective extension via a versioned URL.
 *
 * @param {!Window} win
 * @param {function(!Object, !Object)|!ExtensionPayload} fnOrStruct
 * @return {boolean}
 */
function maybeLoadCorrectVersion(win, fnOrStruct) {
  if (getMode().localDev && isExperimentOn(win, 'disable-version-locking')) {
    return false;
  }
  if (typeof fnOrStruct == 'function') {
    return false;
  }

  if (mode.isEsm()) {
    // If we're in a module runtime, trying to execute a nomodule extension
    // simply remove the nomodule extension so that it is not executed.
    if (!fnOrStruct.m) {
      return true;
    }
  } else {
    // If we're in a nomodule runtime, trying to execute a module extension
    // simply remove the module extension so that it is not executed.
    if (fnOrStruct.m) {
      return true;
    }
  }

  const {v} = fnOrStruct;
  // This is non-obvious, but we only care about the release version,
  // not about the full rtv version, because these only differ
  // in the config that is fully determined by the primary binary.
  if (mode.version() == v) {
    return false;
  }
  Services.extensionsFor(win).reloadExtension(
    fnOrStruct.n,
    fnOrStruct.ev,
    fnOrStruct.l
  );
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
  Services.timerFor(win).delay(cb, 1);
}
