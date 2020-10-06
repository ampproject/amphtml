//
// Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
// Uniform resouce locator parsing related static functions.

#ifndef HTMLPARSER__URL_H_
#define HTMLPARSER__URL_H_

#include <arpa/inet.h>
#include <cctype>
#include <optional>
#include <string>
#include <string_view>

namespace htmlparser {

class URL {
 public:
  // returns: the protocol (scheme) of the URL, if one could be found, according
  // to a strict interpretation of RFC 3986, Section 3.1. Otherwise returns the
  // empty string. No normalization (e.g. lower casing) is performed, and
  // no part of the URL is validated except the protocol. */
  static std::string_view ProtocolStrict(std::string_view url);

  explicit URL(std::string_view url);

  // getters.
  bool is_valid() const { return is_valid_; }
  bool has_protocol() const { return has_protocol_; }
  std::string protocol() const { return protocol_; }
  std::string hostname() const { return host_; }
  std::string login() const { return login_; }
  int port() const { return port_; }

 private:
  static bool IsAlphaNum(int8_t c) {
    return (('0' <= c && c <= '9') ||
            ('a' <= c && c <= 'z') ||
            ('A' <= c && c <= 'Z'));
  }

  static bool IsProtocolCharValidChar(uint8_t c) {
    return IsAlphaNum(c) || c == '+' || c == '-';
  }

  static bool IsPositiveInteger(std::string_view may_be_int) {
    for (auto c : may_be_int) {
      if (!std::isdigit(c)) return false;
    }

    return true;
  }

  static bool HostCharIsEnd(uint8_t c) {
    return c == '#' || c == '/' || c == '?' || c == '\\';
  }

  static bool HostCharIsValid(uint8_t c) {
    static constexpr std::string_view illegal_chars =
        " !\"#$%&'()*+,/:;<=>?@[\\]^`{|}~";
    return c > 0x1f /* unprintable */ &&
        illegal_chars.find_first_of(c) == std::string_view::npos;
  }

  static bool IsIPv6Valid(const std::string& host) {
    struct in6_addr result;
    return inet_pton(AF_INET6, host.c_str(), &result) == 1;
  }

  static std::optional<std::string> UnescapeAndCheckHostname(
      std::string_view hostname);
  void ParseProtocol();
  void ParseAuthority();
  void ProcessHostDots();

  std::string_view url_;
  bool is_valid_;
  bool has_protocol_;
  std::string protocol_;
  std::string_view scheme_specific_port_;
  bool starts_with_double_slash_;
  std::string login_;
  std::string host_;
  int port_;
};

}  // namespace htmlparser

#endif  // HTMLPARSER__URL_H_
