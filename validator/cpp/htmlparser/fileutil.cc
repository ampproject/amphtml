//
// Copyright 2019 The AMP HTML Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the license.
//

#include "fileutil.h"

#include <glob.h>

#include <cstring>
#include <fstream>
#include <iostream>
#include <sstream>

#include "defer.h"
#include "strings.h"

namespace htmlparser {

std::string FileContents(std::string_view filepath) {
  auto str = std::ostringstream{};
  std::ifstream fd(std::string(filepath), std::ios::in);
  defer(fd.close());
  str << fd.rdbuf();
  return str.str();
}

bool ReadFileLinesInternal(const FileReadOptions& options,
                           std::istream& fd,
                           LineCallback callback);

bool FileUtil::ReadFileLines(const FileReadOptions& options,
                             std::string_view filepath,
                             std::vector<std::string>* output) {
  return ReadFileLines(options, filepath, [&](std::string_view line, int) {
    output->push_back(line.data());
  });
}

bool FileUtil::ReadFileLines(const FileReadOptions& options,
                             std::istream& fd,
                             std::vector<std::string>* output) {
  return ReadFileLinesInternal(options, fd, [&](std::string_view line, int) {
    output->push_back(line.data());
  });
}

bool FileUtil::ReadFileLines(const FileReadOptions& options,
                             std::string_view filepath,
                             LineCallback callback) {
  std::ifstream fd(filepath.data());
  defer(fd.close());
  return ReadFileLinesInternal(options, fd, callback);
}

bool FileUtil::ReadFileLines(const FileReadOptions& options,
                             std::istream& fd,
                             LineCallback callback) {
  return ReadFileLinesInternal(options, fd, callback);
}

bool FileUtil::Glob(std::string_view pattern,
                    std::vector<std::string>* filenames) {
  glob_t glob_result;
  std::memset(&glob_result, 0, sizeof(glob_result));

  int return_value = glob(pattern.data(), GLOB_TILDE, nullptr, &glob_result);
  // Ensures cleanup.
  defer(globfree(&glob_result));

  if (return_value != 0) {
    return false;
  }

  for (std::size_t i = 0; i < glob_result.gl_pathc; ++i) {
    filenames->push_back(std::string(glob_result.gl_pathv[i]));
  }

  return true;
}

bool ReadFileLinesInternal(const FileReadOptions& options,
                           std::istream& fd,
                           LineCallback callback) {
  if (!fd.good()) {
    return false;
  }

  int line_number = 0;
  std::string line;
  while (std::getline(fd, line)) {
    line_number++;
    if (line.empty()) continue;

    if (options.ignore_comments && line.at(0) == options.comments_char) {
      continue;
    }

    if (std::get_if<FileReadOptions::LineTransforms::UpperCase>(
          &options.case_transform) != nullptr) {
      std::transform(line.begin(), line.end(), line.begin(),
          [](unsigned char c) { return std::toupper(c); });
    } else if (std::get_if<FileReadOptions::LineTransforms::LowerCase>(
          &options.case_transform) != nullptr) {
      std::transform(line.begin(), line.end(), line.begin(),
          [](unsigned char c) { return std::tolower(c); });
    }

    if (std::get_if<FileReadOptions::LineTransforms::StripWhitespaceLeft>(
          &options.white_space_transform) != nullptr) {
      Strings::TrimLeft(&line);
    } else if (
        std::get_if<FileReadOptions::LineTransforms::StripWhitespaceRight>(
          &options.white_space_transform) != nullptr) {
      Strings::TrimRight(&line);
    } else if (
        std::get_if<FileReadOptions::LineTransforms::StripWhitespace>(
          &options.white_space_transform) != nullptr) {
      Strings::Trim(&line);
    }

    for (auto c : line) {
      if (!options.char_predicate(c)) {
        std::cerr << "Invalid character found in tags file. Char: " << c
          << std::endl;
        return false;
      }
    }

    callback(line, line_number);
  }

  return true;
}

}  // namespace htmlparser
