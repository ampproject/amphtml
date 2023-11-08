// An average HTML DOM tree consists of hundreds or thousands of nodes and
// their attributes. The malloc/new and free/delete are very expensive
// operations for small objects and htmlparser spends majority of the time in
// allocation and deallocation of these small objects.
//
// Usage:
// One Allocator for each type. This approach simplifies the design and
// alignment requirements of different types.
//
//     // Allocator for Node with 8k blocks, and 8 byte alignment boundary.
//     Allocator<Node> node_allocator(8192);
//
//     // Allocator for Attributes with 4k blocks, and 1 byte alignment.
//     Allocator<Attribute> attr_allocator(4096);
//
//     // Default block size.
//     Allocator<Node> node_allocator;  // Block size = OS page_size.
//
// The allocator takes care of alignment requirements of the objects. The blocks
// are always created in the multiples of page_size. For the following Allocator
// the block size is upgraded to 4096 for 4k page_size or 8192 for 8k page_size.
//
//     Allocator<Node> node_allocator(3000);  // Block size = 4096.
//
// To construct the object:
//   Node* node = node_allocator.Construct(NodeType::ELEMENT_NODE);
//
// The construct method supports varargs. Following forwards 4 parameters to the
// AboutMe constructor.
//   Allocator<AboutMe> alloc;
//   AboutMe* name = alloc.Construct("John", "Doe", 94043, MALE);
//
// THREAD SAFETY: Allocator is not thread safe. Multiple threads cannot call
// Allocate() simultaneously. In multi-threaded program a thread local allocator
// per thread is recommended.
//
//
// ---------------------------------------------------------------------------
//                   Internals for code reviewers:
// ---------------------------------------------------------------------------
// The allocator maintains linked list of blocks of memory buffers for
// allocation of small objects.  It allocates blocks on demand, one block at a
// time.
//
// The block is always multiple of page size. It is rounded to nearest page size
// multiple in case caller provided a different size which is not multiple of
// page size. So a 3000 block size request becomes 4096 block and 5000 block
// size request becomes 8192 block size respectively on a 4k page size kernel.
//
// The block_size is the only configurable parameter, and depends on three
// fators: A) Object size, B) Number of objects and C) Alignment boundary.
//
//
// Alignment requirements:
// Every object type has a property called alignment requirement, which is an
// integer value of type std::size_t representing the number of bytes  between
// successive addresses at which objects of this type can be allocated.
// The valid alignment values are non-negative integral powers of two.
//
// We call an object naturally aligned if its address is aligned to its size.
// It's called misaligned otherwise. For example, an 8-byte floating-point data
// is naturally aligned if the address used to identify it has an 8-byte
// alignment.
//
// Following data structure contains members totaling 13 bytes, but it's actual
// size is 24 bytes due to 8 byte alignment.
//
// Alignment is always equal to the largest sized element in the structure.
//
// struct {
//   int32_t a;  // 4 bytes.
//   int64_t b;  // 8 bytes.
//   char c;     // 1 byte.
// };
//
// The above data structure will be padded by compiler to satisfy alignment
// requirement.
// struct {
//   int32_t a;     // 4 byte                                 0x0000
//   char _pad[4];  // compiler added 8 byte padding.
//   int64_t b;     // 8 byte (now at 8 byte alignment).      0x0008
//   char c;        // 1 byte (also at 8 byte alignment).     0x0010
//   char _pad[7]   // compiler added padding
// };
//
// The same data structure if fields are re-organized will consume 16 bytes,
// still at 8 byte alignment.
// struct {
//   int32_t a;     // 4 byte at 0x00000 (like above).        0x0000
//   char c;        // 1 byte char.                           0x0001
//   chr _pad[3]    // 3 bytes for 8 byte alignment.
//   int64_t b;     // at 8 byte alignment.                   0x0010
// };
//
// Allocator computes the alignment requirement of the Type and starts the block
// at the address which is multiple of 8, and hence we say the block is aligned.
//
// +-------------------------------------------------------------------------+
// | Address  |    Block 1  |  Address  |   Block 2  | Address  |  Block 3   |
// +----------+-------------+-----------+------------+----------+------------+
// |   10     |    waste    |   120     |    Obj22   |   164    |   waste    |
// |   11     |    waste    |   121     |            |   165    |   waste    |
// |   12     |    waste    |   122     |            |   166    |   waste    |
// |   13     |    waste    |   123     |            |   167    |   waste    |
// |   14     |    waste    |   124     |            |   168    |   Obj33    |
// |   15     |    waste    |   125     |            |   169    |            |
// |   16     |    Obj1     |   126     |            |   170    |            |
// |   17     |             |   127     |            |   171    |            |
// |   N      |             |   N       |            |   N      |            |
// +-------------------------------------------------------------------------+
//
// In the above diagram there are three blocks with alignment of 8.
//
// Block one start address is 16 so 6 bytes are skipped (or wasted).
// Block two start address is 120 since it is multiple of 8.
// Block three start address is 68 causing 4 bytes to skip (or wasted).
//
// The block alignment is done by std::align or AlignFreeAddress method.
//
// The block is considered full when the remaining bytes are less than the
// object size. So the remaining bytes in the block are skipped and new block
// created. In our tests for 500 objects of 144 bytes and 4096 bytes block
// about 1024 bytes wasted.
//
// Since objects size is always multiple of alignment, subsequent objects can be
// allocated sequentially in the block. So if the object size is 96 bytes, the
// second object in block 1 will be allocated 112 address in block 1.
//
// A block is allocated using operator new at the time of block initialization
// and start address aligned. See NewBlock();
//
// A block is freed at the time of destruction of the allocator object.
// The allocator takes complete ownership of the objects it allocates, client is
// not responsible for deallocating or destroying the objects allocated by this
// allocator. Allocator will call the destructors of the objects it allocated.
// See ~Allocator() and Destroy() method.
//
// IMPORTANT: Tree like structure must not destroy the child nodes or sibling
// nodes. Allocator destroys all the objects and call its destructor, it is an
// error to invoke destructors on objects allocated by this allocator. Allocator
// is the master owner of all the objects. Client treats all objects as const
// pointer as far as destruction goes.
//
// It is not possible to destroy random objects or free up the slots to be
// re-used for allocation of objects. This allocator is used for html parsing
// which should free up the resources after document parsing. A singleton
// allocator for example will keep growing unless Reset() is called upon each
// new parsing.
//
// Bit shifting syntax used in this source:
// A) To round the block size to nearest page size (4096) multiple:
//    ((block_size - 1) | (page_size - 1) + 1.
//    Examples:
//    - block_size = 3000;
//     (3000 - 1) | (4096 - 1) + 1 = 4096.
//    - block_size = 5000;
//     (5000 - 1) | (4096 - 1) + 1 = 8096.
//
// B) If N is multiple of A.
//    (N & (A - 1)) == 0
//    This can also be achieved by modulo operator N % A == 0.
//    Examples:
//    - 40 is multiple of 8?
//     40 & (8 - 1) == 0;
//    - 62 is multiple of 4?
//     60 & (4 - 1) != 0;

