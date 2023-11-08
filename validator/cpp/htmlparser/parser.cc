#include <algorithm>
#include <set>
#include <tuple>
#ifdef DUMP_NODES
#include <iostream>  // For DumpDocument
#endif               // DUMP_NODES

#include "absl/flags/flag.h"
#include "absl/status/status.h"
#include "cpp/htmlparser/atomutil.h"
#include "cpp/htmlparser/comparators.h"
#include "cpp/htmlparser/defer.h"
#include "cpp/htmlparser/doctype.h"
#include "cpp/htmlparser/foreign.h"
#include "cpp/htmlparser/logging.h"
#include "cpp/htmlparser/parser.h"
#include "cpp/htmlparser/strings.h"

ABSL_RETIRED_FLAG(uint32_t, htmlparser_max_nodes_depth_count, 245, "retired");

namespace htmlparser {

namespace {
// Internal functions forward declarations.
std::string ExtractWhitespace(const std::string& s);

#ifdef DUMP_NODES
void DumpNode(Node* root_node) {
  for (Node* c = root_node->FirstChild(); c; c = c->NextSibling()) {
    std::cerr << c->NameSpace() << ": " << AtomUtil::ToString(c->DataAtom())
              << std::endl;
    DumpNode(c);
  }
}
// Dumps the nodes in the DOM in their final order after parsing.
void DumpDocument(Document* doc) { DumpNode(doc->RootNode()); }

#endif  // DUMP_NODES

}  // namespace.

std::unique_ptr<Document> Parse(std::string_view html) {
  std::unique_ptr<Parser> parser = std::make_unique<Parser>(
      html,
      ParseOptions{.scripting = true,
                   .frameset_ok = true,
                   .record_node_offsets = true,
                   .record_attribute_offsets = true,
                   .count_num_terms_in_text_node = true});
  return parser->Parse();
}

std::unique_ptr<Document> ParseWithOptions(std::string_view html,
                                           const ParseOptions& options) {
  return std::make_unique<Parser>(html, options)->Parse();
}

std::unique_ptr<Document> ParseFragmentWithOptions(std::string_view html,
                                                   const ParseOptions& options,
                                                   Node* fragment_parent) {
  std::unique_ptr<Parser> parser = std::make_unique<Parser>(
      html, options, fragment_parent);
  Node* root = parser->document_->NewNode(NodeType::ELEMENT_NODE, Atom::HTML);
  parser->document_->root_node_->AppendChild(root);
  parser->open_elements_stack_.Push(root);

  if (fragment_parent && fragment_parent->DataAtom() == Atom::TEMPLATE) {
    parser->template_stack_.push_back(std::bind(&Parser::InTemplateIM,
                                                parser.get()));
  }

  parser->ResetInsertionMode();

  for (Node* node = fragment_parent; node; node = node->Parent()) {
    if (node->Type() == NodeType::ELEMENT_NODE &&
        node->DataAtom() == Atom::FORM) {
      parser->form_ = node;
      break;
    }
  }

  auto doc = parser->Parse();

  if (doc->status().ok()) {
    Node* parent = fragment_parent ? root : doc->root_node_;
    for (Node* c = parent->FirstChild(); c;) {
      Node* next = c->NextSibling();
      doc->fragment_nodes_.push_back(std::move(c));
      parent->RemoveChild(c);
      c = next;
    }
  }

  return doc;
}

std::unique_ptr<Document> ParseFragment(std::string_view html,
                                        Node* fragment_parent) {
  // Expects clients to update the offsets relative to the parent which
  // this fragment belongs.
  ParseOptions options = {.scripting = true,
                          .frameset_ok = true,
                          .record_node_offsets = true,
                          .record_attribute_offsets = true,
                          .count_num_terms_in_text_node = true};
  return ParseFragmentWithOptions(html, options, fragment_parent);
}

Parser::Parser(std::string_view html, const ParseOptions& options,
               Node* fragment_parent)
    : tokenizer_(std::make_unique<Tokenizer>(
          html,
          fragment_parent ? AtomUtil::ToString(fragment_parent->atom_) : "")),
      on_node_callback_(options.on_node_callback),
      document_(new Document),
      scope_marker_(document_->NewNode(NodeType::SCOPE_MARKER_NODE)),
      scripting_(options.scripting),
      frameset_ok_(options.frameset_ok),
      record_node_offsets_(options.record_node_offsets),
      record_attribute_offsets_(options.record_attribute_offsets),
      count_num_terms_in_text_node_(options.count_num_terms_in_text_node),
      fragment_(fragment_parent != nullptr),
      context_node_(fragment_parent) {
  document_->metadata_.html_src_bytes = html.size();
  insertion_mode_ = std::bind(&Parser::InitialIM, this);
}

std::unique_ptr<Document> Parser::Parse() {
  bool eof = tokenizer_->IsEOF();
  while (!eof) {
    Node* node = open_elements_stack_.Top();
    tokenizer_->SetAllowCDATA(node && !node->name_space_.empty());
    // Read and parse the next token.
    TokenType token_type = tokenizer_->Next(!template_stack_.empty());

    // No end of input, but error token. Parsing failed.
    if (token_type == TokenType::ERROR_TOKEN) {
      eof = tokenizer_->IsEOF();
      if (!eof && tokenizer_->Error()) {
        document_->status_ = absl::InvalidArgumentError(
            "htmlparser::Parser tokenizer error.");
        return std::move(document_);
      }
    }
    token_ = tokenizer_->token();
    ParseCurrentToken();
  }

#ifdef DUMP_NODES
  DumpDocument(document_.get());
#endif

  document_->metadata_.document_end_location = tokenizer_->CurrentPosition();
  return std::move(document_);
}  // End Parser::Parse.

Node* Parser::top() {
  Node* node = open_elements_stack_.Top();
  if (node) {
    return node;
  }

  return document_->root_node_;
}  // End Parser::Top.

template <typename... Args>
bool Parser::PopUntil(Scope scope, Args... match_tags) {
  std::vector<Atom> argsList{match_tags...};
  int i = IndexOfElementInScope(scope, argsList);
  if (i != -1) {
    open_elements_stack_.Pop(open_elements_stack_.size() - i);
    return true;
  }
  return false;
}  // End Parser::PopUntil.

int Parser::IndexOfElementInScope(Scope scope,
                                  const std::vector<Atom>& match_tags) const {
  for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
    Node* node = open_elements_stack_.at(i);
    if (node->name_space_.empty()) {
      for (Atom a : match_tags) {
        if (a == node->atom_) {
          return i;
        }
      }
      switch (scope) {
        case Scope::DefaultScope:
          // No-op.
          break;
        case Scope::ListItemScope:
          if (node->atom_ == Atom::OL || node->atom_ == Atom::UL) return -1;
          break;
        case Scope::ButtonScope:
          if (node->atom_ == Atom::BUTTON) return -1;
          break;
        case Scope::TableScope:
          if (node->atom_ == Atom::HTML || node->atom_ == Atom::TABLE ||
              node->atom_ == Atom::TEMPLATE) {
            return -1;
          }
          break;
        case Scope::SelectScope:
          if (node->atom_ != Atom::OPTGROUP && node->atom_ != Atom::OPTION) {
            return -1;
          }
          break;
        default:
          CHECK(false) << "HTML Parser reached unreachable scope";
      }
    }

    switch (scope) {
      case Scope::DefaultScope:
      case Scope::ListItemScope:
      case Scope::ButtonScope: {
        for (auto& scope_stop_tags : kDefaultScopeStopTags) {
          if (scope_stop_tags.first == node->name_space_) {
            for (Atom t : scope_stop_tags.second) {
              if (t == Atom::UNKNOWN) break;
              if (t == node->atom_) return -1;
            }
          }
        }
        break;
      }
      default:
        break;
    }
  }
  return -1;
}  // Parser::IndexOfElementInScope.

template <typename... Args>
bool Parser::ElementInScope(Scope scope, Args... tags) const {
  std::vector<Atom> argsList{tags...};
  return IndexOfElementInScope(scope, argsList) != -1;
}  // Parser::ElementInScope.

void Parser::ClearStackToContext(Scope scope) {
  for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
    Node* node = open_elements_stack_.at(i);
    Atom atom = node->atom_;
    switch (scope) {
      case Scope::TableScope:
        if (atom == Atom::HTML || atom == Atom::TABLE ||
            atom == Atom::TEMPLATE) {
          open_elements_stack_.Pop(open_elements_stack_.size() - i - 1);
          return;
        }
        break;
      case Scope::TableRowScope:
        if (atom == Atom::HTML || atom == Atom::TR || atom == Atom::TEMPLATE) {
          open_elements_stack_.Pop(open_elements_stack_.size() - i - 1);
          return;
        }
        break;
      case Scope::TableBodyScope:
        if (atom == Atom::HTML || atom == Atom::TBODY || atom == Atom::TFOOT ||
            atom == Atom::THEAD || atom == Atom::TEMPLATE) {
          open_elements_stack_.Pop(open_elements_stack_.size() - i - 1);
          return;
        }
        break;
      default:
        CHECK(false) << "HTML Parser reached unreachable scope";
    }
  }
}  // Parser::ClearStackToContext.

void Parser::GenerateImpliedEndTags(
    const std::initializer_list<Atom>& exceptions) {
  int i = open_elements_stack_.size() - 1;
  for (; i >= 0; --i) {
    Node* node = open_elements_stack_.at(i);
    if (node->node_type_ == NodeType::ELEMENT_NODE) {
      switch (node->atom_) {
        case Atom::DD:
        case Atom::DT:
        case Atom::LI:
        case Atom::OPTGROUP:
        case Atom::OPTION:
        case Atom::P:
        case Atom::RB:
        case Atom::RP:
        case Atom::RT:
        case Atom::RTC:
          for (auto e : exceptions) {
            if (node->atom_ == e) {
              // Pop nodes and return early.
              open_elements_stack_.Pop(open_elements_stack_.size() - i - 1);
              return;
            }
          }
          continue;
        default:
          break;
      }
    }
    break;
  }
  open_elements_stack_.Pop(open_elements_stack_.size() - i - 1);
}  // Parser::GenerateImpliedEndTags.

void Parser::AddChild(Node* node) {
  if (ShouldFosterParent()) {
    FosterParent(node);
  } else {
    top()->AppendChild(node);
  }

  if (node->node_type_ == NodeType::ELEMENT_NODE) {
    open_elements_stack_.Push(node);
  }
}  // Parser::AddChild.

bool Parser::ShouldFosterParent() {
  if (!foster_parenting_) return false;
  Atom a = top()->atom_;
  return (a == Atom::TABLE || a == Atom::TBODY || a == Atom::TFOOT ||
          a == Atom::THEAD || a == Atom::TR);
}  // Parser::ShouldFosterParent.

