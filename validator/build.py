#!/usr/bin/python2.7
#
# Copyright 2015 The AMP HTML Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the license.
#

"""A build script which (thus far) works on Ubuntu 14."""

import logging
import os
import platform
import re
import subprocess
import sys


def Die(msg):
  """Prints error and exits with status 1.

  Args:
    msg: The error message to emit
  """
  print >> sys.stderr, msg
  sys.exit(1)


def CheckPrereqs():
  """Checks that various prerequisites for this script are satisfied."""
  logging.info('entering ...')

  if platform.system() != 'Linux':
    Die('Sorry, this script assumes Linux thus far, e.g. Ubuntu 14. '
        'Please feel free to edit the source and fix it to your needs.')

  # Ensure source files are available.
  for f in ['validator.protoascii', 'validator.proto', 'validator_gen.py',
            'package.json', 'validator.js', 'validator_test.js',
            'validator-in-browser.js', 'tokenize-css.js', 'parse-css.js']:
    if not os.path.exists(f):
      Die('%s not found. Must run in amp_validator source directory.' % f)

  # Ensure protoc is available.
  try:
    libprotoc_version = subprocess.check_output(['protoc', '--version'])
  except:
    Die('Protobuf compiler not found. Try "apt-get install protobuf-compiler".')

  # Ensure 'libprotoc 2.5.0' or newer.
  m = re.search('^(\\w+) (\\d+)\\.(\\d+)\\.(\\d+)', libprotoc_version)
  if (m.group(1) != 'libprotoc' or
      (int(m.group(2)), int(m.group(3)), int(m.group(4))) < (2, 5, 0)):
    Die('Expected libprotoc 2.5.0 or newer, saw: %s' % libprotoc_version)

  # Ensure that the Python protobuf package is installed.
  for m in ['descriptor', 'text_format']:
    module = 'google.protobuf.%s' % m
    try:
      __import__(module)
    except:
      Die('%s not found. Try "apt-get install python-protobuf"' % module)

  # Ensure that npm is installed.
  try:
    npm_version = subprocess.check_output(['npm', '--version'])
  except:
    Die('npm package manager not found. Try "apt-get install npm".')

  # Ensure npm version '1.3.10' or newer.
  m = re.search('^(\\d+)\\.(\\d+)\\.(\\d+)$', npm_version)
  if (int(m.group(1)), int(m.group(2)), int(m.group(3))) < (1, 3, 10):
    Die('Expected npm version 1.3.10 or newer, saw: %s' % npm_version)

  # Ensure JVM installed. TODO: Check for version?
  try:
    subprocess.check_output(['java', '-version'], stderr=subprocess.STDOUT)
  except:
    Die('Java missing. Try "apt-get install openjdk-7-jre"')
  logging.info('... done')


def SetupOutDir(out_dir):
  """Sets up a clean output directory.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  if os.path.exists(out_dir):
    subprocess.check_call(['rm', '-rf', out_dir])
  os.mkdir(out_dir)
  logging.info('... done')


def InstallNodeDependencies():
  logging.info('entering ...')
  # Install the project dependencies specified in package.json into
  # node_modules.
  subprocess.check_call(['npm', 'install'])
  logging.info('... done')


def GenValidatorPb2Py(out_dir):
  """Calls the proto compiler to generate validator_pb2.py.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  subprocess.check_call(['protoc', 'validator.proto',
                         '--python_out=%s' % out_dir])
  open('%s/__init__.py' % out_dir, 'w').close()
  logging.info('... done')


