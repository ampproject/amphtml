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
# This script builds the Java AMP Validator.
set -e # Exit on error
echo 'clean start';
bazel clean
echo 'clean done, run //:fetchAMPResources start';
bazel run //:fetchAMPResources
echo 'run //:fetchAMPResources done, build //:amphtml_validator_java_proto_lib start';
bazel build //:amphtml_validator_java_proto_lib
echo 'build //:amphtml_validator_java_proto_lib done, run //:copyValidatorJavaSource start';
bazel run //:copyValidatorJavaSource
echo 'run //:copyValidatorJavaSource done, build //:amphtml_validator_lib start';
bazel build //:amphtml_validator_lib
echo 'build //:amphtml_validator_lib done, build //:amphtml_validator_test start';
bazel build //:amphtml_validator_test
echo 'build //:amphtml_validator_test done';
