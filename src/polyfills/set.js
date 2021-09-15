import {toArray} from '#core/types/array';

/**
 * @param {!Window} win
 */
export function install(win) {
  const {Set: SetConstructor} = win;
  const s = new SetConstructor([1]);
  // Add suppport for `new Set(iterable)`. IE11 lacks it.
  if (s.size < 1) {
    win.Set = /** @type {typeof Set} */ (
      function (iterable) {
        const set = new SetConstructor();
        if (iterable) {
          const asArray = toArray(iterable);
          for (let i = 0; i < asArray.length; i++) {
            set.add(asArray[i]);
          }
        }
        return set;
      }
    );
  }
  // Forces the return value from Set.prototype.add to always be the set
  // instance. IE11 returns undefined.
  if (s.add(0) !== s) {
    const {add} = s;

    win.Object.defineProperty(SetConstructor.prototype, 'add', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function () {
        add.apply(this, arguments);
        return this;
      },
    });
  }
}
