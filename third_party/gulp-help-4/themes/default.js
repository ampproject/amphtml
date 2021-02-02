var {cyan, dim, underline} = require('ansi-colors');

module.exports = {
  styles: {
    taskLinePrefix: null,
    taskName: cyan,
    tasksHeading: underline,
    description: null,
    flagName: cyan,
    flagPrefix: null,
    flagDescription: dim,
    aliasesLabel: null,
    aliasDescription: null
  }
};
