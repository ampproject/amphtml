/**
 * @param {!Object} config
 * @param {!Object} fn
 * @return {!Object}
 */
export function getDefaultArgs(config, fn) {
  const args = {...config.args, ...fn.args};
  const argTypes = {...config.argTypes, ...fn.argTypes};
  for (const [name, argType] of Object.entries(argTypes)) {
    args[name] = argType.defaultValue || args[name];
  }
  return args;
}
