/**
 *
 * @return {(content: string, file: string, done: (error: null, content: string) => void) => void}
 */
function createFilepathTransformer() {
  return async function (content, file, done) {
    done(null, content);
  };
}

createFilepathTransformer.$inject = [];

module.exports = {createFilepathTransformer};
