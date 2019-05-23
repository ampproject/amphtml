'use strict';

function fuzzysearch(query, text) {
  var tlen = text.length;
  var qlen = query.length;
  if (qlen > tlen) {
    return false;
  }
  if (qlen === tlen && query === text) {
    return true;
  }
  outer: for (var i = 0, j = 0; i < qlen; i++) {
    var qch = query.charCodeAt(i);
    while (j < tlen) {
      if (text.charCodeAt(j++) === qch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}

module.exports = fuzzysearch;
