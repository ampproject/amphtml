/**
 *
 * @param {RegExp} regex
 * @param {string} subject
 */
function* matchIterator(regex, subject) {
  let match = regex.exec(subject);
  while (match != null) {
    yield match;
    match = regex.exec(subject);
  }
}

module.exports = {matchIterator};
