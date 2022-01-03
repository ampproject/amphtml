#ifndef CPP_HTMLPARSER_HASH_H_
#define CPP_HTMLPARSER_HASH_H_

#include <string_view>

namespace htmlparser {

// Source: https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function
class Hash {
 public:
  static uint32_t FNVHash(std::string_view s, uint32_t h = 2166136261) {
    for (unsigned char c : s) {
      h ^= c;
      h *= 16777619;  // FNV prime.
    }
    return h;
  }

  static uint64_t FNVHash64(std::string_view s,
                            uint64_t h = 14695981039346656037u) {
    for (unsigned char c : s) {
      h ^= c;
      h *= 1099511628211;  // FNV prime.
    }
    return h;
  }

  // FNV-1a. Alternate. Same as above except the order of XOR and multiply
  // is reversed.
  static uint64_t FNV_AHash64(std::string_view s,
                              uint64_t h = 14695981039346656037u) {
    for (unsigned char c : s) {
      h *= 1099511628211;  // FNV prime.
      h ^= c;
    }
    return h;
  }

 private:
  // No objects of this class.
  Hash() = delete;
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_HASH_H_
