#!/usr/bin/env python2.7
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

import argparse
import glob
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


def EnsureNodeJsIsInstalled():
  """Ensure Node.js is installed and that 'node' is the command to run."""
  logging.info('entering ...')

  try:
    output = subprocess.check_output(['node', '--eval', 'console.log("42")'])
    if output.strip() == '42':
      return
  except (subprocess.CalledProcessError, OSError):
    pass
  Die('Node.js not found. Try "apt-get install nodejs" or follow the install instructions at https://github.com/ampproject/amphtml/blob/master/validator/README.md#installation')


def CheckPrereqs():
  """Checks that various prerequisites for this script are satisfied."""
  logging.info('entering ...')

  if platform.system() != 'Linux' and platform.system() != 'Darwin':
    Die('Sorry, this script assumes Linux or Mac OS X thus far. '
        'Please feel free to edit the source and fix it to your needs.')

  # Ensure source files are available.
  for f in [
      'validator-main.protoascii', 'validator.proto', 'validator_gen_js.py',
      'package.json', 'engine/validator.js', 'engine/validator_test.js',
      'engine/validator-in-browser.js', 'engine/tokenize-css.js',
      'engine/definitions.js', 'engine/parse-css.js', 'engine/parse-srcset.js',
      'engine/parse-url.js'
  ]:
    if not os.path.exists(f):
      Die('%s not found. Must run in amp_validator source directory.' % f)

  # Ensure protoc is available.
  try:
    libprotoc_version = subprocess.check_output(['protoc', '--version'])
  except (subprocess.CalledProcessError, OSError):
    Die('Protobuf compiler not found. Try "apt-get install protobuf-compiler" or follow the install instructions at https://github.com/ampproject/amphtml/blob/master/validator/README.md#installation.')

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
    except ImportError:
      Die('%s not found. Try "apt-get install python-protobuf" or follow the install instructions at https://github.com/ampproject/amphtml/blob/master/validator/README.md#installation' % module)

  # Ensure that yarn is installed.
  try:
    subprocess.check_output(['yarn', '--version'])
  except (subprocess.CalledProcessError, OSError):
    Die('Yarn package manager not found. Run '
        '"curl -o- -L https://yarnpkg.com/install.sh | bash" '
        'or see https://yarnpkg.com/docs/install.')

  # Ensure JVM installed. TODO: Check for version?
  try:
    subprocess.check_output(['java', '-version'], stderr=subprocess.STDOUT)
  except (subprocess.CalledProcessError, OSError):
    Die('Java missing. Try "apt-get install openjdk-7-jre" or follow the install instructions at https://github.com/ampproject/amphtml/blob/master/validator/README.md#installation')
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
  """Installs the dependencies using yarn."""
  logging.info('entering ...')
  # Install the project dependencies specified in package.json into
  # node_modules.
  logging.info('installing AMP Validator engine dependencies ...')
  subprocess.check_call(
      ['yarn', 'install'],
      stdout=(open(os.devnull, 'wb') if os.environ.get('TRAVIS') else sys.stdout))
  logging.info('installing AMP Validator nodejs dependencies ...')
  subprocess.check_call(
      ['yarn', 'install'],
      cwd='nodejs',
      stdout=(open(os.devnull, 'wb') if os.environ.get('TRAVIS') else sys.stdout))
  logging.info('... done')


def GenValidatorPb2Py(out_dir):
  """Calls the proto compiler to generate validator_pb2.py.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  subprocess.check_call(
      ['protoc', 'validator.proto', '--python_out=%s' % out_dir])
  open('%s/__init__.py' % out_dir, 'w').close()
  logging.info('... done')


def GenValidatorProtoascii(out_dir):
  """Assembles the validator protoascii file from the main and extensions.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  protoascii_segments = [open('validator-main.protoascii').read()]
  extensions = glob.glob('extensions/*/validator-*.protoascii')
  # In the Github project, the extensions are located in a sibling directory
  # to the validator rather than a child directory.
  if not extensions:
    extensions = glob.glob('../extensions/*/validator-*.protoascii')
  extensions.sort()
  for extension in extensions:
    protoascii_segments.append(open(extension).read())
  f = open('%s/validator.protoascii' % out_dir, 'w')
  f.write(''.join(protoascii_segments))
  f.close()
  logging.info('... done')


