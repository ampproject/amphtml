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
import {
  addDocFactoryToExtension,
  addElementToExtension,
  addShadowRootFactoryToExtension,
  installExtensionsInShadowDoc,
  installExtensionsService,
  registerExtension,
} from './service/extensions-impl';
import {ampdocFor} from './ampdoc';
import {cssText} from '../build/css';
import {dev, user} from './log';
import {fromClassForDoc, getService, getServiceForDoc} from './service';
import {childElementsByTag} from './dom';
import {getMode} from './mode';
import {installActionServiceForDoc} from './service/action-impl';
import {installGlobalSubmitListener} from './document-submit';
import {installHistoryService} from './service/history-impl';
import {installImg} from '../builtins/amp-img';
import {installPixel} from '../builtins/amp-pixel';
import {installResourcesService} from './service/resources-impl';
import {installShadowDoc} from './service/ampdoc-impl';
import {installStandardActionsForDoc} from './service/standard-actions-impl';
import {installStyles, installStylesForShadowRoot} from './styles';
import {installTemplatesService} from './service/template-impl';
import {installUrlReplacementsService} from './service/url-replacements-impl';
import {installVideo} from '../builtins/amp-video';
import {installViewerService} from './service/viewer-impl';
import {installViewportService} from './service/viewport-impl';
import {installVsyncService} from './service/vsync-impl';
import {installXhrService} from './service/xhr-impl';
import {isExperimentOn, toggleExperiment} from './experiments';
import {platformFor} from './platform';
import {registerElement} from './custom-element';
import {registerExtendedElement} from './extended-element';
import {resourcesFor} from './resources';
import {setStyle} from './style';
import {viewerFor} from './viewer';
import {viewportFor} from './viewport';
import {waitForBody} from './dom';
import * as config from './config';


/** @const @private {string} */
const TAG = 'runtime';

/** @type {!Object} */
const elementsForTesting = {};


/**
 * Install runtime-level services.
 * @param {!Window} global Global scope to adopt.
 */
export function installRuntimeServices(global) {
  // TODO(dvoytenko, #3742): Split into runtime and ampdoc services.
  installViewerService(global);
  installViewportService(global);
  installHistoryService(global);
  installVsyncService(global);
  installResourcesService(global);
  installUrlReplacementsService(global);
  installXhrService(global);
  installTemplatesService(global);
  if (isExperimentOn(global, 'form-submit')) {
    installGlobalSubmitListener(global);
  }
}


/**
 * Install ampdoc-level services.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installAmpdocServices(ampdoc) {
  // TODO(dvoytenko, #3742): Split into runtime and ampdoc services.
  installActionServiceForDoc(ampdoc);
  installStandardActionsForDoc(ampdoc);
}


/**
 * Install builtins.
 * @param {!Window} global Global scope to adopt.
 */
export function installBuiltins(global) {
  installImg(global);
  installPixel(global);
  installVideo(global);
}


