import '#polyfills';
import '#service/timer-impl';
import {Deferred} from '#core/data-structures/promise';
import {onDocumentReady} from '#core/document/ready';

import {isExperimentOn, toggleExperiment} from '#experiments';

import {listenOnce} from '#utils/event-helper';
import {devAssert, initLogConstructor, setReportError} from '#utils/log';

import {EXPERIMENTS} from './experiments-config';

import {SameSite_Enum, getCookie, setCookie} from '../../src/cookies';
import {reportError} from '../../src/error-reporting';
import {getMode} from '../../src/mode';
import {parseUrlDeprecated} from '../../src/url';
//TODO(@cramforce): For type. Replace with forward declaration.

initLogConstructor();
setReportError(reportError);

const COOKIE_MAX_AGE_DAYS = 180; // 6 month
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const COOKIE_MAX_AGE_MS = COOKIE_MAX_AGE_DAYS * MS_PER_DAY;
const RTV_COOKIE_MAX_AGE_MS = MS_PER_DAY / 2;

const RTV_PATTERN = /^\d{15}$/;

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   spec: string,
 *   cleanupIssue: string,
 * }}
 */
let ExperimentDef;

/**
 * These experiments are special because they use a different mechanism that is
 * interpreted by the server to deliver a different version of the AMP
 * JS libraries.
 */
const EXPERIMENTAL_CHANNEL_ID = 'experimental-channel';
const BETA_CHANNEL_ID = 'beta-channel';
const NIGHTLY_CHANNEL_ID = 'nightly-channel';
const RTV_CHANNEL_ID = 'rtv-channel';

/**
 * The different states of the __Host-AMP_OPT_IN cookie.
 */
const AMP_OPT_IN_COOKIE = {
  DISABLED: '0',
  EXPERIMENTAL: 'experimental',
  BETA: 'beta',
  NIGHTLY: 'nightly',
};

/** @const {!Array<!ExperimentDef>} */
const CHANNELS = [
  {
    id: EXPERIMENTAL_CHANNEL_ID,
    name: 'AMP Experimental Channel (more info)',
    spec: 'https://github.com/ampproject/amphtml/blob/main/docs/release-schedule.md#amp-experimental-and-beta-channels',
  },
  {
    id: BETA_CHANNEL_ID,
    name: 'AMP Beta Channel (more info)',
    spec: 'https://github.com/ampproject/amphtml/blob/main/docs/release-schedule.md#amp-experimental-and-beta-channels',
  },
  {
    id: NIGHTLY_CHANNEL_ID,
    name: 'AMP Nightly Channel (more info)',
    spec: 'https://github.com/ampproject/amphtml/blob/main/docs/release-schedule.md#amp-experimental-and-beta-channels',
  },
];

if (getMode().localDev) {
  EXPERIMENTS.forEach((experiment) => {
    devAssert(
      experiment.cleanupIssue,
      `experiment ${experiment.name} must have a \`cleanupIssue\` field.`
    );
  });
}

/**
 * Builds the expriments table.
 */
function build() {
  const {host} = window.location;

  const subdomain = document.getElementById('subdomain');
  subdomain.textContent = host;

  // #redirect contains UI that generates a subdomain experiments page link
  // given a "google.com/amp/..." viewer URL.
  const redirect = document.getElementById('redirect');
  const input = redirect.querySelector('input');
  const button = redirect.querySelector('button');
  const anchor = redirect.querySelector('a');
  button.addEventListener('click', function () {
    let urlString = input.value.trim();
    // Avoid protocol-less urlString from being parsed as a relative URL.
    const hasProtocol = /^https?:\/\//.test(urlString);
    if (!hasProtocol) {
      urlString = 'https://' + urlString;
    }
    const url = parseUrlDeprecated(urlString);
    if (url) {
      const subdomain = url.hostname.replace(/\./g, '-');
      const href = `https://${subdomain}.cdn.ampproject.org/experiments.html`;
      anchor.href = href;
      anchor.textContent = href;
    }
  });

  const channelsTable = document.getElementById('channels-table');
  CHANNELS.forEach(function (experiment) {
    channelsTable.appendChild(buildExperimentRow(experiment));
  });

  const experimentsTable = document.getElementById('experiments-table');
  EXPERIMENTS.forEach(function (experiment) {
    experimentsTable.appendChild(buildExperimentRow(experiment));
  });

  if (host === 'cdn.ampproject.org') {
    const experimentsDesc = document.getElementById('experiments-desc');
    experimentsDesc.setAttribute('hidden', '');
    experimentsTable.setAttribute('hidden', '');
  } else {
    redirect.setAttribute('hidden', '');
  }

  const rtvInput = document.getElementById('rtv');
  const rtvButton = document.getElementById('rtv-submit');
  rtvInput.addEventListener('input', () => {
    rtvButton.disabled = rtvInput.value && !RTV_PATTERN.test(rtvInput.value);
    rtvButton.textContent = rtvInput.value ? 'opt-in' : 'opt-out';
  });
  rtvButton.addEventListener('click', () => {
    if (!rtvInput.value) {
      showConfirmation_(
        'Do you really want to opt out of RTV?',
        setAmpOptInCookie_.bind(null, AMP_OPT_IN_COOKIE.DISABLED)
      );
    } else if (RTV_PATTERN.test(rtvInput.value)) {
      showConfirmation_(
        `Do you really want to opt in to RTV ${rtvInput.value}?`,
        setAmpOptInCookie_.bind(null, rtvInput.value)
      );
    }
  });

  if (isExperimentOn_(RTV_CHANNEL_ID)) {
    rtvInput.value = getCookie(window, '__Host-AMP_OPT_IN');
    rtvInput.dispatchEvent(new Event('input'));
    document.getElementById('rtv-details').open = true;
  }
}

