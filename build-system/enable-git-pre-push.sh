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
# This script adds a pre-push hook to .git/hooks/, which runs some basic tests
# before running "git push".
#
# To enable it, run this script: "./build-system/enable-git-pre-push.sh"


SCRIPT=`realpath $0`
BUILD_SYSTEM_DIR=$(dirname "$SCRIPT")
AMPHTML_DIR=$(dirname "$BUILD_SYSTEM_DIR")
PRE_PUSH_SRC="build-system/default-pre-push"
GIT_HOOKS_DIR=".git/hooks"
PRE_PUSH_DEST="$GIT_HOOKS_DIR/pre-push"
PRE_PUSH_BACKUP="$GIT_HOOKS_DIR/pre-push.backup"

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
CYAN() { echo -e "\033[0;36m$1\033[0m"; }
YELLOW() { echo -e "\033[0;33m$1\033[0m"; }


echo $(YELLOW "-----------------------------------------------------------------------------------------------------------------")
echo $(GREEN "Running") $(CYAN $SCRIPT)
echo $(GREEN "This script does the following:")
echo $(GREEN "  1. If already present, makes a backup of") $(CYAN "$PRE_PUSH_DEST") $(GREEN "at") $(CYAN "$PRE_PUSH_BACKUP")
echo $(GREEN "  2. Creates a new file") $(CYAN "$PRE_PUSH_DEST") $(GREEN "which calls") $(CYAN "$PRE_PUSH_SRC")
echo $(GREEN "  3. With this,")  $(CYAN "git push") $(GREEN "will first run the checks in") $(CYAN "$PRE_PUSH_SRC")
echo $(GREEN "  4. You can edit") $(CYAN "$PRE_PUSH_DEST") $(GREEN "to change the pre-push hooks that are run before") $(CYAN "git push")
echo $(GREEN "  5. To skip the hook, run") $(CYAN "git push --no-verify") $(GREEN "or") $(CYAN "git push -n")
echo $(GREEN "  6. To remove the hook, delete the file") $(CYAN "$PRE_PUSH_DEST")
echo $(YELLOW "-----------------------------------------------------------------------------------------------------------------")
echo -e "\n"

read -n 1 -s -r -p "$(GREEN 'Press any key to continue...')"
echo -e "\n"

if [ -f "$AMPHTML_DIR/$PRE_PUSH_DEST" ]; then
  echo $(GREEN "Found") $(CYAN $PRE_PUSH_DEST)
  mv $AMPHTML_DIR/$PRE_PUSH_DEST $AMPHTML_DIR/$PRE_PUSH_BACKUP
  echo $(GREEN "Moved it to") $(CYAN $PRE_PUSH_BACKUP)
fi

cat > $AMPHTML_DIR/$PRE_PUSH_DEST <<- EOM
#!/bin/bash
# Pre-push hook for AMPHTML
eval $AMPHTML_DIR/$PRE_PUSH_SRC
EOM
chmod 755 $AMPHTML_DIR/$PRE_PUSH_DEST

echo $(GREEN "Successfully wrote") $(CYAN "$PRE_PUSH_DEST")
