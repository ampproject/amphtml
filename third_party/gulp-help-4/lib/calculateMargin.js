module.exports = function (gulp, options) {

  var taskLinePrefix = options && options.taskLinePrefix ? options.taskLinePrefix : '',
    flagPrefix = options && options.flagPrefix ? options.flagPrefix : '',
    tasks = gulp.registry().tasks(),
    keysToCalculate = [];

  Object.keys(tasks).forEach(function (taskName) {
    var task = gulp.registry().get(taskName);
    if (!task.hide) { // do not take into account hidden tasks
      keysToCalculate.push(taskLinePrefix + taskName);
      if (task.flags) {
        var flags = Object.keys(task.flags);
        flags.forEach(function (item, index, theArray) {
          theArray[index] = flagPrefix + item; // use prefix that will be added later for margin calculating
        });
        keysToCalculate.push.apply(keysToCalculate, flags);
      }
    }
  });

  return keysToCalculate.reduce(function (m, key) {
    if (m > key.length) {
      return m;
    }
    return key.length;
  }, 0);
};
