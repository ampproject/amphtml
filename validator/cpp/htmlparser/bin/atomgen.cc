// To regenerate atom.h file, run:
// bazel build htmlparser/bin:atomgen
// bazel-bin/htmlparser/bin/atomgen

#include <algorithm>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <map>
#include <memory>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/fileutil.h"
#include "cpp/htmlparser/hash.h"
#include "cpp/htmlparser/strings.h"
#include "cpp/htmlparser/token.h"

namespace htmlparser {

// Internal functions forward declarations.
namespace {
// Converts string to enum value.
std::string ToIdentifier(std::string_view s);
}  // namespace

class TableBuilder {
 public:
  bool Init(uint32_t initial_hash_value, uint32_t hash_num_bits,
      std::vector<std::string>& candidate_strings) {
    initial_hash_value_ = initial_hash_value;
    hash_num_bits_ = hash_num_bits;
    uint32_t entry_size = 1 << hash_num_bits;
    table_.resize(entry_size, "");
    for (std::size_t i = 0; i < entry_size; i++) {
      table_[i] = "";
    }

    mask_ = entry_size - 1;

    for (const auto& s : candidate_strings) {
      if (!Insert(s)) {
        return false;
      }
    }

    return true;
  }

  bool Insert(const std::string& s) {
    std::pair<uint32_t, uint32_t> hashes = Hash(s);
    if (table_[hashes.first] == "") {
      table_[hashes.first] = s;
      return true;
    }

    if (table_[hashes.second] == "") {
      table_[hashes.second] = s;
      return true;
    }

    if (Push(hashes.first, 0)) {
      table_[hashes.first] = s;
      return true;
    }

    if (Push(hashes.second, 0)) {
      table_[hashes.second] = s;
      return true;
    }

    return false;
  }

  // Getters.
  uint32_t hash_num_bits() { return hash_num_bits_; }
  uint32_t initial_hash_value() { return initial_hash_value_; }
  const std::vector<std::string>& table() { return table_; }

 private:
  std::pair<uint32_t, uint32_t> Hash(const std::string& s) {
    uint32_t hash = Hash::FNVHash(s, initial_hash_value_);
    uint32_t h0 = hash & mask_;
    uint32_t h1 = (hash >> 16) & mask_;
    return std::make_pair(h0, h1);
  }

  bool Push(uint32_t i, int depth) {
    if (depth > table_.size()) {
      return false;
    }

    std::string entry = table_[i];
    std::pair<uint32_t, uint32_t> hashes = Hash(entry);
    uint32_t new_location = hashes.first + hashes.second - i;

    if (table_[new_location] != "" && !Push(new_location, depth + 1)) {
      return false;
    }

    table_[new_location] = entry;
    return true;
  }

  uint32_t initial_hash_value_;
  uint32_t hash_num_bits_;
  uint32_t mask_;
  std::vector<std::string> table_;
};

namespace {
// Converts a string to valid c++ enum identifier.
// div to Div, main to Main, accept-charset to AcceptCharset.
std::string ToIdentifier(std::string_view s) {
  std::stringbuf buf;
  while (!s.empty()) {
    char c = s.front();
    // amp-img to AMP_IMG, foreignObject to FOREIGN_OBJECT.
    if (c == '-') {
      buf.sputc('_');
      s.remove_prefix(1);
      continue;
    }

    if ('A' <= c && c <= 'Z') {
      buf.sputc('_');
      buf.sputc(c);
      s.remove_prefix(1);
      continue;
    }

    if (Strings::IsCharAlphabet(c)) {
      c -= 'a' - 'A';
    }

    buf.sputc(c);
    s.remove_prefix(1);
  }

  return buf.str();
}
}  // namespace

}  // namespace htmlparser


using namespace htmlparser;