/**
 * Applies the runtime to a given global scope for a single-doc mode.
 * Multi frame support is currently incomplete.
 * @param {!Window} global Global scope to adopt.
 * @param {!{
 *     registerElement: function(
 *         !Window,
 *         !./service/extensions-impl.Extensions,
 *         string, !Function, (string|undefined)),
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
  const preregisteredExtensions = global.AMP || [];

  const extensions = installExtensionsService(global);
  installRuntimeServices(global);

  global.AMP = {
    win: global,
  };

  /** @const */
  global.AMP.config = config;

  /** @const */
  global.AMP.BaseElement = BaseElement;

  /** @const */
  global.AMP.BaseTemplate = BaseTemplate;

  /**
   * Registers an extended element and installs its styles.
   * @param {string} name
   * @param {!Function} implementationClass
   * @param {string=} opt_css Optional CSS to install with the component.
   *     Typically imported from generated CSS-in-JS file for each component.
   */
  global.AMP.registerElement = opts.registerElement.bind(null,
      global, extensions);

  /**
   * Registers an extended template.
   * @param {string} name
   * @param {!Function} implementationClass
   */
  global.AMP.registerTemplate = function(name, implementationClass) {
    registerExtendedTemplate(global, name, implementationClass);
  };

  /**
   * Registers an ampdoc service.
   * @param {string} name
   * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)=} opt_ctor
   * @param {function(!./service/ampdoc-impl.AmpDoc):!Object=} opt_factory
   */
  global.AMP.registerServiceForDoc = opts.registerServiceForDoc.bind(null,
      global, extensions);

  // Experiments.
  /** @const */
  global.AMP.isExperimentOn = isExperimentOn.bind(null, global);
  /** @const */
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
   * @param {function(!Object)|{n:string, f:function(!Object)}} fnOrStruct
   */
  function installExtension(fnOrStruct) {
    if (typeof fnOrStruct == 'function') {
      fnOrStruct(global.AMP);
    } else {
      registerExtension(extensions, fnOrStruct.n, fnOrStruct.f, global.AMP);
    }
  }

  /**
   * Registers a new custom element.
   * @param {function(!Object)|{n:string, f:function(!Object)}} fnOrStruct
   */
  global.AMP.push = function(fnOrStruct) {
    // Extensions are only processed once HEAD is complete.
    waitForBody(global.document, () => {
      installExtension(fnOrStruct);
    });
  };

  // Execute asynchronously scheduled elements.
  // Extensions are only processed once HEAD is complete.
  waitForBody(global.document, () => {
    for (let i = 0; i < preregisteredExtensions.length; i++) {
      const fnOrStruct = preregisteredExtensions[i];
      try {
        installExtension(fnOrStruct);
      } catch (e) {
        // Throw errors outside of loop in its own micro task to
        // avoid on error stopping other extensions from loading.
        dev.error(TAG, 'Extension failed: ', e, fnOrStruct.n);
      }
    }
    // Make sure we empty the array of preregistered extensions.
    // Technically this is only needed for testing, as everything should
    // go out of scope here, but just making sure.
    preregisteredExtensions.length = 0;
  });

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
    const viewer = viewerFor(global);

    /** @const */
    global.AMP.viewer = viewer;

    if (getMode().development) {
      /** @const */
      global.AMP.toggleRuntime = viewer.toggleRuntime.bind(viewer);
      /** @const */
      global.AMP.resources = resourcesFor(global);
    }

    const viewport = viewportFor(global);

    /** @const */
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
    /**
     * Registers a shadow root document.
     * @param {!Element} hostElement
     * @param {!Document} doc
     * @param {string} url
     */
    global.AMP.attachShadowDoc = prepareAndAttachShadowDoc.bind(null,
        global, extensions);
  });
}


/**
 * Registers an extended element and installs its styles in a single-doc mode.
 * @param {!Window} global
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {string} name
 * @param {!Function} implementationClass
 * @param {string=} opt_css
 */
