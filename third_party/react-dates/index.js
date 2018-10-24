import 'react-dates/initialize';
import 'react-dates';

// A very basic polyfill for Array.from,
// to avoid needing to use a full 3p implementation
if (!Array.from) {
  Array.from = function (arrayLike) {
    if (!arrayLike) {
      return [];
    }

    if (!arrayLike.length) {
      return [];
    }

    return [].concat(arrayLike);
  }
}
