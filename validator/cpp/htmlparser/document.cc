#include "absl/flags/flag.h"
#include "cpp/htmlparser/document.h"

ABSL_FLAG(std::size_t, htmlparser_nodes_allocator_block_size,
          256 << 10 /* 256k */,
          "Allocator block size for html nodes.");

namespace htmlparser {

Document::Document() :
    node_allocator_(new Allocator<Node>(
        ::absl::GetFlag(FLAGS_htmlparser_nodes_allocator_block_size))),
    root_node_(NewNode(NodeType::DOCUMENT_NODE)) {}

Node* Document::NewNode(NodeType node_type, Atom atom) {
  return node_allocator_->Construct(node_type, atom);
}

Node* Document::CloneNode(const Node* from) {
  Node* clone = NewNode(from->Type());
  clone->atom_ = from->atom_;
  clone->data_ = from->data_;
  clone->attributes_.reserve(from->Attributes().size());
  std::copy(from->Attributes().begin(), from->Attributes().end(),
            std::back_inserter(clone->attributes_));
  return clone;
}

}  // namespace htmlparser
