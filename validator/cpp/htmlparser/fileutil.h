#ifndef CPP_HTMLPARSER_FILEUTIL_H_
#define CPP_HTMLPARSER_FILEUTIL_H_

#include <climits>
#include <functional>
#include <optional>
#include <sstream>
#include <string>
#include <variant>
#include <vector>

namespace htmlparser {

using LineCallback = std::function<void(std::string_view, int)>;

struct FileReadOptions {
  struct LineTransforms {
    // No transformations.
    enum class NoTransform {};
    // Converts the entire line to uppercase chars.
    enum class UpperCase {};
    // Converts the entire line to lowercase chars.
    enum class LowerCase {};
    // Whitespace transformations. tab and whitesapce only.
    // ----------------------------------------------------
    // Strips whitespace at the beginning and the end of the line.
    enum class StripWhitespace {};
    // Strips whitespaces at the beginning of the line only.
    enum class StripWhitespaceLeft {};
    // Strips whitespaces at the end of the line only.
    enum class StripWhitespaceRight {};
  };

  // Ignores lines that are comments in the file. See comments_char below.
  bool ignore_comments = false;

  // Comments character. Ignores lines starting with this character.
  char comments_char = '#';

  // Converts case of the file content.
  std::variant<std::monostate, LineTransforms::LowerCase,
               LineTransforms::UpperCase>
      case_transform;

  // Strips whitespaces.
  std::variant<std::monostate, LineTransforms::StripWhitespace,
               LineTransforms::StripWhitespaceLeft,
               LineTransforms::StripWhitespaceRight>
      white_space_transform;

  // Allowed chars per line predicate. If any char that this predicate doesn't
  // allow file line reader returns error.
  // Default is to allow any character.
  std::function<bool(char)> char_predicate = [](char c) { return true; };
};

class FileUtil {
 public:
  static std::string FileContents(std::string_view filepath);

  // Different styles of utility functions to read text file contents.
  // All return false, if error reading/processing the file.
  //
  // 1) Reads all the lines in a file. Useful for small sized text files.
  static bool ReadFileLines(const FileReadOptions& options,
                            std::string_view filepath,
                            std::vector<std::string>* output);
  static bool ReadFileLines(const FileReadOptions& options, std::istream& fd,
                            std::vector<std::string>* output);

  // 2) Reads line by line to provided callback.
  static bool ReadFileLines(const FileReadOptions& options,
                            std::string_view filepath, LineCallback callback);
  static bool ReadFileLines(const FileReadOptions& options, std::istream& fd,
                            LineCallback callback);

  // 3) Lookup of single row of key/value multi-line data (separated by a marker
  // or EOF)
  //
  // Expecations:
  // - Rows are sorted in some form and client provides a comparator. Example:
  //
  // Amanda : Works in marketing department.
  // ;
  // Amit : Works in engineering department.
  // ;
  // Sam : is on vacations.
  // ;
  // Zahra : was born in leap year.
  //
  // In the above example ';' is the marker and the rows are sorted by the
  // first name. Note: Not the entire row data is sorted. The sorting is user
  // defined and hence user provides a comparator.
  //
  // Example comparator in above example to lookup a key 'Zahra':
  // [](std::string_view line) -> bool {
  //    std::size_t colon = line.find_first_of(':');
  //    if (colon == std::string_view::npos) {
  //      return -1;
  //    }
  //    return (line.substr(0, colon - 1 /* space */).compare('Zahra'));
  // }
  template <std::size_t RowPrefixNumLines = ULONG_MAX - 1>
  static std::optional<std::string> RowLookup(
      std::istream& fd, std::string_view marker,
      std::function<int(std::string_view)> comparator) {
    if (!fd.good()) return std::nullopt;

    // Determine file size.
    fd.seekg(0, std::ios::end);
    int file_size = fd.tellg();
    if (file_size == -1) return std::nullopt;

    std::stringbuf data_buffer;
    bool collect_data = false;
    uint64_t prefix_lines = RowPrefixNumLines;

    std::string line;
    int jump = file_size / 2;
    fd.seekg(jump);

    int current_marker = fd.tellg();
    int compare = 2;

    while (std::getline(fd, line)) {
      if (collect_data) {
        if (prefix_lines-- > 0) {
          data_buffer.sputn(line.c_str(), line.size());
          if (prefix_lines > 0) data_buffer.sputc('\n');
          continue;
        }
        std::string key = data_buffer.str();
        data_buffer.sputc('\n');
        data_buffer.sputn(line.c_str(), line.size());
        compare = comparator(key);
        if (compare == 0) {  // Matched.
          while (std::getline(fd, line)) {
            if (marker.compare(line) == 0) {
              return data_buffer.str();
            }
            data_buffer.sputc('\n');
            data_buffer.sputn(line.c_str(), line.size());
          }
          return data_buffer.str();
        }

        current_marker = fd.tellg();

        // Row didn't match. Move cursor to new location to compare next record.
        if (compare < 0) {  // Move to second half.
          if (jump < file_size / 2) {
            jump = jump + (jump / 2);
          } else {
            jump = jump + ((file_size - jump) / 2);
          }
        } else if (compare > 0) {  // Move to first half.
          if (jump > file_size / 2) {
            jump = jump - ((file_size - jump) / 2);
          } else {
            jump = jump - (jump / 2);
          }
        }

        if (jump < RowPrefixNumLines + 1) {
          jump = 0;
        }

        fd.seekg(jump);
        prefix_lines = RowPrefixNumLines;
        data_buffer.str("");
        collect_data = false;
        continue;
      }

      if (marker.compare(line) == 0) {
        // Collect upto RowPrefixNumLines lines.
        collect_data = true;
        current_marker = fd.tellg();
      }
    }

    return std::nullopt;
  }

  // 4) Returns data (collection of lines until the next marker or EOF) in the
  // file containing multi-line data separated by a marker.
  // This works only if marker is in its own line. It won't work for columnar
  // or delimited files.
  //
  // marker is case sensitive.
  //
  // The optional post processing callback assist transforming the raw text
  // into custom datatype T.
  template <typename T = std::string_view>
  static bool ReadFileDataAtMarker(
      const FileReadOptions& options, std::string_view filepath,
      std::string_view marker, std::function<void(T)> callback,
      std::function<T(std::string_view)> post_processing) {
    std::stringbuf data_buffer;
    auto result = ReadFileLines(
        options, filepath, [&](std::string_view line, int line_number) {
          if (marker.compare(line) == 0) {
            callback(post_processing(data_buffer.str()));
            data_buffer.str("");
          } else {
            data_buffer.sputn(line.data(), line.size());
            data_buffer.sputc('\n');
          }
        });

    callback(post_processing(data_buffer.str()));
    return result;
  }

  template <typename T = std::string_view>
  static bool ReadFileDataAtMarker(
      const FileReadOptions& options, std::istream& fd, std::string_view marker,
      std::function<void(T)> callback,
      std::function<T(std::string_view)> post_processing) {
    std::stringbuf data_buffer;
    auto result =
        ReadFileLines(options, fd, [&](std::string_view line, int line_number) {
          if (marker.compare(line) == 0) {
            callback(post_processing(data_buffer.str()));
            data_buffer.str("");
          } else {
            data_buffer.sputn(line.data(), line.size());
            data_buffer.sputc('\n');
          }
        });

    // Last record.
    callback(post_processing(data_buffer.str()));
    return result;
  }

  // Returns file names based on a pattern.
  static bool Glob(std::string_view pattern,
                   std::vector<std::string>* filenames);
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_FILEUTIL_H_
