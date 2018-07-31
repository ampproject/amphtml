/**
 * Get function from an object attached with the object as a context
 * @param {*} context
 * @param {*} functionName
 */
export function getBoundFunction(context, functionName) {
  // TODO: throw error if function doesn't exist?
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