void Parser::FosterParent(Node* node) {
  Node* table = nullptr;
  Node* parent = nullptr;
  Node* prev = nullptr;
  Node* tpl = nullptr;
  int i = -1;
  for (i = open_elements_stack_.size() - 1; i >= 0; --i) {
    if (open_elements_stack_.at(i)->atom_ == Atom::TABLE) {
      table = open_elements_stack_.at(i);
      break;
    }
  }

  int j = -1;
  for (j = open_elements_stack_.size() - 1; j >= 0; --j) {
    if (open_elements_stack_.at(j)->atom_ == Atom::TEMPLATE) {
      tpl = open_elements_stack_.at(j);
      break;
    }
  }

  if (tpl && (!table || j > i)) {
    tpl->AppendChild(node);
    return;
  }

  if (!table) {
    // The foster parent is the html element.
    parent = open_elements_stack_.at(0);
  } else {
    parent = table->Parent();
  }

  if (!parent) {
    parent = open_elements_stack_.at(i - 1);
  }

  if (table) {
    prev = table->PrevSibling();
  } else {
    prev = parent->LastChild();
  }

  if (prev && prev->node_type_ == NodeType::TEXT_NODE &&
      node->node_type_ == NodeType::TEXT_NODE) {
    prev->data_.append(node->data_);
    return;
  }

  parent->InsertBefore(node, table);
}  // Parser::FosterParent.

void Parser::AddText(const std::string& text) {
  if (text.empty()) return;

  auto text_node = document_->NewNode(NodeType::TEXT_NODE);
  if (record_node_offsets_) {
    text_node->line_col_in_html_src_ = token_.line_col_in_html_src;
  }

  if (ShouldFosterParent()) {
    text_node->data_.assign(text, 0, text.size());
    FosterParent(text_node);
    return;
  }

  Node* top_node = top();
  if (top_node->LastChild() &&
      top_node->LastChild()->node_type_ == NodeType::TEXT_NODE) {
    top_node->LastChild()->data_.append(text);
    return;
  }

  text_node->data_.assign(text, 0, text.size());
  AddChild(text_node);
  // Count number of terms in the text node, except if this is <script>,
  // <textarea> or a comment node.
  if (count_num_terms_in_text_node_ && text_node->Parent() &&
      text_node->Parent()->DataAtom() != Atom::SCRIPT &&
      text_node->Parent()->Type() != NodeType::COMMENT_NODE &&
      text_node->Parent()->DataAtom() != Atom::TEXTAREA) {
    text_node->num_terms_ = Strings::CountTerms(text);
  }
}  // Parser::AddText.

void Parser::AddElement() {
  Node* element_node = document_->NewNode(NodeType::ELEMENT_NODE, token_.atom);
  if (token_.atom == Atom::UNKNOWN) {
    element_node->data_ = token_.data;
  }

  if (record_node_offsets_) {
    element_node->line_col_in_html_src_ = token_.line_col_in_html_src;
  }

  switch (token_.atom) {
    case Atom::HTML: {
      element_node->SetManufactured(document_->metadata_.has_manufactured_html);
      break;
    }
    case Atom::HEAD: {
      element_node->SetManufactured(document_->metadata_.has_manufactured_head);
      break;
    }
    case Atom::BODY: {
      element_node->SetManufactured(document_->metadata_.has_manufactured_body);
      break;
    }
    default:
      break;
  }

  std::copy(token_.attributes.begin(), token_.attributes.end(),
            std::back_inserter(element_node->attributes_));
  AddChild(element_node);

  if (!record_attribute_offsets_ && !element_node->attributes_.empty()) {
    std::transform(
        element_node->attributes_.begin(), element_node->attributes_.end(),
        element_node->attributes_.begin(), [](Attribute attr) -> Attribute {
          attr.line_col_in_html_src = std::nullopt;
          return attr;
        });
  }

  if (on_node_callback_) {
    on_node_callback_(element_node, token_);
  }
}  // Parser::AddElement.

// Section 12.2.4.3.
void Parser::AddFormattingElement() {
  Atom tag_atom = token_.atom;
  AddElement();

  // Implement the Noah's Ark clause, but with three per family instead of two.
  int identical_elements = 0;
  for (int i = active_formatting_elements_stack_.size() - 1; i >= 0; --i) {
    Node* node = active_formatting_elements_stack_.at(i);
    if (node->node_type_ == NodeType::SCOPE_MARKER_NODE) break;
    if (node->node_type_ != NodeType::ELEMENT_NODE) continue;
    if (node->name_space_ != "") continue;
    if (node->atom_ != tag_atom) continue;
    if (node->attributes_.size() != token_.attributes.size()) continue;

    bool attr_matched = false;
    for (int j = 0; j < node->attributes_.size(); ++j) {
      for (int k = 0; k < token_.attributes.size(); ++k) {
        attr_matched = (node->attributes_[j] == token_.attributes[k]);
        // Found a match for this attribute, continue with the next attribute.
        if (attr_matched) break;
      }

      if (attr_matched) continue;

      // If we get here, there is no attribute that matches a.
      // Therefore the element is not identical to the new one.
      // Stop processing rest of the attributes and proceed to next element.
      break;
    }

    if (attr_matched) {
      identical_elements++;
      if (identical_elements >= 3) {
        active_formatting_elements_stack_.Remove(node);
      }
    }
  }

  active_formatting_elements_stack_.Push(top());
}  // Parser::AddFormattingElement.

// Section 12.2.4.3.
void Parser::ClearActiveFormattingElements() {
  while (active_formatting_elements_stack_.size() != 0) {
    Node* node = active_formatting_elements_stack_.Pop();
    if (node->node_type_ == NodeType::SCOPE_MARKER_NODE) break;
  }
}  // Parser::ClearActiveFormattingElements.

// Section 12.2.4.3.
void Parser::ReconstructActiveFormattingElements() {
  Node* node = active_formatting_elements_stack_.Top();
  if (!node) return;

  if (node->node_type_ == NodeType::SCOPE_MARKER_NODE ||
      open_elements_stack_.Index(node) != -1) {
    return;
  }

  int i = active_formatting_elements_stack_.size() - 1;
  while (node->node_type_ != NodeType::SCOPE_MARKER_NODE &&
         open_elements_stack_.Index(node) == -1) {
    if (i == 0) {
      i = -1;
      break;
    }
    i--;
    node = active_formatting_elements_stack_.at(i);
  }

  do {
    i++;
    auto clone = document_->CloneNode(active_formatting_elements_stack_.at(i));
    AddChild(clone);
    active_formatting_elements_stack_.Replace(i, clone);
  } while (i < active_formatting_elements_stack_.size() - 1);
}  // Parser::ReconstructActiveFormattingElements.

// Section 12.2.5.
void Parser::AcknowledgeSelfClosingTag() {
  has_self_closing_token_ = false;
}  // Parser::AcknowledgeSelfClosingTag.

// Section 12.2.4.1, "using the rules for".
void Parser::SetOriginalIM() {
  CHECK(!original_insertion_mode_)
      << "html: bad parser state: original_insertion_mode was set twice";
  original_insertion_mode_ = insertion_mode_;
}  // Parser::SetOriginalIM.

// Section 12.2.4.1, "reset the insertion mode".
void Parser::ResetInsertionMode() {
  for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
    Node* node = open_elements_stack_.at(i);
    bool last = (i == 0);
    if (last && context_node_) {
      node = context_node_;
    }

    switch (node->atom_) {
      case Atom::SELECT:
        if (!last) {
          Node* ancestor = node;
          Node* first = open_elements_stack_.at(0);
          while (ancestor != first) {
            ancestor = open_elements_stack_.at(
                open_elements_stack_.Index(ancestor) - 1);
            switch (ancestor->atom_) {
              case Atom::TEMPLATE:
                insertion_mode_ = std::bind(&Parser::InSelectIM, this);
                return;
              case Atom::TABLE:
                insertion_mode_ = std::bind(&Parser::InSelectInTableIM, this);
                return;
              default:
                break;
            }
          }
        }
        insertion_mode_ = std::bind(&Parser::InSelectIM, this);
        break;
      case Atom::TD:
      case Atom::TH:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=829668
        insertion_mode_ = std::bind(&Parser::InCellIM, this);
        break;
      case Atom::TR:
        insertion_mode_ = std::bind(&Parser::InRowIM, this);
        break;
      case Atom::TBODY:
      case Atom::THEAD:
      case Atom::TFOOT:
        insertion_mode_ = std::bind(&Parser::InTableBodyIM, this);
        break;
      case Atom::CAPTION:
        insertion_mode_ = std::bind(&Parser::InCaptionIM, this);
        break;
      case Atom::COLGROUP:
        insertion_mode_ = std::bind(&Parser::InColumnGroupIM, this);
        break;
      case Atom::TABLE:
        insertion_mode_ = std::bind(&Parser::InTableIM, this);
        break;
      case Atom::TEMPLATE:
        // TODO: remove this divergence from the HTML5 spec.
        if (!node->name_space_.empty()) {
          continue;
        }
        insertion_mode_ = template_stack_.back();
        break;
      case Atom::HEAD:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=829668
        insertion_mode_ = std::bind(&Parser::InHeadIM, this);
        break;
      case Atom::BODY:
        insertion_mode_ = std::bind(&Parser::InBodyIM, this);
        break;
      case Atom::FRAMESET:
        insertion_mode_ = std::bind(&Parser::InFramesetIM, this);
        break;
      case Atom::HTML:
        if (head_) {
          insertion_mode_ = std::bind(&Parser::AfterHeadIM, this);
        } else {
          insertion_mode_ = std::bind(&Parser::BeforeHeadIM, this);
        }
        break;
      default:
        if (last) {
          insertion_mode_ = std::bind(&Parser::InBodyIM, this);
          return;
        }
        continue;
    }
    return;
  }
}  // Parser::ResetInsertionMode.

// Section 12.2.6.4.1.
bool Parser::InitialIM() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      // https://www.w3.org/TR/2011/WD-html5-20110113/tokenization.html#the-initial-insertion-mode
      Strings::TrimLeft(&token_.data, Strings::kWhitespace);
      if (token_.data.empty()) {
        // It was all whitespace, so ignore it.
        return true;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->data_ = std::move(token_.data);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->SetManufactured(token_.is_manufactured);
      document_->root_node_->AppendChild(node);
      return true;
    }
    case TokenType::DOCTYPE_TOKEN: {
      auto doctype_node = document_->NewNode(NodeType::DOCTYPE_NODE);
      bool quirks_mode = ParseDoctype(token_.data, doctype_node);
      if (record_node_offsets_) {
        doctype_node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      document_->root_node_->AppendChild(doctype_node);
      document_->metadata_.quirks_mode = quirks_mode;
      insertion_mode_ = std::bind(&Parser::BeforeHTMLIM, this);

      if (on_node_callback_) {
        on_node_callback_(doctype_node, token_);
      }

      return true;
    }
    default:
      break;
  }

  document_->metadata_.quirks_mode = true;
  insertion_mode_ = std::bind(&Parser::BeforeHTMLIM, this);
  return false;
}  // Parser::InitialIM.

// Section 12.2.6.4.2.
bool Parser::BeforeHTMLIM() {
  switch (token_.token_type) {
    case TokenType::DOCTYPE_TOKEN: {
      // Ignore the token.
      return true;
    }
    case TokenType::TEXT_TOKEN: {
      // https://www.w3.org/TR/2011/WD-html5-20110113/tokenization.html#the-before-html-insertion-mode
      Strings::TrimLeft(&token_.data, Strings::kWhitespace);
      if (token_.data.empty()) {
        // It was all whitespace, so ignore it.
        return true;
      }
      break;
    }
    case TokenType::START_TAG_TOKEN: {
      if (token_.atom == Atom::HTML) {
        AddElement();
        insertion_mode_ = std::bind(&Parser::BeforeHeadIM, this);
        return true;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch ((Atom)token_.atom) {
        case Atom::HEAD:
        case Atom::BODY:
        case Atom::HTML:
        case Atom::BR:
          ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::HTML,
                            AtomUtil::ToString(Atom::HTML));
          return false;
        default:
          // Ignore the token.
          return true;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = std::move(token_.data);
      document_->root_node_->AppendChild(node);
      return true;
    }
    default:
      break;
  }
  ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::HTML,
                    AtomUtil::ToString(Atom::HTML));
  return false;
}  // Parser::BeforeHTMLIM.