def GenValidatorProtoGeneratedJs(out_dir):
  """Calls validator_gen_js to generate validator-proto-generated.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  # These imports happen late, within this method because they don't necessarily
  # exist when the module starts running, and the ones that probably do
  # are checked by CheckPrereqs.
  # pylint: disable=g-import-not-at-top
  from google.protobuf import text_format
  from google.protobuf import descriptor
  from dist import validator_pb2
  import validator_gen_js
  # pylint: enable=g-import-not-at-top
  out = []
  validator_gen_js.GenerateValidatorGeneratedJs(
      specfile=None,
      validator_pb2=validator_pb2,
      generate_proto_only=True,
      generate_spec_only=False,
      text_format=text_format,
      html_format=None,
      descriptor=descriptor,
      out=out)
  out.append('')
  f = open('%s/validator-proto-generated.js' % out_dir, 'w')
  f.write('\n'.join(out))
  f.close()
  logging.info('... done')


def GenValidatorGeneratedJs(out_dir):
  """Calls validator_gen_js to generate validator-generated.js and validator-generated.json.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  # These imports happen late, within this method because they don't necessarily
  # exist when the module starts running, and the ones that probably do
  # are checked by CheckPrereqs.
  # pylint: disable=g-import-not-at-top
  from google.protobuf import text_format
  from google.protobuf import json_format
  from google.protobuf import descriptor
  from dist import validator_pb2
  import validator_gen_js
  # pylint: enable=g-import-not-at-top
  out = []
  validator_gen_js.GenerateValidatorGeneratedJs(
      specfile='%s/validator.protoascii' % out_dir,
      validator_pb2=validator_pb2,
      generate_proto_only=False,
      generate_spec_only=True,
      text_format=text_format,
      html_format=None,
      descriptor=descriptor,
      out=out)
  out.append('')
  f = open('%s/validator-generated.js' % out_dir, 'w')
  f.write('\n'.join(out))
  f.close()

  out = []
  validator_gen_js.GenerateValidatorGeneratedJson(
      specfile='%s/validator.protoascii' % out_dir,
      validator_pb2=validator_pb2,
      text_format=text_format,
      json_format=json_format,
      out=out)
  out.append('')
  f = open('%s/validator-generated.json' % out_dir, 'w')
  f.write('\n'.join(out))
  f.close()
  logging.info('... done')


def CompileWithClosure(js_files, definitions, entry_points, output_file):
  """Compiles the arguments with the Closure compiler for transpilation to ES5.

  Args:
    js_files: list of files to compile
    definitions: list of definitions flags to closure compiler
    entry_points: entry points (these won't be minimized)
    output_file: name of the Javascript output file
  """

  cmd = [
      'java', '-jar', 'node_modules/google-closure-compiler/compiler.jar',
      '--language_out=ES5_STRICT', '--dependency_mode=STRICT',
      '--js_output_file=%s' % output_file
  ]
  cmd += ['--entry_point=%s' % e for e in entry_points]
  cmd += ['--output_manifest=%s' % ('%s.manifest' % output_file)]
  cmd += [
      'node_modules/google-closure-library/closure/**.js',
      '!node_modules/google-closure-library/closure/**_test.js',
      'node_modules/google-closure-library/third_party/closure/**.js',
      '!node_modules/google-closure-library/third_party/closure/**_test.js'
  ]
  cmd += js_files
  cmd += definitions
  subprocess.check_call(cmd)


def CompileValidatorMinified(out_dir):
  """Generates a minified validator script, which can be imported to validate.

  Args:
    out_dir: output directory
  """
  logging.info('entering ...')
  CompileWithClosure(
      js_files=[
          'engine/definitions.js', 'engine/htmlparser.js',
          'engine/parse-css.js', 'engine/parse-srcset.js',
          'engine/parse-url.js', 'engine/tokenize-css.js',
          '%s/validator-generated.js' % out_dir,
          '%s/validator-proto-generated.js' % out_dir,
          'engine/validator-in-browser.js', 'engine/validator.js',
          'engine/amp4ads-parse-css.js', 'engine/keyframes-parse-css.js',
          'engine/htmlparser-interface.js'
      ],
      definitions=[],
      entry_points=[
          'amp.validator.validateString',
          'amp.validator.renderValidationResult',
          'amp.validator.renderErrorMessage'
      ],
      output_file='%s/validator_minified.js' % out_dir)
  logging.info('... done')


