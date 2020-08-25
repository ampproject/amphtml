/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

// TODO(#22733): remove when ampdoc-fie is launched.

import {LEGACY_ELEMENTS, stubLegacyElements} from './service/extensions-impl';
import {Services} from './services';
import {cssText as ampSharedCss} from '../build/ampshared.css';
import {
  copyElementToChildWindow,
  stubElementIfNotKnown,
  upgradeOrRegisterElement,
} from './service/custom-element-registry';
import {dev} from './log';
import {
  getAmpdoc,
  installServiceInEmbedIfEmbeddable,
  setParentWindow,
} from './service';
import {install as installCustomElements} from './polyfills/custom-elements';
import {install as installDOMTokenList} from './polyfills/domtokenlist';
import {install as installDocContains} from './polyfills/document-contains';
import {installForChildWin as installIntersectionObserver} from './polyfills/intersection-observer';
import {installStylesLegacy} from './style-installer';
import {installTimerInEmbedWindow} from './service/timer-impl';
import {toWin} from './types';

/**
 * Static installers that can be easily stubbed for tests. Exposed via
 * a static class to simply stubbing in tests.
 */
export class LegacyInstaller {
  /**
   * Install extensions in the child window (friendly iframe).
   * It injects polyfills, CSS for AMP runtime, standard services, built-in
   * elements and stubs all other elements.
   * @param {!./service/extensions-impl.Extensions} extensions
   * @param {!Window} childWin
   * @param {!Array<string>} extensionIds
   * @param {function(!Window, ?./service/ampdoc-impl.AmpDoc=)|undefined} preinstallCallback
   * @param {function()} startRender
   * @param {function(!Promise)=} opt_installComplete
   * @return {!Promise}
   * @visibleForTesting
   */
  static installExtensionsInChildWindow(
    extensions,
    childWin,
    extensionIds,
    preinstallCallback,
    startRender,
    opt_installComplete
  ) {
    const getDelayPromise = getDelayPromiseProducer();
    return getDelayPromise(undefined)
      .then(() =>
        preInstallExtensionsInChildWindow(
          extensions,
          childWin,
          extensionIds,
          preinstallCallback
        )
      )
      .then(() => {
        // Ready to be shown.
        startRender();
      })
      .then(() => {
        if (!childWin.frameElement) {
          return;
        }
        // Intentionally do not wait for the full installation to complete.
        // It's enough of initialization done to return the embed.
        const promise = installExtensionsInChildWindow(
          extensions,
          childWin,
          extensionIds
        );
        if (opt_installComplete) {
          opt_installComplete(promise);
        }
      });
  }
}

/**
 * Adopt predefined core services for the child window (friendly iframe).
 * @param {!Window} childWin
 * @visibleForTesting
 */
export function installStandardServicesInEmbed(childWin) {
  const frameElement = dev().assertElement(
    childWin.frameElement,
    'frameElement not found for embed'
  );
  const standardServices = [
    // The order of service adoptations is important.
    Services.urlForDoc(frameElement),
    Services.actionServiceForDoc(frameElement),
    Services.standardActionsForDoc(frameElement),
    Services.navigationForDoc(frameElement),
  ];
  const ampdoc = getAmpdoc(frameElement);
  standardServices.forEach((service) => {
    // Static functions must be invoked on the class, not the instance.
    service.constructor.installInEmbedWindow(childWin, ampdoc);
  });
  installTimerInEmbedWindow(childWin);
}

/**
 * Prepare for installing extensions in the child window (friendly iframe).
 * It injects polyfills, CSS for AMP runtime, standard services, built-in
 * elements and stubs all other elements.
 * The pre-install callback, if specified, is executed after polyfills have been configured.
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {!Window} childWin
 * @param {!Array<string>} extensionIds
 * @param {function(!Window, ?./service/ampdoc-impl.AmpDoc=)|undefined} preinstallCallback
 * @return {!Promise}
 */
