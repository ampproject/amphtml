importScripts('./validator_wasm.js');

const globals = {};
globals.ampCacheBgcolor = '#ffffff';
globals.ampCacheIconPrefix = 'amp-link';
globals.ampCacheTitle = chrome.i18n.getMessage('pageFromAmpCacheTitle');
globals.devModeAmpBgcolor = '#fcba03';
globals.devModeAmpIconPrefix = 'dev';
globals.devModeAmpTitle = chrome.i18n.getMessage('pageInDevModeTitle');
globals.invalidAmpBgcolor = '#f44336';
globals.invalidAmpIconPrefix = 'invalid';
globals.invalidAmpTitle = chrome.i18n.getMessage('pageFailsValidationTitle');
globals.linkToAmpBgColor = '#ffffff';
globals.linkToAmpIconPrefix = 'amp-link';
globals.linkToAmpTitle = chrome.i18n.getMessage('pageHasAmpAltTitle');
globals.userAgentHeader = 'X-AMP-Validator-UA';
globals.validAmpBgcolor = '#ffd700';
globals.validAmpIconPrefix = 'valid';
globals.validAmpTitle = chrome.i18n.getMessage('pagePassesValidationTitle');
globals.validatorNotPresentBadge = chrome.i18n.getMessage('validatorNotPresentBadge');
globals.validatorNotPresentBgColor = '#b71c1c';
globals.validatorNotPresentIconPrefix = 'validator-not-present';
globals.validatorNotPresentPopup = 'popup-validator-not-present.build.html';
globals.validatorNotPresentTitle = chrome.i18n.getMessage('validatorNotPresentTitle');
globals.validatorPopup = 'popup-validator.build.html';

/**
 * Format a hex value (HTML colors such as #ffffff) as an RGBA.
 *
 * @param {string} hex
 * @return {string} rgba
 */
function hex2rgba(hex) {
  // Remove the '#' char if necessary.
  if (hex.charAt(0) === '#') { hex = hex.slice(1); }
  hex = hex.toUpperCase();
  let hexAlpha = '0123456789ABCDEF', value = new Array(4), k = 0, int1, int2, i;
  for (i = 0; i < 6; i += 2) {
    int1 = hexAlpha.indexOf(hex.charAt(i));
    int2 = hexAlpha.indexOf(hex.charAt(i + 1));
    value[k] = (int1 * 16) + int2;
    k += 1;
  }
  value[3] = 255;
  return value;
}

/**
 * Returns a dictionary of the number of errors and warnings that occur
 * in the set of ValidationErrors.
 *
 * @param {Array<ValidationError>} errors Validation errors and/or warnings.
 * @return {Object}
 */
function getErrorSeverityCounts(errors) {
  let numErrors = 0;
  let numWarnings = 0;
  for (const error in errors) {
    if (errors[error].severity == 'ERROR') {numErrors += 1;}
    if (errors[error].severity == 'WARNING') {numWarnings += 1;}
  }
  return {'ERROR': numErrors, 'WARNING': numWarnings};
}

/**
 * Returns the number of errors that occur in the set of ValidationErrors.
 *
 *
 * @param {Array<ValidationError>} errors Validation errors and/or warnings.
 * @return {number}
 */
function getNumberOfErrors(errors) {
  return getErrorSeverityCounts(errors)['ERROR'];
}

/**
 * Returns the number of warnings that occur in the set of ValidationErrors.
 *
 * @param {Array<ValidationError>} errors Validation errors and/or warnings.
 * @return {number}
 */
function getNumberOfWarnings(errors) {
  return getErrorSeverityCounts(errors)['WARNING'];
}

/**
 * Inspects ValidationResult to discover if the document has only one
 * error which states DEV_MODE_ONLY. See #24176 for more context.
 *
 * @param {!Object<!ValidationResult>} validationResult
 * @return {boolean}
 */
function onlyErrorIsDevMode(validationResult) {
  return ((validationResult.errors.length == 1) &&
      (validationResult.errors[0].code == 'DEV_MODE_ONLY'));
}

