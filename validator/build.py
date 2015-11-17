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

  if platform.system() != 'Linux':
    Die('Sorry, this script assumes Linux thus far, e.g. Ubuntu 14. '
        'Please feel free to edit the source and fix it to your needs.')

  # Ensure source files are available.
  for f in ['validator.protoascii', 'validator.proto', 'validator_gen.py',
            'package.json']:
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


def SetupOutDir(out_dir):
  """Sets up a clean output directory.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  if os.path.exists(out_dir):
    subprocess.check_call(['rm', '-rf', out_dir])
  os.mkdir(out_dir)


def InstallNodeDependencies():
  # Install the project dependencies specified in package.json into
  # node_modules.
  subprocess.check_call(['npm', 'install'])


def GenValidatorPb2Py(out_dir):
  """Calls the proto compiler to generate validator_pb2.py.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  subprocess.check_call(['protoc', 'validator.proto',
                         '--python_out=%s' % out_dir])
  open('codegen/__init__.py', 'w').close()


def GenValidatorGeneratedJs(out_dir):
  """Calls validator_gen to generate validator-generated.js.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  assert re.match(r'^[a-zA-Z_\-0-9]+$', out_dir), 'bad out_dir: %s' % out_dir

  # These imports happen late, within this method because they don't necessarily
  # exist when the module starts running, and the ones that probably do
  # are checked by CheckPrereqs.
  from google.protobuf import text_format
  from google.protobuf import descriptor
  from codegen import validator_pb2
  import validator_gen
  out = []
  validator_gen.GenerateValidatorGeneratedJs(specfile='validator.protoascii',
                                             validator_pb2=validator_pb2,
                                             text_format=text_format,
                                             descriptor=descriptor,
                                             out=out)
  out.append('')
  f = open('codegen/validator-generated.js', 'w')
  f.write('\n'.join(out))
  f.close()


def CompileValidatorMinified(out_dir):
  GOOG = 'node_modules/google-closure-library/closure/goog/'
  subprocess.check_call([
      'node_modules/google-closure-library/closure/bin/build/closurebuilder.py',
      '--output_mode=compiled',
      '--compiler_jar=node_modules/google-closure-compiler/compiler.jar',
      '--root=node_modules/google-closure-library/closure',
      '--root=node_modules/google-closure-library/third_party/closure',
      '--output_file=codegen/validator_minified.js',
      '--input=codegen/validator-generated.js',
      '--input=validator-in-browser.js',
      '--input=validator.js',
      '--compiler_flags=--language_in=ECMASCRIPT6_STRICT',
      '--compiler_flags=--language_out=ES5_STRICT',
      'htmlparser.js',
      'parse-css.js',
      'tokenize-css.js',
      'codegen/validator-generated.js',
      'validator-in-browser.js',
      'validator.js'])


def GenerateValidateBin(out_dir):
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


def RunSmokeTest(out_dir):
  # Run codegen/validate on the minimum valid amp and observe that it passes.
  p = subprocess.Popen(['codegen/validate', 'testdata/minimum_valid_amp.html'],
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  (stdout, stderr) = p.communicate()
  if ('PASS\n', '', p.returncode) != (stdout, stderr, 0):
    Die('Smoke test failed. returncode=%d stdout="%s" stderr="%s"' % (
        p.returncode, stdout, stderr))

  # Run codegen/validate on an empty file and observe that it fails.
  open('%s/empty.html' % out_dir, 'w').close()
  p = subprocess.Popen(['codegen/validate', '%s/empty.html' % out_dir],
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  (stdout, stderr) = p.communicate()
  if p.returncode != 1:
    Die('smoke test failed. Expected p.returncode==1, saw: %s' % p.returncode)
  if not stderr.startswith('FAIL\nempty.html:1:0 MANDATORY_TAG_MISSING'):
    Die('smoke test failed; stderr was: "%s"' % stdout)


CheckPrereqs()
InstallNodeDependencies()
SetupOutDir(out_dir='codegen')
GenValidatorPb2Py(out_dir='codegen')
GenValidatorGeneratedJs(out_dir='codegen')
CompileValidatorMinified(out_dir='codegen')
GenerateValidateBin(out_dir='codegen')
RunSmokeTest(out_dir='codegen')
print 'Success - codegen/validate built and tested.'
