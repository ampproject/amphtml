/**
 * Forces the return value from Map.prototype.set to always be the map
 * instance. IE11 returns undefined.
 *
 * @param {!Window} win
 */
export function install(win) {
  const {Map} = win;
  const m = new Map();
  if (m.set(0, 0) !== m) {
    const {set} = m;

    win.Object.defineProperty(Map.prototype, 'set', {
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
