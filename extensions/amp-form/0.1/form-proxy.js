import {getWin} from '#core/window';

import {Services} from '#service';

import {dev, devAssert} from '#utils/log';

/**
 * denylisted properties. Used mainly fot testing.
 * @type {?Array<string>}
 */
let denylistedProperties = null;

/**
 * @param {?Array<string>} properties
 * @visibleForTesting
 */
export function setDenylistedPropertiesForTesting(properties) {
  denylistedProperties = properties;
}

/**
 * Creates a proxy object `form.$p` that proxies all of the methods and
 * properties to the original DOM APIs. This is to work around the problematic
 * forms feature where inputs mask DOM APIs.
 *
 * E.g. a `<input id="id">` will override `form.id` from the original DOM API.
 * Form proxy will give access to the original `id` value via `form.$p.id`.
 *
 * See https://medium.com/@dvoytenko/solving-conflicts-between-form-inputs-and-dom-api-535c45333ae4
 *
 * @param {!HTMLFormElement} form
 * @return {!Object}
 */
export function installFormProxy(form) {
  const constr = getFormProxyConstr(getWin(form));
  const proxy = new constr(form);
  if (!('action' in proxy)) {
    setupLegacyProxy(form, proxy);
  }
  form['$p'] = proxy;
  return proxy;
}

/**
 * @param {!Window} win
 * @return {function(new:Object, !HTMLFormElement)}
 */
function getFormProxyConstr(win) {
  if (!win.FormProxy) {
    win.FormProxy = createFormProxyConstr(win);
  }
  return win.FormProxy;
}

/**
 * @param {!Window} win
 * @return {function(new:Object, !HTMLFormElement)}
 */
function createFormProxyConstr(win) {
  /**
   * @param {!HTMLFormElement} form
   * @constructor
   */
  function FormProxy(form) {
    /** @private @const {!HTMLFormElement} */
    this.form_ = form;
  }

  const FormProxyProto = FormProxy.prototype;
  const {Object} = win;
  const ObjectProto = Object.prototype;

  // Hierarchy:
  //   Node  <==  Element <== HTMLElement <== HTMLFormElement
  //   EventTarget  <==  HTMLFormElement
  const baseClasses = [win.HTMLFormElement, win.EventTarget];
  const inheritance = baseClasses.reduce((all, klass) => {
    let proto = klass && klass.prototype;
    while (proto && proto !== ObjectProto) {
      if (all.indexOf(proto) >= 0) {
        break;
      }
      all.push(proto);
      proto = Object.getPrototypeOf(proto);
    }

    return all;
  }, []);

  /** @type {!Array} */ (inheritance).forEach((proto) => {
    for (const name in proto) {
      const property = win.Object.getOwnPropertyDescriptor(proto, name);
      if (
        !property ||
        // Exclude constants.
        name.toUpperCase() == name ||
        // Exclude on-events.
        name.startsWith('on') ||
        // Exclude properties that already been created.
        ObjectProto.hasOwnProperty.call(FormProxyProto, name) ||
        // Exclude some properties. Currently only used for testing.
        (denylistedProperties && denylistedProperties.includes(name))
      ) {
        continue;
      }
      if (typeof property.value == 'function') {
        // A method call. Call the original prototype method via `call`.
        const method = property.value;
        FormProxyProto[name] = function () {
          return method.apply(
            /** @type {!FormProxy} */ (this).form_,
            arguments
          );
        };
      } else {
        // A read/write property. Call the original prototype getter/setter.
        const spec = {};
        if (property.get) {
          spec.get = function () {
            return property.get.call(/** @type {!FormProxy} */ (this).form_);
          };
        }
        if (property.set) {
          spec.set = function (v) {
            return property.set.call(/** @type {!FormProxy} */ (this).form_, v);
          };
        }
        win.Object.defineProperty(FormProxyProto, name, spec);
      }
    }
  });

  return FormProxy;
}

/**
 * This is a very heavy-handed way to support browsers that do not have
 * properties defined in the prototype chain. Specifically, this is necessary
 * for Chrome 45 and under.
 *
 * See https://developers.google.com/web/updates/2015/04/DOM-attributes-now-on-the-prototype-chain
 * for more info.
 *
 * @param {!HTMLFormElement} form
 * @param {!Object} proxy
 */