def RunSmokeTest(out_dir):
  """Runs a smoke test (minimum valid AMP and empty html file).

  Args:
    out_dir: output directory
  """
  logging.info('entering ...')
  # Run index.js on the minimum valid amp and observe that it passes.
  p = subprocess.Popen(
      [
          'node', 'nodejs/index.js', '--validator_js',
          '%s/validator_minified.js' % out_dir,
          'testdata/feature_tests/minimum_valid_amp.html', '--format=text'
      ],
      stdout=subprocess.PIPE,
      stderr=subprocess.PIPE)
  (stdout, stderr) = p.communicate()
  if ('testdata/feature_tests/minimum_valid_amp.html: PASS\n', '', p.returncode
     ) != (stdout, stderr, 0):
    Die('Smoke test failed. returncode=%d stdout="%s" stderr="%s"' %
        (p.returncode, stdout, stderr))

  # Run index.js on an empty file and observe that it fails.
  p = subprocess.Popen(
      [
          'node', 'nodejs/index.js', '--validator_js',
          '%s/validator_minified.js' % out_dir,
          'testdata/feature_tests/empty.html', '--format=text'
      ],
      stdout=subprocess.PIPE,
      stderr=subprocess.PIPE)
  (stdout, stderr) = p.communicate()
  if p.returncode != 1:
    Die('smoke test failed. Expected p.returncode==1, saw: %s' % p.returncode)
  if not stderr.startswith('testdata/feature_tests/empty.html:1:0 '
                           'The mandatory tag \'html'):
    Die('smoke test failed; stderr was: "%s"' % stderr)
  logging.info('... done')


def RunIndexTest():
  """Runs the index_test.js, which tests the NodeJS API.
  """
  logging.info('entering ...')
  p = subprocess.Popen(
      ['node', './index_test.js'],
      stdout=subprocess.PIPE,
      stderr=subprocess.PIPE,
      cwd='nodejs')
  (stdout, stderr) = p.communicate()
  if p.returncode != 0:
    Die('index_test.js failed. returncode=%d stdout="%s" stderr="%s"' %
        (p.returncode, stdout, stderr))
  logging.info('... done')


def CompileValidatorTestMinified(out_dir):
  """Runs closure compiler for validator_test.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  CompileWithClosure(
      js_files=[
          'engine/definitions.js', 'engine/htmlparser.js',
          'engine/parse-css.js', 'engine/parse-srcset.js',
          'engine/parse-url.js', 'engine/tokenize-css.js',
          '%s/validator-generated.js' % out_dir,
          '%s/validator-proto-generated.js' % out_dir,
          'engine/validator-in-browser.js', 'engine/validator.js',
          'engine/amp4ads-parse-css.js', 'engine/keyframes-parse-css.js',
          'engine/htmlparser-interface.js', 'engine/validator_test.js'
      ],
      definitions=[],
      entry_points=['amp.validator.ValidatorTest'],
      output_file='%s/validator_test_minified.js' % out_dir)
  logging.info('... success')


def CompileHtmlparserTestMinified(out_dir):
  """Runs closure compiler for htmlparser_test.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  CompileWithClosure(
      js_files=[
          'engine/htmlparser.js', 'engine/htmlparser-interface.js',
          'engine/htmlparser_test.js'
      ],
      definitions=[],
      entry_points=['amp.htmlparser.HtmlParserTest'],
      output_file='%s/htmlparser_test_minified.js' % out_dir)
  logging.info('... success')


def CompileParseCssTestMinified(out_dir):
  """Runs closure compiler for parse-css_test.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  CompileWithClosure(
      js_files=[
          'engine/definitions.js', 'engine/parse-css.js', 'engine/parse-url.js',
          'engine/tokenize-css.js', 'engine/css-selectors.js',
          'engine/json-testutil.js', 'engine/parse-css_test.js',
          '%s/validator-generated.js' % out_dir,
          '%s/validator-proto-generated.js' % out_dir
      ],
      definitions=[],
      entry_points=['parse_css.ParseCssTest'],
      output_file='%s/parse-css_test_minified.js' % out_dir)
  logging.info('... success')


def CompileParseUrlTestMinified(out_dir):
  """Runs closure compiler for parse-url_test.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  CompileWithClosure(
      js_files=[
          'engine/definitions.js', 'engine/parse-url.js', 'engine/parse-css.js',
          'engine/tokenize-css.js', 'engine/css-selectors.js',
          'engine/json-testutil.js', 'engine/parse-url_test.js',
          '%s/validator-generated.js' % out_dir,
          '%s/validator-proto-generated.js' % out_dir
      ],
      definitions=[],
      entry_points=['parse_url.ParseURLTest'],
      output_file='%s/parse-url_test_minified.js' % out_dir)
  logging.info('... success')