int main(int argc, char** argv) {
  std::vector<std::string> all_names;
  FileReadOptions options;
  options.ignore_comments = true;
  options.white_space_transform =
      FileReadOptions::LineTransforms::StripWhitespace();
  options.char_predicate = [](char c) {
    // Characters in html tags and attributes.
    return ('a' <= c && c <= 'z') ||   // a-z.
           ('A' <= c && c <= 'Z') ||   // A-Z.
           ('0' <= c && c <= '9') ||   // 0-9.
           (c == '-');                 // hyphen.
  };

  if (!(FileUtil::ReadFileLines(
            options, "cpp/htmlparser/data/htmltags.txt", &all_names) &&
        FileUtil::ReadFileLines(
            options, "cpp/htmlparser/data/htmlattributes.txt",
            &all_names) &&
        FileUtil::ReadFileLines(
            options, "cpp/htmlparser/data/javascriptevents.txt",
            &all_names) &&
        FileUtil::ReadFileLines(
            options, "cpp/htmlparser/data/extras.txt", &all_names) &&
        FileUtil::ReadFileLines(
            options, "cpp/htmlparser/data/amptags.txt", &all_names))) {
    std::cerr << "Error reading input txt files." << std::endl;
    return EXIT_FAILURE;
  }

  // Remove duplicates.
  std::sort(all_names.begin(), all_names.end());
  all_names.erase(std::unique(all_names.begin(), all_names.end()),
      all_names.end());

  // Find hash that minimizes table size.
  std::unique_ptr<TableBuilder> table{nullptr};
  for (int i = 0; i < 1; i++) {
    if (table.get() != nullptr
        && (1 << (table->hash_num_bits() - 1)) < all_names.size()) {
      break;
    }

    srand(time(nullptr));
    uint32_t rand_state;
    uint32_t hash0 = rand_r(&rand_state) % 1000000000;
    for (uint32_t k = 0; k <= 16; k++) {
      if (table.get() != nullptr && k >= table->hash_num_bits())
        break;
      std::unique_ptr<TableBuilder> base(new TableBuilder());
      if (base->Init(hash0, k, all_names)) {
        table.reset(base.release());
        break;
      }
    }
  }

  if (table.get() == nullptr) {
    std::cerr << "Failed to construct string table." << std::endl;
    std::cerr <<  all_names.size() << ": elements." << std::endl;
    return EXIT_FAILURE;
  }

  // Lay out strings, using overlaps when possible.
  std::vector<std::string> layout;
  std::copy(all_names.begin(), all_names.end(), std::back_inserter(layout));

  // Remove strings that are substrings of other strings.
  bool changed = true;
  while (changed) {
    changed = false;
    for (std::size_t i = 0; i < layout.size(); i++) {
      if (layout[i] == "") continue;

      for (std::size_t j = 0; j < layout.size(); j++) {
        if (i != j && layout[j] != ""
            && layout[i].find(layout[j]) != std::string::npos) {
          changed = true;
          layout[j] = "";
        }
      }
    }
  }

  // Join strings where one suffix matches other prefix.
  while (true) {
    // Find best i, j, k such that layout[i][size - k:] == layout[j][:k],
    // maximizing overlap length k.
    int besti = -1;
    int bestj = -1;
    int bestk = 0;
    for (std::size_t i = 0; i < layout.size(); i++) {
      if (layout[i] == "") continue;

      for (std::size_t j = 0; j < layout.size(); j++) {
        if (i == j) continue;
        for (int k = bestk + 1; k <= layout[i].size() && k <= layout[j].size();
             k++) {
          if (layout[i].substr(layout[i].size()-k) == layout[j].substr(0, k)) {
            besti = i;
            bestj = j;
            bestk = k;
          }
        }
      }
    }
    if (bestk > 0) {
      layout[besti] += layout[bestj].substr(bestk);
      layout[bestj] = "";
      continue;
    }
    break;
  }

  std::ostringstream imploded;
  std::copy(layout.begin(), layout.end(), std::ostream_iterator<std::string>(
        imploded, ""));
  std::string text = imploded.str();
  std::map<std::string, uint32_t> nameToTextOffset;
  for (const auto& s : all_names) {
    std::size_t offset = text.find(s);
    if (offset < 0) {
      std::cerr << "Lost string: " << s << std::endl;
      return EXIT_FAILURE;
    }

    nameToTextOffset[s] = static_cast<uint32_t>(offset << 8 | s.size());
  }

  std::ofstream fd("cpp/htmlparser/atom.h");
  Defer ____([&]() {fd.close();});

  fd << R"(// AUTO GENERATED; DO NOT EDIT.
// To regenerate this file see comments in bin/atomgen.cc

#ifndef CPP_HTMLPARSER_ATOM_H_
#define CPP_HTMLPARSER_ATOM_H_

#include <array>
#include <string>

namespace htmlparser {

enum class Atom {
  UNKNOWN = 0x0,
)";

  uint32_t max_len = 0;
  for (const auto& name : all_names) {
    if (max_len < name.size()) {
      max_len = name.size();
    }
    fd << "  " << ToIdentifier(name) << " = "
       << Strings::ToHexString(nameToTextOffset[name]) << ","
       << std::endl;
  }

  fd << "};" << std::endl << std::endl;

  fd << "inline constexpr int kMaxAtomLength = "
     << max_len << ";" << std::endl;
  fd << "inline constexpr uint32_t kInitialHashValue = "
     << Strings::ToHexString(table->initial_hash_value()) << ";"
     << std::endl << std::endl;

  fd << "inline constexpr std::array<uint32_t, 1 << "
     << table->hash_num_bits() << "> "
     << "kNamesHashTable = {" << std::endl;
  for (std::size_t i = 0; i < table->table().size(); i++) {
    if (table->table()[i].empty()) {
      fd << "  0x0," << std::endl;
      continue;
    }

    fd << "  " << Strings::ToHexString(nameToTextOffset[table->table()[i]])
       << ", "
       << "  // " << table->table()[i] << std::endl;
  }
  fd << "};" << std::endl << std::endl;
  fd << "inline constexpr std::string_view kAtomText(\""
     << text << "\");" << std::endl;
  fd << std::endl << "}  // namespace htmlparser." << std::endl;
  fd << std::endl << "#endif  // CPP_HTMLPARSER_ATOM_H_" << std::endl;
}
