"""embed_data.bzl to follow it's usage in BUILD file as embed_data(...)"""

def _impl(ctx):
    # Both the input and output files are specified by the BUILD file.
    in_file = ctx.file.src
    out_file = ctx.outputs.header_out
    ctx.actions.run(
        inputs = [in_file],
        outputs = [out_file],
        arguments = [
            in_file.path,
            out_file.path,
            ctx.attr.namespace,
            ctx.attr.varname,
        ],
        progress_message = "Generating c++ header for data file: %s" % (in_file),
        executable = ctx.executable.header_generator,
    )

embed_data = rule(
    implementation = _impl,
    attrs = {
        "src": attr.label(
            allow_single_file = True,
            mandatory = True,
            doc = "The file to embed",
        ),
        "header_out": attr.output(
            mandatory = True,
            doc = "Generated header file name",
        ),
        "namespace": attr.string(
            mandatory = True,
            doc = "c++ namespace, for nested namespace use c++17 style a::b",
        ),
        "varname": attr.string(
            mandatory = True,
            doc = "byte array varname",
        ),
        "header_generator": attr.label(
            executable = True,
            cfg = "host",
            allow_files = True,
            default = Label(
                "//cpp/engine/scripts:filecontents_to_cpp_header",
            ),
        ),
    },
    doc = "Create the header file",
)
