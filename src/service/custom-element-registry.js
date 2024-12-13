import {Services} from '#service';

import {userAssert} from '#utils/log';

import {extensionScriptsInNode} from './extension-script';

import {
  createCustomElementClass,
  markUnresolvedElements,
  stubbedElements,
} from '../custom-element';
import {ElementStub} from '../element-stub';
import {reportError} from '../error-reporting';

/** @type {!WeakMap<!./service/ampdoc-impl.AmpDoc, boolean>} */
const docInitializedMap = new WeakMap();

/**
 * @param {!Window} win
 * @return {!{[key: string]: typeof ../base-element.BaseElement}}
 */
function getExtendedElements(win) {
  if (!win.__AMP_EXTENDED_ELEMENTS) {
    win.__AMP_EXTENDED_ELEMENTS = {};
  }
  return win.__AMP_EXTENDED_ELEMENTS;
}

/**
 * Registers an element. Upgrades it if has previously been stubbed.
 * @param {!Window} win
 * @param {string} name
 * @param {typeof ../base-element.BaseElement} toClass
 */
export function upgradeOrRegisterElement(win, name, toClass) {
  const waitPromise = waitReadyForUpgrade(win, toClass);
  if (waitPromise) {
    waitPromise.then(() => upgradeOrRegisterElementReady(win, name, toClass));
  } else {
    upgradeOrRegisterElementReady(win, name, toClass);
  }
}

/**
 * Registers an element. Upgrades it if has previously been stubbed.
 * @param {!Window} win
 * @param {string} name
 * @param {typeof ../base-element.BaseElement} toClass
 */
function upgradeOrRegisterElementReady(win, name, toClass) {
  const knownElements = getExtendedElements(win);
  if (!knownElements[name]) {
    registerElement(win, name, toClass);
    return;
  }
  if (knownElements[name] == toClass) {
    // Already registered this instance.
    return;
  }
  userAssert(
    knownElements[name] == ElementStub,
    '%s is already registered. The script tag for ' +
      '%s is likely included twice in the page.',
    name,
    name
  );
  knownElements[name] = toClass;
  for (let i = 0; i < stubbedElements.length; i++) {
    const element = stubbedElements[i];
    // There are 3 possible states here:
    // 1. We never made the stub because the extended impl. loaded first.
    //    In that case the element won't be in the array.
    // 2. We made a stub but the browser didn't attach it yet. In
    //    that case we don't need to upgrade but simply switch to the new
    //    implementation.
    // 3. A stub was attached. We upgrade which means we replay the
    //    implementation.
    if (
      element.tagName.toLowerCase() == name &&
      element.ownerDocument.defaultView == win
    ) {
      tryUpgradeElement(element, toClass);
      // Remove element from array.
      stubbedElements.splice(i--, 1);
    }
  }
}

/**
 * This method should not be inlined to prevent TryCatch deoptimization.
 * @param {Element} element
 * @param {typeof ../base-element.BaseElement} toClass
 * @private
 */
function tryUpgradeElement(element, toClass) {
  try {
    element.upgrade(toClass);
  } catch (e) {
    reportError(e, element);
  }
}

/**
 * Ensures that the element is ready for upgrade. Either returns immediately
 * with `undefined` indicating that no waiting is necessary, or returns a
 * promise that will resolve when the upgrade can proceed.
 *
 * @param {!Window} win
 * @param {typeof ../base-element.BaseElement} elementClass
 * @return {!Promise|undefind}
 */
function waitReadyForUpgrade(win, elementClass) {
  // Make sure the polyfill is installed for Shadow DOM if element needs it.
  if (elementClass.requiresShadowDom() && !win.Element.prototype.attachShadow) {
    const extensions = Services.extensionsFor(win);
    return extensions.importUnwrapped(win, 'amp-shadow-dom-polyfill');
  }
}

/**
 * Stub extended elements missing an implementation. It can be called multiple
 * times and on partial document in order to start stubbing as early as
 * possible.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function stubElementsForDoc(ampdoc) {
  const extensions = extensionScriptsInNode(ampdoc.getHeadNode());
  extensions.forEach(({extensionId, extensionVersion, script}) => {
    ampdoc.declareExtension(extensionId, extensionVersion);
    script.addEventListener('error', () => markUnresolvedElements(extensionId));
    stubElementIfNotKnown(ampdoc.win, extensionId);
  });
  if (ampdoc.isBodyAvailable()) {
    ampdoc.setExtensionsKnown();
  }
}

/**
 * Stub element if not yet known.
 * @param {!Window} win
 * @param {string} name
 */
export function stubElementIfNotKnown(win, name) {
  const knownElements = getExtendedElements(win);
  if (!knownElements[name]) {
    registerElement(win, name, ElementStub);
  }
}

/**
 * Copies the specified element to child window (friendly iframe). This way
 * all implementations of the AMP elements are shared between all friendly
 * frames.
 * @param {!Window} parentWin
 * @param {!Window} childWin
 * @param {string} name
 */
export function copyElementToChildWindow(parentWin, childWin, name) {
  const toClass = getExtendedElements(parentWin)[name];
  registerElement(childWin, name, toClass || ElementStub);
}

/**
 * Registers a new custom element with its implementation class.
 * @param {!Window} win The window in which to register the elements.
 * @param {string} name Name of the custom element
 * @param {typeof ../base-element.BaseElement} implementationClass
 */
export function registerElement(win, name, implementationClass) {
  const knownElements = getExtendedElements(win);
  knownElements[name] = implementationClass;
  const klass = createCustomElementClass(win, elementConnectedCallback);
  win['customElements'].define(name, klass);
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!AmpElement} element
 * @param {?(typeof BaseElement)} implementationClass
 * @visibleForTesting
 */
export function elementConnectedCallback(ampdoc, element, implementationClass) {
  // Make sure that the ampdoc has already been stubbed.
  if (!docInitializedMap.has(ampdoc)) {
    docInitializedMap.set(ampdoc, true);
    stubElementsForDoc(ampdoc);
  }

  // Load the pre-stubbed legacy extension if needed.
  const extensionId = element.localName;
  if (!implementationClass && !ampdoc.declaresExtension(extensionId)) {
    Services.extensionsFor(ampdoc.win).installExtensionForDoc(
      ampdoc,
      extensionId,
      // The legacy auto-extensions are always 0.1.
      '0.1'
    );
  }
}

/**
 * In order to provide better error messages we only allow to retrieve
 * services from other elements if those elements are loaded in the page.
 * This makes it possible to mark an element as loaded in a test.
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @visibleForTesting
 */
export function markElementScheduledForTesting(win, elementName) {
  const knownElements = getExtendedElements(win);
  if (!knownElements[elementName]) {
    knownElements[elementName] = ElementStub;
  }
}

/**
 * Resets our scheduled elements.
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @visibleForTesting
 */
export function resetScheduledElementForTesting(win, elementName) {
  if (win.__AMP_EXTENDED_ELEMENTS) {
    delete win.__AMP_EXTENDED_ELEMENTS[elementName];
  }
}

/**
 * Returns a currently registered element class.
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @return {?function()}
 * @visibleForTesting
 */
export function getElementClassForTesting(win, elementName) {
  const knownElements = win.__AMP_EXTENDED_ELEMENTS;
  return (knownElements && knownElements[elementName]) || null;
}