/**
 * Builds one row in the channel or experiments table.
 * @param {!ExperimentDef} experiment
 * @return {*} TODO(#23582): Specify return type
 */
function buildExperimentRow(experiment) {
  const tr = document.createElement('tr');
  tr.id = 'exp-tr-' + experiment.id;

  const tdId = document.createElement('td');
  tdId.appendChild(buildLinkMaybe(experiment.id, experiment.spec));
  tr.appendChild(tdId);

  const tdName = document.createElement('td');
  tdName.appendChild(buildLinkMaybe(experiment.name, experiment.spec));
  tr.appendChild(tdName);

  const tdOn = document.createElement('td');
  tdOn.classList.add('button-cell');
  tr.appendChild(tdOn);

  const button = document.createElement('button');
  tdOn.appendChild(button);

  const buttonOn = document.createElement('div');
  buttonOn.classList.add('on');
  buttonOn.textContent = 'On';
  button.appendChild(buttonOn);

  const buttonDefault = document.createElement('div');
  buttonDefault.classList.add('default');
  buttonDefault.textContent = 'Default on';
  button.appendChild(buttonDefault);

  const buttonOff = document.createElement('div');
  buttonOff.classList.add('off');
  buttonOff.textContent = 'Off';
  button.appendChild(buttonOff);

  button.addEventListener(
    'click',
    toggleExperiment_.bind(null, experiment.id, experiment.name, undefined)
  );

  return tr;
}

/**
 * If link is available, builds the anchor. Otherwise, it'd return a basic span.
 * @param {string} text
 * @param {?string} link
 * @return {!Element}
 */
function buildLinkMaybe(text, link) {
  let element;
  if (link) {
    element = document.createElement('a');
    element.setAttribute('href', link);
    element.setAttribute('target', '_blank');
  } else {
    element = document.createElement('span');
  }
  element.textContent = text;
  return element;
}

/**
 * Updates states of all experiments in the table.
 */
function update() {
  CHANNELS.concat(EXPERIMENTS).forEach(function (experiment) {
    updateExperimentRow(experiment);
  });
}

/**
 * Updates the state of a single experiment.
 * @param {!ExperimentDef} experiment
 */
function updateExperimentRow(experiment) {
  const tr = document.getElementById('exp-tr-' + experiment.id);
  if (!tr) {
    return;
  }
  let state = isExperimentOn_(experiment.id) ? 1 : 0;
  if (self.AMP_CONFIG[experiment.id]) {
    state = 'default';
  }
  tr.setAttribute('data-on', state);
}

/**
 * Returns whether the experiment is on or off.
 * @param {string} id
 * @return {boolean}
 */
function isExperimentOn_(id) {
  const optInCookieValue = getCookie(window, '__Host-AMP_OPT_IN');
  switch (id) {
    case EXPERIMENTAL_CHANNEL_ID:
      return optInCookieValue == AMP_OPT_IN_COOKIE.EXPERIMENTAL;
    case BETA_CHANNEL_ID:
      return optInCookieValue == AMP_OPT_IN_COOKIE.BETA;
    case NIGHTLY_CHANNEL_ID:
      return optInCookieValue == AMP_OPT_IN_COOKIE.NIGHTLY;
    case RTV_CHANNEL_ID:
      return RTV_PATTERN.test(optInCookieValue);
    default:
      return isExperimentOn(window, /*OK*/ id);
  }
}