#ifndef CPP_HTMLPARSER_ALLOCATOR_H_
#define CPP_HTMLPARSER_ALLOCATOR_H_

#include <unistd.h>  // For getpagesize()

#include <array>
#include <cstring>
#include <memory>
#include <tuple>
#include <vector>

namespace htmlparser {

template <class T>
class Allocator {
 public:
  explicit Allocator(std::size_t block_size = 0) :
    alignment_(std::alignment_of_v<T>),
    // Rounds the block_size_ to page size multiple.
    // 3000 becomes 4096 and 5000 becomes 8192 for 4k page size OS.
    block_size_(
        ((block_size < 1 ? 0 : block_size - 1) | (getpagesize() - 1)) + 1),
    object_size_(sizeof(T)),
    remaining_(0),
    next_free_(nullptr),
    blocks_allocated_(0),
    block_(nullptr) {}

  ~Allocator() {
    FreeBlocks();
  }

  Allocator(const Allocator&) = delete;
  Allocator& operator=(const Allocator&) = delete;

  // Allocates memory of same size required to construct object of type T.
  // Returns nullptr if allocation failed.
  void* Allocate() {
    // Checks if remaining bytes in block are less than object size, or
    // remaining bytes after alignment is less than object size.
    // Add a new block.
    if (object_size_ > remaining_ || !AlignFreeAddress()) {
      if (!NewBlock()) return nullptr;
    }

    // Get the address for object allocation.
    last_alloc_ = next_free_;
    remaining_ -= object_size_;
    // Move the pointer for next object.
    next_free_ += object_size_;
    return static_cast<void*>(last_alloc_);
  }

