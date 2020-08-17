#include <vector>

#include "base/init_google.h"
#include "testing/base/public/benchmark.h"
#include "gtest/gtest.h"
#include "allocator.h"

#define REPEAT2(x) x x
#define REPEAT4(x) REPEAT2(x) REPEAT2(x)
#define REPEAT8(x) REPEAT4(x) REPEAT4(x)
#define REPEAT16(x) REPEAT8(x) REPEAT8(x)
#define REPEAT32(x) REPEAT16(x) REPEAT16(x)
#define REPEAT(x) REPEAT32(x)

using htmlparser::Allocator;

struct DataType {
 public:
  DataType(bool o) : own(o) {}
  DataType() : own(false) {}

  ~DataType() {
    if (own && next) {
      delete next;
      next = nullptr;
    }
  }

  DataType(const DataType&) = delete;
  DataType& operator=(const DataType&) = delete;

  bool own;
  int64_t a;
  int32_t b;
  char c;
  std::string s;
  DataType* next = nullptr;
  int offset;
};

DataType* CreateLinkedList(int num_links,
                           Allocator<DataType>* alloc = nullptr) {
  DataType* root = alloc ? alloc->Construct() : new DataType(true);
  DataType* next = alloc ? alloc->Construct() : new DataType(true);
  root->next = next;
  for (int c = 1; c < num_links; ++c) {
    next->next = alloc ? alloc->Construct() : new DataType(true);
    next = next->next;
  }
  return root;
}

void BM_DataTypeAllocatorBasic(benchmark::State& state) {
  Allocator<DataType> alloc(8096);
  for (auto _ : state) {
    REPEAT({
      DataType* data = alloc.Construct();
      benchmark::DoNotOptimize(data);
    });
  }
  state.SetItemsProcessed(32 * state.iterations());
}
BENCHMARK(BM_DataTypeAllocatorBasic)->Range(32, 1024);

void BM_DataTypeNewDeleteBasic(benchmark::State& state) {
  for (auto _ : state) {
    REPEAT({
      DataType* data = new DataType(true);
      benchmark::DoNotOptimize(data);
      delete data;
    });
  }
  state.SetItemsProcessed(32 * state.iterations());
}
BENCHMARK(BM_DataTypeNewDeleteBasic)->Range(32, 1024);

void BM_DataTypeAllocatorStackComplex(benchmark::State& state) {
  Allocator<DataType> alloc(8096);
  for (auto _ : state) {
    REPEAT({
      DataType* linkedlist = CreateLinkedList(1000, &alloc);
      benchmark::DoNotOptimize(linkedlist);
    });
  }
  state.SetItemsProcessed(32 * state.iterations());
}
BENCHMARK(BM_DataTypeAllocatorStackComplex)->Range(32, 1024);

void BM_DataTypeNewDeleteStackComplex(benchmark::State& state) {
  for (auto _ : state) {
    REPEAT({
      DataType* linkedlist = CreateLinkedList(200);
      benchmark::DoNotOptimize(linkedlist);
      delete linkedlist;
    });
  }
  state.SetItemsProcessed(32 * state.iterations());
}
BENCHMARK(BM_DataTypeNewDeleteStackComplex)->Range(32, 1024);

int main(int argc, char** argv) {
  InitGoogle(argv[0], &argc, &argv, true);
  ConsoleReporter benchmark_reporter;
  RunMatchingBenchmarks(".", &benchmark_reporter);
}
