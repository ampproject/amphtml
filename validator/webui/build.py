#!/usr/bin/env python2.7
#
# Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

# TODO(powdercloud): Make a gulp file or similar for this. For now
# it's simply split off from the main build.py in the parent
# directory, but this is not an idiomatic use to build a Javascript or
# Polymer project, and unlike for the parent directory there's no
# particular benefit to using Python.

import glob
import logging
import os
import platform
import re
import shutil
import subprocess
import sys
import tempfile


def Die(msg):
  """Prints error and exits with status 1.

  Args:
    msg: The error message to emit
  """
  print >> sys.stderr, msg
  sys.exit(1)


def GetNodeJsCmd():
  """Ensure Node.js is installed and return the proper command to run."""
  logging.info('entering ...')

  for cmd in ['node', 'nodejs']:
    try:
      output = subprocess.check_output([cmd, '--eval', 'console.log("42")'])
      if output.strip() == '42':
        logging.info('... done')
        return cmd
    except (subprocess.CalledProcessError, OSError):
      continue
  Die('Node.js not found. Try "apt-get install nodejs".')


def CheckPrereqs():
  """Checks that various prerequisites for this script are satisfied."""
  logging.info('entering ...')

  if platform.system() != 'Linux' and platform.system() != 'Darwin':
    Die('Sorry, this script assumes Linux or Mac OS X thus far. '
        'Please feel free to edit the source and fix it to your needs.')

  # Ensure source files are available.
  for f in ['webui.js', 'index.html',
            'logo-blue.svg', 'package.json']:
    if not os.path.exists(f):
      Die('%s not found. Must run in amp_validator source directory.' % f)

  # Ensure that npm is installed.
  try:
    npm_version = subprocess.check_output(['npm', '--version'])
  except (subprocess.CalledProcessError, OSError):
    Die('npm package manager not found. Try "apt-get install npm".')

  # Ensure npm version '1.3.10' or newer.
  m = re.search('^(\\d+)\\.(\\d+)\\.(\\d+)$', npm_version)
  if (int(m.group(1)), int(m.group(2)), int(m.group(3))) < (1, 3, 10):
    Die('Expected npm version 1.3.10 or newer, saw: %s' % npm_version)

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
  """Installs the dependencies using npm."""
  logging.info('entering ...')
  # Install the project dependencies specified in package.json into
  # node_modules.
  logging.info('installing AMP Validator webui dependencies ...')
  subprocess.check_call(
      ['npm', 'install'],
      stdout=(open(os.devnull, 'wb') if os.environ.get('TRAVIS') else sys.stdout))
  logging.info('... done')


def CreateWebuiAppengineDist(out_dir):
  """Creates the webui vulcanized directory to deploy to Appengine.

  Args:
    out_dir: directory name of the output directory. Must not have slashes,
      dots, etc.
  """
  logging.info('entering ...')
  try:
    tempdir = tempfile.mkdtemp()
    # Merge the contents of webui with the installed node_modules into a
    # common root (a temp directory). This lets us use the vulcanize tool.
    for entry in os.listdir('.'):
      if entry != 'node_modules':
        if os.path.isfile(entry):
          shutil.copyfile(entry, os.path.join(tempdir, entry))
        else:
          shutil.copytree(entry, os.path.join(tempdir, entry))
    for entry in os.listdir('node_modules'):
      if entry == 'web-animations-js':
        shutil.copytree(os.path.join('node_modules', entry),
                        os.path.join(tempdir, '@polymer', entry))
      elif entry != '@polymer':
        shutil.copytree(os.path.join('node_modules', entry),
                        os.path.join(tempdir, entry))
    for entry in os.listdir('node_modules/@polymer'):
      shutil.copytree(os.path.join('node_modules/@polymer', entry),
                      os.path.join(tempdir, '@polymer', entry))
    vulcanized_index_html = subprocess.check_output([
        'node_modules/vulcanize/bin/vulcanize',
        '--inline-scripts', '--inline-css',
        '-p', tempdir, 'index.html'])
  finally:
    shutil.rmtree(tempdir)
  webui_out = os.path.join(out_dir, 'webui_appengine')
  shutil.copytree('.', webui_out, ignore=shutil.ignore_patterns('dist'))
  f = open(os.path.join(webui_out, 'index.html'), 'w')
  f.write(vulcanized_index_html)
  f.close()
  logging.info('... success')


def Main():
  """The main method, which executes all build steps and runs the tests."""
  logging.basicConfig(
      format='[[%(filename)s %(funcName)s]] - %(message)s',
      level=(logging.ERROR if os.environ.get('TRAVIS') else logging.INFO))
  nodejs_cmd = GetNodeJsCmd()
  CheckPrereqs()
  InstallNodeDependencies()
  SetupOutDir(out_dir='dist')
  CreateWebuiAppengineDist(out_dir='dist')


if __name__ == '__main__':
  Main()
