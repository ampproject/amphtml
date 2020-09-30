package(default_visibility = ["//visibility:public"])


genrule(
    name = "validator-extensions-protoascii-gen",
    srcs = glob(
        [
            "*/validator-*.protoascii",
        ],
    ),
    outs = ["validator-extensions.protoascii"],
    cmd = "cat $(SRCS) > $@",
)
