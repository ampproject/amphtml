## Custom transforms for `amp serve`.

**Main directory:** `build-system/server/new-server/transforms/`

**Structure:** Each subdirectory should contain the following:

-   A single `.ts` file that implements a specific transform (`*-transform.ts`)
-   A `test/` subdirectory containing one or more subdirectories labelled by test name, with each subdirectory containing one pair of input and output files (`test/*/[input|output].html`)
-   Optionally, in each individual test subdirectory, an `options.json` file for specific configurations for specific tests (`test/*/options.json`)

**Example:**

```
└── transforms
    ├── foo
    │   ├── foo-transform.ts
    │   └── test
    │       └── testName
    │           ├── input.html
    │           ├── output.html
    │           └── options.json
    ├── bar
    │   ├── bar-transform.ts
    │   └── test
    │       ├── testName1
    │       │   ├── input.html
    │       │   └── output.html
    │       └── testName2
    │           ├── input.html
    │           └── output.html
```