function setupLegacyProxy(form, proxy) {
  const win = form.ownerDocument.defaultView;
  const proto = win.HTMLFormElement.prototype.cloneNode.call(
    form,
    /* deep */ false
  );
  for (const name in proto) {
    if (
      name in proxy ||
      // Exclude constants.
      name.toUpperCase() == name ||
      // Exclude on-events.
      name.startsWith('on')
    ) {
      continue;
    }
    const desc = LEGACY_PROPS[name];
    const current = form[name];
    if (desc) {
      if (desc.access == LegacyPropAccessType.READ_ONCE) {
        // A property such as `style`. The only way is to read this value
        // once and use it for all subsequent calls.
        let actual;
        if (current && current.nodeType) {
          // The overriding input, if present, has to be removed and re-added
          // (renaming does NOT work). Completely insane, I know.
          const element = dev().assertElement(current);
          const {nextSibling, parentNode: parent} = element;
          parent.removeChild(element);
          try {
            actual = form[name];
          } finally {
            parent.insertBefore(element, nextSibling);
          }
        } else {
          actual = current;
        }
        Object.defineProperty(proxy, name, {
          get() {
            return actual;
          },
        });
      } else if (desc.access == LegacyPropAccessType.ATTR) {
        // An attribute-based property. We can use DOM API to read and write
        // with a minimal type conversion.
        const attr = desc.attr || name;
        Object.defineProperty(proxy, name, {
          get() {
            const value = proxy.getAttribute(attr);
            if (value == null && desc.def !== undefined) {
              return desc.def;
            }
            if (desc.type == LegacyPropDataType.BOOL) {
              return value === 'true';
            }
            if (desc.type == LegacyPropDataType.TOGGLE) {
              return value != null;
            }
            if (desc.type == LegacyPropDataType.URL) {
              // URLs, e.g. in `action` attribute are resolved against the
              // document's base.
              const str = /** @type {string} */ (value || '');
              return Services.urlForDoc(form).parse(str).href;
            }
            return value;
          },
          set(value) {
            if (desc.type == LegacyPropDataType.TOGGLE) {
              if (value) {
                value = '';
              } else {
                value = null;
              }
            }
            if (value != null) {
              proxy.setAttribute(attr, value);
            } else {
              proxy.removeAttribute(attr);
            }
          },
        });
      } else {
        devAssert(false, 'unknown property access type: %s', desc.access);
      }
    } else {
      // Not a known property - proxy directly.
      Object.defineProperty(proxy, name, {
        get() {
          return form[name];
        },
        set(value) {
          form[name] = value;
        },
      });
    }
  }
}

/**
 * @enum {number}
 */
const LegacyPropAccessType = {
  ATTR: 1,
  READ_ONCE: 2,
};

/**
 * @enum {number}
 */
const LegacyPropDataType = {
  URL: 1,
  BOOL: 2,
  TOGGLE: 3,
};

/**
 * @const {!{[key: string]: {
 *   access: !LegacyPropAccessType,
 *   attr: (string|undefined),
 *   type: (LegacyPropDataType|undefined),
 *   def: *,
 * }}}
 */
const LEGACY_PROPS = {
  'acceptCharset': {
    access: LegacyPropAccessType.ATTR,
    attr: 'accept-charset',
  },
  'accessKey': {
    access: LegacyPropAccessType.ATTR,
    attr: 'accesskey',
  },
  'action': {
    access: LegacyPropAccessType.ATTR,
    type: LegacyPropDataType.URL,
  },
  'attributes': {
    access: LegacyPropAccessType.READ_ONCE,
  },
  'autocomplete': {
    access: LegacyPropAccessType.ATTR,
    def: 'on',
  },
  'children': {
    access: LegacyPropAccessType.READ_ONCE,
  },
  'dataset': {
    access: LegacyPropAccessType.READ_ONCE,
  },
  'dir': {
    access: LegacyPropAccessType.ATTR,
  },
  'draggable': {
    access: LegacyPropAccessType.ATTR,
    type: LegacyPropDataType.BOOL,
    def: false,
  },
  'elements': {
    access: LegacyPropAccessType.READ_ONCE,
  },
  'encoding': {
    access: LegacyPropAccessType.READ_ONCE,
  },
  'enctype': {
    access: LegacyPropAccessType.ATTR,
  },
  'hidden': {
    access: LegacyPropAccessType.ATTR,
    type: LegacyPropDataType.TOGGLE,
    def: false,
  },
  'id': {
    access: LegacyPropAccessType.ATTR,
    def: '',
  },
  'lang': {
    access: LegacyPropAccessType.ATTR,
  },
  'localName': {
    access: LegacyPropAccessType.READ_ONCE,
  },
  'method': {
    access: LegacyPropAccessType.ATTR,
    def: 'get',
  },
  'name': {
    access: LegacyPropAccessType.ATTR,
  },
  'noValidate': {
    access: LegacyPropAccessType.ATTR,
    attr: 'novalidate',
    type: LegacyPropDataType.TOGGLE,
    def: false,
  },
  'prefix': {
    access: LegacyPropAccessType.READ_ONCE,
  },
  'spellcheck': {
    access: LegacyPropAccessType.ATTR,
  },
  'style': {
    access: LegacyPropAccessType.READ_ONCE,
  },
  'target': {
    access: LegacyPropAccessType.ATTR,
    def: '',
  },
  'title': {
    access: LegacyPropAccessType.ATTR,
  },
  'translate': {
    access: LegacyPropAccessType.ATTR,
  },
};
