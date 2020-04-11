sh_binary(
    name = "copyValidatorJavaSource",
    srcs = ["src/main/bin/copyValidatorJavaSource.sh"],
    deps = [
        "@bazel_tools//tools/bash/runfiles"
    ],
)

sh_binary(
    name = "fetchAMPResources",
    srcs = ["src/main/bin/fetchAMPResources.sh"],
    deps = [
        "@bazel_tools//tools/bash/runfiles"
    ],
)

load("@rules_java//java:defs.bzl", "java_proto_library")
load("@rules_proto//proto:defs.bzl", "proto_library")

java_proto_library(
    name = "amphtml_validator_java_proto_lib",
    visibility = ["//visibility:public"],
    deps = [":amphtml_validator_proto_lib"],
)

proto_library(
    name = "amphtml_validator_proto_lib",
    srcs = ["src/main/proto/validator.proto"],
)

java_library(
    name = "amphtml_validator_lib",
    srcs = glob(["src/main/java/**/*.java"]),
    resources = glob(["src/main/resources/**"]),
    deps = [
       "@maven//:org_w3c_css_sac",
       "@maven//:com_google_code_findbugs_jsr305",
       "@maven//:org_json_json",
       "@maven//:net_sourceforge_cssparser_cssparser",
       "@maven//:org_testng_testng",
       "@maven//:ch_qos_logback_logback_classic",
       "@maven//:org_slf4j_slf4j_api",
       "@maven//:com_google_protobuf_protobuf_java",
       "@maven//:com_yahoo_tagchowder_tagchowder_core",
       "@maven//:org_apache_commons_commons_lang3",
       "@maven//:org_apache_commons_commons_text"
    ],
)

java_library(
    name = "amphtml_validator_test_lib",
    srcs = glob(["src/test/java/**/*.java"]),
    resources = glob(["src/test/resources/**", "src/main/resources/**"]),
    deps = [
        ":amphtml_validator_java_proto_lib",
        ":amphtml_validator_lib",
        "@maven//:net_sourceforge_cssparser_cssparser",
        "@maven//:com_google_code_findbugs_jsr305",
        "@maven//:org_testng_testng",
        "@maven//:junit_junit",
        "@maven//:org_mockito_mockito_all",
        "@maven//:com_google_guava_guava",
    ],
)

java_test(
    name = "amphtml_validator_test",
    size = "small",
    runtime_deps = [
        ":amphtml_validator_test_lib",
    ],
    use_testrunner=False,
    main_class='org.testng.TestNG',
    args=['-testjar','libamphtml_validator_test_lib.jar','-verbose','1'],
)
