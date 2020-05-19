#!/bin/bash
#
# Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

sudo apt-get install unzip &&
a=$(uname -m) &&
rm -r /tmp/chromedriver/
mkdir /tmp/chromedriver/ &&
wget -O /tmp/chromedriver/chromedriver.zip 'http://chromedriver.storage.googleapis.com/83.0.4103.39/chromedriver_linux64.zip' &&
sudo unzip /tmp/chromedriver/chromedriver.zip chromedriver -d /usr/local/bin/ &&
echo 'success?'
