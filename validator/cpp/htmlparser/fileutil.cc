#include "cpp/htmlparser/fileutil.h"

#include <glob.h>

#include <algorithm>
#include <cstring>
#include <fstream>
#include <iostream>
#include <sstream>

#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/strings.h"

// TODO(caoboxiao)
// The Macro `GLOB_TILDE` is not defined in the WebAssembly environment because
// WebAssembly does not have the file system, so we have to define this MACRO in
// order to have this file successfully compiled in WebAssembly. The side
// effects is minimized because this is a cc file not an h file. In fact, the
// WebAssembly module never calls the glob function, so it is better to split
// fileutil.cc into two files, and the WebAssembly module will only depend on
// the one without glob functions.
#ifndef GLOB_TILDE
#define GLOB_TILDE (1 << 12)
#endif

namespace htmlparser {

std::string FileUtil::FileContents(std::string_view filepath) {
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
