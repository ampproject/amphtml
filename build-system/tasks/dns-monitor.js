/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const argv = require('minimist')(process.argv.slice(2));
const colors = require('ansi-colors');
const log = require('fancy-log');
const readline = require('readline');
const {execScriptAsync} = require('../common/exec');

const PERMITTED_DOMAIN_REGEXES = [
  /\.internal$/, // Travis use
  /^(amp-test-status-bot|amp-error-reporting)\.appspot\.com$/, // Infra team
  /\.test$/, // .test TLD is safe to use for tests
];

const TCPDUMP_DNS_REGEX = /^(\d{2}:\d{2}:\d{2})\.\d{6} IP6? [^ ]+ > [^ ]+: \d+\+ (A|AAAA)\? ([^ ]+)\. \(\d+\)$/;

/**
 * Monitor DNS requests sent from the entire machine, and report any request
 * that does not match one of the PERMITTED_DOMAIN_REGEXES.
 *
 * It runs perpetually until receiving a SIGTERM or SIGINT signal, and will
 * return non-zero code if there are unmatched DNS requests.
 * @return {!Promise}
 */
function dnsMonitor() {
  let resolver;
  const deferred = new Promise(resolverIn => {
    resolver = resolverIn;
  });

  const monProcess = execScriptAsync('sudo tcpdump -l port 53');
  monProcess.unref();
  const domainAccesses = new Map();

  const onFinish = () => {
    if (domainAccesses.size) {
      log(
        'Tests that send requests to external domains might slow',
        'down the tests and cause flakiness.'
      );
      log(
        'If possible, please change them to examples.test domain since',
        'they never resolve.'
      );
      log(
        'If these requests are indeed necessary to the test, go to',
        colors.cyan('build-system/tasks/dns-monitor.js'),
        'to permit it.'
      );
      if (!argv.nonblocking) {
        process.exitCode = 1;
      }
    } else {
      log(colors.green('No impermissible external requests found'));
    }
    for (const [domain, ts] of domainAccesses.entries()) {
      log(ts, 'Request(s) to', colors.red(domain), 'recorded.');
    }

    // Using killall since a problem with running `kill` on Travis
    const killAll = execScriptAsync('sudo killall tcpdump');
    killAll.stdout.pipe(process.stdout);
    killAll.stderr.pipe(process.stderr);
    resolver();
  };
  process.on('SIGTERM', onFinish);
  process.on('SIGINT', onFinish);

  console.error('DNS Ready'); // To signal that the monitor is up.
  readline
    .createInterface({
      input: monProcess.stdout,
    })
    .on('line', line => {
      handleLog_(line, domainAccesses);
    });
  return deferred;
}

function handleLog_(line, domainAccesses) {
  const match = TCPDUMP_DNS_REGEX.exec(line);
  if (
    match &&
    !domainAccesses.has(match[3]) &&
    !matchOneOfRegexes(match[3], PERMITTED_DOMAIN_REGEXES)
  ) {
    domainAccesses.set(match[3], match[1]);
  }
}

function matchOneOfRegexes(testStr, regexes) {
  for (let i = 0; i < regexes.length; i++) {
    if (regexes[i].exec(testStr)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  dnsMonitor,
};

dnsMonitor.description =
  'Check if there are unpermitted DNS requests (requires sudo)';
dnsMonitor.flags = {
  'nonblocking': 'Do not block the test even if the test fails',
};