/**
 * Handles actions to be taken for pages that are on an AMP Cache.
 *
 * @param {integer} tabId ID of a tab.
 * @param {string} ampHref The URL of the AMP page.
 */
function handleAmpCache(tabId, ampHref) {
  updateTabStatus(
      tabId, globals.ampCacheIconPrefix, globals.ampCacheTitle,
      '' /*text*/, globals.ampCacheBgcolor);
  chrome.action.onClicked.addListener(
      function loadAmpHref(tab) {
        if (tab.id == tabId) {
          chrome.action.onClicked.removeListener(loadAmpHref);
          chrome.tabs.sendMessage(tab.id,
              {'loadAmp': true, 'ampHref': ampHref});
        }
      }
  );
}

/**
 * Handles actions to be taken for AMP pages that are in Dev Mode.
 *
 * @param {integer} tabId ID of a tab.
 */
function handleAmpDevMode(tabId) {
  updateTabStatus(
      tabId, globals.devModeAmpIconPrefix, globals.devModeAmpTitle,
      '' /*text*/, globals.devModeAmpBgColor);
  updateTabPopup(tabId);
}

/**
 * Handles actions to be taken for AMP pages that fail validation.
 *
 * @param {integer} tabId ID of a tab.
 * @param {!Object<!ValidationResult>} validationResult
 */
function handleAmpFail(tabId, validationResult) {
  const numErrors = getNumberOfErrors(validationResult.errors);
  updateTabStatus(
      tabId, globals.invalidAmpIconPrefix, globals.invalidAmpTitle,
      numErrors.toString(), globals.invalidAmpBgcolor);
  updateTabPopup(tabId);
}

/**
 * Handles actions to be taken for pages that have an AMP page available.
 *
 * @param {integer} tabId ID of a tab.
 * @param {string} ampHref The URL of the AMP page.
 */
function handleAmpLink(tabId, ampHref) {
  updateTabStatus(
      tabId, globals.linkToAmpIconPrefix, globals.linkToAmpTitle,
      '' /*text*/, globals.linkToAmpBgColor);
  chrome.action.onClicked.addListener(
      function loadAmpHref(tab) {
        if (tab.id == tabId) {
          chrome.action.onClicked.removeListener(loadAmpHref);
          chrome.tabs.sendMessage(tab.id,
              {'loadAmp': true, 'ampHref': ampHref});
        }
      }
  );
}

/**
 * Handles actions to be taken for AMP pages that pass validation.
 *
 * @param {integer} tabId ID of a tab.
 * @param {!Object<!ValidationResult>} validationResult
 */
function handleAmpPass(tabId, validationResult) {
  const numWarnings = getNumberOfWarnings(validationResult.errors);
  updateTabStatus(
      tabId, globals.validAmpIconPrefix, globals.validAmpTitle,
      '' /*text*/, globals.validAmpBgcolor);
  if (numWarnings > 0) {updateTabPopup(tabId);}
}

function handleValidatorNotPresent(tabId) {
  updateTabStatus(tabId, globals.validatorNotPresentIconPrefix,
      globals.validatorNotPresentTitle, globals.validatorNotPresentBadge,
      globals.validatorNotPresentBgColor);
  chrome.tabs.get(tabId, () => {
    if (!chrome.runtime.lastError) {
      chrome.action.setPopup({
        tabId,
        popup: globals.validatorNotPresentPopup,
      });
    }
  });
}

/**
 * Returns whether the url is forbidden for the extension to act on.
 *
 * @param {string} url The URL of a tab.
 * @return {boolean}
 */
function isForbiddenUrl(url) {
  return (url.startsWith('chrome://') || url.startsWith('view-source'));
}

/**
 * Handles events for a specific tab and asks the tab's content_script to
 * determine AMP details about the page's content.
 *
 * @param {Tab} tab The Tab which triggered the event.
 */
