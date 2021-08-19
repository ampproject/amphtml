/**
 * Replaces isExperimentOn() and toggleExperiment() calls when they match a name
 * specified by --isExperimentOnExperiment
 *
 * - isExperimentOn() is replaced with boolean (--isExperimentOnLaunched):
 *     isExperimentOn(win, 'foo') -> true
 *
 * - toggleExperiment() is replaced with either:
 *
 *     a. its toggle value in third argument:
 *          toggleExperiment(win, 'foo', false) -> false
 *
 *     b. or the negation of --isExperimentOnLaunched when lacking third argument:
 *          toggleExperiment(win, 'foo') -> !true
 *
 * Resulting unused imports of these functions are also removed.
 *
 * @param {*} file
 * @param {*} api
 * @param {*} options
 * @return {*}
 */
module.exports = function (file, api, options) {
  const j = api.jscodeshift;

  const missingOptions = [
    'isExperimentOnExperiment',
    'isExperimentOnLaunched',
  ].filter((option) => options[option] == null);

  if (missingOptions.length > 0) {
    throw new Error(
      `Missing options for ${options.transform}\n` +
        JSON.stringify(missingOptions)
    );
  }

  const {isExperimentOnExperiment, isExperimentOnLaunched} = options;

  const root = j(file.source);

  return root
    .find(
      j.CallExpression,
      (node) =>
        node.callee.type === 'Identifier' &&
        (node.callee.name === 'isExperimentOn' ||
          node.callee.name === 'toggleExperiment') &&
        node.arguments[1] &&
        node.arguments[1].value === isExperimentOnExperiment
    )
    .forEach((path) => {
      const {name} = path.node.callee;

      // remove unused imports
      root
        .find(j.ImportDeclaration, ({specifiers}) =>
          specifiers.some(({imported}) => imported && imported.name === name)
        )
        .forEach((path) => {
          if (root.find(j.CallExpression, {callee: {name}}).size() > 1) {
            return;
          }
          if (path.node.specifiers.length === 1) {
            path.prune();
          } else {
            path.node.specifiers = path.node.specifiers.filter(
              ({imported}) => !(imported && imported.name === name)
            );
          }
        });

      // toggle flips that match the launch value can be simply removed.
      if (
        name === 'toggleExperiment' &&
        path.node.arguments[2] &&
        path.node.arguments[2].value == isExperimentOnLaunched
      ) {
        path.prune();
        return;
      }

      // otherwise replace call result with an annotated constant boolean:
      const isExperimentOnLaunchedLiteral = j.booleanLiteral(
        !!isExperimentOnLaunched
      );
      const replacement =
        name === 'isExperimentOn'
          ? isExperimentOnLaunchedLiteral
          : // from toggleExperiment (no-op)
            path.node.arguments[2] ||
            // if lacking argument, toggle launch value as affordance:
            j.unaryExpression('!', isExperimentOnLaunchedLiteral);
      replacement.comments = [
        j.commentBlock(
          ` ${j(path).toSource()} // launched: ${!!isExperimentOnLaunched} `,
          /* leading */ true,
          /* trailing */ false
        ),
      ];
      path.replace(replacement);
    })
    .toSource();
};
