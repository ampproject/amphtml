// Embeds the contents of given file in c++ header as c++ array of bytes.
//
// In most cases data files are provided to library or binary using:
//   A) Command line flags containing full path of the file
//   B) Through constructor as an API
//   C) Fetched from network during initialization or periodically
//
// Sometimes, the above scenarios or combination of them are not feasible and it
// is required to embed the data in the library hiding the data details from the
// clients, like validation rules.
//
// This script generates a header file that contains contents of the input file
// as const array of bytes. These bytes can be read by any parts of the program
// by just importing the header file.
//
// Though this script can be used to generate header files directly. For
// automation and up-to-date header file for each release use embed_data rule
// defined in embed_data.bzl.
//
// Usage:
// $./filecontents_to_cpp_header \
//     <input_file> <output_header>.h <cpp_namespace> <varname>
//
// $./filecontents_to_cpp_header abc.h abc kABCByteArray
//
//                      or,
//
// load("//quality/dni/validator:embed_data.bzl", "embed_data")
// embed_data(
//     name = "mydata_h",
//     src = "mydatafile",
//     header_out = "mydatabytes.h",
//     namespace = "myproject::data",
//     varname = "kMyDataByteArray")
//
// In source:
// #include "myproject/data/mydatabytes.h"
//
// ProcessMyData(kMyDataByteArray); or MyStream stream(kMyDataByteArray);
//

#include <fstream>
#include <iomanip>
#include <iostream>
#include <string>

#include "cpp/htmlparser/defer.h"

int main(int argc, char** argv) {
  if (argc != 5) {
    std::cerr << "Missing input file name.\n";
    std::cerr << "Format:\n";
    std::cerr << "filecontents_to_cpp_header mygeneratedheader.h my_project "
              << "kMyDataByteArray\n";
    return EXIT_FAILURE;
  }

  std::ifstream fd(argv[1]);
  htmlparser::defer(fd.close());

  if (!fd.good()) {
    std::cerr << "File: " << argv[1] << " not found.\n";
    return EXIT_FAILURE;
  }

  std::string output_file = argv[2];

  std::ofstream ofd(argv[2]);
  htmlparser::defer(ofd.close());

  if (!ofd.good()) {
    std::cerr << "Output header file: " << argv[2] << " error.\n";
    return EXIT_FAILURE;
  }

  std::string name_space = argv[3];
  std::string var_name = argv[4];

  ofd << "#pragma once\n\n";
  ofd << "namespace " << name_space << " {\n\n";

  int i = fd.get();
  int count = 1;
  ofd << "constexpr static unsigned char " << var_name << "[] = {\n   ";

  while (!fd.eof() && i != -1) {
    // NOTE: protobuf bytes are always little endian. If this ever changes, or
    // this script is run in big endian systems it will fail.
    // TODO: Add a endian attr in embed_data?
    ofd << " 0x" << std::setfill('0') << std::setw(2) << std::hex << i;
    if (count++ % 10 == 0) {
      ofd << ",\n   ";
    } else {
      ofd << ",";
    }
    i = fd.get();
  }

  ofd << "\n};\n";

  ofd << "constexpr long " << var_name << "Size = 0x" << count - 1 << ";\n\n";

  ofd << "}  // namespace " << name_space;
}