// Section 12.2.6.4.3.
bool Parser::BeforeHeadIM() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      // https://www.w3.org/TR/2011/WD-html5-20110113/tokenization.html#the-before-head-insertion-mode
      Strings::TrimLeft(&token_.data, Strings::kWhitespace);
      if (token_.data.empty()) {
        // It was all whitespace, so ignore it.
        return true;
      }
      break;
    }
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HEAD:
          AddElement();
          head_ = top();
          insertion_mode_ = std::bind(&Parser::InHeadIM, this);
          return true;
        case Atom::HTML:
          return InBodyIM();
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HEAD:
        case Atom::BODY:
        case Atom::HTML:
        case Atom::BR:
          ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::HEAD,
                            AtomUtil::ToString(Atom::HEAD));
          return false;
        default:
          // Ignore the token.
          return true;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = std::move(token_.data);
      AddChild(node);
      return true;
    }
    case TokenType::DOCTYPE_TOKEN: {
      // Ignore the token.
      return true;
    }
    default:
      break;
  }

  ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::HEAD,
                    AtomUtil::ToString(Atom::HEAD));
  return false;
}  // Parser::BeforeHeadIM.

// Section 12.2.6.4.4.
bool Parser::InHeadIM() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      std::string s = token_.data;
      Strings::TrimLeft(&s, Strings::kWhitespace);
      if (s.size() < token_.data.size()) {
        // Add the initial whitespace to the current node.
        // https://www.w3.org/TR/2011/WD-html5-20110113/tokenization.html#parsing-main-inhead
        AddText(token_.data.substr(0, token_.data.size() - s.size()));
        if (s.empty()) {
          return true;
        }
        token_.data = s;
      }
      break;
    }
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HTML:
          return InBodyIM();
        case Atom::BASE:
        case Atom::BASEFONT:
        case Atom::BGSOUND:
        case Atom::LINK:
        case Atom::META: {
          AddElement();
          open_elements_stack_.Pop();
          AcknowledgeSelfClosingTag();
          if (!top() || !top()->LastChild()) return true;
          // Record some extra document url related info.
          if (token_.atom == Atom::BASE) {
            auto base_node = top()->LastChild();
            RecordBaseURLMetadata(base_node);
          } else if (token_.atom == Atom::LINK) {
            auto link_node = top()->LastChild();
            RecordLinkRelCanonical(link_node);
          }
          return true;
        }
        case Atom::NOSCRIPT: {
          if (scripting_) {
            ParseGenericRawTextElement();
            return true;
          }
          AddElement();
          insertion_mode_ = std::bind(&Parser::InHeadNoscriptIM, this);
          // Don't let the tokenizer go into raw text mode when scripting is
          // disabled.
          tokenizer_->NextIsNotRawText();
          return true;
        }
        case Atom::SCRIPT:
        case Atom::TITLE: {
          AddElement();
          SetOriginalIM();
          insertion_mode_ = std::bind(&Parser::TextIM, this);
          return true;
        }
        case Atom::NOFRAMES:
        case Atom::STYLE: {
          ParseGenericRawTextElement();
          return true;
        }
        case Atom::HEAD: {
          // Ignore the token.
          return true;
        }
        case Atom::TEMPLATE: {
          AddElement();
          active_formatting_elements_stack_.Push(scope_marker_);
          frameset_ok_ = false;
          insertion_mode_ = std::bind(&Parser::InTemplateIM, this);
          template_stack_.push_back(std::bind(&Parser::InTemplateIM, this));
          return true;
        }
        default:
          // Ignore remaining tags.
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HEAD: {
          open_elements_stack_.Pop();
          insertion_mode_ = std::bind(&Parser::AfterHeadIM, this);
          return true;
        }
        case Atom::BODY:
        case Atom::HTML:
        case Atom::BR: {
          ParseImpliedToken(TokenType::END_TAG_TOKEN, Atom::HEAD,
                            AtomUtil::ToString(Atom::HEAD));
          return false;
        }
        case Atom::TEMPLATE: {
          if (!open_elements_stack_.Contains(Atom::TEMPLATE)) return true;

          // See https://bugs.chromium.org/p/chromium/issues/detail?id=829668
          GenerateImpliedEndTags();
          for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
            Node* node = open_elements_stack_.at(i);
            if (node->name_space_.empty() && node->atom_ == Atom::TEMPLATE) {
              open_elements_stack_.Pop(open_elements_stack_.size() - i);
              break;
            }
          }

          ClearActiveFormattingElements();
          template_stack_.pop_back();
          ResetInsertionMode();
          return true;
        }
        default:
          // Ignore the token.
          return true;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = std::move(token_.data);
      AddChild(node);
      return true;
    }
    case TokenType::DOCTYPE_TOKEN: {
      // Ignore the token.
      return true;
    }
    default:
      break;
  }

  ParseImpliedToken(TokenType::END_TAG_TOKEN, Atom::HEAD,
                    AtomUtil::ToString(Atom::HEAD));
  return false;
}  // Parser::InHeadIM.

// 12.2.6.4.5.
bool Parser::InHeadNoscriptIM() {
  switch (token_.token_type) {
    case TokenType::DOCTYPE_TOKEN: {
      // Ignore the token.
      return true;
    }
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HTML: {
          return InBodyIM();
          break;
        }
        case Atom::BASEFONT:
        case Atom::BGSOUND:
        case Atom::LINK:
        case Atom::META:
        case Atom::NOFRAMES:
        case Atom::STYLE: {
          return InHeadIM();
          break;
        }
        case Atom::HEAD:
          // Ignore the token.
          return true;
        case Atom::NOSCRIPT: {
          // Don't let the tokenizer go into raw text mode even when a
          // <noscript> tag is in "in head noscript" insertion mode.
          tokenizer_->NextIsNotRawText();
          // Ignore the token.
          return true;
        }
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::NOSCRIPT:
        case Atom::BR: {
          break;
        }
        default:
          // Ignore the token.
          return true;
      }
      break;
    }
    case TokenType::TEXT_TOKEN: {
      if (Strings::IsAllWhitespaceChars(token_.data)) {
        // It was all whitespace.
        return InHeadIM();
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      return InHeadIM();
      break;
    }
    default:
      break;
  }
  open_elements_stack_.Pop();
  CHECK(top()->atom_ == Atom::HEAD)
      << "html: the new current node will be a head element.";

  insertion_mode_ = std::bind(&Parser::InHeadIM, this);
  if (token_.atom == Atom::NOSCRIPT) {
    return true;
  }

  return false;
}  // Parser::InHeadNoscriptIM.

// Section 12.2.6.4.6.
bool Parser::AfterHeadIM() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      std::string s = token_.data;
      Strings::TrimLeft(&s);
      if (s.size() < token_.data.size()) {
        // Add the initial whitespace to the current node.
        AddText(token_.data.substr(0, token_.data.size() - s.size()));
        if (s.empty()) return true;
        token_.data = s;
      }
      break;
    }
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HTML:
          return InBodyIM();
        case Atom::BODY: {
          AddElement();
          frameset_ok_ = false;
          insertion_mode_ = std::bind(&Parser::InBodyIM, this);
          return true;
        }
        case Atom::FRAMESET: {
          AddElement();
          insertion_mode_ = std::bind(&Parser::InFramesetIM, this);
          return true;
        }
        case Atom::BASE:
        case Atom::BASEFONT:
        case Atom::BGSOUND:
        case Atom::LINK:
        case Atom::META:
        case Atom::NOFRAMES:
        case Atom::SCRIPT:
        case Atom::STYLE:
        case Atom::TEMPLATE:
        case Atom::TITLE: {
          open_elements_stack_.Push(head_);
          defer(open_elements_stack_.Remove(head_));
          return InHeadIM();
        }
        case Atom::HEAD:
          // Ignore the token.
          return true;
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::BODY:
        case Atom::HTML:
        case Atom::BR: {
          // Drop down to creating an implied <body> tag.
          break;
        }
        case Atom::TEMPLATE: {
          return InHeadIM();
        }
        default:
          // Ignore the token.
          return true;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = std::move(token_.data);
      AddChild(node);
      return true;
    }
    case TokenType::DOCTYPE_TOKEN:
      // Ignore the token.
      return true;
    default:
      break;
  }

  ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::BODY,
                    AtomUtil::ToString(Atom::BODY));
  frameset_ok_ = true;
  return false;
}  // Parser::AfterHeadIM.

