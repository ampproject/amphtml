#include "cpp/htmlparser/url.h"

#include "cpp/htmlparser/strings.h"

namespace htmlparser {

std::string_view URL::ProtocolStrict(std::string_view url) {
  for (int i = 0; i < url.size(); ++i) {
    char c = url[i];
    if (c == ':') {  // Protocol terminator.
      return url.substr(0, i);
    } else if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') ||
               (i > 0 &&
                (('0' <= c && c <= '9') || c == '+' || c == '-' || c == '.'))) {
      // Valid character, don't need to do anything.
    } else {
      return "";  // Invalid character for protocol, so give up.
    }
  }
  return "";  // No protocol found.
}

URL::URL(std::string_view url)
    : url_(url),
      is_valid_(true),
      has_protocol_(false),
      protocol_(""),
      login_(""),
      host_(""),
      port_(0) {
  Strings::Trim(&url_);
  ParseProtocol();
  if (!url_.empty() && Strings::StartsWith(url_, "//")) {
    url_.remove_prefix(2);
    ParseAuthority();
  }
}

void URL::ProcessHostDots() {
  if (host_.empty()) return;

  if (host_.front() == '.' || host_.find("..") != std::string::npos) {
    is_valid_ = false;
  } else if (host_.back() == '.') {
    host_.pop_back();
  }
}

void URL::ParseProtocol() {
  if (int colon_at = url_.find(':'); colon_at != std::string_view::npos) {
    for (int i = 0; i < colon_at; ++i) {
      auto c = url_.at(i);
      if (!IsProtocolCharValidChar(c)) {
        has_protocol_ = false;
        protocol_ = "https";
        return;
      }
    }

    has_protocol_ = true;
    auto protocol = url_.substr(0, colon_at);
    url_.remove_prefix(colon_at + 1);
    if (Strings::EqualFold(protocol, "http")) {
      protocol_ = "http";
    } else if (Strings::EqualFold(protocol, "https")) {
      protocol_ = "https";
    } else if (Strings::EqualFold(protocol, "ftp")) {
      protocol_ = "ftp";
    } else if (Strings::EqualFold(protocol, "sftp")) {
      protocol_ = "sftp";
    } else {
      protocol_ = protocol;
      url_.remove_prefix(url_.size());
    }
    Strings::ToLower(&protocol_);
  } else {
    // Didn't see any colon in the URL, so make it a default protocol url and
    // parse the rest of the URL.
    has_protocol_ = false;
    protocol_ = "https";
  }
}

void URL::ParseAuthority() {
  std::size_t idx = 0;

  // See if this could be an IPv6 address literal. If so, we skip colons until
  // we see a matching ']'.
  bool skip_colons = false;
  if (!url_.empty() && url_.at(0) == '[') {
    skip_colons = true;
    idx++;
  }

  if (idx >= url_.size()) {
    is_valid_ = false;
    return;
  }

  // Look for '@' and ':', e.g. user:password@example.com:1234
  // and for '[' and ']', e.g. [2001:0db8::85ae]
  std::size_t at_idx = -1;
  std::size_t port_idx = -1;
  std::size_t password_idx = -1;
  while (idx < url_.size()) {
    auto c = url_.at(idx);
    if (c == '#' || c == '/' || c == '?' || c == '\\') break;
    switch (c) {
      case '@': {
        at_idx = idx;  // Save the last occurrence of '@'.
        password_idx = port_idx;
        port_idx = -1;  // We have a login, so reset the port.

        // Any [ before here must have been junk, or part of the password
        // so we reset.
        if (idx + 1 < url_.size() && url_.at(idx + 1) == '[') {
          skip_colons = true;
          idx++;
        } else {
          skip_colons = false;
        }
        break;
      }
      case ':': {
        if (port_idx == -1 && !skip_colons) {
          port_idx = idx + 1;  // might be password; save as port anyway.
        }
        break;
      }
      case '[': {
        // Start brackets can only either come at the start of where we
        // expect a host name (right after the protocol://, or right after @),
        // so this is either junk or part of the password.
        // In any case, this is not an IPv6 literal.
        skip_colons = false;
        break;
      }
      case ']': {
        // End bracket; stop skipping colons. Note that this allows multiple
        // [] groups, but the URL is broken anyway, so it doesn't matter much
        // if we split it "wrong".
        skip_colons = false;
        break;
      }
    }
    idx++;
  }
  // Save off whatever is left as the path + params + fragment.
  // We don't further parse this.
  path_params_fragment_ = url_.substr(idx);

  // Extract the login string if one was found.
  if (at_idx != -1) {
    std::size_t login_length = at_idx;
    if (password_idx != -1 && password_idx == at_idx) {
      login_length--;
    }
    login_ = url_.substr(0, login_length);
  }

  // Extract the hostname.
  std::size_t host_begin = at_idx != -1 ? at_idx + 1 : 0;
  std::size_t host_end = port_idx != -1 ? port_idx - 1 : idx;

  bool is_ipv6_literal = false;
  std::string_view host = url_.substr(host_begin, host_end - host_begin);
  if (host.front() == '[' && host.back() == ']' && host.size() > 2 /* [] */) {
    is_ipv6_literal = true;
    host.remove_prefix(1);
    host.remove_suffix(1);
    if (!IsIPv6Valid(std::string(host))) {
      is_valid_ = false;
      return;
    }
  }

  if (!is_ipv6_literal) {
    if (auto host_opt = Strings::DecodePercentEncodedURL(host);
        host_opt.has_value()) {
      host_ = host_opt.value();
      for (auto c : host_) {
        if (!HostCharIsValid(c)) {
          is_valid_ = false;
          break;
        }
      }
    } else {
      is_valid_ = false;
      host_ = host;
    }
  } else {
    host_ = host;
  }

  ProcessHostDots();
  if (host_.empty()) {
    is_valid_ = false;
  }

  // Extract the port, if present.
  if (port_idx != -1 && port_idx < idx) {
    auto port_str = url_.substr(port_idx, idx - port_idx);
    // Port www.google.com:0000000000000000000000080 is valid. So trim zeros.
    Strings::TrimLeft(&port_str, "0");
    if (port_str.empty()) {
      port_ = 0;
    } else if (auto is_int = port_str.find_first_not_of("0123456789");
               is_int == std::string_view::npos &&
               port_str.size() < 6 /* Max 65535 */) {
      port_ = std::stoi(port_str.data());
    } else {
      is_valid_ = false;
      return;
    }

    if (port_ > 65535) {
      is_valid_ = false;
      return;
    }
  }

  if (port_ == 0) {
    if (protocol_ == "http") {
      port_ = 80;
    } else if (protocol_ == "https") {
      port_ = 443;
    } else if (protocol_ == "ftp") {
      port_ = 21;
    } else if (protocol_ == "sftp") {
      port_ = 22;
    } else {
      port_ = 0;
    }
  }
}

}  // namespace htmlparser
