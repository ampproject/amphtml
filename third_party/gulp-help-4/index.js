var objectAssign = require('object-assign'),
  logTasks = require('./lib/logTasks'),
  DEFAULT_THEME = require('./themes/default'),
  DEFAULT_OPTIONS = objectAssign({
    helpTaskName: 'help',
    helpText: 'Display this help text.',
    helpTaskAliases: ['h'],
    hideHelpTask: false,
    hideAliasTasks: true,
    hideDefaultTask: true,
    tasksHeadingText: '\nAvailable tasks',
    aliasesLabel: 'Aliases:',
    postHelpText: '',
    taskLinePrefix: '  ',
    flagPrefix: '   --',
    afterPrintCallback: function () {
    }
  }, DEFAULT_THEME);

module.exports = function (gulp, options) {

  var tasks = gulp.registry().tasks(),
    originalTaskFn = gulp.task;

  // define new gulp task fn
  gulp.task = function (name, fn) {
    if (!fn && typeof name === 'function') {
      fn = name;
      name = undefined;
    }

    name = name || fn.name || fn.displayName;

    if (typeof name !== 'string') {
      // invalid state. Just ignore and let gulp deal with it
      return originalTaskFn.call(gulp, name, fn);
    }

    // define this task before defining its aliases below
    var result = originalTaskFn.call(gulp, name, fn);

    // add alias tasks
    if (fn && fn.aliases && fn.aliases.length > 0) {
      fn.aliases.forEach(function (alias) {
        var aliasTaskFn = gulp.series(name);
        aliasTaskFn.hide = options.hideAliasTasks;
        gulp.task(alias, aliasTaskFn);
      });
    }

    return result;
  };

  options = objectAssign({}, DEFAULT_OPTIONS, options);

  // attach gulp help task
  function help(done) {
    logTasks(gulp, options);
    done();
  }

  help.description = options.helpText;
  help.aliases = options.helpTaskAliases;
  help.hide = options.hideHelpTask;

  gulp.task(options.helpTaskName, help);

  // do not add default task if one already exists
  if (tasks['default'] === undefined) {
    var defaultTaskFn = gulp.series(options.helpTaskName);
    defaultTaskFn.hide = options.hideDefaultTask;
    gulp.task('default', defaultTaskFn);
  }

  return gulp;
};