// Section 12.2.6.4.7.
bool Parser::InBodyIM() {  // NOLINT
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      std::string d = token_.data;
      Node* node = open_elements_stack_.Top();
      switch (node->atom_) {
        case Atom::PRE:
        case Atom::LISTING: {
          if (!node->FirstChild()) {
            // Ignore a new line at the start of a <pre> block.
            if (!d.empty() && d.front() == '\r') {
              d = d.substr(1);
            }
            if (!d.empty() && d.front() == '\n') {
              d = d.substr(1);
            }
          }
          break;
        }
        default:
          break;
      }

      Strings::ReplaceAny(&d, Strings::kNullChar, "");
      // Checks if data empty or all null characters.
      if (d.empty()) {
        return true;
      }

      ReconstructActiveFormattingElements();
      AddText(d);
      if (frameset_ok_ && !Strings::IsAllWhitespaceChars(d)) {
        // There were non-whitespace characters inserted.
        frameset_ok_ = false;
      }
      break;
    }
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HTML: {
          num_html_tags_++;
          if (open_elements_stack_.Contains(Atom::TEMPLATE)) {
            return true;
          }
          CopyAttributes(open_elements_stack_.at(0), token_);
          if (!document_->metadata_.has_manufactured_html ||
              num_html_tags_ > 1) {
            document_->metadata_.duplicate_html_elements = true;
            document_->metadata_.duplicate_html_element_location =
                token_.line_col_in_html_src;
          }
          break;
        }
        case Atom::BASE:
        case Atom::BASEFONT:
        case Atom::BGSOUND:
        case Atom::LINK:
        case Atom::META:
        case Atom::NOFRAMES:
        case Atom::SCRIPT:
        case Atom::STYLE:
        case Atom::TEMPLATE:
        case Atom::TITLE: {
          return InHeadIM();
        }
        case Atom::BODY: {
          num_body_tags_++;
          if (open_elements_stack_.Contains(Atom::TEMPLATE)) {
            return true;
          }
          if (open_elements_stack_.size() >= 2) {
            Node* body = open_elements_stack_.at(1);
            if (body->node_type_ == NodeType::ELEMENT_NODE &&
                body->atom_ == Atom::BODY) {
              frameset_ok_ = false;
              CopyAttributes(body, token_);
              if (!document_->metadata_.has_manufactured_body ||
                  num_body_tags_ > 1) {
                document_->metadata_.duplicate_body_elements = true;
                document_->metadata_.duplicate_body_element_location =
                    token_.line_col_in_html_src;
              }
            }
          }
          break;
        }
        case Atom::FRAMESET: {
          if (!frameset_ok_ || open_elements_stack_.size() < 2 ||
              open_elements_stack_.at(1)->atom_ != Atom::BODY) {
            // Ignore the token.
            return true;
          }
          auto body = open_elements_stack_.at(1);
          if (body->Parent()) {
            auto removed_body = body->Parent()->RemoveChild(body);
            open_elements_stack_.Remove(removed_body);
          }
          // Remove all nodes except one, the last in the stack.
          open_elements_stack_.Pop(open_elements_stack_.size() - 1);
          AddElement();
          insertion_mode_ = std::bind(&Parser::InFramesetIM, this);
          return true;
        }
        case Atom::ADDRESS:
        case Atom::ARTICLE:
        case Atom::ASIDE:
        case Atom::BLOCKQUOTE:
        case Atom::CENTER:
        case Atom::DETAILS:
        case Atom::DIALOG:
        case Atom::DIR:
        case Atom::DIV:
        case Atom::DL:
        case Atom::FIELDSET:
        case Atom::FIGCAPTION:
        case Atom::FIGURE:
        case Atom::FOOTER:
        case Atom::HEADER:
        case Atom::HGROUP:
        case Atom::MAIN:
        case Atom::MENU:
        case Atom::NAV:
        case Atom::OL:
        case Atom::P:
        case Atom::SECTION:
        case Atom::SUMMARY:
        case Atom::UL: {
          PopUntil(Scope::ButtonScope, Atom::P);
          AddElement();
          break;
        }
        case Atom::H1:
        case Atom::H2:
        case Atom::H3:
        case Atom::H4:
        case Atom::H5:
        case Atom::H6: {
          PopUntil(Scope::ButtonScope, Atom::P);
          Node* top_node = top();
          if (top_node) {
            switch (top_node->atom_) {
              case Atom::H1:
              case Atom::H2:
              case Atom::H3:
              case Atom::H4:
              case Atom::H5:
              case Atom::H6:
                open_elements_stack_.Pop();
                break;
              default:
                break;
            }
          }
          AddElement();
          break;
        }
        case Atom::PRE:
        case Atom::LISTING: {
          PopUntil(Scope::ButtonScope, Atom::P);
          AddElement();
          // The newline, if any, will be dealth with by the TEXT_TOKEN case.
          frameset_ok_ = false;
          break;
        }
        case Atom::FORM: {
          if (form_ && !open_elements_stack_.Contains(Atom::TEMPLATE)) {
            // Ignore the token.
            return true;
          }
          PopUntil(Scope::ButtonScope, Atom::P);
          AddElement();
          if (!open_elements_stack_.Contains(Atom::TEMPLATE)) {
            form_ = top();
          }
          break;
        }
        case Atom::LI: {
          frameset_ok_ = false;
          for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
            Node* node = open_elements_stack_.at(i);
            switch (node->atom_) {
              case Atom::LI:
                // Remove all except last in stack.
                open_elements_stack_.Pop(open_elements_stack_.size() - i);
                break;
              case Atom::ADDRESS:
              case Atom::DIV:
              case Atom::P:
                continue;
              default:
                if (!node->IsSpecialElement()) continue;
            }
            break;
          }
          PopUntil(Scope::ButtonScope, Atom::P);
          AddElement();
          break;
        }
        case Atom::DD:
        case Atom::DT: {
          frameset_ok_ = false;
          for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
            Node* node = open_elements_stack_.at(i);
            switch (node->atom_) {
              case Atom::DD:
              case Atom::DT:
                // Remove all except last in stack.
                open_elements_stack_.Pop(open_elements_stack_.size() - i);
                break;
              case Atom::ADDRESS:
              case Atom::DIV:
              case Atom::P:
                continue;
              default:
                if (!node->IsSpecialElement()) continue;
            }
            break;
          }
          PopUntil(Scope::ButtonScope, Atom::P);
          AddElement();
          break;
        }
        case Atom::PLAINTEXT: {
          PopUntil(Scope::ButtonScope, Atom::P);
          AddElement();
          break;
        }
        case Atom::BUTTON: {
          PopUntil(Scope::DefaultScope, Atom::BUTTON);
          ReconstructActiveFormattingElements();
          AddElement();
          frameset_ok_ = false;
          break;
        }
        case Atom::A: {
          for (int i = active_formatting_elements_stack_.size() - 1; i >= 0;
               --i) {
            Node* node = active_formatting_elements_stack_.at(i);
            if (node->node_type_ == NodeType::SCOPE_MARKER_NODE) break;
            if (node->node_type_ == NodeType::ELEMENT_NODE &&
                node->atom_ == Atom::A) {
              InBodyEndTagFormatting(Atom::A, "a");
              open_elements_stack_.Remove(node);
              active_formatting_elements_stack_.Remove(node);
              break;
            }
          }
          ReconstructActiveFormattingElements();
          AddFormattingElement();
          break;
        }
        case Atom::B:
        case Atom::BIG:
        case Atom::CODE:
        case Atom::EM:
        case Atom::FONT:
        case Atom::I:
        case Atom::S:
        case Atom::SMALL:
        case Atom::STRIKE:
        case Atom::STRONG:
        case Atom::TT:
        case Atom::U: {
          ReconstructActiveFormattingElements();
          AddFormattingElement();
          break;
        }
        case Atom::NOBR: {
          ReconstructActiveFormattingElements();
          if (ElementInScope(Scope::DefaultScope, Atom::NOBR)) {
            InBodyEndTagFormatting(Atom::NOBR, "nobr");
            ReconstructActiveFormattingElements();
          }
          AddFormattingElement();
          break;
        }
        case Atom::APPLET:
        case Atom::MARQUEE:
        case Atom::OBJECT: {
          ReconstructActiveFormattingElements();
          AddElement();
          active_formatting_elements_stack_.Push(scope_marker_);
          frameset_ok_ = false;
          break;
        }
        case Atom::TABLE: {
          if (!document_->metadata_.quirks_mode) {
            PopUntil(Scope::ButtonScope, Atom::P);
          }
          AddElement();
          frameset_ok_ = false;
          insertion_mode_ = std::bind(&Parser::InTableIM, this);
          return true;
        }
        case Atom::AREA:
        case Atom::BR:
        case Atom::EMBED:
        case Atom::IMG:
        case Atom::INPUT:
        case Atom::KEYGEN:
        case Atom::WBR: {
          ReconstructActiveFormattingElements();
          AddElement();
          open_elements_stack_.Pop();
          AcknowledgeSelfClosingTag();
          if (token_.atom == Atom::INPUT) {
            for (auto& attr : token_.attributes) {
              if (attr.key == "type" &&
                  Strings::EqualFold(attr.value, "hidden")) {
                  // Skip setting frameset_ok_ = false;
                  return true;
              }
            }
          }
          frameset_ok_ = false;
          break;
        }
        case Atom::PARAM:
        case Atom::SOURCE:
        case Atom::TRACK: {
          AddElement();
          open_elements_stack_.Pop();
          AcknowledgeSelfClosingTag();
          break;
        }
        case Atom::HR: {
          PopUntil(Scope::ButtonScope, Atom::P);
          AddElement();
          open_elements_stack_.Pop();
          AcknowledgeSelfClosingTag();
          frameset_ok_ = false;
          break;
        }
        case Atom::IMAGE: {
          token_.atom = Atom::IMG;
          token_.data = AtomUtil::ToString(Atom::IMG);
          return false;
        }
        case Atom::TEXTAREA: {
          AddElement();
          SetOriginalIM();
          frameset_ok_ = false;
          insertion_mode_ = std::bind(&Parser::TextIM, this);
          break;
        }
        case Atom::XMP: {
          PopUntil(Scope::ButtonScope, Atom::P);
          ReconstructActiveFormattingElements();
          frameset_ok_ = false;
          ParseGenericRawTextElement();
          break;
        }
        case Atom::IFRAME: {
          frameset_ok_ = false;
          ParseGenericRawTextElement();
          break;
        }
        case Atom::NOEMBED: {
          ParseGenericRawTextElement();
          break;
        }
        case Atom::NOSCRIPT: {
          if (scripting_) {
            ParseGenericRawTextElement();
            return true;
          }
          ReconstructActiveFormattingElements();
          AddElement();
          // Don't let the tokenizer go into raw text mode when scripting is
          // disabled.
          tokenizer_->NextIsNotRawText();
          break;
        }
        case Atom::SELECT: {
          ReconstructActiveFormattingElements();
          AddElement();
          frameset_ok_ = false;
          insertion_mode_ = std::bind(&Parser::InSelectIM, this);
          return true;
          break;
        }
        case Atom::OPTGROUP:
        case Atom::OPTION: {
          if (top()->atom_ == Atom::OPTION) {
            open_elements_stack_.Pop();
          }
          ReconstructActiveFormattingElements();
          AddElement();
          break;
        }
        case Atom::RB:
        case Atom::RTC: {
          if (ElementInScope(Scope::DefaultScope, Atom::RUBY)) {
            GenerateImpliedEndTags();
          }
          AddElement();
          break;
        }
        case Atom::RP:
        case Atom::RT: {
          if (ElementInScope(Scope::DefaultScope, Atom::RUBY)) {
            GenerateImpliedEndTags({Atom::RTC});
          }
          AddElement();
          break;
        }
        case Atom::MATH:
        case Atom::SVG: {
          ReconstructActiveFormattingElements();
          if (token_.atom == Atom::MATH) {
            AdjustMathMLAttributeNames(&token_.attributes);
          } else {
            AdjustSVGAttributeNames(&token_.attributes);
          }
          AdjustForeignAttributes(&token_.attributes);
          AddElement();
          top()->name_space_ = AtomUtil::ToString(token_.atom);
          if (has_self_closing_token_) {
            open_elements_stack_.Pop();
            AcknowledgeSelfClosingTag();
          }
          return true;
          break;
        }
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::FRAME:
        case Atom::HEAD:
        case Atom::TBODY:
        case Atom::TD:
        case Atom::TFOOT:
        case Atom::TH:
        case Atom::THEAD:
        case Atom::TR: {
          // Ignore the token.
          break;
        }
        default:
          ReconstructActiveFormattingElements();
          AddElement();
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::BODY:
          if (ElementInScope(Scope::DefaultScope, Atom::BODY)) {
            insertion_mode_ = std::bind(&Parser::AfterBodyIM, this);
          }
          break;
        case Atom::HTML: {
          if (ElementInScope(Scope::DefaultScope, Atom::BODY)) {
            ParseImpliedToken(TokenType::END_TAG_TOKEN, Atom::BODY,
                              AtomUtil::ToString(Atom::BODY));
            return false;
          }
          return true;
          break;
        }
        case Atom::ADDRESS:
        case Atom::ARTICLE:
        case Atom::ASIDE:
        case Atom::BLOCKQUOTE:
        case Atom::BUTTON:
        case Atom::CENTER:
        case Atom::DETAILS:
        case Atom::DIALOG:
        case Atom::DIR:
        case Atom::DIV:
        case Atom::DL:
        case Atom::FIELDSET:
        case Atom::FIGCAPTION:
        case Atom::FIGURE:
        case Atom::FOOTER:
        case Atom::HEADER:
        case Atom::HGROUP:
        case Atom::LISTING:
        case Atom::MAIN:
        case Atom::MENU:
        case Atom::NAV:
        case Atom::OL:
        case Atom::PRE:
        case Atom::SECTION:
        case Atom::SUMMARY:
        case Atom::UL: {
          PopUntil(Scope::DefaultScope, token_.atom);
          break;
        }
        case Atom::FORM: {
          if (open_elements_stack_.Contains(Atom::TEMPLATE)) {
            int i = IndexOfElementInScope(Scope::DefaultScope, {Atom::FORM});
            if (i == -1) {
              // Ignore the token.
              return true;
            }
            GenerateImpliedEndTags();
            if (open_elements_stack_.at(i)->atom_ != Atom::FORM) {
              // Ignore the token.
              return true;
            }
            PopUntil(Scope::DefaultScope, Atom::FORM);
          } else {
            Node* node = form_;
            form_ = nullptr;
            int i = IndexOfElementInScope(Scope::DefaultScope, {Atom::FORM});
            if (!node || i == -1 || open_elements_stack_.at(i) != node) {
              // Ignore the token.
              return true;
            }
            GenerateImpliedEndTags();
            open_elements_stack_.Remove(node);
          }
          break;
        }
        case Atom::P: {
          if (!ElementInScope(Scope::ButtonScope, Atom::P)) {
            ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::P,
                              AtomUtil::ToString(Atom::P));
          }
          PopUntil(Scope::ButtonScope, Atom::P);
          break;
        }
        case Atom::LI: {
          PopUntil(Scope::ListItemScope, Atom::LI);
          break;
        }
        case Atom::DD:
        case Atom::DT: {
          PopUntil(Scope::DefaultScope, token_.atom);
          break;
        }
        case Atom::H1:
        case Atom::H2:
        case Atom::H3:
        case Atom::H4:
        case Atom::H5:
        case Atom::H6: {
          PopUntil(Scope::DefaultScope, Atom::H1, Atom::H2, Atom::H3, Atom::H4,
                   Atom::H5, Atom::H6);
          break;
        }
        case Atom::A:
        case Atom::B:
        case Atom::BIG:
        case Atom::CODE:
        case Atom::EM:
        case Atom::FONT:
        case Atom::I:
        case Atom::NOBR:
        case Atom::S:
        case Atom::SMALL:
        case Atom::STRIKE:
        case Atom::STRONG:
        case Atom::TT:
        case Atom::U: {
          InBodyEndTagFormatting(token_.atom,
                                 token_.atom != Atom::UNKNOWN
                                     ? AtomUtil::ToString(token_.atom)
                                     : token_.data);
          break;
        }
        case Atom::APPLET:
        case Atom::MARQUEE:
        case Atom::OBJECT: {
          if (PopUntil(Scope::DefaultScope, token_.atom)) {
            ClearActiveFormattingElements();
          }
          break;
        }
        case Atom::BR: {
          token_.token_type = TokenType::START_TAG_TOKEN;
          return false;
          break;
        }
        case Atom::TEMPLATE: {
          return InHeadIM();
          break;
        }
        default:
          InBodyEndTagOther(token_.atom, token_.data);
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      AddChild(node);
      break;
    }
    case TokenType::ERROR_TOKEN: {
      if (template_stack_.size() > 0) {
        insertion_mode_ = std::bind(&Parser::InTemplateIM, this);
        return false;
      } else {
        for (Node* n : open_elements_stack_) {
          switch (n->atom_) {
            case Atom::DD:
            case Atom::LI:
            case Atom::OPTGROUP:
            case Atom::OPTION:
            case Atom::P:
            case Atom::RB:
            case Atom::RP:
            case Atom::RT:
            case Atom::RTC:
            case Atom::TBODY:
            case Atom::TD:
            case Atom::TFOOT:
            case Atom::TH:
            case Atom::THEAD:
            case Atom::TR:
            case Atom::BODY:
            case Atom::HTML:
              // Ignore.
              break;
            default:
              return true;
          }
        }
      }
      break;
    }
    default:
      break;
  }

  return true;
}  // NOLINT(readability/fn_size)
// Parser::InBodyIM end.