  // Allocates memory and constructs the object.
  // Returns nullptr if memory allocation failed.
  template <typename ...Args>
  T* Construct(Args&& ...args) {
    void* mem = Allocate();
    // New object or nullptr if memory allocation failed.
    return mem ? new (mem) T(std::forward<Args>(args)...) : nullptr;
  }

  // Default constructor.
  T* Construct() {
    void* mem = Allocate();
    return mem ? new (mem) T() : nullptr;
  }

  // Deallocates the blocks and restores the allocator for reuse.
  void Reset() {
    FreeBlocks();
    next_free_ = nullptr;
    remaining_ = 0;
  }

  // Used only by test or development environment.
  std::tuple<int /*alignment*/,
             int /*block_size*/,
             int /*object_size*/,
             unsigned char* /*last_alloc*/,
             unsigned char* /*next_free*/,
             std::size_t /*remaining*/,
             uint32_t /*blocks_allocated*/> DebugInfo() const {
    return {alignment_, block_size_, object_size_, last_alloc_, next_free_,
      remaining_, blocks_allocated_};
  }

 private:
  struct Block {
    Block* previous;
    void* buf;
  };

  // Deallocates the blocks.
  void FreeBlocks() {
    Block* current_block = block_;
    bool partial = true;
    while (current_block != nullptr) {
      Block* previous = current_block->previous;
      Destroy(current_block, partial);
      partial = false;
      FreeBlockMemory(current_block);
      delete current_block;
      blocks_allocated_--;
      current_block = previous;
    }
  }

  // Creates a new block.
  bool NewBlock() {
    Block* block = new Block;
    block->previous = block_;
    if (alignment_ <=  __STDCPP_DEFAULT_NEW_ALIGNMENT__) {
      block->buf = ::operator new(block_size_);
    } else {
      block->buf = ::operator new(block_size_, std::align_val_t(alignment_));
    }
    std::memset(block->buf, 0, block_size_);
    // Align the block to alignment boundary.
    //
    // The adjusted space may be lesser than block size.
    std::size_t adjusted_space = block_size_;
    if (alignment_ > 1) {
      if (block->buf = std::align(alignment_, block_size_, block->buf,
                                  adjusted_space);
          block->buf == nullptr) {
        // In case std::align fails, try manual alignment.
        if (!AlignFreeAddress()) {
          return false;
        }
      } else if (adjusted_space < object_size_) {
        return false;
      }
    }

    next_free_ = static_cast<unsigned char*>(block->buf);
    remaining_ = adjusted_space;
    blocks_allocated_++;
    block_ = block;
    return true;
  }

  void FreeBlockMemory(Block* block) {
    if (alignment_ <= __STDCPP_DEFAULT_NEW_ALIGNMENT__) {
      ::operator delete(block->buf, block_size_);
      block->buf = nullptr;
    } else {
      ::operator delete(block->buf, block_size_, std::align_val_t(alignment_));
      block->buf = nullptr;
    }
  }

  // Destroys the T objects allocated and constructed using this block.
  // If the block is only partially consumed, destroys only objects allocated
  // in the partial space.
  void Destroy(Block* block, bool partial_allocation = false) {
    unsigned char* t_ptr = static_cast<unsigned char*>(block->buf);
    unsigned char* block_end = t_ptr + block_size_;
    std::size_t remaining = block_end - t_ptr;
    // All offsets are aligned, so simply increment and destroy.
    if ((object_size_ & (alignment_ - 1)) == 0) {
      while (remaining >= object_size_) {
        reinterpret_cast<T*>(t_ptr)->~T();
        t_ptr += object_size_;
        if (partial_allocation && t_ptr >= next_free_) {
          return;
        }
        remaining -= object_size_;
      }
    }
  }

  // If the block's address is not aligned, moves the pointer to the address
  // that is multiple of alignment_.
  bool AlignFreeAddress() {
    // Checks how many bytes to skip to be at the correct alignment.
    if (const std::size_t skip =
            reinterpret_cast<std::size_t>(next_free_) & (alignment_ - 1);
        skip > 0) {
      auto waste = remaining_ - skip;
      if (waste >= remaining_) return false;
      next_free_ += waste;
      remaining_ -= waste;
    }

    return true;
  }

  const std::size_t alignment_;
  const std::size_t block_size_;
  const std::size_t object_size_;
  std::size_t remaining_;
  unsigned char* last_alloc_;
  unsigned char* next_free_;
  uint32_t blocks_allocated_;

  Block* block_;
};

}  // namespace htmlparser

#endif  // CPP_HTMLPARSER_ALLOCATOR_H_