def GenValidatorGeneratedJs(out_dir):
  """Calls validator_gen to generate validator-generated.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  # These imports happen late, within this method because they don't necessarily
  # exist when the module starts running, and the ones that probably do
  # are checked by CheckPrereqs.
  from google.protobuf import text_format
  from google.protobuf import descriptor
  from dist import validator_pb2
  import validator_gen
  out = []
  validator_gen.GenerateValidatorGeneratedJs(specfile='validator.protoascii',
                                             validator_pb2=validator_pb2,
                                             text_format=text_format,
                                             descriptor=descriptor,
                                             out=out)
  out.append('')
  f = open('%s/validator-generated.js' % out_dir, 'w')
  f.write('\n'.join(out))
  f.close()
  logging.info('... done')


def CompileWithClosure(js_files, closure_entry_points, output_file):
  cmd = ['java', '-jar', 'node_modules/google-closure-compiler/compiler.jar',
         '--language_in=ECMASCRIPT6_STRICT', '--language_out=ES5_STRICT',
         '--js_output_file=%s' % output_file,
         '--only_closure_dependencies']
  cmd += ['--closure_entry_point=%s' % e for e in closure_entry_points]
  cmd += ['node_modules/google-closure-library/closure/**.js',
          '!node_modules/google-closure-library/closure/**_test.js',
          'node_modules/google-closure-library/third_party/closure/**.js',
          '!node_modules/google-closure-library/third_party/closure/**_test.js']
  cmd += js_files
  subprocess.check_call(cmd)


def CompileValidatorMinified(out_dir):
  logging.info('entering ...')
  CompileWithClosure(
      js_files=['htmlparser.js', 'parse-css.js', 'tokenize-css.js',
                '%s/validator-generated.js' % out_dir,
                'validator-in-browser.js', 'validator.js'],
      closure_entry_points=['amp.validator.validateString',
                            'amp.validator.renderValidationResult'],
      output_file='%s/validator_minified.js' % out_dir)
  logging.info('... done')


def GenerateValidateBin(out_dir):
  logging.info('entering ...')
  f = open('%s/validate' % out_dir, 'w')
  f.write('#!/usr/bin/nodejs\n')
  for l in open('%s/validator_minified.js' % out_dir):
    f.write(l)
  f.write("""
      var fs = require('fs');
      var path = require('path');

      function main() {
        if (process.argv.length < 3) {
          console.error('usage: validate <file.html>');
          process.exit(1)
        }
        var args = process.argv.slice(2);
        var full_path = args[0];
        var filename = path.basename(full_path);
        var contents = fs.readFileSync(full_path, 'utf8');
        var results = amp.validator.validateString(contents);
        var output = amp.validator.renderValidationResult(results, filename);

        if (output[0] === 'PASS') {
          for (var i = 0; i < output.length; ++i) {
            console.info(output[i]);
          }
          process.exit(0);
        } else {  // FAIL
          for (var i = 0; i < output.length; ++i) {
            console.error(output[i]);
          }
          process.exit(1);
        }
      }

      if (require.main === module) {
        main();
      }
      """)
  os.chmod('%s/validate' % out_dir, 0750)
  logging.info('... done')


def RunSmokeTest(out_dir):
  logging.info('entering ...')
  # Run dist/validate on the minimum valid amp and observe that it passes.
  p = subprocess.Popen(['%s/validate' % out_dir,
                        'testdata/feature_tests/minimum_valid_amp.html'],
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  (stdout, stderr) = p.communicate()
  if ('PASS\n', '', p.returncode) != (stdout, stderr, 0):
    Die('Smoke test failed. returncode=%d stdout="%s" stderr="%s"' % (
        p.returncode, stdout, stderr))

  # Run dist/validate on an empty file and observe that it fails.
  open('%s/empty.html' % out_dir, 'w').close()
  p = subprocess.Popen(['%s/validate' % out_dir, '%s/empty.html' % out_dir],
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  (stdout, stderr) = p.communicate()
  if p.returncode != 1:
    Die('smoke test failed. Expected p.returncode==1, saw: %s' % p.returncode)
  if not stderr.startswith('FAIL\nempty.html:1:0 MANDATORY_TAG_MISSING'):
    Die('smoke test failed; stderr was: "%s"' % stdout)
  logging.info('... done')


def CompileValidatorTestMinified(out_dir):
  logging.info('entering ...')
  CompileWithClosure(
      js_files=['htmlparser.js', 'parse-css.js', 'tokenize-css.js',
                '%s/validator-generated.js' % out_dir,
                'validator-in-browser.js', 'validator.js', 'validator_test.js'],
      closure_entry_points=['amp.validator.ValidatorTest'],
      output_file='%s/validator_test_minified.js' % out_dir)
  logging.info('... success')


def CompileHtmlparserTestMinified(out_dir):
  logging.info('entering ...')
  CompileWithClosure(
      js_files=['htmlparser.js', 'htmlparser_test.js'],
      closure_entry_points=['amp.htmlparser.HtmlParserTest'],
      output_file='%s/htmlparser_test_minified.js' % out_dir)
  logging.info('... success')


def CompileParseCssTestMinified(out_dir):
  logging.info('entering ...')
  CompileWithClosure(
      js_files=['parse-css.js', 'tokenize-css.js', 'css-selectors.js',
                'json-testutil.js', 'parse-css_test.js'],
      closure_entry_points=['parse_css.ParseCssTest'],
      output_file='%s/parse-css_test_minified.js' % out_dir)
  logging.info('... success')


def GenerateTestRunner(out_dir):
  logging.info('entering ...')
  f = open('%s/test_runner' % out_dir, 'w')
  f.write("""#!/usr/bin/nodejs
             global.assert = require('assert');
             global.fs = require('fs');
             global.path = require('path');
             var JasmineRunner = require('jasmine');
             var jasmine = new JasmineRunner();
             process.env.TESTDATA_DIRS = 'testdata'
             require('./validator_test_minified');
             require('./htmlparser_test_minified');
             require('./parse-css_test_minified');
             jasmine.onComplete(function (passed) {
                 process.exit(passed ? 0 : 1);
             });
             jasmine.execute();
          """)
  os.chmod('%s/test_runner' % out_dir, 0750)
  logging.info('... success')


def RunTests(out_dir):
  logging.info('entering ...')
  subprocess.check_call(['%s/test_runner' % out_dir])
  logging.info('... success')


logging.basicConfig(format='[[%(filename)s %(funcName)s]] - %(message)s',
                    level=logging.INFO)
CheckPrereqs()
InstallNodeDependencies()
SetupOutDir(out_dir='dist')
GenValidatorPb2Py(out_dir='dist')
GenValidatorGeneratedJs(out_dir='dist')
CompileValidatorMinified(out_dir='dist')
GenerateValidateBin(out_dir='dist')
RunSmokeTest(out_dir='dist')
CompileValidatorTestMinified(out_dir='dist')
CompileHtmlparserTestMinified(out_dir='dist')
CompileParseCssTestMinified(out_dir='dist')
GenerateTestRunner(out_dir='dist')
RunTests(out_dir='dist')