void Parser::InBodyEndTagFormatting(Atom tag_atom, std::string_view tag_name) {
  // This is the "adoption agency" algorithm, described at
  // https://html.spec.whatwg.org/multipage/syntax.html#adoptionAgency

  // TODO: this is a fairly literal line-by-line translation of that algorithm.
  // Once the code successfully parses the comprehensive test suite, we should
  // refactor this code to be more idiomatic.

  // Steps 1-2
  if (auto current = open_elements_stack_.Top();
      current->data_ == tag_name &&
      active_formatting_elements_stack_.Index(current) == -1) {
    open_elements_stack_.Pop();
    return;
  }

  // Steps 3-5. The outer loop.
  for (int i = 0; i < 8; ++i) {
    // Step 6. Find the formatting element.
    Node* formatting_element = nullptr;
    for (int j = active_formatting_elements_stack_.size() - 1; j >= 0; --j) {
      if (active_formatting_elements_stack_.at(j)->node_type_ ==
          NodeType::SCOPE_MARKER_NODE) {
        break;
      }
      if (active_formatting_elements_stack_.at(j)->atom_ == tag_atom) {
        formatting_element = active_formatting_elements_stack_.at(j);
        break;
      }
    }

    if (!formatting_element) {
      InBodyEndTagOther(tag_atom, tag_name);
      return;
    }

    // Step 7. Ignore the tag if formatting element is not in the stack of open
    // elements.
    int fe_index = open_elements_stack_.Index(formatting_element);
    if (fe_index == -1) {
      active_formatting_elements_stack_.Remove(formatting_element);
      return;
    }

    // Step 8. Ignore the tag if formatting element is not in the scope.
    if (!ElementInScope(Scope::DefaultScope, tag_atom)) {
      // Ignore the tag.
      return;
    }

    // Step 9. This step is omitted because it's just a parse error but no
    // need to return.

    // Steps 10-11. Find the furthest block.
    Node* furthest_block = nullptr;
    for (int k = fe_index; k < open_elements_stack_.size(); ++k) {
      if (open_elements_stack_.at(k)->IsSpecialElement()) {
        furthest_block = open_elements_stack_.at(k);
        break;
      }
    }

    if (!furthest_block) {
      Node* e = open_elements_stack_.Pop();
      while (e != formatting_element) {
        e = open_elements_stack_.Pop();
      }
      active_formatting_elements_stack_.Remove(e);
      return;
    }

    // Steps 12-13. Find the common ancestor and bookmark node.
    Node* common_ancestor = open_elements_stack_.at(fe_index - 1);
    auto bookmark = active_formatting_elements_stack_.Index(formatting_element);

    // Step 14. The inner loop. Find the last_node to reparent.
    Node* last_node = furthest_block;
    Node* node = furthest_block;
    int x = open_elements_stack_.Index(node);
    // Step 14.1.
    int j = 0;
    while (true) {
      // Step 14.2.
      j++;
      // Step 14.3.
      x--;
      node = open_elements_stack_.at(x);
      // Step 14.4. Go to the next step if node is formatting element.
      if (node == formatting_element) break;

      // Step 14.5. Remove node from the list of active formatting elements if
      // inner loop counter is greater than three and node is in the list of
      // active formatting elements.
      if (int ni = active_formatting_elements_stack_.Index(node);
          j > 3 && ni > -1) {
        active_formatting_elements_stack_.Remove(node);
        // If any element of the list of active formatting elements is removed,
        // we need to take care whether bookmark should be decremented or not.
        // This is because the value of bookmark may exceed the size of the
        // list by removing elements from the list.
        if (ni <= bookmark) {
          bookmark--;
        }
        continue;
      }

      // Step 14.6. Continue the next inner loop if node is not in the list of
      // active formatting elements.
      if (active_formatting_elements_stack_.Index(node) == -1) {
        open_elements_stack_.Remove(node);
        continue;
      }

      // Step 14.7.
      Node* clone = document_->CloneNode(node);
      active_formatting_elements_stack_.Replace(
          active_formatting_elements_stack_.Index(node), clone);
      open_elements_stack_.Replace(open_elements_stack_.Index(node), clone);
      node = clone;

      // Step 14.8.
      if (last_node == furthest_block) {
        bookmark = active_formatting_elements_stack_.Index(node) + 1;
      }
      // Step 14.9.
      if (last_node->Parent()) {
        last_node = last_node->Parent()->RemoveChild(last_node);
      }
      node->AppendChild(last_node);

      // Step 14.10.
      last_node = node;
    }

    // Step 15. Reparent lastNode to the common ancestor,
    // or for misnested table nodes, to the foster parent.
    if (last_node->Parent()) {
      last_node = last_node->Parent()->RemoveChild(last_node);
    }

    switch (common_ancestor->atom_) {
      case Atom::TABLE:
      case Atom::TBODY:
      case Atom::TFOOT:
      case Atom::THEAD:
      case Atom::TR:
        FosterParent(last_node);
        break;
      default:
        common_ancestor->AppendChild(last_node);
    }

    // Steps 16-18. Reparent nodes from the furthest block's children
    // to a clone of the formatting element.
    Node* clone = document_->CloneNode(formatting_element);
    furthest_block->ReparentChildrenTo(clone);
    furthest_block->AppendChild(clone);

    // Step 19. Fix up the list of active formatting elements.
    int old_loc = active_formatting_elements_stack_.Index(formatting_element);
    if (old_loc != -1 && old_loc < bookmark) {
      // Move the bookmark with the rest of the list.
      bookmark--;
    }

    active_formatting_elements_stack_.Remove(formatting_element);
    active_formatting_elements_stack_.Insert(bookmark, clone);

    // Step 20. Fix up the stack of open elements.
    open_elements_stack_.Remove(formatting_element);
    open_elements_stack_.Insert(open_elements_stack_.Index(furthest_block) + 1,
                                clone);
  }
}  // Parser::InBodyEndTagFormatting.

void Parser::InBodyEndTagOther(Atom tag_atom, std::string_view tag_name) {
  for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
    // Two element nodes have the same tag if they have the same Data (a
    // string-typed field). As an optimization, for common HTML tags, each
    // Data string is assigned a unique, non-zero Atom (a uint32-typed
    // field), since integer comparison is faster than string comparison.
    // Uncommon (custom) tags get a zero Atom.
    //
    // The if condition here is equivalent to (node->data_ == tag_name).
    if (open_elements_stack_.at(i)->atom_ == tag_atom &&
        ((tag_atom != Atom::UNKNOWN) ||
         (open_elements_stack_.at(i)->data_ == tag_name))) {
      open_elements_stack_.Pop(open_elements_stack_.size() - i);
      break;
    }

    if (open_elements_stack_.at(i)->IsSpecialElement()) break;
  }
}  // Parser::InBodyEndTagOther.

// Section 12.2.6.4.8.
bool Parser::TextIM() {
  switch (token_.token_type) {
    case TokenType::ERROR_TOKEN:
      open_elements_stack_.Pop();
      break;
    case TokenType::TEXT_TOKEN: {
      std::string_view data_view(token_.data);
      Node* node = open_elements_stack_.Top();
      if ((node->atom_ == Atom::TEXTAREA) && !node->FirstChild()) {
        // Ignore a newline at the start of a <textarea> block.
        if (!data_view.empty() && data_view.front() == '\r') {
          data_view.remove_prefix(1);
        }
        if (!data_view.empty() && data_view.front() == '\n') {
          data_view.remove_prefix(1);
        }
      }
      if (data_view.empty()) return true;
      AddText(data_view.data());
      return true;
    }
    case TokenType::END_TAG_TOKEN:
      open_elements_stack_.Pop();
      break;
    default:
      break;
  }
  insertion_mode_ = original_insertion_mode_;
  original_insertion_mode_ = nullptr;
  return token_.token_type == TokenType::END_TAG_TOKEN;
}  // Parser::TextIM.

