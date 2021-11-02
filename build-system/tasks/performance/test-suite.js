const argv = require('minimist')(process.argv.slice(2));
const loadConfig = require('./load-config');
const {expect} = require('chai');
const {getReport} = require('./print-report');
// Set threshold to 1.05 by default
const DEFAULT_THRESHOLD = 1.05;
const THRESHOLD = argv.threshold ? argv.threshold + 1 : DEFAULT_THRESHOLD;

const {urlToHandlers} = loadConfig();
const reports = getReport(Object.keys(urlToHandlers));

reports.forEach((report) => {
  describe(`${report.url}`, () => {
    report.metrics.forEach(({control, experiment}, name) => {
      it(`${name}`, () => {
        expect(experiment).to.be.at.most(control * THRESHOLD);
      });
    });
  });
});