function preInstallExtensionsInChildWindow(
  extensions,
  childWin,
  extensionIds,
  preinstallCallback
) {
  const topWin = extensions.win;
  const parentWin = toWin(childWin.frameElement.ownerDocument.defaultView);
  setParentWindow(childWin, parentWin);
  const getDelayPromise = getDelayPromiseProducer();

  return getDelayPromise(undefined)
    .then(() => {
      // Install necessary polyfills.
      installPolyfillsInChildWindow(parentWin, childWin);
    })
    .then(getDelayPromise)
    .then(() => {
      // Install runtime styles.
      installStylesLegacy(
        childWin.document,
        ampSharedCss,
        /* callback */ null,
        /* opt_isRuntimeCss */ true,
        /* opt_ext */ 'amp-runtime'
      );
    })
    .then(getDelayPromise)
    .then(() => {
      // Run pre-install callback.
      if (preinstallCallback) {
        preinstallCallback(childWin);
      }
    })
    .then(getDelayPromise)
    .then(() => {
      // Install embeddable standard services.
      installStandardServicesInEmbed(childWin);
    })
    .then(getDelayPromise)
    .then(() => {
      // Install built-ins elements.
      copyBuiltinElementsToChildWindow(topWin, childWin);
      stubLegacyElements(childWin);
    })
    .then(getDelayPromise)
    .then(() => {
      extensionIds.forEach((extensionId) => {
        // This will extend automatic upgrade of custom elements from top
        // window to the child window.
        if (!LEGACY_ELEMENTS.includes(extensionId)) {
          stubElementIfNotKnown(childWin, extensionId);
        }
      });
    })
    .then(getDelayPromise);
}

/**
 * Install non-built-in extensions in the child window (friendly iframe).
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {!Window} childWin
 * @param {!Array<string>} extensionIds
 * @return {!Promise}
 * @visibleForTesting
 */
function installExtensionsInChildWindow(extensions, childWin, extensionIds) {
  const getDelayPromise = getDelayPromiseProducer();

  const promises = [];
  extensionIds.forEach((extensionId) => {
    const promise = getDelayPromise(undefined)
      .then(() => extensions.preloadExtension(extensionId))
      .then((extension) => {
        // Adopt embeddable extension services.
        /** @type {!Array} */ (extension.services).forEach((service) => {
          installServiceInEmbedIfEmbeddable(childWin, service.serviceClass);
        });

        // Adopt the custom elements.
        let elementPromises = null;
        for (const elementName in extension.elements) {
          const elementDef = extension.elements[elementName];
          const elementPromise = new Promise((resolve) => {
            if (elementDef.css) {
              installStylesLegacy(
                childWin.document,
                elementDef.css,
                /* completeCallback */ resolve,
                /* isRuntime */ false,
                extensionId
              );
            } else {
              resolve();
            }
          }).then(() => {
            upgradeOrRegisterElement(
              childWin,
              elementName,
              elementDef.implementationClass
            );
          });
          if (elementPromises) {
            elementPromises.push(elementPromise);
          } else {
            elementPromises = [elementPromise];
          }
        }
        if (elementPromises) {
          return Promise.all(elementPromises).then(() => extension);
        }
        return extension;
      });
    promises.push(promise);
  });
  return Promise.all(promises);
}

/**
 * @return {function(*): !Promise<*>}
 */
function getDelayPromiseProducer() {
  return (val) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(val), 1);
    });
}

/**
 * Copy builtins to a child window.
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
function copyBuiltinElementsToChildWindow(parentWin, childWin) {
  copyElementToChildWindow(parentWin, childWin, 'amp-img');
  copyElementToChildWindow(parentWin, childWin, 'amp-pixel');
}

/**
 * Install polyfills in the child window (friendly iframe).
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
function installPolyfillsInChildWindow(parentWin, childWin) {
  installDocContains(childWin);
  installDOMTokenList(childWin);
  // The anonymous class parameter allows us to detect native classes vs
  // transpiled classes.
  if (!IS_SXG) {
    installCustomElements(childWin, class {});
    installIntersectionObserver(parentWin, childWin);
  }
}
