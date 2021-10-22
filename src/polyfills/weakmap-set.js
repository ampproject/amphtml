/**
 * Forces the return value from WeakMap.prototype.set to always be the map
 * instance. IE11 returns undefined.
 *
 * @param {!Window} win
 */
export function install(win) {
  const {WeakMap} = win;
  const m = new WeakMap();
  if (m.set({}, 0) !== m) {
    const {set} = m;

    win.Object.defineProperty(WeakMap.prototype, 'set', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function () {
        set.apply(this, arguments);
        return this;
      },
    });
  }
}