// Section 12.2.6.4.9.
bool Parser::InTableIM() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      Strings::ReplaceAny(&token_.data, Strings::kNullChar, "");
      switch (open_elements_stack_.Top()->atom_) {
        case Atom::TABLE:
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD:
        case Atom::TR: {
          // All whitespace including \x00.
          if (Strings::IsAllWhitespaceChars(token_.data,
                                            Strings::kWhitespaceOrNull)) {
            AddText(token_.data);
            return true;
          }
          break;
        }
        default:
          break;
      }
      break;
    }
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::CAPTION: {
          ClearStackToContext(Scope::TableScope);
          active_formatting_elements_stack_.Push(scope_marker_);
          AddElement();
          insertion_mode_ = std::bind(&Parser::InCaptionIM, this);
          return true;
        }
        case Atom::COLGROUP: {
          ClearStackToContext(Scope::TableScope);
          AddElement();
          insertion_mode_ = std::bind(&Parser::InColumnGroupIM, this);
          return true;
        }
        case Atom::COL: {
          ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::COLGROUP,
                            AtomUtil::ToString(Atom::COLGROUP));
          return false;
        }
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD: {
          ClearStackToContext(Scope::TableScope);
          AddElement();
          insertion_mode_ = std::bind(&Parser::InTableBodyIM, this);
          return true;
        }
        case Atom::TD:
        case Atom::TH:
        case Atom::TR: {
          ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::TBODY,
                            AtomUtil::ToString(Atom::TBODY));
          return false;
        }
        case Atom::TABLE: {
          if (PopUntil(Scope::TableScope, Atom::TABLE)) {
            ResetInsertionMode();
            return false;
          }
          // Ignore the token.
          return true;
        }
        case Atom::STYLE:
        case Atom::SCRIPT:
        case Atom::TEMPLATE: {
          return InHeadIM();
        }
        case Atom::INPUT: {
          for (auto& attr : token_.attributes) {
            if (attr.key == "type" &&
                Strings::EqualFold(attr.value, "hidden")) {
              AddElement();
              open_elements_stack_.Pop();
              return true;
            }
          }
          break;
          // Otherwise drop down to the default action.
        }
        case Atom::FORM: {
          if (open_elements_stack_.Contains(Atom::TEMPLATE) || form_) {
            // Ignore the token.
            return true;
          }
          AddElement();
          form_ = open_elements_stack_.Pop();
          break;
        }
        case Atom::SELECT: {
          ReconstructActiveFormattingElements();
          switch (top()->atom_) {
            case Atom::TABLE:
            case Atom::TBODY:
            case Atom::TFOOT:
            case Atom::THEAD:
            case Atom::TR:
              foster_parenting_ = true;
              break;
            default:
              // Ignore remaining tags.
              break;
          }
          AddElement();
          foster_parenting_ = false;
          frameset_ok_ = false;
          insertion_mode_ = std::bind(&Parser::InSelectInTableIM, this);
          return true;
        }
        default:
          // Ignore remaining tags.
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::TABLE:
          if (PopUntil(Scope::TableScope, Atom::TABLE)) {
            ResetInsertionMode();
            return true;
          }
          // Ignore the token.
          return true;
        case Atom::BODY:
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::HTML:
        case Atom::TBODY:
        case Atom::TD:
        case Atom::TFOOT:
        case Atom::TH:
        case Atom::THEAD:
        case Atom::TR:
          // Ignore the token.
          return true;
        case Atom::TEMPLATE:
          return InHeadIM();
        default:
          // Ignore.
          break;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      AddChild(node);
      return true;
    }
    case TokenType::DOCTYPE_TOKEN: {
      // Ignore the token.
      return true;
    }
    case TokenType::ERROR_TOKEN: {
      return InBodyIM();
    }
    default:
      break;
  }

  foster_parenting_ = true;
  defer(foster_parenting_ = false;);
  return InBodyIM();
}  // Parser::InTableIM.

// Section 12.2.6.4.11.
bool Parser::InCaptionIM() {
  switch (token_.token_type) {
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::TBODY:
        case Atom::TD:
        case Atom::TFOOT:
        case Atom::THEAD:
        case Atom::TR: {
          if (PopUntil(Scope::TableScope, Atom::CAPTION)) {
            ClearActiveFormattingElements();
            insertion_mode_ = std::bind(&Parser::InTableIM, this);
            return false;
          }
          // Ignore the token.
          return true;
        }
        case Atom::SELECT: {
          ReconstructActiveFormattingElements();
          AddElement();
          frameset_ok_ = false;
          insertion_mode_ = std::bind(&Parser::InSelectInTableIM, this);
          return true;
        }
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::CAPTION: {
          if (PopUntil(Scope::TableScope, Atom::CAPTION)) {
            ClearActiveFormattingElements();
            insertion_mode_ = std::bind(&Parser::InTableIM, this);
          }
          return true;
        }
        case Atom::TABLE: {
          if (PopUntil(Scope::TableScope, Atom::CAPTION)) {
            ClearActiveFormattingElements();
            insertion_mode_ = std::bind(&Parser::InTableIM, this);
            return false;
          }
          // Ignore the token.
          return true;
        }
        case Atom::BODY:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::HTML:
        case Atom::TBODY:
        case Atom::TD:
        case Atom::TFOOT:
        case Atom::TH:
        case Atom::THEAD:
        case Atom::TR: {
          // Ignore the token.
          return true;
        }
        default:
          break;
      }
      break;
    }
    default:
      break;
  }

  return InBodyIM();
}  // Parser::InCaptionIM.

// Section 12.2.6.4.12.
bool Parser::InColumnGroupIM() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      std::string s = token_.data;
      Strings::TrimLeft(&s);
      if (s.size() < token_.data.size()) {
        // Add the initial whitespace to the current node.
        AddText(token_.data.substr(0, token_.data.size() - s.size()));
        if (s.empty()) return true;
        token_.data = s;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      AddChild(node);
      return true;
    }
    case TokenType::DOCTYPE_TOKEN: {
      // Ignore the token.
      return true;
    }
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HTML: {
          return InBodyIM();
        }
        case Atom::COL: {
          AddElement();
          open_elements_stack_.Pop();
          AcknowledgeSelfClosingTag();
          return true;
        }
        case Atom::TEMPLATE: {
          return InHeadIM();
        }
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::COLGROUP:
          if (open_elements_stack_.Top()->atom_ == Atom::COLGROUP) {
            open_elements_stack_.Pop();
            insertion_mode_ = std::bind(&Parser::InTableIM, this);
          }
          return true;
        case Atom::COL:
          // Ignore the token.
          return true;
        case Atom::TEMPLATE:
          return InHeadIM();
        default:
          break;
      }
      break;
    }
    case TokenType::ERROR_TOKEN: {
      return InBodyIM();
    }
    default:
      break;
  }

  if (open_elements_stack_.Top()->atom_ != Atom::COLGROUP) {
    return true;
  }
  open_elements_stack_.Pop();
  insertion_mode_ = std::bind(&Parser::InTableIM, this);
  return false;
}  // Parser::InColumnGroupIM.

// Section 12.2.6.4.13.
bool Parser::InTableBodyIM() {
  switch (token_.token_type) {
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::TR: {
          ClearStackToContext(Scope::TableBodyScope);
          AddElement();
          insertion_mode_ = std::bind(&Parser::InRowIM, this);
          return true;
        }
        case Atom::TD:
        case Atom::TH: {
          ParseImpliedToken(TokenType::START_TAG_TOKEN, Atom::TR,
                            AtomUtil::ToString(Atom::TR));
          return false;
        }
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD: {
          if (PopUntil(Scope::TableScope, Atom::TBODY, Atom::THEAD,
                       Atom::TFOOT)) {
            insertion_mode_ = std::bind(&Parser::InTableIM, this);
            return false;
          }
          // Ignore the token.
          return true;
        }
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD: {
          if (ElementInScope(Scope::TableScope, token_.atom)) {
            ClearStackToContext(Scope::TableBodyScope);
            open_elements_stack_.Pop();
            insertion_mode_ = std::bind(&Parser::InTableIM, this);
          }
          return true;
        }
        case Atom::TABLE: {
          if (PopUntil(Scope::TableScope, Atom::TBODY, Atom::THEAD,
                       Atom::TFOOT)) {
            insertion_mode_ = std::bind(&Parser::InTableIM, this);
            return false;
          }
          // Ignore the token.
          return true;
        }
        case Atom::BODY:
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::HTML:
        case Atom::TD:
        case Atom::TH:
        case Atom::TR: {
          // Ignore the token.
          return true;
        }
        default:
          break;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      AddChild(node);
      return true;
    }
    default:
      break;
  }

  return InTableIM();
}  // Parser::InTableBodyIM.

// Section 12.2.6.4.14.
bool Parser::InRowIM() {
  switch (token_.token_type) {
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::TD:
        case Atom::TH: {
          ClearStackToContext(Scope::TableRowScope);
          AddElement();
          active_formatting_elements_stack_.Push(scope_marker_);
          insertion_mode_ = std::bind(&Parser::InCellIM, this);
          return true;
        }
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD:
        case Atom::TR: {
          if (PopUntil(Scope::TableScope, Atom::TR)) {
            insertion_mode_ = std::bind(&Parser::InTableBodyIM, this);
            return false;
          }
          // Ignore the token.
          return true;
          break;
        }
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::TR: {
          if (PopUntil(Scope::TableScope, Atom::TR)) {
            insertion_mode_ = std::bind(&Parser::InTableBodyIM, this);
          }
          // Ignore the token.
          return true;
        }
        case Atom::TABLE: {
          if (PopUntil(Scope::TableScope, Atom::TR)) {
            insertion_mode_ = std::bind(&Parser::InTableBodyIM, this);
            return false;
          }
          // Ignore the token.
          return true;
        }
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD: {
          if (ElementInScope(Scope::TableScope, token_.atom)) {
            ParseImpliedToken(TokenType::END_TAG_TOKEN, Atom::TR,
                              AtomUtil::ToString(Atom::TR));
            return false;
          }
          // Ignore the token.
          return true;
        }
        case Atom::BODY:
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::HTML:
        case Atom::TD:
        case Atom::TH: {
          // Ignore the token.
          return true;
        }
        default:
          break;
      }
      break;
    }
    default:
      break;
  }

  return InTableIM();
}  // Parser::InRowIM.

// Section 12.2.6.4.15.
bool Parser::InCellIM() {
  switch (token_.token_type) {
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::TBODY:
        case Atom::TD:
        case Atom::TFOOT:
        case Atom::TH:
        case Atom::THEAD:
        case Atom::TR: {
          if (PopUntil(Scope::TableScope, Atom::TD, Atom::TH)) {
            // Close the cell and reprocess.
            ClearActiveFormattingElements();
            insertion_mode_ = std::bind(&Parser::InRowIM, this);
            return false;
          }
          // Ignore the token.
          return true;
        }
        case Atom::SELECT: {
          ReconstructActiveFormattingElements();
          AddElement();
          frameset_ok_ = false;
          insertion_mode_ = std::bind(&Parser::InSelectInTableIM, this);
          return true;
        }
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::TD:
        case Atom::TH: {
          if (!PopUntil(Scope::TableScope, token_.atom)) {
            // Ignore the token.
            return true;
          }
          ClearActiveFormattingElements();
          insertion_mode_ = std::bind(&Parser::InRowIM, this);
          return true;
        }
        case Atom::BODY:
        case Atom::CAPTION:
        case Atom::COL:
        case Atom::COLGROUP:
        case Atom::HTML: {
          // Ignore the token.
          return true;
        }
        case Atom::TABLE:
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD:
        case Atom::TR: {
          if (!ElementInScope(Scope::TableScope, token_.atom)) {
            // Ignore the token.
            return true;
          }
          // Close the cell and reprocess.
          if (PopUntil(Scope::TableScope, Atom::TD, Atom::TH)) {
            ClearActiveFormattingElements();
          }
          insertion_mode_ = std::bind(&Parser::InRowIM, this);
          return false;
        }
        default:
          break;
      }
      break;
    }
    default:
      break;
  }
  return InBodyIM();
}  // Parser::InCellIM.