function updateTab(tab) {
  if (!isForbiddenUrl(tab.url)) {
    chrome.tabs.sendMessage(
        tab.id, {'getAmpDetails': true}, response => {
          if (response && response.fromAmpCache && response.ampHref) {
            handleAmpCache(tab.id, response.ampHref);
          } else if (response && response.isAmp) {
            validateUrlFromTab(tab, response.userAgent);
          } else if (response && !response.isAmp && response.ampHref) {
            handleAmpLink(tab.id, response.ampHref);
          }
        }
    );
  }
}

/**
 * Updates the tabId's extension popup.
 *
 * @param {number} tabId ID of a tab.
 */
function updateTabPopup(tabId) {
  // Verify tab still exists
  chrome.tabs.get(tabId, () => {
    if (!chrome.runtime.lastError) {
      chrome.action.setPopup(
          {tabId, popup: globals.validatorPopup});
    }
  });
}

/**
 * Updates the tabId's extension icon and badge.
 *
 * @param {number} tabId ID of a tab.
 * @param {string} iconPrefix File name prefix of the icon to use.
 * @param {string} title Title to display in extension icon hover.
 * @param {string} text Text to display in badge.
 * @param {string} color Background color for badge.
 */
function updateTabStatus(tabId, iconPrefix, title, text, color) {
  // Verify tab still exists
  chrome.tabs.get(tabId, () => {
    if (!chrome.runtime.lastError) {
      chrome.action.setIcon({
        path: {
          '19': iconPrefix + '-128.png',
          '38': iconPrefix + '-38.png',
        },
        tabId,
      });
      if (title !== undefined)
      {chrome.action.setTitle({title, tabId});}
      if (text !== undefined)
      {chrome.action.setBadgeText({text, tabId});}
      if (color !== undefined)
      {chrome.action.setBadgeBackgroundColor(
          {color: hex2rgba(color), tabId});}
    }
  });
}

/**
 * Fetches the content of the tab's URL and validates it. Then updates the
 * extension's icons with pass/fail.
 *
 * @param {Tab} tab The Tab which triggered the event.
 * @param {userAgent} string Tab's current user agent.
 */
function validateUrlFromTab(tab, userAgent) {
  // Verify amp and amp.validator are defined.
  if (typeof amp === 'undefined' || typeof amp.validator === 'undefined') {
    handleValidatorNotPresent(tab.id);
    return;
  }

  const url = tab.url.split('#')[0];
  fetch(url, {
    method: 'GET',
    headers: {
      'user-agent': userAgent,
    }
  }).then(resp => {
    if (resp.ok) {
      return resp.text();
    }
  }).then(async text => {
    await amp.validator.init();
    const validationResult = amp.validator.validateString(text);
    chrome.storage.session.set({
      [url]: JSON.stringify(validationResult)
    });
    if (validationResult.status == 'PASS') {
      handleAmpPass(tab.id, validationResult);
    } else if (onlyErrorIsDevMode(validationResult)) {
      handleAmpDevMode(tab.id);
    } else {
      handleAmpFail(tab.id, validationResult);
    }
  });
}

/**
 * Remove the URL from storage when the tab is closed.
 */
function removeTab(tabId) {
  chrome.tabs.get(tabId, tab => {
    if (!chrome.runtime.lastError) {
      chrome.storage.session.remove(tab.url);
    }
  });
}

/**
 * Listen for a new tab being created.
 */
chrome.tabs.onCreated.addListener(updateTab);

/**
 * Listen for a tab being changed.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  removeTab(tabId);
  updateTab(tab);
});

/**
 * Listen for a tab being replaced (due to prerendering or instant).
 */
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  removeTab(removedTabId);
  chrome.tabs.get(addedTabId, tab => {
    updateTab(tab);
  });
});

chrome.runtime.onMessage.addListener((url, sender, sendResponse) => {
  // To ensure that the browser does not drop the reply.
  (async () => {
    chrome.storage.session.get(url, result => {
      sendResponse(result[url]);
    });
  })();
  return true;
});