def CompileAmp4AdsParseCssTestMinified(out_dir):
  """Runs closure compiler for amp4ads-parse-css_test.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  CompileWithClosure(
      js_files=[
          'engine/definitions.js', 'engine/amp4ads-parse-css_test.js',
          'engine/parse-css.js', 'engine/parse-url.js',
          'engine/amp4ads-parse-css.js', 'engine/tokenize-css.js',
          'engine/css-selectors.js', 'engine/json-testutil.js',
          '%s/validator-generated.js' % out_dir,
          '%s/validator-proto-generated.js' % out_dir
      ],
      definitions=[],
      entry_points=['parse_css.Amp4AdsParseCssTest'],
      output_file='%s/amp4ads-parse-css_test_minified.js' % out_dir)
  logging.info('... success')


def CompileKeyframesParseCssTestMinified(out_dir):
  """Runs closure compiler for keyframes-parse-css_test.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  CompileWithClosure(
      js_files=[
          'engine/definitions.js', 'engine/keyframes-parse-css_test.js',
          'engine/parse-css.js', 'engine/parse-url.js',
          'engine/keyframes-parse-css.js', 'engine/tokenize-css.js',
          'engine/css-selectors.js', 'engine/json-testutil.js',
          '%s/validator-generated.js' % out_dir,
          '%s/validator-proto-generated.js' % out_dir
      ],
      definitions=[],
      entry_points=['parse_css.KeyframesParseCssTest'],
      output_file='%s/keyframes-parse-css_test_minified.js' % out_dir)
  logging.info('... success')


def CompileParseSrcsetTestMinified(out_dir):
  """Runs closure compiler for parse-srcset_test.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  CompileWithClosure(
      js_files=[
          'engine/definitions.js', 'engine/parse-srcset.js',
          'engine/json-testutil.js', 'engine/parse-srcset_test.js',
          '%s/validator-generated.js' % out_dir,
          '%s/validator-proto-generated.js' % out_dir
      ],
      definitions=[],
      entry_points=['parse_srcset.ParseSrcsetTest'],
      output_file='%s/parse-srcset_test_minified.js' % out_dir)
  logging.info('... success')


def GenerateTestRunner(out_dir):
  """Generates a test runner: a nodejs script that runs our minified tests.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  f = open('%s/test_runner' % out_dir, 'w')
  extensions_dir = 'extensions'
  # In the Github project, the extensions are located in a sibling directory
  # to the validator rather than a child directory.
  if not os.path.isdir(extensions_dir):
    extensions_dir = '../extensions'
  f.write("""#!/usr/bin/env node
             global.assert = require('assert');
             global.fs = require('fs');
             global.path = require('path');
             var JasmineRunner = require('jasmine');
             var jasmine = new JasmineRunner();
             process.env.TESTDATA_ROOTS = 'testdata:%s'
             require('./validator_test_minified');
             require('./htmlparser_test_minified');
             require('./parse-css_test_minified');
             require('./parse-url_test_minified');
             require('./amp4ads-parse-css_test_minified');
             require('./keyframes-parse-css_test_minified');
             require('./parse-srcset_test_minified');
             jasmine.onComplete(function (passed) {
                 process.exit(passed ? 0 : 1);
             });
             jasmine.execute();
          """ % extensions_dir)
  os.chmod('%s/test_runner' % out_dir, 0750)
  logging.info('... success')


def RunTests(update_tests, out_dir):
  """Runs all the minified tests.

  Args:
    update_tests: a boolean indicating whether or not to update the test
      output files.
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  env = os.environ.copy()
  if update_tests:
    env['UPDATE_VALIDATOR_TEST'] = '1'
  subprocess.check_call(['node', '%s/test_runner' % out_dir], env=env)
  logging.info('... success')


def Main(parsed_args):
  """The main method, which executes all build steps and runs the tests."""
  logging.basicConfig(
      format='[[%(filename)s %(funcName)s]] - %(message)s',
      level=(logging.ERROR if os.environ.get('TRAVIS') else logging.INFO))
  EnsureNodeJsIsInstalled()
  CheckPrereqs()
  InstallNodeDependencies()
  SetupOutDir(out_dir='dist')
  GenValidatorProtoascii(out_dir='dist')
  GenValidatorPb2Py(out_dir='dist')
  GenValidatorProtoGeneratedJs(out_dir='dist')
  GenValidatorGeneratedJs(out_dir='dist')
  CompileValidatorMinified(out_dir='dist')
  RunSmokeTest(out_dir='dist')
  RunIndexTest()
  CompileValidatorTestMinified(out_dir='dist')
  CompileHtmlparserTestMinified(out_dir='dist')
  CompileParseCssTestMinified(out_dir='dist')
  CompileParseUrlTestMinified(out_dir='dist')
  CompileAmp4AdsParseCssTestMinified(out_dir='dist')
  CompileKeyframesParseCssTestMinified(out_dir='dist')
  CompileParseSrcsetTestMinified(out_dir='dist')
  GenerateTestRunner(out_dir='dist')
  RunTests(update_tests=parsed_args.update_tests, out_dir='dist')

if __name__ == '__main__':
  parser = argparse.ArgumentParser(
      description='Build script for the AMP Validator.')
  parser.add_argument(
      '--update_tests',
      action='store_true',
      help=('If True, validator_test will overwrite the .out test files with '
            'the encountered test output.'))
  Main(parser.parse_args())
