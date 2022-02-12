# AMP HTML ⚡ Validator

A validator for the
[AMP HTML format](https://github.com/ampproject/amphtml/blob/main/README.md).

## Validating a Page

If you just want to validate a page, please see
[our documentation over at amp.dev](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp).

### Chrome Extension

Please see [js/chromeextension/README.md](https://github.com/ampproject/amphtml/blob/main/validator/js/chromeextension/README.md).

### Visual Studio Code Extension

An extension for Visual Studio Code
[VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=amphtml.amphtml-validator)

### Command Line Tool and Node.js API

Please see [js/nodejs/README.md](https://github.com/ampproject/amphtml/blob/main/validator/js/nodejs/README.md).

### Web UI

Please see [js/webui/README.md](https://github.com/ampproject/amphtml/blob/main/validator/js/webui/README.md).

### JSON

The validator rules are exported in the JSON format and hosted on: `https://cdn.ampproject.org/v0/validator.json`

The JSON rules are provided on best-effort basis and it's not recommended to
rely on them in a production environment.

## Building a Custom Validator

This is only useful development - e.g. when making changes to
`cpp/engine/validator.h`.

### Development Prerequisites

1. Start an interactive docker container. Note that you will be the `root` user inside the docker container.
    ```bash
    docker run -it -u root cimg/openjdk:17.0-node bash
    ```
1. Run following commands in the container.
    ```bash
    apt update
    apt install -y python sudo
    git clone https://github.com/ampproject/amphtml.git
    cd amphtml
    npm install
    npm run postinstall
    .circleci/install_validator_dependencies.sh
    ```

### Building Validator Engine

In `amphtml/validator` folder, run

```bash
bazel build cpp/engine/wasm:validator_js_bin
```

This creates `bazel-bin/cpp/engine/wasm/validator_js_bin.js`, which is
equivalent to the validator deployed at `cdn.ampproject.org`.

You may now use the `--validator_js` command line flag to
[amphtml-validator](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp#command-line-tool) to use this validator.

### Reproducing Validator Tests of Circle CI workflow

1. In `amphtml` folder, run

    ```bash
    amp validator-cpp && echo SUCCESS || echo FAIL
    ```

1. To see more information of the tests
    ```bash
    sed -i 's/--test_output=errors//' build-system/tasks/validator.js
    sed -i 's/--ui_event_filters=INFO//' build-system/tasks/validator.js
    ```
    Then re-run `amp validator-cpp && echo SUCCESS || echo FAIL`.