function prepareAndRegisterElement(global, extensions,
    name, implementationClass, opt_css) {
  addElementToExtension(extensions, name, implementationClass);
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
 * @param {!Function} implementationClass
 * @param {string=} opt_css
 */
function prepareAndRegisterElementShadowMode(global, extensions,
    name, implementationClass, opt_css) {
  addElementToExtension(extensions, name, implementationClass);
  registerElementClass(global, name, implementationClass, opt_css);
  if (opt_css) {
    addShadowRootFactoryToExtension(extensions, shadowRoot => {
      installStylesForShadowRoot(shadowRoot, opt_css,
          /* isRuntimeCss */ false, name);
    });
  }
}


/**
 * Registration steps for an extension element in both single- and shadow-doc
 * modes.
 * @param {!Window} global
 * @param {string} name
 * @param {!Function} implementationClass
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
  // Resolve this extension's Service Promise.
  getService(global, name, emptyService);
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
  const ampdocService = ampdocFor(global);
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
  dev.assert((opt_ctor || opt_factory) && (!opt_ctor || !opt_factory),
      'Only one: a class or a factory must be specified');
  if (opt_ctor) {
    fromClassForDoc(ampdoc, name, opt_ctor);
  } else {
    getServiceForDoc(ampdoc, name, opt_factory);
  }
}


/**
 * Attaches the shadow doc and configures ampdoc for it.
 * @param {!Window} global
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {!Element} hostElement
 * @param {!Document} doc
 * @param {string} url
 */
function prepareAndAttachShadowDoc(global, extensions, hostElement, doc, url) {
  dev.fine(TAG, 'Attach shadow doc:', doc);
  const ampdocService = ampdocFor(global);

  hostElement.style.visibility = 'hidden';
  const shadowRoot = hostElement.createShadowRoot();
  shadowRoot.AMP = {};
  shadowRoot.AMP.url = url;

  const ampdoc = installShadowDoc(ampdocService, shadowRoot);
  dev.fine(TAG, 'Attach to shadow root:', shadowRoot, ampdoc);

  // Install runtime CSS.
  installStylesForShadowRoot(shadowRoot, cssText, /* opt_isRuntimeCss */ true);

  // Instal doc services.
  installAmpdocServices(ampdoc);

  // Install extensions.
  const extensionIds = mergeShadowHead(global, extensions, shadowRoot, doc);

  // Apply all doc extensions.
  installExtensionsInShadowDoc(extensions, ampdoc, extensionIds);

  // Append body.
  if (doc.body) {
    const body = global.document.importNode(doc.body, true);
    body.classList.add('amp-shadow');
    body.style.position = 'relative';
    shadowRoot.appendChild(body);
  }

  // TODO(dvoytenko): find a better and more stable way to make content visible.
  // E.g. integrate with dynamic classes. In shadow case specifically, we have
  // to wait for stubbing to complete, which may take awhile due to importNode.
  global.setTimeout(function() {
    hostElement.style.visibility = 'visible';
  }, 50);

  dev.fine(TAG, 'Shadow root initialization is done:', shadowRoot, ampdoc);
  return shadowRoot.AMP;
}


/**
 * Processes the contents of the shadow document's head.
 * @param {!Window} global
 * @param {!./service/extensions-impl.Extensions} extensions
 * @param {!ShadowRoot} shadowRoot
 * @param {!Document} doc
 * @return {!Array<string>}
 */
function mergeShadowHead(global, extensions, shadowRoot, doc) {
  const extensionIds = [];
  if (doc.head) {
    const parentLinks = {};
    childElementsByTag(global.document.head, 'link').forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        parentLinks[href] = true;
      }
    });

    for (let n = doc.head.firstElementChild; n; n = n.nextElementSibling) {
      const tagName = n.tagName;
      const name = n.getAttribute('name');
      const rel = n.getAttribute('rel');
      if (n.tagName == 'TITLE') {
        shadowRoot.AMP.title = n.textContent;
        dev.fine(TAG, '- set title: ', shadowRoot.AMP.title);
      } else if (tagName == 'META' && n.hasAttribute('charset')) {
        // Ignore.
      } else if (tagName == 'META' && name == 'viewport') {
        // Ignore.
      } else if (tagName == 'META') {
        // TODO(dvoytenko): copy other meta tags.
        dev.warn(TAG, 'meta ignored: ', n);
      } else if (tagName == 'LINK' && rel == 'canonical') {
        shadowRoot.AMP.canonicalUrl = n.getAttribute('href');
        dev.fine(TAG, '- set canonical: ', shadowRoot.AMP.canonicalUrl);
      } else if (tagName == 'LINK' && rel == 'stylesheet') {
        // This must be a font definition: no other stylesheets are allowed.
        const href = n.getAttribute('href');
        if (parentLinks[href]) {
          dev.fine(TAG, '- stylesheet already included: ', href);
        } else {
          parentLinks[href] = true;
          const el = global.document.createElement('link');
          el.setAttribute('rel', 'stylesheet');
          el.setAttribute('type', 'text/css');
          el.setAttribute('href', href);
          global.document.head.appendChild(el);
          dev.fine(TAG, '- import font to parent: ', href, el);
        }
      } else if (n.tagName == 'STYLE') {
        if (n.hasAttribute('amp-boilerplate')) {
          // Ignore.
          dev.fine(TAG, '- ignore boilerplate style: ', n);
        } else {
          shadowRoot.appendChild(global.document.importNode(n, true));
          dev.fine(TAG, '- import style: ', n);
        }
      } else if (n.tagName == 'SCRIPT' && n.hasAttribute('src')) {
        dev.fine(TAG, '- src script: ', n);
        const src = n.getAttribute('src');
        const isRuntime = src.indexOf('/amp.js') != -1 ||
            src.indexOf('/v0.js') != -1;
        const customElement = n.getAttribute('custom-element');
        const customTemplate = n.getAttribute('custom-template');
        if (isRuntime) {
          dev.fine(TAG, '- ignore runtime script: ', src);
        } else if (customElement || customTemplate) {
          // This is an extension.
          extensions.loadExtension(customElement || customTemplate);
          dev.fine(TAG, '- load extension: ', customElement || customTemplate);
          if (customElement) {
            extensionIds.push(customElement);
          }
        } else {
          user.error(TAG, '- unknown script: ', n, src);
        }
      } else if (n.tagName == 'SCRIPT') {
        // Non-src version of script.
        const type = n.getAttribute('type') || 'application/javascript';
        if (type.indexOf('javascript') == -1) {
          shadowRoot.appendChild(global.document.importNode(n, true));
          dev.fine(TAG, '- non-src script: ', n);
        } else {
          user.error(TAG, '- unallowed inline javascript: ', n);
        }
      } else if (n.tagName == 'NOSCRIPT') {
        // Ignore.
      } else {
        user.error(TAG, '- UNKNOWN head element:', n);
      }
    }
  }
  return extensionIds;
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
    const element = elementsForTesting[key];
    if (element.css) {
      installStyles(win.document, element.css, () => {
        registerElement(win, element.name, element.implementationClass);
      }, false, element.name);
    } else {
      registerElement(win, element.name, element.implementationClass);
    }
  }
}
