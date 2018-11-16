import 'react-dates/initialize';
import 'react-dates';

// A very basic polyfill for Array.from,
// to avoid needing to use a full 3p implementation
if (!Array.from) {
  function simpleArrayFrom(arrayLike) {
    if (!arrayLike) {
      return [];
    }

    if (!arrayLike.length) {
      return [];
    }

    const result = [];
    for (let i = 0; i < arrayLike.length; i++) {
      result[i] = arrayLike[i];
    }
    return result;
  }

  Object.defineProperty(Array, 'from', {
    writable: true,
    enumerable: false,
    configurable: true,
    value: simpleArrayFrom,
  });
}
