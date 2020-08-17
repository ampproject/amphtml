#include "base/init_google.h"
#include "testing/base/public/benchmark.h"
#include "gtest/gtest.h"
#include "json/parser.h"
#include "third_party/jsoncpp/json.h"

#define REPEAT2(x) x x
#define REPEAT4(x) REPEAT2(x) REPEAT2(x)
#define REPEAT8(x) REPEAT4(x) REPEAT4(x)
#define REPEAT16(x) REPEAT8(x) REPEAT8(x)
#define REPEAT32(x) REPEAT16(x) REPEAT16(x)
#define REPEAT(x) REPEAT32(x)

static const std::string kJsonStr = R"JSON({
  "a": "foo",
  "b": true,
  "c": false,
  "d": null,
  "e": [1,2, 3,4,5,6,7,8,9,0],
  "f": [1, "foo", "bar", true, false],
  "g": {"a": "ok", "b": true, "c": 22323},
  "h": [1.2, 0.02, 1.22323, 212.2, 322343],
  "i": 1234567})JSON";

static const std::string kJsonStr2 = R"JSON({
  "states":[
  {"state":{"state_id":"AN","state_name":"Andaman and Nicobar Island (UT)"}},
  {"state":{"state_id":"AP","state_name":"Andhra Pradesh"}},
  {"state":{"state_id":"AR","state_name":"Arunachal Pradesh"}},
  {"state":{"state_id":"AS","state_name":"Assam"}},
  {"state":{"state_id":"BR","state_name":"Bihar"}},
  {"state":{"state_id":"CH","state_name":"Chandigarh (UT)"}
  },{"state":{"state_id":"CG","state_name":"Chhattisgarh"}},
  {"state":{"state_id":"DN","state_name":"Dadra and Nagar Haveli (UT)"}},
  {"state":{"state_id":"DD","state_name":"Daman and Diu (UT)"}},
  {"state":{"state_id":"DL","state_name":"Delhi (NCT)"}},
  {"state":{"state_id":"GA","state_name":"Goa"}},
  {"state":{"state_id":"GJ","state_name":"Gujarat"}},
  {"state":{"state_id":"HR","state_name":"Haryana"}},
  {"state":{"state_id":"HP","state_name":"Himachal Pradesh"}},
  {"state":{"state_id":"JK","state_name":"Jammu and Kashmir"}},
  {"state":{"state_id":"JH","state_name":"Jharkhand"}},
  {"state":{"state_id":"KA","state_name":"Karnataka"}},
  {"state":{"state_id":"KL","state_name":"Kerala"}},
  {"state":{"state_id":"LD","state_name":"Lakshadweep (UT)"}},
  {"state":{"state_id":"MP","state_name":"Madhya Pradesh"}},
  {"state":{"state_id":"MH","state_name":"Maharashtra"}},
  {"state":{"state_id":"MN","state_name":"Manipur"}},
  {"state":{"state_id":"ML","state_name":"Meghalaya"}},
  {"state":{"state_id":"MZ","state_name":"Mizoram"}},
  {"state":{"state_id":"NL","state_name":"Nagaland"}},
  {"state":{"state_id":"OR","state_name":"Odisha"}},
  {"state":{"state_id":"PY","state_name":"Puducherry (UT)"}},
  {"state":{"state_id":"PB","state_name":"Punjab"}},
  {"state":{"state_id":"RJ","state_name":"Rajasthan"}},
  {"state":{"state_id":"SK","state_name":"Sikkim"}},
  {"state":{"state_id":"TN","state_name":"Tamil Nadu"}},
  {"state":{"state_id":"TG","state_name":"Telangana"}},
  {"state":{"state_id":"TR","state_name":"Tripura"}},
  {"state":{"state_id":"UK","state_name":"Uttarakhand"}},
  {"state":{"state_id":"UP","state_name":"Uttar Pradesh"}},
  {"state":{"state_id":"WB","state_name":"West Bengal"}}]})JSON";

void BM_ValidateJsonAMPJsonParser(benchmark::State& state) {
  for (auto _ : state) {
    REPEAT({
      []() {
        auto result = htmlparser::json::JSONParser::Validate(kJsonStr);
        benchmark::DoNotOptimize(result);
        EXPECT_TRUE(result.first);
        auto result2 = htmlparser::json::JSONParser::Validate(kJsonStr2);
        benchmark::DoNotOptimize(result2);
        EXPECT_TRUE(result2.first);
      }();
    });
  }
  state.SetItemsProcessed(32 * 2 * state.iterations());
}
BENCHMARK(BM_ValidateJsonAMPJsonParser);

void BM_ValidateJsonJsonCppParser(benchmark::State& state) {
  for (auto _ : state) {
    REPEAT({
      []() {
        Json::Value val;
        Json::Reader reader;
        bool result = reader.parse(kJsonStr, val);
        benchmark::DoNotOptimize(result);
        EXPECT_TRUE(result);
        bool result2 = reader.parse(kJsonStr2, val);
        benchmark::DoNotOptimize(result2);
        EXPECT_TRUE(result2);
      }();
    });
  }
  state.SetItemsProcessed(32 * 2 * state.iterations());
}
BENCHMARK(BM_ValidateJsonJsonCppParser);


int main(int argc, char** argv) {
  InitGoogle(argv[0], &argc, &argv, true);
  ConsoleReporter benchmark_reporter;
  RunMatchingBenchmarks(".", &benchmark_reporter);
}
