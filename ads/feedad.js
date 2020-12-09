import {adConfig} from "./_config";
import {loadScript, validateData} from "../3p/3p";

/**
 * @typedef FeedAdGlobal
 * @internal
 *
 * @property {FeedAdAsync} feedad
 */

/**
 * @typedef {Object} FeedAdAsync
 * @internal
 *
 * @property {FeedAd} [sdk]
 * @property {!Function[]} cmd
 */

/**
 * @typedef {Object} FeedAd
 * @internal
 *
 * @property {function(string)} init
 * @property {function(string):Promise<FeedAdResponse>} requestAd
 */

/**
 * @typedef {Object} FeedAdResponse
 * @internal
 *
 * @property {function():HTMLElement} createAdContainer()
 */

/**
 * @typedef {Object} FeedAdData
 * @internal
 *
 * @property {string} clientToken
 * @property {string} placementId
 * @property {string} [background]
 */

/**
 * @param {!FeedAdGlobal & Window} global
 * @param {!FeedAdData} data
 */
export function feedad(global, data) {
  validateData(data, ["clientToken", "placementId"], ["background"]);

  global.feedad = global.feedad || {cmd: []};
  global.feedad.cmd.push(() => {
    global.feedad.sdk.init(data.clientToken)
          .then(() => global.feedad.sdk.requestAd(data.placementId))
          .then((response) => {
            const ad = response.createAdContainer();
            const container = global.document.getElementById("c");
            applyContainerStyle(container, data);
            container.appendChild(ad);
            global.context.renderStart();
            global.context.reportRenderedEntityIdentifier("FeedAd");
            requestOptimalSize(global, ad);
            return response.promise;
          })
          .catch(() => {
            global.context.noContentAvailable();
          });
  });
  loadScript(global, adConfig.feedad.prefetch);
}

/**
 * Centers the ad container within the AMP container.
 * Applies the optional background color for the unfilled space.
 *
 * @param {HTMLElement} container
 * @param {!FeedAdData} data
 */
function applyContainerStyle(container, data) {
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.justifyContent = "stretch";
  container.style.alignItems = "center";
  if (data.background) {
    container.style.backgroundColor = data.background;
  }
}

/**
 * Requests a resize if the AMP container bounds do not match the ad.
 *
 * @param {Window} win
 * @param {HTMLElement} adElement
 */
function requestOptimalSize(win, adElement) {
  const {height, width} = adElement.getBoundingClientRect();
  if (height !== win.innerHeight) {
    win.context.requestResize(width, height, true);
  }
}
