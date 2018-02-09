#!/bin/bash
#
# Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
# This script clones https://github.com/ampproject/amp-by-example and
# regenerates all the pages on www.ampbyexample.com so they can be used as test
# pages by the AMP visual diff tests.

GREEN() { echo -e "\033[1;32m$1\033[0m"; }
CYAN() { echo -e "\033[1;36m$1\033[0m"; }
YELLOW() { echo -e "\033[1;33m$1\033[0m"; }
RED() { echo -e "\033[1;31m$1\033[0m"; }

RUN() {
  $* || { echo $(RED "ERROR:") "Command" $(CYAN $1) "failed"  ; exit 1; }
}

#SCRIPT=${BASH_SOURCE[0]}
SCRIPT=`realpath $0`
BUILD_SYSTEM_DIR=$(dirname "$SCRIPT")
AMPHTML_DIR=$(dirname "$BUILD_SYSTEM_DIR")
SRC_DIR=$(dirname "$AMPHTML_DIR")
ABE_DIR="$SRC_DIR/amp-by-example"
ABE_TESTS_PATH="examples/visual-tests/amp-by-example"
ABE_TESTS_DIR="$AMPHTML_DIR/$ABE_TESTS_PATH"
ABE_CLONE_PATH="git@github.com:ampproject/amp-by-example.git"

echo $(YELLOW "-----------------------------------------------------------------------------------------------------------------")
echo $(GREEN "Running") $(CYAN $SCRIPT)
echo $(GREEN "This script does the following:")
echo $(GREEN "  1. If required, creates a local") $(CYAN "amp-by-example") $(GREEN "git client in") $(CYAN $ABE_DIR)
echo $(GREEN "  2. If already present, updates the local") $(CYAN "amp-by-example") $(GREEN "git client")
echo $(GREEN "  3. Runs") $(CYAN "gulp build") $(GREEN "to regenerate pages")
echo $(GREEN "  4. Copies the") $(CYAN "dist") $(GREEN "folder to") $(CYAN "$ABE_TESTS_DIR")
echo $(GREEN "  5. Prepends all local directory links with") $(CYAN "$ABE_TESTS_PATH")
echo $(YELLOW "-----------------------------------------------------------------------------------------------------------------")
echo -e "\n"

read -n 1 -s -r -p "$(GREEN 'Press any key to continue...')"

# Create a clone in ampproject/amp-by-example if required
echo -e "\n"
echo $(GREEN "Checking for the existence of") $(CYAN $ABE_DIR)
if [ -d "$ABE_DIR" ]; then
  echo "Found" $(CYAN $ABE_DIR)
else
  echo "Could not find" $(CYAN $ABE_DIR)

  echo -e "\n"
  echo $(GREEN "Cloning") $(CYAN $ABE_CLONE_PATH) $(GREEN "into") $(CYAN $ABE_DIR)
  RUN "cd $SRC_DIR"
  RUN "git clone $ABE_CLONE_PATH"

  echo -e "\n"
  echo $(GREEN "Running") $(CYAN "npm install")
  RUN "cd $ABE_DIR"
  RUN "npm install"
fi

# Create a fresh build in ampproject/amp-by-example
echo -e "\n"
echo $(GREEN "Changing directory to") $(CYAN $ABE_DIR)
RUN "cd $ABE_DIR"
RUN "echo `pwd`"

echo -e "\n"
echo $(GREEN "Current branch")
RUN "git branch"

echo -e "\n"
echo $(GREEN "Status and local changes from current branch")
RUN "git status"
RUN "git diff"

echo -e "\n"
echo $(GREEN "Resetting local changes")
RUN "git checkout master -- ."
RUN "git status"

echo -e "\n"
echo $(GREEN "Checking out the") $(CYAN "master") $(GREEN "branch")
RUN "git checkout master"

echo -e "\n"
echo $(GREEN "Fetching latest changes from") $(CYAN "upstream")
RUN "git fetch"
RUN "git status"

echo -e "\n"
echo $(GREEN "Applying changes locally")
RUN "git rebase"
RUN "git status"

echo -e "\n"
echo $(GREEN "Cleaning") $(CYAN "dist") $(GREEN "directory in") $(CYAN $ABE_DIR)
RUN "gulp clean"

echo -e "\n"
echo $(GREEN "Building") $(CYAN "amp-by-example")
RUN "gulp build"

# Copy dist directory to examples/visual-diff/amp-by-example
echo -e "\n"
echo $(GREEN "Copying contents of") $(CYAN "$ABE_DIR/dist") $(GREEN "from") \
$(GREEN "to") $(CYAN "$ABE_TESTS_DIR")
RUN "rm -rf $ABE_TESTS_DIR/*"
RUN "cp -r $ABE_DIR/dist/* $ABE_TESTS_DIR/"

echo -e "\n"
echo $(GREEN "Contents of") $(CYAN "$ABE_TESTS_DIR")
RUN "ls -la $ABE_TESTS_DIR/"

echo -e "\n"
echo $(GREEN "Subdirectories in") $(CYAN "$ABE_TESTS_DIR")
cd $ABE_TESTS_DIR
RUN "ls -d */"

echo -e "\n"
echo $(GREEN "Prepending all local directory links with") $(CYAN "$ABE_TESTS_DIR")
for HTMLFILE in `find . -name "*.html"`
do
  echo "Processing $HTMLFILE..."
  for DIRPATH in `ls -d */`
  do
    DIRNAME=`basename $DIRPATH`
    sed -i "s~/$DIRNAME/~/$ABE_TESTS_PATH/$DIRNAME/~g" $HTMLFILE
    sed -i "s~ampbyexample\.com/$ABE_TESTS_PATH/$DIRNAME/~ampbyexample\.com/$DIRNAME/~g" $HTMLFILE
  done
done
echo -e "\n"
echo $(YELLOW "-----------------------------------------------------------------------------------------------------------------")
echo $(GREEN "Successfully completed the following:")
echo $(GREEN "  1. Created / updated the local") $(CYAN "amp-by-example") $(GREEN "git client")
echo $(GREEN "  2. Regenerated all pages in") $(CYAN "$ABE_TESTS_DIR")
echo $(GREEN "  3. Replaced the contents of") $(CYAN "$ABE_TESTS_DIR") $(GREEN "with newly built pages")
echo $(GREEN "  4. Prepended all local directory links with") $(CYAN "$ABE_TESTS_PATH")
echo $(YELLOW "-----------------------------------------------------------------------------------------------------------------")
