/**
 * Removes an entry from files like tools/experiments/experiments-config.js,
 * whose id property is specified by --experimentId:
 *
 *    [
 *      {
 *        ...
 *      },
 *   -  {
 *   -    id: 'foo',
 *   -    name: 'Foo.',
 *   -    spec: '...',
 *   -  },
 *      {
 *        ...
 *      }
 *    ]
 *
 * @param {*} file
 * @param {*} api
 * @param {*} options
 * @return {*}
 */
module.exports = function (file, api, options) {
  const j = api.jscodeshift;

  const {experimentId} = options;

  return j(file.source)
    .find(j.ObjectExpression, (node) =>
      node.properties.some(
        ({key, value}) => key.name === 'id' && value.value === experimentId
      )
    )
    .forEach((path) => {
      const serializable = {};
      path.value.properties.forEach(({key, value}) => {
        // Only keep literal properties.
        if ('name' in key && 'value' in value) {
          serializable[key.name] = value.value;
        }
      });
      api.report(JSON.stringify(serializable));
    })
    .remove()
    .toSource();
};
