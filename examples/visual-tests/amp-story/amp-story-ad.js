'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'Test story ad system layer property correctness': async (page, name) => {
    await verifySelectorsVisible(page, name, ['.i-amphtml-story-ad-badge']);
  },
};
