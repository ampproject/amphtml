/**
 * @param {() => T} fn
 * @return {() => T}
 * @template T
 */
function once(fn) {
  let evaluated = false;
  let value;
  return () => {
    if (!evaluated) {
      evaluated = true;
      value = fn();
    }
    return value;
  };
}

module.exports = {
  once,
};