// Section 12.2.6.4.16.
bool Parser::InSelectIM() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      Strings::ReplaceAny(&token_.data, Strings::kNullChar, "");
      AddText(token_.data);
      break;
    }
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::HTML: {
          return InBodyIM();
        }
        case Atom::OPTION: {
          if (top()->atom_ == Atom::OPTION) {
            open_elements_stack_.Pop();
          }
          AddElement();
          break;
        }
        case Atom::OPTGROUP: {
          if (top()->atom_ == Atom::OPTION) {
            open_elements_stack_.Pop();
          }
          if (top()->atom_ == Atom::OPTGROUP) {
            open_elements_stack_.Pop();
          }
          AddElement();
          break;
        }
        case Atom::SELECT: {
          if (PopUntil(Scope::SelectScope, Atom::SELECT)) {
            ResetInsertionMode();
          }
          // Ignore the token.
          return true;
        }
        case Atom::INPUT:
        case Atom::KEYGEN:
        case Atom::TEXTAREA: {
          if (ElementInScope(Scope::SelectScope, Atom::SELECT)) {
            ParseImpliedToken(TokenType::END_TAG_TOKEN, Atom::SELECT,
                              AtomUtil::ToString(Atom::SELECT));
            return false;
          }
          // In order to properly ignore <textarea>, we need to change the
          // tokenizer mode.
          tokenizer_->NextIsNotRawText();
          // Ignore the token.
          return true;
        }
        case Atom::SCRIPT:
        case Atom::TEMPLATE: {
          return InHeadIM();
        }
        case Atom::IFRAME:
        case Atom::NOEMBED:
        case Atom::NOFRAMES:
        case Atom::NOSCRIPT:
        case Atom::PLAINTEXT:
        case Atom::STYLE:
        case Atom::TITLE:
        case Atom::XMP: {
          // Don't let the tokenizer go into raw text mode when there are raw
          // tags to be ignored. These tags should be ignored from the tokenizer
          // properly.
          tokenizer_->NextIsNotRawText();
          // Ignore the token.
          return true;
        }
        default:
          break;
      }
      break;
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::OPTION: {
          if (top()->atom_ == Atom::OPTION) {
            open_elements_stack_.Pop();
          }
          break;
        }
        case Atom::OPTGROUP: {
          int i = open_elements_stack_.size() - 1;
          Node* node = open_elements_stack_.at(i);
          if (node && node->atom_ == Atom::OPTION) {
            i--;
          }
          node = open_elements_stack_.at(i);
          if (node && node->atom_ == Atom::OPTGROUP) {
            open_elements_stack_.Pop(open_elements_stack_.size() - i);
          }
          break;
        }
        case Atom::SELECT: {
          if (!PopUntil(Scope::SelectScope, Atom::SELECT)) {
            // Ignore the token.
            return true;
          }
          ResetInsertionMode();
          break;
        }
        case Atom::TEMPLATE: {
          return InHeadIM();
        }
        default:
          break;
      }
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      AddChild(node);
      break;
    }
    case TokenType::DOCTYPE_TOKEN: {
      // Ignore the token.
      return true;
    }
    case TokenType::ERROR_TOKEN: {
      return InBodyIM();
    }
    default:
      break;
  }

  return true;
}  // Parser::InSelectIM.

// Section 12.2.6.4.17.
bool Parser::InSelectInTableIM() {
  switch (token_.token_type) {
    case TokenType::START_TAG_TOKEN:
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::CAPTION:
        case Atom::TABLE:
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD:
        case Atom::TR:
        case Atom::TD:
        case Atom::TH: {
          if (token_.token_type == TokenType::END_TAG_TOKEN &&
              !ElementInScope(Scope::TableScope, token_.atom)) {
            // Ignore the token.
            return true;
          }
          // This is like p.popUntil(selectScope, a.Select), but it also
          // matches <math select>, not just <select>. Matching the MathML
          // tag is arguably incorrect (conceptually), but it mimics what
          // Chromium does.
          for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
            if (open_elements_stack_.at(i)->atom_ == Atom::SELECT) {
              open_elements_stack_.Pop(open_elements_stack_.size() - i);
              break;
            }
          }
          ResetInsertionMode();
          return false;
        }
        default:
          break;
      }
      break;
    }
    default:
      break;
  }

  return InSelectIM();
}  // Parser::InSelectInTableIM.

// Section 12.2.6.4.18.
bool Parser::InTemplateIM() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN:
    case TokenType::COMMENT_TOKEN:
    case TokenType::DOCTYPE_TOKEN:
      return InBodyIM();
    case TokenType::START_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::BASE:
        case Atom::BASEFONT:
        case Atom::BGSOUND:
        case Atom::LINK:
        case Atom::META:
        case Atom::NOFRAMES:
        case Atom::SCRIPT:
        case Atom::STYLE:
        case Atom::TEMPLATE:
        case Atom::TITLE:
          return InHeadIM();
        case Atom::CAPTION:
        case Atom::COLGROUP:
        case Atom::TBODY:
        case Atom::TFOOT:
        case Atom::THEAD: {
          template_stack_.pop_back();
          template_stack_.push_back(std::bind(&Parser::InTableIM, this));
          insertion_mode_ = std::bind(&Parser::InTableIM, this);
          return false;
        }
        case Atom::COL: {
          template_stack_.pop_back();
          template_stack_.push_back(std::bind(&Parser::InColumnGroupIM, this));
          insertion_mode_ = std::bind(&Parser::InColumnGroupIM, this);
          return false;
        }
        case Atom::TR: {
          template_stack_.pop_back();
          template_stack_.push_back(std::bind(&Parser::InTableBodyIM, this));
          insertion_mode_ = std::bind(&Parser::InTableBodyIM, this);
          return false;
        }
        case Atom::TD:
        case Atom::TH: {
          template_stack_.pop_back();
          template_stack_.push_back(std::bind(&Parser::InRowIM, this));
          insertion_mode_ = std::bind(&Parser::InRowIM, this);
          return false;
        }
        default:
          template_stack_.pop_back();
          template_stack_.push_back(std::bind(&Parser::InBodyIM, this));
          insertion_mode_ = std::bind(&Parser::InBodyIM, this);
          return false;
      }
    }
    case TokenType::END_TAG_TOKEN: {
      switch (token_.atom) {
        case Atom::TEMPLATE:
          return InHeadIM();
        default:
          // Ignore the token.
          return true;
      }
    }
    case TokenType::ERROR_TOKEN: {
      if (!open_elements_stack_.Contains(Atom::TEMPLATE)) {
        // Ignore the token.
        return true;
      }
      // TODO: remove this divergence from the HTML5 spec.
      //
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=829668
      GenerateImpliedEndTags();
      for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
        Node* node = open_elements_stack_.at(i);
        if (node->name_space_.empty() && node->atom_ == Atom::TEMPLATE) {
          open_elements_stack_.Pop(open_elements_stack_.size() - i);
          break;
        }
      }
      ClearActiveFormattingElements();
      template_stack_.pop_back();
      ResetInsertionMode();
      return false;
    }
    default:
      break;
  }
  return false;
}  // Parser::InTemplateIM.

// Section 12.2.6.4.19.
bool Parser::AfterBodyIM() {
  switch (token_.token_type) {
    case TokenType::ERROR_TOKEN:
      // Stop parsing.
      return true;
    case TokenType::TEXT_TOKEN:
      // https://www.w3.org/TR/2011/WD-html5-20110113/tokenization.html#parsing-main-afterbody
      if (token_.data.find_first_not_of(Strings::kWhitespace) ==
          std::string::npos) {
        // It was all whitesapce.
        return InBodyIM();
      }
      break;
    case TokenType::START_TAG_TOKEN:
      if (token_.atom == Atom::HTML) {
        return InBodyIM();
      }
      break;
    case TokenType::END_TAG_TOKEN:
      if (token_.atom == Atom::HTML) {
        if (!fragment_) {
          insertion_mode_ = std::bind(&Parser::AfterAfterBodyIM, this);
        }
        return true;
      }
      break;
    case TokenType::COMMENT_TOKEN: {
      // The comment is attached to the <html> element.
      CHECK(open_elements_stack_.size() > 0 &&
            open_elements_stack_.at(0)->atom_ == Atom::HTML)
          << "html: bad parser state: <html> element not found, in the "
             "after-body insertion mode";
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      open_elements_stack_.at(0)->AppendChild(node);
      return true;
    }
    default:
      break;
  }

  insertion_mode_ = std::bind(&Parser::InBodyIM, this);
  return false;
}  // Parser::AfterBodyIM.

// Section 12.2.6.4.20.
bool Parser::InFramesetIM() {
  switch (token_.token_type) {
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      AddChild(node);
      break;
    }
    case TokenType::TEXT_TOKEN: {
      std::string whitespace_only = ExtractWhitespace(token_.data);
      if (!whitespace_only.empty()) AddText(whitespace_only);
      break;
    }
    case TokenType::START_TAG_TOKEN:
      switch (token_.atom) {
        case Atom::HTML:
          return InBodyIM();
        case Atom::FRAMESET:
          AddElement();
          break;
        case Atom::FRAME:
          AddElement();
          open_elements_stack_.Pop();
          AcknowledgeSelfClosingTag();
          break;
        case Atom::NOFRAMES:
          return InHeadIM();
        default:
          break;
      }
      break;
    case TokenType::END_TAG_TOKEN:
      switch (token_.atom) {
        case Atom::FRAMESET:
          if (open_elements_stack_.Top()->atom_ != Atom::HTML) {
            open_elements_stack_.Pop();
            if (open_elements_stack_.Top()->atom_ != Atom::FRAMESET) {
              insertion_mode_ = std::bind(&Parser::AfterFramesetIM, this);
              return true;
            }
          }
          break;
        default:
          break;
      }
      break;
    default:
      // Ignore the token.
      break;
  }
  return true;
}  // Parser::InFramesetIM.

// Section 12.2.6.4.21.
bool Parser::AfterFramesetIM() {
  switch (token_.token_type) {
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      AddChild(node);
      break;
    }
    case TokenType::TEXT_TOKEN: {
      std::string whitespace_only = ExtractWhitespace(token_.data);
      if (!whitespace_only.empty()) AddText(whitespace_only);
      break;
    }
    case TokenType::START_TAG_TOKEN:
      switch (token_.atom) {
        case Atom::HTML:
          return InBodyIM();
        case Atom::NOFRAMES:
          return InHeadIM();
        default:
          break;
      }
      break;
    case TokenType::END_TAG_TOKEN:
      switch (token_.atom) {
        case Atom::HTML:
          insertion_mode_ = std::bind(&Parser::AfterAfterFramesetIM, this);
          return true;
        default:
          break;
      }
      break;
    default:
      // Ignore the token.
      break;
  }
  return true;
}  // Parser::AfterFramesetIM.

