/**
 * @typedef {{
 *   mediaQueryList: MediaQueryList,
 *   value: string,
 * }}
 */
let MediaQueriesListAndValueDef;

/**
 * @param {string} value
 * @return {!Array<!MediaQueriesListAndValueDef>}
 */
function getMediaQueryListsAndValues(value) {
  return (
    value
      .split(',')
      .map((part) => {
        // Find the value portion by looking at the end.
        const result = /[a-z0-9.]+$/.exec(part);
        if (!result) {
          return;
        }

        const {index} = result;
        const value = part.slice(index);
        // The media query is everything before the value.
        const mediaQuery = part.slice(0, index).trim();
        const mediaQueryList = window.matchMedia(mediaQuery);

        return {
          mediaQueryList,
          value,
        };
      })
      // Remove any items that did not match the regex above and are
      // undefined as a result.
      .filter(Boolean)
  );
}

/**
 * @param {!Array<!MediaQueriesListAndValueDef>} mediaQueryListsAndValues
 * @return {string} The value for the first matching MediaQuery, or an empty
 *    string if none match.
 */
function getMatchingValue(mediaQueryListsAndValues) {
  for (let i = 0; i < mediaQueryListsAndValues.length; i++) {
    const {mediaQueryList, value} = mediaQueryListsAndValues[i];
    if (mediaQueryList.matches) {
      return value;
    }
  }

  return '';
}

/**
 * Given a string of media query, value pairs, gets the value for the first
 * matching media query, Some examples of the string:
 *
 * * "(min-width: 600px) true, false"
 * * "(min-width: 600px) 5, (min-width: 500px) 4, 3"
 * * "(min-width: 600px) and (min-height: 800px) 5, 3"
 * * "false"
 * * "(min-width: 600px) true"
 *
 * @param {string} str The media query/value string.
 * @return {*} TODO(#23582): Specify return type
 */
export function getResponsiveAttributeValue(str) {
  return getMatchingValue(getMediaQueryListsAndValues(str));
}

/**
 * Manages attributes that can respond to media queries. Uses a provided config
 * Object invoke callback functions when the matching value changes. When an
 * attribute changes, `updateAttribute` should be called with the name of the
 * attribute along with the responsive MediaQuery/value pairs. This is a comma
 * separated list of media queries followed by values see
 * {@link getResponsiveAttributeValue} for details on the format.
 *
 * The first value for the first media query in the list that matches is used.
 * If there are no matching media queries, the value is an empty string.
 */
export class ResponsiveAttributes {
  /**
   * @param {!{[key: string]: function(string)}} config A mapping of attribute
   *    names to functions that should handle them.
   */
  constructor(config) {
    /** @private @const */
    this.config_ = config;

    /** @private @const {!{[key: string]: string}} */
    this.existingValuesMap_ = {};

    /** @private @const {!{[key: string]: !Array<!MediaQueriesListAndValueDef>}} */
    this.mediaQueryListsAndValues_ = {};
  }

  /**
   * Updates an attribute, calling the configured attribute handler with the
   * new matching value, if it has changed. Whenever the matching media query
   * changes, the matching value will be checked to see if it has changed. If
   * so, the attribute handler is called.
   * @param {string} name The name of the attribute.
   * @param {string} newValue The new value for the attribute.
   */
  updateAttribute(name, newValue) {
    // Not an attribute we are managing.
    if (!this.config_[name]) {
      return;
    }

    const prevMqlv = this.mediaQueryListsAndValues_[name];
    // Need to explicitly clear the onchange. Otherwise the underlying
    // MediqaQueryLists will still be active with their callbacks.
    if (prevMqlv) {
      this.setOnchange_(prevMqlv, null);
    }

    const mqlv = getMediaQueryListsAndValues(newValue);
    const notifyIfChanged = () => {
      this.notifyIfChanged_(name, getMatchingValue(mqlv));
    };
    // Listen for future changes.
    this.setOnchange_(mqlv, notifyIfChanged);
    // Make sure to run once with the current value.
    notifyIfChanged();
    this.mediaQueryListsAndValues_[name] = mqlv;
  }

  /**
   * Notifies the configured handler function if the value of the attribute
   * has changed since the previous call.
   * @param {string} name The name of the attribute.
   * @param {string} value The value of the attribute.
   * @private
   */
  notifyIfChanged_(name, value) {
    if (this.existingValuesMap_[name] === value) {
      return;
    }

    const fn = this.config_[name];
    if (fn) {
      fn(value);
    }

    this.existingValuesMap_[name] = value;
  }

  /**
   * Sets the onchange for each of the associated MediaQueryLists.
   * @param {!Array<!MediaQueriesListAndValueDef>} mediaQueryListsAndValues
   * @param {?function()} fn
   * @private
   */
  setOnchange_(mediaQueryListsAndValues, fn) {
    mediaQueryListsAndValues.forEach((mediaQueryDef) => {
      const {mediaQueryList} = mediaQueryDef;
      mediaQueryList.onchange = fn;
    });
  }
}
