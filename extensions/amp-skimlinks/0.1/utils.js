import {Deferred} from '../../../src/utils/promise';
import {user} from '../../../src/log';


/**
 * Get function from an object attached with the object as its context
 * @param {*} context
 * @param {*} functionName
 */
export function getBoundFunction(context, functionName) {
  const validFunction = context[functionName] && context[functionName].bind;
  user().assert(validFunction,
      `Function '${functionName}' not found in given context.`);
  return context[functionName].bind(context);
}

/**
 * Generate random id of 32 chars.
 */
export function generatePageImpressionId() {
  let str = '';
  for (let i = 0; i < 8; i++) {
    str += Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }

  return str;
}

/**
 * Promise version of setTimeout(cb, 0);
 */
export function nextTick() {
  const deferred = new Deferred();
  setTimeout(() => {
    deferred.resolve();
  });

  return deferred.promise;
}
