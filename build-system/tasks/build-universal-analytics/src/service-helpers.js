import ampDoc from './ampdoc-impl';

const key = '__BENTO_ANALYTICS_SERVICES';

self[key] = Object.create(null);

// For now, we don't care:
// - All services are sync/bundled
// - All services are instantiated on register
// - The only window is the top window
// - No friendly iframes

/**
 * @param {!Window} win
 * @return {!Window}
 */
export function getTopWindow(win) {
  return win;
}

/**
 * @return {null}
 */
export function getParentWindowFrameElement() {
  return null;
}

/**
 * @param {*} unusedElementOrAmpDoc
 * @param {string} serviceName
 * @return {!Promise<!Object>}
 */
export function getServicePromiseForDoc(unusedElementOrAmpDoc, serviceName) {
  // eslint-disable-next-line local/no-forbidden-terms
  return Promise.resolve(getServiceForDoc(unusedElementOrAmpDoc, serviceName));
}

/* eslint-disable local/no-forbidden-terms */
/**
 * @param {*} unusedElementOrAmpDoc
 * @param {string} serviceName
 * @return {!Object}
 */
export function getServiceForDoc(unusedElementOrAmpDoc, serviceName) {
  /* eslint-enable local/no-forbidden-terms */
  return getService(self, serviceName);
}

/**
 * @param {*} unusedWin
 * @param {string} id
 * @return {!Object}
 */
export function getService(unusedWin, id) {
  return self[key][id];
}

/**
 * @param {*} unusedNodeOrAmpDoc
 * @param {string} id of the service.
 * @param {function(new:Object, typeof ampDoc)} constructor
 * @param {boolean=} unusedInstantiate unused, always instantiated
 */
export function registerServiceBuilderForDoc(
  unusedNodeOrAmpDoc,
  id,
  constructor,
  unusedInstantiate
) {
  registerServiceBuilder(self, id, constructor);
}

/**
 * @param {*} unusedWin
 * @param {string} id of the service.
 * @param {function(new:Object, typeof ampDoc)} constructor
 * @param {boolean=} unusedInstantiate unused, always instantiated
 */
export function registerServiceBuilder(
  unusedWin,
  id,
  constructor,
  unusedInstantiate
) {
  self[key][id] = new constructor(ampDoc);
}

/**
 * @param {*} unusedWin
 * @param {string} id
 * @return {!Object}
 */
export function getServicePromise(unusedWin, id) {
  return Promise.resolve(self[key][id]);
}

/**
 * @return {typeof ampDoc}
 */
export function getAmpdoc() {
  return ampDoc;
}

/**
 * Installs a service override on amp-doc level.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} id
 * @param {!Object} service The service.
 */
export function installServiceInEmbedDoc(ampdoc, id, service) {
  // TODO(alanorozco): Do we ever hit this?
}