// Section 12.2.6.4.22.
bool Parser::AfterAfterBodyIM() {
  switch (token_.token_type) {
    case TokenType::ERROR_TOKEN:
      // Stop parsing.
      return true;
    case TokenType::TEXT_TOKEN: {
      if (token_.data.find_first_not_of(Strings::kWhitespace) ==
          std::string::npos) {
        return InBodyIM();
      }
      break;
    }
    case TokenType::START_TAG_TOKEN:
      if (token_.atom == Atom::HTML) {
        return InBodyIM();
      }
      break;
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      document_->root_node_->AppendChild(node);
      return true;
    }
    case TokenType::DOCTYPE_TOKEN:
      return InBodyIM();
    default:
      break;
  }

  insertion_mode_ = std::bind(&Parser::InBodyIM, this);
  return false;
}  // Parser::AfterAfterBodyIM.

// Section 12.2.6.4.23.
bool Parser::AfterAfterFramesetIM() {
  switch (token_.token_type) {
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      document_->root_node_->AppendChild(node);
      break;
    }
    case TokenType::TEXT_TOKEN: {
      std::string whitespace_only = ExtractWhitespace(token_.data);
      if (!whitespace_only.empty()) {
        token_.data = whitespace_only;
        return InBodyIM();
      }
      break;
    }
    case TokenType::START_TAG_TOKEN:
      switch (token_.atom) {
        case Atom::HTML:
          return InBodyIM();
        case Atom::NOFRAMES:
          return InHeadIM();
        default:
          break;
      }
      break;
    case TokenType::DOCTYPE_TOKEN:
      return InBodyIM();
    default:
      break;
  }
  return true;
}  // Parser::AfterAfterFramesetIM.

Node* Parser::AdjustedCurrentNode() {
  if (open_elements_stack_.size() == 1 && fragment_ && context_node_)
    return context_node_;
  return open_elements_stack_.Top();
}

// Section 12.2.6.5.
bool Parser::ParseForeignContent() {
  switch (token_.token_type) {
    case TokenType::TEXT_TOKEN: {
      if (frameset_ok_) {
        frameset_ok_ = (token_.data.find_first_not_of(
                            Strings::kWhitespaceOrNull) == std::string::npos);
      }
      // Replaces null char with \ufffd replacement character.
      Strings::ReplaceAny(&token_.data, Strings::kNullChar,
                          Strings::kNullReplacementChar);
      AddText(token_.data);
      break;
    }
    case TokenType::COMMENT_TOKEN: {
      Node* node = document_->NewNode(NodeType::COMMENT_NODE);
      node->SetManufactured(token_.is_manufactured);
      if (record_node_offsets_) {
        node->line_col_in_html_src_ = token_.line_col_in_html_src;
      }
      node->data_ = token_.data;
      AddChild(node);
      break;
    }
    case TokenType::START_TAG_TOKEN: {
      if (!fragment_) {
        auto breaktout_tag = std::find(std::begin(kBreakoutTags),
                                       std::end(kBreakoutTags), token_.atom);
        bool is_breakout_tag = breaktout_tag != std::end(kBreakoutTags);

        if (token_.atom == Atom::FONT) {
          for (auto& attr : token_.attributes) {
            std::string key = attr.key;
            if (key == "color" || key == "face" || key == "size") {
              is_breakout_tag = true;
              break;
            }
          }
        }
        if (is_breakout_tag) {
          for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
            Node* node = open_elements_stack_.at(i);
            if (node->name_space_.empty() || HtmlIntegrationPoint(*node) ||
                MathMLTextIntegrationPoint(*node)) {
              open_elements_stack_.Pop(open_elements_stack_.size() - i - 1);
              break;
            }
          }
          return false;
        }
      }

      Node* current = AdjustedCurrentNode();
      if (current->name_space_ == "math") {
        AdjustMathMLAttributeNames(&token_.attributes);
      } else if (current->name_space_ == "svg") {
        for (auto [name, adjusted] : kSvgTagNameAdjustments) {
          if (name == token_.atom) {
            token_.atom = adjusted;
          }
        }
        AdjustSVGAttributeNames(&token_.attributes);
      } else {
        CHECK(false) << "html: bad parser state: unexpected namespace";
      }

      AdjustForeignAttributes(&token_.attributes);
      auto& ns = current->name_space_;
      AddElement();
      top()->name_space_ = ns;
      if (!ns.empty()) {
        // Don't let the tokenizer go into raw text mode in foreign content.
        // (e.g. in an SVG <title> tag).
        tokenizer_->NextIsNotRawText();
      }
      if (has_self_closing_token_) {
        open_elements_stack_.Pop();
        AcknowledgeSelfClosingTag();
      }
      break;
    }
    case TokenType::END_TAG_TOKEN:
      for (int i = open_elements_stack_.size() - 1; i >= 0; --i) {
        if (open_elements_stack_.at(i)->name_space_.empty()) {
          return insertion_mode_();
        }

        auto sn = open_elements_stack_.at(i);
        auto node_data = sn->atom_ != Atom::UNKNOWN
                             ? AtomUtil::ToString(sn->atom_)
                             : sn->data_;
        auto token_data = token_.atom != Atom::UNKNOWN
                              ? AtomUtil::ToString(token_.atom)
                              : token_.data;

        if (Strings::EqualFold(node_data, token_data)) {
          open_elements_stack_.Pop(open_elements_stack_.size() - i);
          break;
        }
      }
      return true;
    default:
      // Ignore the token.
      break;
  }
  return true;
}  // Parser::ParseForeignContent.

// Section 12.2.6.
bool Parser::InForeignContent() {
  if (open_elements_stack_.size() == 0) return false;

  Node* node = AdjustedCurrentNode();
  if (node->name_space_.empty()) return false;
  Atom token_atom = token_.atom;
  TokenType token_type = token_.token_type;
  if (MathMLTextIntegrationPoint(*node)) {
    if (token_type == TokenType::START_TAG_TOKEN &&
        token_atom != Atom::MGLYPH && token_atom != Atom::MALIGNMARK) {
      return false;
    }
    if (token_type == TokenType::TEXT_TOKEN) {
      return false;
    }
  }

  if (node->name_space_ == "math" && node->atom_ == Atom::ANNOTATION_XML &&
      token_type == TokenType::START_TAG_TOKEN && token_atom == Atom::SVG) {
    return false;
  }

  if (HtmlIntegrationPoint(*node) &&
      (token_type == TokenType::START_TAG_TOKEN ||
       token_type == TokenType::TEXT_TOKEN)) {
    return false;
  }

  if (token_type == TokenType::ERROR_TOKEN) {
    return false;
  }

  return true;
}  // Parser::InForeignContent.

// Section 12.2.6.2.
void Parser::ParseGenericRawTextElement() {
  AddElement();
  original_insertion_mode_ = insertion_mode_;
  insertion_mode_ = std::bind(&Parser::TextIM, this);
}

void Parser::ParseImpliedToken(TokenType token_type, Atom atom,
                               const std::string& data) {
  // Copy original token.
  Token real_token = {.token_type = token_.token_type,
                      .atom = token_.atom,
                      .data = token_.data,
                      .line_col_in_html_src = token_.line_col_in_html_src,
                      .attributes = token_.attributes};
  bool self_closing = has_self_closing_token_;
  // Create implied tokens.
  token_ = {.token_type = token_type,
            .atom = atom,
            .data = data,
            // For reporting purposes implied tokens are assumed to be parsed at
            // the current tag location.
            .line_col_in_html_src = token_.line_col_in_html_src,
            .attributes = {}};
  has_self_closing_token_ = false;

  // Accounting for manufactured tags.
  if (token_type == TokenType::START_TAG_TOKEN) {
    switch (atom) {
      case Atom::HTML:
        document_->metadata_.has_manufactured_html = true;
        break;
      case Atom::HEAD:
        document_->metadata_.has_manufactured_head = true;
        break;
      case Atom::BODY:
        document_->metadata_.has_manufactured_body = true;
        break;
      default:
        break;
    }
  }

  ParseCurrentToken();
  // Restore original token.
  token_ = {.token_type = real_token.token_type,
            .atom = real_token.atom,
            .data = real_token.data,
            .line_col_in_html_src = token_.line_col_in_html_src,
            .attributes = real_token.attributes};
  has_self_closing_token_ = self_closing;
}  // Parser::ParseImpliedToken.

void Parser::ParseCurrentToken() {
  if (token_.token_type == TokenType::SELF_CLOSING_TAG_TOKEN) {
    has_self_closing_token_ = true;
    token_.token_type = TokenType::START_TAG_TOKEN;
  }

  bool consumed = false;

  while (!consumed) {
    if (InForeignContent()) {
      consumed = ParseForeignContent();
    } else {
      consumed = insertion_mode_();
    }
  }

  if (has_self_closing_token_) {
    // This is a parse error, but ignore it.
    has_self_closing_token_ = false;
  }
}  // Parser::ParseCurrentToken.

void Parser::CopyAttributes(Node* node, Token token) const {
  if (token.attributes.empty()) return;
  std::set<std::string> attr_keys;
  std::transform(node->attributes_.begin(), node->attributes_.end(),
                 std::inserter(attr_keys, attr_keys.begin()),
                 [](const Attribute& attr) -> std::string { return attr.key; });
  for (const Attribute& attr : token.attributes) {
    if (attr_keys.find(attr.key) == attr_keys.end()) {
      node->attributes_.push_back(attr);
      attr_keys.insert(attr.key);
    }
  }
}  // Parser::CopyAttributes.

void Parser::RecordBaseURLMetadata(Node* base_node) {
  if (base_node->Type() != NodeType::ELEMENT_NODE ||
      base_node->DataAtom() != Atom::BASE) return;

  for (auto& attr : base_node->Attributes()) {
    if (Strings::EqualFold(attr.key, "href")) {
      document_->metadata_.base_url.first = attr.value;
    } else if (Strings::EqualFold(attr.key, "target")) {
      document_->metadata_.base_url.second = attr.value;
    }
  }
}

void Parser::RecordLinkRelCanonical(Node* link_node) {
  if (link_node->Type() != NodeType::ELEMENT_NODE ||
      link_node->DataAtom() != Atom::LINK) return;

  bool canonical = false;
  std::string canonical_url;
  for (auto& attr : link_node->Attributes()) {
    if (Strings::EqualFold(attr.key, "rel") &&
        Strings::EqualFold(attr.value, "canonical")) {
      canonical = true;
    } else if (Strings::EqualFold(attr.key, "href")) {
      canonical_url = attr.value;
    }
  }
  if (canonical && !canonical_url.empty()) {
    document_->metadata_.canonical_url = canonical_url;
  }
}

namespace {
// Returns only whitespace characters in s.
// <space><space>foo<space>bar<space> returns 4 spaces.
std::string ExtractWhitespace(const std::string& s) {
  std::string only_whitespaces;
  std::copy_if(
      s.begin(), s.end(),
      only_whitespaces.begin(),  // Unused, populated directly in predicate.
      [&only_whitespaces](char c) -> bool {
        if (Strings::kWhitespace.find(c) != std::string::npos) {
          only_whitespaces.push_back(c);
        }
        return false;
      });
  return only_whitespaces;
}

}  // namespace

}  // namespace htmlparser
