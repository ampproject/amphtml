var logger = require('./logger'),
  calculateMargin = require('./calculateMargin');

module.exports = function (gulp, options) {

  var taskLinePrefixStyler = options.styles.taskLinePrefix || noopStyler,
    taskNameStyler = options.styles.taskName || noopStyler,
    tasksHeadingStyler = options.styles.tasksHeading || noopStyler,
    descriptionStyler = options.styles.description || noopStyler,
    flagNameStyler = options.styles.flagName || noopStyler,
    flagPrefixStyler = options.styles.flagPrefix || noopStyler,
    flagDescriptionStyler = options.styles.flagDescription || noopStyler,
    aliasesLabelStyler = options.styles.aliasesLabel || noopStyler,
    aliasDescriptionStyler = options.styles.aliasDescription || noopStyler;

  var tasks = gulp.registry().tasks(),
    margin = calculateMargin(gulp, options) + 1; // add 1 to avoid bug with 0 margin task/flag

  logger(tasksHeadingStyler(options.tasksHeadingText));

  Object.keys(tasks).forEach(function (taskName) {
    
    var task = gulp.task(taskName).unwrap();

    if (task.hide) return; // skip displaying this task

    var description = descriptionStyler(task.description || '');
    var args = [];

    args.push(taskLinePrefixStyler(options.taskLinePrefix) + taskNameStyler(taskName));
    args.push(new Array(margin - (options.taskLinePrefix.length + taskName.length)).join(' '));
    args.push(description);

    if (task.aliases && task.aliases.length > 0) {
      args.push(aliasesLabelStyler(options.aliasesLabel));
      args.push(aliasDescriptionStyler(task.aliases.join(', ')));
    }

    if (task.flags && !task.hide) {
      Object.keys(task.flags).forEach(function (flagName) {
        var flagDescription = flagDescriptionStyler(task.flags[flagName] || '');
        args.push('\n'+flagPrefixStyler(options.flagPrefix) + flagNameStyler(flagName));
        var m = margin - (options.flagPrefix.length + flagName.length)
        // TODO shouldn't be necessary. calculating margin incorrectly up above, not taking flags into account properly
        if (m < 0) m = 0;
        args.push(new Array(m).join(' '));
        args.push(flagDescription);
      });
    }

    logger.apply(logger, args);
  });

  logger(options.postHelpText);

  options.afterPrintCallback(tasks);
};

function noopStyler(string) {
  return string;
}
