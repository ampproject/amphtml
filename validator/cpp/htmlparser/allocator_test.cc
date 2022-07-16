#include "cpp/htmlparser/allocator.h"

#include "gtest/gtest.h"

// Memory leaks will automatically be detected by the test framework.

namespace htmlparser {

TEST(AllocatorTest, BasicTest) {
  struct Data {
   public:
    int32_t a;
    int64_t b;
    std::string c;
    short d;
    Data() {}
    Data(int32_t a_, int64_t b_, std::string c_, short d_)
        : a(a_), b(b_), c(c_), d(d_) {}
  };

  Allocator<Data> alloc(4096);
  for (int i = 0; i < 1000; ++i) {
    // With default constructor.
    Data* d = alloc.Construct();
    EXPECT_EQ(d->a, 0);
    // With args.
    Data* d2 = alloc.Construct(i, i * 2, "foo", 3);
    EXPECT_EQ(d2->a, i);
    EXPECT_EQ(d2->b, i * 2);
    EXPECT_EQ(d2->c, "foo");
    EXPECT_EQ(d2->d, 3);
  }
}

TEST(AllocatorTest, AlignmentTest) {
  // Two data structures of same size but different alignment.
  // Size: 16, alignment 4.
  struct DataA4 {
   public:
    int32_t a;
    int32_t b;
    int32_t c;
    int32_t d;
    DataA4(int32_t a_, int32_t b_, int32_t c_, int32_t d_)
        : a(a_), b(b_), c(c_), d(d_) {}
  };

  // Size: 16, alignment 8.
  struct DataA8 {
   public:
    int32_t a;
    char b;
    int64_t c;
    DataA8(int32_t a_, int64_t c_, char b_) : a(a_), b(b_), c(c_) {}
  };

  // Size 4, alignment 1.
  struct DataA1 {
    char a;
  };

  // Default block size.
  Allocator<DataA4> alloc4A(4096);
  Allocator<DataA8> alloc8A(4096);
  Allocator<DataA1> alloc1A(4096);
  std::vector<const DataA4*> data4A;
  std::vector<const DataA8*> data8A;
  std::vector<DataA1*> data1A;
  int s4 = sizeof(DataA4);
  int s8 = sizeof(DataA8);
  int s1 = sizeof(DataA1);
  int al4 = alignof(DataA4);
  int al8 = alignof(DataA8);
  int al1 = alignof(DataA1);
  EXPECT_EQ(al4, 4);
  EXPECT_EQ(al8, 8);
  EXPECT_EQ(al1, 1);
  for (int i = 0; i < 1000; ++i) {
    auto [a4, b4, c4, d4, e4, f4, g4] = alloc4A.DebugInfo();
    auto [a8, b8, c8, d8, e8, f8, g8] = alloc8A.DebugInfo();
    auto [a1, b1, c1, d1, e1, f1, g1] = alloc1A.DebugInfo();
    // Alignments.
    EXPECT_EQ(al4, a4);
    EXPECT_EQ(al8, a8);
    EXPECT_EQ(al1, a1);
    EXPECT_EQ(c4, s4);
    EXPECT_EQ(c8, s8);
    EXPECT_EQ(c1, s1);
    data4A.push_back(alloc4A.Construct(i * 1, i * 2, i * 3, i * 4));
    data8A.push_back(alloc8A.Construct(i * 1, i * 2, 'a'));
    DataA1* a = (DataA1*)alloc1A.Allocate();
    a->a = 'z';
    data1A.push_back(a);
  }
  // Checks construction initializes correctly.
  for (int i = 0; i < 1000; ++i) {
    EXPECT_EQ(data4A.at(i)->c, i * 3);
    EXPECT_EQ(data8A.at(i)->c, i * 2);
    EXPECT_EQ(data1A.at(i)->a, 'z');
  }
}

TEST(AllocatorTest, LargeNumberOfObjects) {
  struct Array1k {
    std::array<int, 1000> a{0};
  };

  EXPECT_EQ(sizeof(Array1k), 4000);
  Allocator<Array1k> alloc(40000);
  for (int i = 0; i < 1000; ++i) {
    void* buf = alloc.Allocate();
    EXPECT_FALSE(buf == nullptr);
    Array1k* arr = new (buf) Array1k();
    EXPECT_EQ(arr->a.size(), 1000);
  }
  auto [a, b, c, d, e, f, g] = alloc.DebugInfo();
  EXPECT_EQ(40960, b);
}

TEST(AllocatorTest, DestructorCalled) {
  struct Stats {
    int destructor_counter = 0;
  };

  struct Data {
   public:
    Data(Stats* stats) : stats_(stats) {}
    ~Data() { stats_->destructor_counter++; }
    Stats* stats_;
  };

  Stats stats;
  int object_counter = 0;
  {
    Allocator<Data> alloc(4096);
    for (int i = 0; i < 5200; ++i) {
      auto d = alloc.Construct(&stats);
      EXPECT_FALSE(d == nullptr);
      // Checks objects are not destructred or nullptr.
      EXPECT_EQ(d->stats_->destructor_counter, 0);
      object_counter++;
    }
  }
  EXPECT_EQ(stats.destructor_counter, object_counter);
}

TEST(AllocatorTest, BitFields) {
  struct HasBitFields {
    short s;
    char c;
    int flip : 1;
    int nybble : 4;
    int septet : 7;
  };

  Allocator<HasBitFields> alloc;  // Default block size.
  for (int i = 0; i < 1000; ++i) {
    auto d = alloc.Construct();
    d->c = 'z';
    d->septet = i;
  }
  auto [a, b, c, d, e, f, g] = alloc.DebugInfo();
  EXPECT_EQ(a, 4);  // Alignment.
  EXPECT_EQ(c, 8);  // Size.
}

TEST(AllocatorTest, VectorContainer) {
  struct VectorData {
    std::string s;
    int b;
  };

  struct HasVector {
    int a;
    int b;
    std::vector<VectorData> data;

    ~HasVector() {
      if (a % 2 == 0) {
        // Checks if vector resizing impacts deallocation.
        data.clear();
      }
    }
  };

  Allocator<HasVector> alloc;
  for (int i = 0; i < 1000; ++i) {
    auto d = alloc.Construct();
    d->a = i;
    d->b = 20;
    for (int j = 0; j < 100; j++) {
      VectorData data;
      // One short string (so that its allocated at stack and one long string so
      // it is allocated on heap.
      if (j % 2 == 0) {
        data.s =
            R"STR("dsfjkldsfjldsajfdlsjfldsjflkdsjfkadsjfkdjsfkjdskfljdsafljdskfjdsfjdsafjdaskfjdsfdsfdsfljadskfljdskfjdsklfjkldsjfkldsjfkljdskfjdsklfjadsljfdsajfkldsjfkljdsfjjsdfsdfjdslfjdlsfjlkdsjflksdjfldsjflkjdslfjsdklfjlksdjfkldsjfklsdjfldsjflksdjfldskjflkdsjflkdsjflkdsjflkdsjflkdsjflkjsdfkljdslfkjdslkfjsdlkfjdslkfjdslkfjldskfjklsdjflksdjflsdjfldsjfsdkjflsdjflksdjflksdjfdslfjdslfj)STR";
      } else {
        data.s = "foobar";
      }
      data.b = i;
      d->data.push_back(data);
    }
  }
}

}  // namespace htmlparser