/**
 * Opts in to / out of the pre-release channels or a specific RTV by setting the
 * __Host-AMP_OPT_IN cookie.
 * @param {string} cookieState One of the AMP_OPT_IN_COOKIE enum values, or a
 *   15-digit RTV.
 */
function setAmpOptInCookie_(cookieState) {
  let validUntil = 0;
  if (RTV_PATTERN.test(cookieState)) {
    validUntil = Date.now() + RTV_COOKIE_MAX_AGE_MS;
  } else if (cookieState != AMP_OPT_IN_COOKIE.DISABLED) {
    validUntil = Date.now() + COOKIE_MAX_AGE_MS;
  }
  const cookieOptions = {
    allowOnProxyOrigin: true,
    // Make sure the cookie is available for the script loads coming from
    // other domains. Chrome's default of LAX would otherwise prevent it
    // from being sent.
    sameSite: SameSite_Enum.NONE,
    secure: true,
  };
  setCookie(
    window,
    '__Host-AMP_OPT_IN',
    cookieState,
    validUntil,
    cookieOptions
  );
  // Reflect default experiment state.
  self.location.reload();
}

/**
 * Toggles the experiment.
 * @param {string} id
 * @param {string} name
 * @param {boolean=} opt_on
 */
function toggleExperiment_(id, name, opt_on) {
  const currentlyOn = isExperimentOn_(id);
  const on = opt_on === undefined ? !currentlyOn : opt_on;
  // Protect against accidental choice.
  const confirmMessage = on
    ? 'Do you really want to activate the AMP experiment?'
    : 'Do you really want to deactivate the AMP experiment?';

  showConfirmation_(`${confirmMessage}: "${name}"`, () => {
    switch (id) {
      case EXPERIMENTAL_CHANNEL_ID:
        setAmpOptInCookie_(
          on ? AMP_OPT_IN_COOKIE.EXPERIMENTAL : AMP_OPT_IN_COOKIE.DISABLED
        );
        break;
      case BETA_CHANNEL_ID:
        setAmpOptInCookie_(
          on ? AMP_OPT_IN_COOKIE.BETA : AMP_OPT_IN_COOKIE.DISABLED
        );
        break;
      case NIGHTLY_CHANNEL_ID:
        setAmpOptInCookie_(
          on ? AMP_OPT_IN_COOKIE.NIGHTLY : AMP_OPT_IN_COOKIE.DISABLED
        );
        break;
      default:
        toggleExperiment(window, id, on);
    }
    update();
  });
}

/**
 * Shows confirmation and calls callback if it's approved.
 * @param {string} message
 * @param {function()} callback
 */
function showConfirmation_(message, callback) {
  const container = devAssert(document.getElementById('popup-container'));
  const messageElement = devAssert(document.getElementById('popup-message'));
  const confirmButton = devAssert(document.getElementById('popup-button-ok'));
  const cancelButton = devAssert(
    document.getElementById('popup-button-cancel')
  );
  const unlistenSet = [];
  const closePopup = (affirmative) => {
    container.classList.remove('show');
    unlistenSet.forEach((unlisten) => unlisten());
    if (affirmative) {
      callback();
    }
  };

  messageElement.textContent = message;
  unlistenSet.push(listenOnce(confirmButton, 'click', () => closePopup(true)));
  unlistenSet.push(listenOnce(cancelButton, 'click', () => closePopup(false)));
  container.classList.add('show');
}

/**
 * Loads the AMP_CONFIG objects from whatever the v0.js is that the user has
 * (depends on whether they opted into one of the pre-release channels or into a
 * specific RTV) so that experiment state can reflect the default activated
 * experiments.
 * @return {Promise<JSON>} the active AMP_CONFIG, parsed as a JSON object
 */
function getAmpConfig() {
  const deferred = new Deferred();
  const {promise, reject, resolve} = deferred;
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    resolve(xhr.responseText);
  });
  xhr.addEventListener('error', () => {
    reject(new Error(xhr.statusText));
  });
  // Cache bust, so we immediately reflect cookie changes.
  xhr.open('GET', '/v0.js?' + Math.random(), true);
  xhr.send(null);
  return promise
    .then((text) => {
      const match = text.match(/self\.AMP_CONFIG=(\{.+?\})/);
      if (!match) {
        throw new Error("Can't find AMP_CONFIG in: " + text);
      }
      // Setting global var to make standard experiment code just work.
      return (self.AMP_CONFIG = JSON.parse(match[1]));
    })
    .catch((error) => {
      console./*OK*/ error('Error fetching AMP_CONFIG', error);
      return {};
    });
}

// Start up.
getAmpConfig().then(() => {
  onDocumentReady(document, () => {
    build();
    update();
  });
});
